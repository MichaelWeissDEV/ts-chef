/**
 * Full-screen pipeline editor host. The webview owns presentation state while
 * this class validates messages, resolves VS Code input/output endpoints and
 * executes the existing linear recipe runner.
 */

import * as vscode from "vscode";
import {
  PipelineStore,
  Pipeline,
  VariableStore,
  type StorageScope,
} from "../storage/store";
import { resolveVariableTemplates } from "../storage/variableResolution";
import {
  parsePipeline,
  presentPipelineValue,
  runPipeline,
  resolveDefaultArg,
} from "../commands/runner";
import { pickScope } from "../commands/scopePicker";
import { log } from "../logger";
import registry from "../opsRegistry";
import {
  decodePipelinePanelMessage,
  type PanelPipelineStep,
  type PipelinePanelMessage,
} from "./pipelineProtocol";
import {
  mergeParsedPanelSteps,
  serialisePanelPipeline,
  toPanelSteps,
  toPipelineSteps,
} from "./pipelinePanelModel";
import {
  assertPipelineOutputSize,
  deliverPipelineOutput,
  MAX_PIPELINE_INPUT_CHARACTERS,
  MAX_PIPELINE_OUTPUT_CHARACTERS,
  pipelinePreview,
  readPipelineInput,
} from "./pipelineIO";
import { buildPipelineWebviewHtml } from "./pipelineWebview";
import {
  firstUnsafeLiveOperation,
  isOperationSafeForLive,
  MAX_LIVE_INPUT_CHARACTERS,
  MAX_LIVE_OUTPUT_CHARACTERS,
} from "./pipelineLivePolicy";
import { PipelineRunCoordinator } from "./pipelineRunCoordinator";
import type { ArgConfig } from "../chef/Operation";
import Dish from "../chef/Dish";
import {
  graphStepsForOutput,
  linearPipelineToGraph,
  type PipelineGraph,
  validatePipelineGraph,
} from "./pipelineGraphModel";
import {
  runPipelineGraph,
  type PipelineGraphNodeEvent,
  type PipelineGraphOutputResult,
} from "./pipelineGraphRunner";

export type PipelineEditorMode = "list" | "graph";

interface OperationDescriptor {
  opName: string;
  displayName: string;
  module: string;
  args: unknown[];
  defaults: unknown[];
  inputType: string;
  outputType: string;
  manualBake: boolean;
  flowControl: boolean;
  liveSafe: boolean;
  graphSupported: boolean;
}

let descriptorCache: OperationDescriptor[] | undefined;

function panelDefaultArg(argument: ArgConfig): unknown {
  if (
    argument.type === "populateOption" ||
    argument.type === "populateMultiOption"
  ) {
    const options = argument.value as Array<{ value: unknown }>;
    const index =
      typeof argument.defaultIndex === "number" ? argument.defaultIndex : 0;
    return Array.isArray(options)
      ? (options[index]?.value ?? options[0]?.value ?? "")
      : "";
  }
  if (argument.type === "label") return "";
  return resolveDefaultArg(argument);
}

function panelDefaults(arguments_: ArgConfig[]): unknown[] {
  const defaults = arguments_.map(panelDefaultArg);
  arguments_.forEach((argument, argumentIndex) => {
    if (
      argument.type !== "populateOption" &&
      argument.type !== "populateMultiOption"
    ) {
      return;
    }
    const value = defaults[argumentIndex];
    const targets = Array.isArray(argument.target)
      ? argument.target
      : [argument.target];
    if (argument.type === "populateMultiOption" && Array.isArray(value)) {
      targets.forEach((target, index) => {
        if (typeof target === "number") defaults[target] = value[index];
      });
    } else if (typeof targets[0] === "number") {
      defaults[targets[0]] = value;
    }
  });
  return defaults;
}

