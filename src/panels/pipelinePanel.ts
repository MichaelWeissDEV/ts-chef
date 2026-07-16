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
  private readonly descriptorByName = new Map(
    this.descriptors.map((operation) => [operation.opName, operation]),
  );
  private ready = false;
  private initial: Pipeline | undefined;
  private requestedMode: PipelineEditorMode | undefined;
  private readonly runCoordinator = new PipelineRunCoordinator();
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
    this.runCoordinator.invalidate();
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
  } {
    const steps = toPanelSteps(pipeline?.steps ?? []);
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
    };
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
    const decoded = decodePipelinePanelMessage(raw, this.knownOperations);
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
        this.runCoordinator.invalidate();
        return;
      case "parseRaw":
        this.runCoordinator.invalidate();
        this.parseRaw(message);
        return;
      case "run":
        await this.run(message);
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

  private async run(
    message: Extract<PipelinePanelMessage, { type: "run" }>,
  ): Promise<void> {
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

  private async save(
    message: Extract<PipelinePanelMessage, { type: "save" }>,
  ): Promise<void> {
    const name = message.name.trim();
    if (!name) {
      vscode.window.showWarningMessage("Pipeline name required.");
      return;
    }
    const steps = toPipelineSteps(message.steps);
    // Persist one canonical representation derived from the validated steps.
    // Never trust a separately supplied raw string to describe different or
    // stale steps than the pipeline that will actually execute.
    const raw = serialisePanelPipeline(
      message.steps,
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
    const saved = this.store.upsert(scope, {
      name,
      raw,
      steps,
      description: message.description.trim() || undefined,
    });
    if (!saved) {
      this.post({
        type: "saveFailed",
        value: "Pipeline was not saved. Check the storage warning and choose an available scope.",
      });
      return;
    }
    void vscode.commands.executeCommand("tschef.refreshPipelines");
    this.post({ type: "saved", value: `${name} (${scope})` });
    log(`Pipeline "${name}" saved (${steps.length} step(s), ${scope})`);
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