function operationDescriptors(): OperationDescriptor[] {
  if (descriptorCache) return descriptorCache;
  descriptorCache = registry.map((entry) => {
    const operation = entry.factory();
    return {
      opName: entry.opName,
      displayName: entry.displayName,
      module: entry.module || "Other",
      args: operation.args,
      defaults: panelDefaults(operation.args),
      inputType: operation.inputType || "string",
      outputType: operation.outputType || "string",
      manualBake: operation.manualBake,
      flowControl: operation.flowControl,
      liveSafe: isOperationSafeForLive(entry.opName, operation.manualBake),
      graphSupported: !operation.flowControl,
    };
  });
  return descriptorCache;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function errorProgress(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const progress = (error as { progress?: unknown }).progress;
  return typeof progress === "number" && Number.isInteger(progress)
    ? progress
    : undefined;
}

function outputDetail(target: string): string {
  switch (target) {
    case "clipboard":
      return "copied to clipboard";
    case "replaceSelection":
      return "written to editor";
    case "newDocument":
      return "opened in a new editor";
    default:
      return "preview ready";
  }
}

const GRAPH_NODE_PREVIEW_CHARACTERS = 16 * 1024;
const GRAPH_OUTPUT_PREVIEW_CHARACTERS = 256 * 1024;
const GRAPH_TOTAL_PREVIEW_CHARACTERS = 2 * 1024 * 1024;

interface GraphTextPreview {
  value: string;
  truncated: boolean;
  totalLength: number;
}

function graphDishType(outputType: string | undefined): number {
  switch (outputType?.toLowerCase().replace(/[^a-z]/g, "")) {
    case "arraybuffer":
      return Dish.ARRAY_BUFFER;
    case "bytearray":
      return Dish.BYTE_ARRAY;
    case "json":
    case "object":
      return Dish.JSON;
    case "number":
      return Dish.NUMBER;
    case "bignumber":
    case "bigint":
      return Dish.BIG_NUMBER;
    case "html":
      return Dish.HTML;
    default:
      return Dish.STRING;
  }
}

export function presentGraphValue(value: unknown, outputType?: string): string {
  return presentPipelineValue(value, graphDishType(outputType));
}

function boundedGraphPreview(
  text: string,
  maxCharacters: number,
): GraphTextPreview {
  if (text.length <= maxCharacters) {
    return { value: text, truncated: false, totalLength: text.length };
  }
  if (maxCharacters <= 0) {
    return { value: "", truncated: true, totalLength: text.length };
  }
  const marker = `\n\n… preview truncated (${text.length.toLocaleString()} characters total)`;
  const contentLength = Math.max(0, maxCharacters - marker.length);
  return {
    value: text.slice(0, contentLength) + marker.slice(0, maxCharacters),
    truncated: true,
    totalLength: text.length,
  };
}

export interface GraphOutputPayload {
  id: string;
  name: string;
  preview: string;
  totalLength: number;
  truncated: boolean;
  error?: string;
}

export function buildGraphOutputPayloads(
  graph: PipelineGraph,
  results: ReadonlyMap<string, PipelineGraphOutputResult>,
  presentResult: (result: PipelineGraphOutputResult) => string,
): GraphOutputPayload[] {
  const outputNodes = graph.nodes.filter((node) => node.type === "output");
  const previewCharacters = Math.max(
    1,
    Math.min(
      GRAPH_OUTPUT_PREVIEW_CHARACTERS,
      Math.floor(
        GRAPH_TOTAL_PREVIEW_CHARACTERS / Math.max(1, outputNodes.length),
      ),
    ),
  );
  // Terminal fan-out aliases one source value intentionally. Cache the
  // bounded presentation by source node so a 64 MiB buffer feeding hundreds
  // of outputs is converted once, not hundreds of times.
  const previewsBySource = new Map<string, GraphTextPreview>();
  return outputNodes.map((node) => {
    const result = results.get(node.id);
    if (!result) {
      return {
        id: node.id,
        name: node.name,
        preview: "",
        totalLength: 0,
        truncated: false,
        error: "Output did not produce a result.",
      };
    }
    if (result.error) {
      return {
        id: result.outputId,
        name: result.name,
        preview: "",
        totalLength: 0,
        truncated: false,
        error: result.error.message,
      };
    }
    const sourceId = result.path.at(-2) ?? result.outputId;
    let preview = previewsBySource.get(sourceId);
    if (!preview) {
      preview = boundedGraphPreview(presentResult(result), previewCharacters);
      previewsBySource.set(sourceId, preview);
    }
    return {
      id: result.outputId,
      name: result.name,
      preview: preview.value,
      totalLength: preview.totalLength,
      truncated: preview.truncated,
    };
  });
}


/**
 * Only one editor panel exists at a time. Opening a saved pipeline while the
 * panel is already visible replaces its editor state instead of ignoring it.
 */
export class PipelinePanel {
  private static current: PipelinePanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly descriptors = operationDescriptors();
  private readonly knownOperations = new Set(
    this.descriptors.map((operation) => operation.opName),
  );
  private readonly knownGraphOperations = new Set(
    this.descriptors
      .filter((operation) => operation.graphSupported)
      .map((operation) => operation.opName),
  );
  private readonly descriptorByName = new Map(
    this.descriptors.map((operation) => [operation.opName, operation]),
  );
  private ready = false;
  private initial: Pipeline | undefined;
  private requestedMode: PipelineEditorMode | undefined;
  private readonly runCoordinator = new PipelineRunCoordinator();
  private graphAbortController: AbortController | undefined;
  private lastTextEditor: vscode.TextEditor | undefined;
  private readonly editorSubscription: vscode.Disposable;

  static open(
    context: vscode.ExtensionContext,
    store: PipelineStore,
    initial?: Pipeline,
    variableStore?: VariableStore,
    mode?: PipelineEditorMode,
  ): void {
    if (PipelinePanel.current) {
      PipelinePanel.current.panel.reveal();
      if (initial) PipelinePanel.current.loadPipeline(initial);
      if (mode) PipelinePanel.current.setMode(mode);
      return;
    }
    // Creating/revealing a webview may move focus away from the source editor,
    // so capture it before VS Code creates the panel.
    const sourceEditor = vscode.window.activeTextEditor;
    const panel = vscode.window.createWebviewPanel(
      "tschef.pipelineEditor",
      "ts-chef Pipeline Editor",
      vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    // Keep the public signature stable; context is intentionally retained for
    // callers even though this self-contained webview needs no local resources.
    void context;
    PipelinePanel.current = new PipelinePanel(
      panel,
      store,
      initial,
      sourceEditor,
      variableStore,
      mode,
    );
  }

  private constructor(
    panel: vscode.WebviewPanel,
    private readonly store: PipelineStore,
    initial?: Pipeline,
    sourceEditor?: vscode.TextEditor,
    private readonly variableStore?: VariableStore,
    requestedMode?: PipelineEditorMode,
  ) {
    this.panel = panel;
    this.initial = initial;
    this.requestedMode = requestedMode;
    this.lastTextEditor = sourceEditor ?? vscode.window.activeTextEditor;
    this.editorSubscription = vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
        if (editor) this.lastTextEditor = editor;
      },
    );
    panel.webview.html = buildPipelineWebviewHtml(
      panel.webview.cspSource,
      getNonce(),
    );
    panel.onDidDispose(() => {
      this.graphAbortController?.abort();
      this.editorSubscription.dispose();
      PipelinePanel.current = undefined;
    });
    panel.webview.onDidReceiveMessage((raw) => {
      void this.receiveMessage(raw).catch((error) => {
        log(`Pipeline editor host error: ${errorMessage(error)}`);
        this.post({ type: "protocolError", value: errorMessage(error) });
      });
    });
  }

  private loadPipeline(pipeline: Pipeline): void {
    this.invalidateRuns();
    this.initial = pipeline;
    if (this.ready) {
      this.post({
        type: "setPipeline",
        pipeline: this.pipelinePayload(pipeline),
      });
    }
  }

  /** Switches the existing editor without creating a second webview or losing state. */
  private setMode(mode: PipelineEditorMode): void {
    this.requestedMode = mode;
    if (this.ready) this.postRequestedMode({ type: "setMode", mode }, mode);
  }

  private pipelinePayload(pipeline?: Pipeline): {
    name: string;
    description: string;
    raw: string;
    steps: PanelPipelineStep[];
    graph: PipelineGraph;
    activeOutputId?: string;
  } {
    const graph = pipeline?.graph ?? linearPipelineToGraph(pipeline?.steps ?? []);
    const graphOperations = graph.nodes.filter(
      (node) => node.type === "operation",
    );
    const steps: PanelPipelineStep[] = pipeline?.graph
      ? graphOperations.map((node) => ({
          id: node.id,
          opName: node.opName,
          args: [...node.args],
        }))
      : toPanelSteps(pipeline?.steps ?? []).map((step, index) => ({
          ...step,
          id: graphOperations[index]?.id ?? step.id,
        }));
    return {
      name: pipeline?.name ?? "",
      description: pipeline?.description ?? "",
      raw:
        steps.length > 0
          ? serialisePanelPipeline(
              steps,
              (opName) =>
                this.descriptorByName.get(opName)?.displayName ?? opName,
            )
          : (pipeline?.raw ?? ""),
      steps,
      graph,
      ...(pipeline?.activeOutputId
        ? { activeOutputId: pipeline.activeOutputId }
        : {}),
    };
  }

  private invalidateRuns(): void {
    this.runCoordinator.invalidate();
    this.graphAbortController?.abort();
    this.graphAbortController = undefined;
  }

  private post(message: unknown): void {
    void this.panel.webview.postMessage(message);
  }

  /**
   * A command-selected mode is a one-shot request. Once the webview accepted
   * it, its persisted UI state becomes authoritative for later reloads.
   */
  private postRequestedMode(
    message: unknown,
    requestedMode: PipelineEditorMode | undefined,
  ): void {
    void this.panel.webview.postMessage(message).then(
      (delivered) => {
        if (delivered && this.requestedMode === requestedMode) {
          this.requestedMode = undefined;
        }
      },
      () => undefined,
    );
  }

  private async receiveMessage(raw: unknown): Promise<void> {
    const decoded = decodePipelinePanelMessage(
      raw,
      this.knownOperations,
      this.knownGraphOperations,
    );
    if (!decoded.ok) {
      this.post({
        type: "protocolError",
        value: decoded.error,
        requestId: decoded.requestId,
      });
      return;
    }

    const message = decoded.message;
    switch (message.type) {
      case "ready":
        this.ready = true;
        this.postRequestedMode(
          {
            type: "init",
            ops: this.descriptors,
            pipeline: this.pipelinePayload(this.initial),
            limits: { liveInput: MAX_LIVE_INPUT_CHARACTERS },
            mode: this.requestedMode,
          },
          this.requestedMode,
        );
        return;
      case "invalidateRuns":
        this.invalidateRuns();
        return;
      case "graphChanged":
        // Validation already happened at the webview boundary. Position and
        // topology changes only invalidate in-flight results; the graph itself
        // is persisted on Save.
        this.invalidateRuns();
        return;
      case "parseRaw":
        this.invalidateRuns();
        this.parseRaw(message);
        return;
      case "run":
        await this.run(message);
        return;
      case "runGraph":
        await this.runGraph(message);
        return;
      case "save":
        await this.save(message);
        return;
    }
  }

  private parseRaw(
    message: Extract<PipelinePanelMessage, { type: "parseRaw" }>,
  ): void {
    try {
      const parsed = parsePipeline(message.raw);
      const steps = mergeParsedPanelSteps(
        message.raw,
        parsed,
        message.previousSteps,
      );
      this.post({ type: "parsed", requestId: message.requestId, steps });
    } catch (error) {
      this.post({
        type: "parseError",
        requestId: message.requestId,
        value: errorMessage(error),
      });
    }
  }

  private liveBlockReason(
    message: Extract<PipelinePanelMessage, { type: "run" }>,
  ): string | undefined {
    if (message.inputSource !== "manual")
      return "Live preview only reads manual input.";
    if (message.outputTarget !== "preview")
      return "Live preview never performs output side effects.";
    if (message.manualInput.length > MAX_LIVE_INPUT_CHARACTERS)
      return `Manual input exceeds the live preview limit (${MAX_LIVE_INPUT_CHARACTERS.toLocaleString()} characters); use Run.`;
    const unsafe = firstUnsafeLiveOperation(
      message.steps,
      (opName) => this.descriptorByName.get(opName)?.manualBake ?? true,
    );
    if (unsafe)
      return `${this.descriptorByName.get(unsafe)?.displayName ?? unsafe} requires an explicit run.`;
    return undefined;
  }

  private graphLiveBlockReason(
    message: Extract<PipelinePanelMessage, { type: "runGraph" }>,
  ): string | undefined {
    if (message.inputSource !== "manual")
      return "Live preview only reads manual input.";
    if (message.outputTarget !== "preview")
      return "Live preview never performs output side effects.";
    if (message.manualInput.length > MAX_LIVE_INPUT_CHARACTERS)
      return `Manual input exceeds the live preview limit (${MAX_LIVE_INPUT_CHARACTERS.toLocaleString()} characters); use Run.`;
    const reachable = new Set(
      validatePipelineGraph(message.graph).reachableNodeIds,
    );
    const unsafe = message.graph.nodes.find(
      (node) =>
        node.type === "operation" &&
        reachable.has(node.id) &&
        !this.descriptorByName.get(node.opName)?.liveSafe,
    );
    if (unsafe?.type === "operation") {
      return `${this.descriptorByName.get(unsafe.opName)?.displayName ?? unsafe.opName} requires an explicit run.`;
    }
    return undefined;
  }

  private graphValueText(
    graph: PipelineGraph,
    path: readonly string[],
    value: unknown,
  ): string {
    for (let index = path.length - 1; index >= 0; index -= 1) {
      const node = graph.nodes.find((candidate) => candidate.id === path[index]);
      if (node?.type !== "operation") continue;
      return presentGraphValue(
        value,
        this.descriptorByName.get(node.opName)?.outputType,
      );
    }
    return presentGraphValue(value, "string");
  }

  private postGraphNodeEvent(
    requestId: number,
    generation: number,
    graph: PipelineGraph,
    event: PipelineGraphNodeEvent,
  ): void {
    if (!this.runCoordinator.isCurrent(generation)) return;
    let preview: GraphTextPreview | undefined;
    if (Object.prototype.hasOwnProperty.call(event, "value")) {
      preview = boundedGraphPreview(
        this.graphValueText(graph, event.path, event.value),
        GRAPH_NODE_PREVIEW_CHARACTERS,
      );
    }
    this.post({
      type: "graphNodeResult",
      requestId,
      nodeId: event.nodeId,
      status: event.status,
      path: event.path,
      ...(preview
        ? {
            preview: preview.value,
            totalLength: preview.totalLength,
            truncated: preview.truncated,
          }
        : {}),
      ...(event.error ? { error: event.error.message } : {}),
    });
  }

  private graphOutputPayloads(
    graph: PipelineGraph,
    results: ReadonlyMap<string, PipelineGraphOutputResult>,
  ): GraphOutputPayload[] {
    return buildGraphOutputPayloads(graph, results, (result) =>
      this.graphValueText(graph, result.path, result.value),
    );
  }

  private async run(
    message: Extract<PipelinePanelMessage, { type: "run" }>,
  ): Promise<void> {
    this.graphAbortController?.abort();
    this.graphAbortController = undefined;
    const generation = this.runCoordinator.beginRun();
    if (!message.explicit) {
      const reason = this.liveBlockReason(message);
      if (reason) {
        this.post({
          type: "liveBlocked",
          requestId: message.requestId,
          value: reason,
        });
        return;
      }
    }

    try {
      const input = await readPipelineInput(
        message.inputSource,
        message.manualInput,
        undefined,
        this.lastTextEditor,
      );
      if (!this.runCoordinator.isCurrent(generation)) return;
      const pipelineInput = this.variableStore
        ? resolveVariableTemplates(input.text, this.variableStore)
        : input.text;

      const steps = toPipelineSteps(message.steps);
      const result = await runPipeline(
        pipelineInput,
        steps,
        message.explicit
          ? undefined
          : { maxIntermediateSize: MAX_LIVE_OUTPUT_CHARACTERS },
      );
      if (!this.runCoordinator.isCurrent(generation)) return;

      const inputPreview = pipelinePreview(pipelineInput);
      const outputPreview = pipelinePreview(result);

      // Preview is always sent before an optional side effect. If delivery
      // fails, the transformed data remains available to the user.
      this.post({
        type: "result",
        requestId: message.requestId,
        preview: outputPreview.value,
        totalLength: outputPreview.totalLength,
        truncated: outputPreview.truncated,
        inputValue: inputPreview.value,
        inputLength: inputPreview.totalLength,
        inputTruncated: inputPreview.truncated,
        outputApplied: message.outputTarget === "preview",
      });
      log(
        `Pipeline editor ran ${steps.length} step(s), ${pipelineInput.length} → ${result.length} chars`,
      );

      try {
        assertPipelineOutputSize(result);
      } catch (error) {
        this.post({
          type: "outputError",
          requestId: message.requestId,
          value: errorMessage(error),
        });
        return;
      }

      if (!message.explicit && result.length > MAX_LIVE_OUTPUT_CHARACTERS) {
        this.post({
          type: "liveBlocked",
          requestId: message.requestId,
          value: `Output exceeds the live preview limit (${MAX_LIVE_OUTPUT_CHARACTERS.toLocaleString()} characters); use Run.`,
        });
        return;
      }

      if (!message.explicit || message.outputTarget === "preview") return;
      if (!this.runCoordinator.isCurrent(generation)) return;
      try {
        const delivered = await this.runCoordinator.deliverIfCurrent(
          generation,
          () => deliverPipelineOutput(message.outputTarget, result, input),
        );
        if (!delivered || !this.runCoordinator.isCurrent(generation)) return;
        this.post({
          type: "outputApplied",
          requestId: message.requestId,
          detail: outputDetail(message.outputTarget),
        });
      } catch (error) {
        if (!this.runCoordinator.isCurrent(generation)) return;
        this.post({
          type: "outputError",
          requestId: message.requestId,
          value: errorMessage(error),
        });
      }
    } catch (error) {
      if (!this.runCoordinator.isCurrent(generation)) return;
      if (
        !message.explicit &&
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "PIPELINE_SIZE_LIMIT"
      ) {
        this.post({
          type: "liveBlocked",
          requestId: message.requestId,
          value: errorMessage(error),
        });
        return;
      }
      const progress = errorProgress(error);
      this.post({
        type: "error",
        requestId: message.requestId,
        value: errorMessage(error),
        stepId:
          progress !== undefined ? message.steps[progress]?.id : undefined,
      });
      log(`Pipeline editor run error: ${errorMessage(error)}`);
    }
  }

  private async runGraph(
    message: Extract<PipelinePanelMessage, { type: "runGraph" }>,
  ): Promise<void> {
    this.graphAbortController?.abort();
    const abortController = new AbortController();
    this.graphAbortController = abortController;
    const generation = this.runCoordinator.beginRun();
    if (!message.explicit) {
      const reason = this.graphLiveBlockReason(message);
      if (reason) {
        if (this.graphAbortController === abortController) {
          this.graphAbortController = undefined;
        }
        this.post({
          type: "liveBlocked",
          requestId: message.requestId,
          value: reason,
        });
        return;
      }
    }

    try {
      const input = await readPipelineInput(
        message.inputSource,
        message.manualInput,
        undefined,
        this.lastTextEditor,
      );
      if (!this.runCoordinator.isCurrent(generation)) return;
      const pipelineInput = this.variableStore
        ? resolveVariableTemplates(input.text, this.variableStore)
        : input.text;
      const results = await runPipelineGraph(message.graph, pipelineInput, {
        live: !message.explicit,
        allowedOperations: message.explicit
          ? undefined
          : (opName) => this.descriptorByName.get(opName)?.liveSafe === true,
        maxInputSize: message.explicit
          ? MAX_PIPELINE_INPUT_CHARACTERS * 4
          : MAX_LIVE_INPUT_CHARACTERS * 4,
        maxNodeOutputSize: message.explicit
          ? MAX_PIPELINE_OUTPUT_CHARACTERS
          : MAX_LIVE_OUTPUT_CHARACTERS,
        maxTotalOutputSize: message.explicit
          ? MAX_PIPELINE_OUTPUT_CHARACTERS
          : MAX_LIVE_OUTPUT_CHARACTERS * 4,
        signal: abortController.signal,
        onNodeSettled: (event) =>
          this.postGraphNodeEvent(
            message.requestId,
            generation,
            message.graph,
            event,
          ),
      });
      if (!this.runCoordinator.isCurrent(generation)) return;

      const inputPreview = pipelinePreview(pipelineInput);
      const outputs = this.graphOutputPayloads(message.graph, results);
      const failedNodeId = [...results.values()].find(
        (result) => result.error,
      )?.error?.nodeId;
      this.post({
        type: "graphResult",
        requestId: message.requestId,
        outputs,
        inputValue: inputPreview.value,
        inputLength: inputPreview.totalLength,
        inputTruncated: inputPreview.truncated,
        failedNodeId,
        outputApplied: message.outputTarget === "preview",
      });
      log(
        `Pipeline graph ran ${message.graph.nodes.length} node(s), ${pipelineInput.length} input characters, ${outputs.length} output(s)`,
      );

      if (!message.explicit || message.outputTarget === "preview") return;
      if (!this.runCoordinator.isCurrent(generation)) return;
      const selected =
        (message.activeOutputId
          ? results.get(message.activeOutputId)
          : undefined) ??
        [...results.values()].find((result) => !result.error);
      if (!selected) {
        this.post({
          type: "outputError",
          requestId: message.requestId,
          value: "The graph has no connected output to deliver.",
        });
        return;
      }
      if (selected.error) {
        this.post({
          type: "outputError",
          requestId: message.requestId,
          value: selected.error.message,
        });
        return;
      }
      const result = this.graphValueText(
        message.graph,
        selected.path,
        selected.value,
      );
      try {
        assertPipelineOutputSize(result);
        const delivered = await this.runCoordinator.deliverIfCurrent(
          generation,
          () => deliverPipelineOutput(message.outputTarget, result, input),
        );
        if (!delivered || !this.runCoordinator.isCurrent(generation)) return;
        this.post({
          type: "outputApplied",
          requestId: message.requestId,
          detail: `${selected.name}: ${outputDetail(message.outputTarget)}`,
        });
      } catch (error) {
        if (!this.runCoordinator.isCurrent(generation)) return;
        this.post({
          type: "outputError",
          requestId: message.requestId,
          value: errorMessage(error),
        });
      }
    } catch (error) {
      if (!this.runCoordinator.isCurrent(generation)) return;
      if (!message.explicit) {
        this.post({
          type: "liveBlocked",
          requestId: message.requestId,
          value: errorMessage(error),
        });
        return;
      }
      this.post({
        type: "error",
        requestId: message.requestId,
        value: errorMessage(error),
      });
      log(`Pipeline graph run error: ${errorMessage(error)}`);
    } finally {
      if (this.graphAbortController === abortController) {
        this.graphAbortController = undefined;
      }
    }
  }

  private async save(
    message: Extract<PipelinePanelMessage, { type: "save" }>,
  ): Promise<void> {
    const name = message.name.trim();
    if (!name) {
      vscode.window.showWarningMessage("Pipeline name required.");
      return;
    }
    let steps = toPipelineSteps(message.steps);
    const graphReachable = message.graph
      ? new Set(validatePipelineGraph(message.graph).reachableNodeIds)
      : new Set<string>();
    const persistGraph =
      message.graph &&
      message.graph.nodes.every(
        (node) =>
          node.type !== "operation" ||
          !graphReachable.has(node.id) ||
          this.knownGraphOperations.has(node.opName),
      )
        ? message.graph
        : undefined;
    if (message.graph) {
      const outputIds = [
        ...(message.activeOutputId ? [message.activeOutputId] : []),
        ...message.graph.nodes
          .filter((node) => node.type === "output")
          .map((node) => node.id)
          .filter((id) => id !== message.activeOutputId),
      ];
      for (const outputId of outputIds) {
        const branchSteps = graphStepsForOutput(message.graph, outputId);
        if (branchSteps !== undefined) {
          steps = branchSteps;
          break;
        }
      }
    }
    // Persist one canonical representation derived from the validated steps.
    // Never trust a separately supplied raw string to describe different or
    // stale steps than the pipeline that will actually execute.
    const raw = serialisePanelPipeline(
      toPanelSteps(steps),
      (opName) => this.descriptorByName.get(opName)?.displayName ?? opName,
    );
    const defaultPipelineScope = vscode.workspace
      .getConfiguration("tschef")
      .get<StorageScope>("defaultPipelineScope", "global");
    const scope = await pickScope(
      defaultPipelineScope,
      `Save pipeline "${name}"`,
    );
    if (!scope) return;
    const pipeline: Pipeline = {
      name,
      raw,
      steps,
      description: message.description.trim() || undefined,
      ...(persistGraph ? { graph: persistGraph } : {}),
      ...(persistGraph && message.activeOutputId
        ? { activeOutputId: message.activeOutputId }
        : {}),
    };
    const saved = this.store.upsert(scope, pipeline);
    if (!saved) {
      this.post({
        type: "saveFailed",
        value: "Pipeline was not saved. Check the storage warning and choose an available scope.",
      });
      return;
    }
    this.initial = pipeline;
    void vscode.commands.executeCommand("tschef.refreshPipelines");
    this.post({ type: "saved", value: `${name} (${scope})` });
    log(
      `Pipeline "${name}" saved (${steps.length} primary step(s), ${persistGraph?.nodes.length ?? 0} graph node(s), ${scope})`,
    );
    vscode.window.showInformationMessage(
      `ts-chef: Pipeline "${name}" saved (${scope}).`,
    );
  }
}

function getNonce(): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";
  for (let index = 0; index < 32; index++) {
    nonce += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return nonce;
}
