/**
 * @fileoverview VS Code extension entry point for ts-chef
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as vscode from "vscode";
import { createHash } from "crypto";
import { ScanState } from "./providers/scanState";
import { DecorationProvider } from "./providers/decorationProvider";
import {
  HoverProvider,
  type HoverOperationPayload,
  type HoverPipelinePayload,
  type HoverReplacementPayload,
  type HoverTextTarget,
} from "./providers/hoverProvider";
import { PatternsTreeProvider } from "./providers/patternsTreeProvider";
import { VariablesTreeProvider } from "./providers/variablesTreeProvider";
import { PipelinesTreeProvider } from "./providers/pipelinesTreeProvider";
import {
  VariableStore,
  PipelineStore,
  type StorageScope,
  type Pipeline,
} from "./storage/store";
import { resolveVariableTemplates } from "./storage/variableResolution";
import { PipelinePanel } from "./panels/pipelinePanel";
import { runPipelineGraph } from "./panels/pipelineGraphRunner";
import {
  type PipelineGraph,
  validatePipelineGraph,
} from "./panels/pipelineGraphModel";
import {
  runOpAsync,
  parsePipeline,
  runPipeline,
  resolveDefaultArg,
  presentBytes,
} from "./commands/runner";
import { EntropyMapProvider } from "./providers/entropyMapProvider";
import { detectFormat, makeReadable } from "./providers/format";
import {
  capturePipelineResultTarget,
  presentPipelineResult,
  type ResultRenderer,
} from "./commands/pipelineResult";
import {
  captureTextEditSnapshot,
  replaceTextEditSnapshot,
  type TextEditSnapshot,
} from "./commands/textEditSnapshot";
import { InlineResultController } from "./commands/inlineResult";
import { WebviewResultController } from "./commands/webviewResult";
import {
  OperationsViewProvider,
  type OpInfo,
} from "./providers/operationsViewProvider";
import {
  RecipeViewProvider,
  type RecipeStep,
} from "./providers/recipeViewProvider";
import { pickScope } from "./commands/scopePicker";
import {
  loadStandardRecipes,
  type BuiltInPipeline,
} from "./recipes/standardRecipes";
import {
  analyseMalwarePayload,
  renderMalwareTriageMarkdown,
} from "./analysis/malwareTriage";
import {
  MAX_YARA_RULE_BYTES,
  MAX_YARA_SAMPLE_BYTES,
  yaraLimitError,
} from "./chef/operations/YARARules";

/** The configured default scope for a given preset kind. */
function defaultScope(
  key: "defaultVariableScope" | "defaultPipelineScope",
): StorageScope {
  return vscode.workspace
    .getConfiguration("tschef")
    .get<StorageScope>(key, "global");
}
import { magicAnalyse, stringStats, type MagicChain } from "./providers/magic";
import { initOutputChannel, log } from "./logger";
import registry from "./opsRegistry";
import type { ArgConfig, Operation } from "./chef/Operation";
import {
  ActionHistory,
  describeHistoryAction,
  parseShortcutRegistry,
  type HistoryAction,
  type ShortcutBinding,
} from "./commands/shortcutRegistry";

function resultToString(result: unknown, outputType?: string): string {
  const normalisedType = outputType?.toLowerCase().replace(/[^a-z]/g, "");
  if (normalisedType === "json" || normalisedType === "object") {
    try {
      return JSON.stringify(result, null, 2) ?? "";
    } catch {
      return String(result ?? "");
    }
  }
  let bytes: Buffer | undefined;
  if (result instanceof ArrayBuffer)
    bytes = Buffer.from(new Uint8Array(result));
  else if (Buffer.isBuffer(result) || result instanceof Uint8Array)
    bytes = Buffer.from(result);
  else if (
    (normalisedType === "bytearray" || normalisedType === "arraybuffer") &&
    Array.isArray(result) &&
    result.every(
      (item) =>
        Number.isInteger(item) && Number(item) >= 0 && Number(item) <= 255,
    )
  )
    bytes = Buffer.from(result as number[]);
  if (bytes) {
    return presentBytes(bytes);
  }
  if (typeof result === "string") return result;
  if (result === null || result === undefined) return "";
  try {
    return JSON.stringify(result, null, 2) ?? String(result);
  } catch {
    return String(result);
  }
}

function graphOutputType(
  graph: PipelineGraph,
  path: readonly string[],
): string {
  for (let index = path.length - 1; index >= 0; index -= 1) {
    const node = graph.nodes.find((candidate) => candidate.id === path[index]);
    if (node?.type !== "operation") continue;
    return (
      registry.find((entry) => entry.opName === node.opName)?.factory()
        .outputType ?? "string"
    );
  }
  return "string";
}

function graphSupportsDirectExecution(graph: PipelineGraph): boolean {
  const reachable = new Set(validatePipelineGraph(graph).reachableNodeIds);
  return graph.nodes.every((node) => {
    if (node.type !== "operation" || !reachable.has(node.id)) return true;
    const entry = registry.find(
      (candidate) => candidate.opName === node.opName,
    );
    return Boolean(entry && !entry.factory().flowControl);
  });
}

async function runSavedGraph(
  graph: PipelineGraph,
  input: string,
  activeOutputId?: string,
): Promise<{ text: string; outputName: string } | undefined> {
  const results = await runPipelineGraph(graph, input);
  const values = [...results.values()];
  if (values.length === 0) {
    throw new Error("The graph has no output nodes.");
  }
  let selected =
    values.find((result) => result.outputId === activeOutputId) ?? values[0];
  if (values.length > 1) {
    const picked = await vscode.window.showQuickPick(
      values.map((result) => ({
        label: result.error
          ? `$(error) ${result.name}`
          : `$(output) ${result.name}`,
        description: result.error ? "failed" : "ready",
        detail: result.error?.message ?? `${result.path.length} graph nodes`,
        picked: result.outputId === selected.outputId,
        result,
      })),
      {
        title: "Choose Graph Output",
        placeHolder: "Select the output to write back to the editor",
        matchOnDescription: true,
        matchOnDetail: true,
      },
    );
    if (!picked) return undefined;
    selected = picked.result;
  }
  if (selected.error) throw new Error(selected.error.message);
  return {
    text: resultToString(selected.value, graphOutputType(graph, selected.path)),
    outputName: selected.name,
  };
}

function parseCommandPayload<T>(payload: T | string): T {
  if (typeof payload !== "string") return payload;
  return JSON.parse(decodeURIComponent(payload)) as T;
}

function targetRange(target: HoverTextTarget): vscode.Range {
  return new vscode.Range(
    target.start.line,
    target.start.character,
    target.end.line,
    target.end.character,
  );
}

async function promptForArgs(opInstance: Operation): Promise<unknown[] | null> {
  const result: unknown[] = [];
  for (const argDef of opInstance.args) {
    if (argDef.type === "toggleString" && (argDef.value as string) === "") {
      const strVal = await vscode.window.showInputBox({
        prompt: argDef.name,
        placeHolder: `Enter ${argDef.name.toLowerCase()} (encoding: ${argDef.toggleValues?.join(" / ") ?? "Hex"})`,
      });
      if (strVal === undefined) return null;
      const encoding =
        argDef.toggleValues && argDef.toggleValues.length > 1
          ? await vscode.window.showQuickPick(argDef.toggleValues, {
              placeHolder: `Encoding for "${argDef.name}"`,
            })
          : argDef.toggleValues?.[0];
      if (encoding === undefined) return null;
      result.push({ string: strVal, option: encoding });
    } else {
      result.push(resolveDefaultArg(argDef));
    }
  }
  return result;
}

let opPickItemsCache:
  | (vscode.QuickPickItem & { opName?: string })[]
  | undefined;

function buildOpPickItems(): (vscode.QuickPickItem & { opName?: string })[] {
  if (opPickItemsCache) return opPickItemsCache;
  const byModule = new Map<string, typeof registry>();
  for (const e of registry) {
    const mod = e.module || "Other";
    if (!byModule.has(mod)) byModule.set(mod, []);
    byModule.get(mod)!.push(e);
  }
  const items: (vscode.QuickPickItem & { opName?: string })[] = [];
  for (const [mod, ops] of byModule) {
    items.push({ label: mod, kind: vscode.QuickPickItemKind.Separator });
    for (const e of ops) {
      const inst = e.factory();
      const needsInput = inst.args.some(
        (a) => a.type === "toggleString" && (a.value as string) === "",
      );
      const requiredNames = inst.args
        .filter((a) => a.type === "toggleString" && (a.value as string) === "")
        .map((a) => a.name)
        .join(", ");
      items.push({
        label: e.displayName,
        description: needsInput ? `$(key) needs: ${requiredNames}` : undefined,
        opName: e.opName,
      });
    }
  }
  opPickItemsCache = items;
  return opPickItemsCache;
}

/**
 * Extension entry point called by VS Code when the extension is first activated.
 * Registers all providers, tree views, commands, and event listeners for the lifetime
 * of the extension.
 *
 * @param context - The extension context used to register disposables and access storage.
 */
export function activate(context: vscode.ExtensionContext): void {
  initOutputChannel(context);
  log("Extension activated");

  const scanState = new ScanState();
  const decorations = new DecorationProvider(scanState);
  const entropyMap = new EntropyMapProvider();
  context.subscriptions.push({ dispose: () => entropyMap.dispose() });
  const globalDir = context.globalStorageUri.fsPath;
  const varStore = new VariableStore(globalDir);
  const pipeStore = new PipelineStore(globalDir);
  let standardPipelineCache: BuiltInPipeline[] | undefined;
  const standardPipelines = (): BuiltInPipeline[] =>
    (standardPipelineCache ??= loadStandardRecipes());
  const historyCapacity = vscode.workspace
    .getConfiguration("tschef")
    .get<number>("shortcutHistorySize", 100);
  const actionHistory = new ActionHistory(
    Number.isFinite(historyCapacity)
      ? Math.max(1, Math.min(10_000, Math.trunc(historyCapacity)))
      : 100,
  );

  const allPipelines = (): Array<Pipeline | BuiltInPipeline> => [
    ...standardPipelines(),
    ...pipeStore.loadAll(),
  ];
  type PipelineCommandValue =
    | string
    | Pipeline
    | BuiltInPipeline
    | { pipeline?: Pipeline | BuiltInPipeline };
  const resolvePipeline = (
    value: PipelineCommandValue | undefined,
  ): Pipeline | BuiltInPipeline | undefined => {
    if (!value) return undefined;
    let resolved: Pipeline | BuiltInPipeline | undefined;
    if (typeof value === "object" && "pipeline" in value) {
      resolved = value.pipeline;
    } else if (typeof value !== "string") {
      resolved = value as Pipeline | BuiltInPipeline;
    } else {
      resolved =
        pipeStore.findByName(value) ??
        standardPipelines().find(
          (pipeline) => pipeline.id === value || pipeline.name === value,
        );
    }
    if (
      resolved &&
      vscode.workspace.isTrusted === false &&
      (resolved as Pipeline & { scope?: string }).scope === "workspace"
    ) {
      void vscode.window.showWarningMessage(
        "ts-chef: Workspace pipelines are unavailable in Restricted Mode.",
      );
      return undefined;
    }
    return resolved;
  };

  const patternsTree = new PatternsTreeProvider(scanState);
  const varTree = new VariablesTreeProvider(varStore);
  const pipeTree = new PipelinesTreeProvider(pipeStore, standardPipelines);

  // Drives the Follow/Pin toggle button shown in the Patterns view title bar.
  void vscode.commands.executeCommand(
    "setContext",
    "tschef.patternsFollow",
    patternsTree.isFollowing(),
  );

  /** Whether a document is worth auto-scanning when it gains focus. */
  function isScannableDoc(doc: vscode.TextDocument): boolean {
    return (
      doc.uri.scheme === "file" &&
      !doc.isUntitled &&
      doc.lineCount > 0 &&
      doc.getText().length <= 512 * 1024
    );
  }

  /**
   * React to the active editor changing: if the Patterns view follows the
   * active editor, switch it to that document (optionally auto-scanning it).
   */
  function onEditorFocused(editor: vscode.TextEditor): void {
    if (!patternsTree.isFollowing()) return;
    const cfg = vscode.workspace.getConfiguration("tschef");
    if (
      cfg.get("patterns.autoScanOnFocus", false) &&
      !scanState.hasScanned(editor.document.uri) &&
      isScannableDoc(editor.document)
    ) {
      scanState.scan(editor.document); // fires change → tree refresh
    } else {
      patternsTree.focusActive();
    }
  }

  // Custom result presenters for the `inline` / `panel` modes, injected into
  // presentPipelineResult via the renderer map below.
  const inlineResult = new InlineResultController();
  const webviewResult = new WebviewResultController();
  inlineResult.register(context);
  webviewResult.register(context);
  const resultRenderers: Partial<Record<"inline" | "panel", ResultRenderer>> = {
    inline: (editor, result, target) =>
      inlineResult.show(editor, result, target),
    panel: (editor, result, target) =>
      webviewResult.show(editor, result, target),
  };

  // Lazily instantiate operations only when their arg defs are first needed,
  // so the 479 ops aren't all constructed at startup.
  const argDefsCache = new Map<string, ArgConfig[]>();
  const argDefsFor = (opName: string): ArgConfig[] | undefined => {
    const cached = argDefsCache.get(opName);
    if (cached) return cached;
    const entry = registry.find((e) => e.opName === opName);
    if (!entry) return undefined;
    const defs = entry.factory().args;
    argDefsCache.set(opName, defs);
    return defs;
  };
  const displayNameFor = (opName: string): string =>
    registry.find((e) => e.opName === opName)?.displayName ?? opName;

  const operationAction = (
    opName: string,
    args: unknown[],
    label = displayNameFor(opName),
  ): HistoryAction => ({ kind: "operation", opName, args, label });

  const pipelineAction = (
    steps: Pipeline["steps"],
    label: string,
  ): HistoryAction =>
    steps.length === 1
      ? operationAction(steps[0].opName, steps[0].args, label)
      : { kind: "pipeline", steps, label };

  /** Repeat an action against the current selection/document without re-recording it. */
  async function applyHistoryAction(action: HistoryAction): Promise<boolean> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage("ts-chef: No active editor.");
      return false;
    }
    const target = capturePipelineResultTarget(editor);
    const input = resolveVariableTemplates(target.value, varStore);
    try {
      let result: string;
      if (action.kind === "operation") {
        const meta = registry.find((entry) => entry.opName === action.opName);
        if (!meta) throw new Error(`Unknown operation: ${action.opName}`);
        result = resultToString(
          await runOpAsync(action.opName, input, action.args),
          meta.factory().outputType,
        );
      } else {
        result = await runPipeline(input, action.steps);
      }
      if (result === "" && target.value !== "") {
        vscode.window.showWarningMessage(
          `ts-chef: "${action.label}" produced an empty result — nothing replaced.`,
        );
        return false;
      }
      if (!(await replaceTextEditSnapshot(target, result))) return false;
      log(`Shortcut/history action applied: "${action.label}"`);
      vscode.window.setStatusBarMessage(
        `ts-chef: Applied "${describeHistoryAction(action)}"`,
        3000,
      );
      return true;
    } catch (error) {
      log(`Shortcut/history action error: ${error}`);
      vscode.window.showErrorMessage(`ts-chef: ${error}`);
      return false;
    }
  }

  // ---- Operations + Recipe sidebars (WebviewViews) ----
  const recipeView = new RecipeViewProvider({
    argDefsFor,
    displayNameFor,
    apply: (steps) => applyRecipeToSelection(steps),
    save: (name, steps) => saveRecipeAsPipeline(name, steps),
  });
  const operationsView = new OperationsViewProvider({
    listOps: (): OpInfo[] =>
      registry.map((e) => ({
        opName: e.opName,
        displayName: e.displayName,
        module: e.module || "Other",
      })),
    apply: (opName) =>
      vscode.commands.executeCommand("tschef.applyOperation", opName),
    addToRecipe: (opName) => recipeView.addOperation(opName),
  });

  /** Re-open and revalidate the exact text range captured by a hover action. */
  async function resolveHoverTarget(
    target: HoverTextTarget,
  ): Promise<TextEditSnapshot | undefined> {
    try {
      const uri = vscode.Uri.parse(target.uri);
      const document = await vscode.workspace.openTextDocument(uri);
      const range = targetRange(target);
      const value = document.getText(range);
      const digest = createHash("sha256").update(value, "utf-8").digest("hex");
      if (digest !== target.sha256) {
        vscode.window.showWarningMessage(
          "ts-chef: The hovered text changed. Hover it again before applying the conversion.",
        );
        return undefined;
      }
      const editor =
        vscode.window.visibleTextEditors.find(
          (candidate) => candidate.document.uri.toString() === uri.toString(),
        ) ?? (await vscode.window.showTextDocument(document));
      const snapshot = captureTextEditSnapshot(editor, range);
      if (snapshot.value !== value) {
        vscode.window.showWarningMessage(
          "ts-chef: The hovered text changed. Hover it again before applying the conversion.",
        );
        return undefined;
      }
      return snapshot;
    } catch (error) {
      log(`Hover target validation failed: ${error}`);
      vscode.window.showWarningMessage(
        "ts-chef: The original hover target is no longer available.",
      );
      return undefined;
    }
  }

  async function applyRecipeToSelection(steps: RecipeStep[]): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage("ts-chef: No active editor.");
      return;
    }
    if (!steps.length) {
      vscode.window.showWarningMessage("ts-chef: The recipe is empty.");
      return;
    }
    const target = capturePipelineResultTarget(editor);
    try {
      const result = await runPipeline(
        resolveVariableTemplates(target.value, varStore),
        steps,
      );
      log(`Recipe applied: ${steps.length} step(s)`);
      await presentPipelineResult(
        editor,
        result,
        "Recipe",
        resultRenderers,
        target,
      );
      actionHistory.record(pipelineAction(steps, "Recipe"));
    } catch (e) {
      log(`Recipe error: ${e}`);
      vscode.window.showErrorMessage(`ts-chef recipe error: ${e}`);
    }
  }

  async function saveRecipeAsPipeline(
    name: string,
    steps: RecipeStep[],
  ): Promise<void> {
    if (!name) {
      vscode.window.showWarningMessage(
        "ts-chef: Name the recipe before saving.",
      );
      return;
    }
    if (!steps.length) {
      vscode.window.showWarningMessage("ts-chef: The recipe is empty.");
      return;
    }
    const scope = await pickScope(
      defaultScope("defaultPipelineScope"),
      `Save recipe "${name}"`,
    );
    if (!scope) return;
    const raw = steps.map((s) => displayNameFor(s.opName)).join(" | ");
    if (!pipeStore.upsert(scope, { name, raw, steps })) return;
    pipeTree.refresh();
    log(
      `Recipe "${name}" saved as pipeline (${steps.length} step(s), ${scope})`,
    );
    vscode.window.showInformationMessage(
      `ts-chef: Recipe "${name}" saved (${scope}).`,
    );
  }

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("tschef.patternsView", patternsTree),
    vscode.window.registerTreeDataProvider("tschef.variablesView", varTree),
    vscode.window.registerTreeDataProvider("tschef.pipelinesView", pipeTree),
    vscode.window.registerWebviewViewProvider(
      OperationsViewProvider.viewType,
      operationsView,
    ),
    vscode.window.registerWebviewViewProvider(
      RecipeViewProvider.viewType,
      recipeView,
    ),
    vscode.languages.registerHoverProvider(
      { scheme: "*" },
      new HoverProvider(scanState),
    ),
  );

  let debounceTimeout: NodeJS.Timeout | undefined;
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        decorations.update(editor);
        entropyMap.update(editor);
        onEditorFocused(editor);
      }
    }),
    vscode.workspace.onDidChangeTextDocument((e) => {
      // Cached ranges refer to a specific document snapshot. Discard them on
      // the first edit so decorations, the tree and legacy hover actions can
      // never target shifted or stale text. Instant hover still analyses the
      // current line on demand.
      if (scanState.hasScanned(e.document.uri)) {
        scanState.clear(e.document.uri);
      }
      const editor = vscode.window.activeTextEditor;
      if (editor && e.document === editor.document) {
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }
        debounceTimeout = setTimeout(() => {
          decorations.update(editor);
          entropyMap.update(editor);
        }, 200);
      }
    }),
  );

  // ---- Commands ----

  let shortcutBindings: ShortcutBinding[] = [];
  const dynamicShortcutCommands = new Map<string, vscode.Disposable>();

  const historyActionFor = (
    target: ShortcutBinding["target"],
  ): HistoryAction | undefined => {
    switch (target.kind) {
      case "history-last":
        return actionHistory.last();
      case "history-previous":
        return actionHistory.previous();
      case "history-next":
        return actionHistory.next();
      case "history-offset":
        return actionHistory.at(target.offset);
      default:
        return undefined;
    }
  };

  async function executeShortcut(binding: ShortcutBinding): Promise<void> {
    const target = binding.target;
    if (
      target.kind === "history-last" ||
      target.kind === "history-previous" ||
      target.kind === "history-next" ||
      target.kind === "history-offset"
    ) {
      const action = historyActionFor(target);
      if (!action) {
        vscode.window.showInformationMessage(
          "ts-chef: The operation history is empty or does not reach that far back.",
        );
        return;
      }
      await applyHistoryAction(action);
      return;
    }

    let action: HistoryAction;
    if (target.kind === "saved-pipeline") {
      const pipeline = resolvePipeline(target.name);
      if (!pipeline) {
        vscode.window.showWarningMessage(
          `ts-chef: Saved pipeline "${target.name}" was not found.`,
        );
        return;
      }
      action = pipelineAction(pipeline.steps, pipeline.name);
    } else {
      try {
        const steps = parsePipeline(target.expression);
        if (steps.length === 0) throw new Error("Pipeline is empty");
        action = pipelineAction(steps, binding.id);
      } catch (error) {
        vscode.window.showErrorMessage(
          `ts-chef shortcut "${binding.id}": ${error}`,
        );
        return;
      }
    }

    if (await applyHistoryAction(action)) actionHistory.record(action);
  }

  function syncShortcutCommands(showProblems = false): void {
    for (const disposable of dynamicShortcutCommands.values()) {
      disposable.dispose();
    }
    dynamicShortcutCommands.clear();

    const raw = vscode.workspace
      .getConfiguration("tschef")
      .get<Record<string, unknown>>("shortcuts", {});
    const parsed = parseShortcutRegistry(raw);
    shortcutBindings = parsed.bindings;
    for (const binding of shortcutBindings) {
      dynamicShortcutCommands.set(
        binding.command,
        vscode.commands.registerCommand(binding.command, () =>
          executeShortcut(binding),
        ),
      );
    }
    if (parsed.issues.length > 0) {
      log(`Shortcut registry: ${parsed.issues.join("; ")}`);
      if (showProblems) {
        vscode.window.showWarningMessage(
          `ts-chef: ${parsed.issues.length} shortcut registry entr${parsed.issues.length === 1 ? "y was" : "ies were"} ignored. See the ts-chef output for details.`,
        );
      }
    }
    log(`Shortcut registry loaded: ${shortcutBindings.length} command(s)`);
  }

  syncShortcutCommands();
  context.subscriptions.push(
    {
      dispose: () => dynamicShortcutCommands.forEach((item) => item.dispose()),
    },
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("tschef.shortcuts")) {
        syncShortcutCommands(true);
      }
    }),
    vscode.commands.registerCommand(
      "tschef.runShortcut",
      async (requested?: string | { id?: string }) => {
        const id = typeof requested === "string" ? requested : requested?.id;
        let binding = id
          ? shortcutBindings.find((candidate) => candidate.id === id)
          : undefined;
        if (!binding) {
          if (shortcutBindings.length === 0) {
            vscode.window.showInformationMessage(
              "ts-chef: No shortcut registry entries are configured.",
            );
            return;
          }
          const picked = await vscode.window.showQuickPick(
            shortcutBindings.map((candidate) => ({
              label: candidate.id,
              description: candidate.expression,
              detail: candidate.command,
              binding: candidate,
            })),
            {
              title: "Run Registered ts-chef Shortcut",
              placeHolder: "Choose an operation, pipeline, or history action…",
              matchOnDescription: true,
              matchOnDetail: true,
            },
          );
          binding = picked?.binding;
        }
        if (binding) await executeShortcut(binding);
      },
    ),
    vscode.commands.registerCommand("tschef.repeatLastOperation", async () => {
      const action = actionHistory.last();
      if (!action) {
        vscode.window.showInformationMessage(
          "ts-chef: No operation has been run in this session yet.",
        );
        return;
      }
      await applyHistoryAction(action);
    }),
    vscode.commands.registerCommand(
      "tschef.cycleOperationHistoryBack",
      async () => {
        const action = actionHistory.previous();
        if (!action) {
          vscode.window.showInformationMessage(
            "ts-chef: No operation has been run in this session yet.",
          );
          return;
        }
        await applyHistoryAction(action);
      },
    ),
    vscode.commands.registerCommand(
      "tschef.cycleOperationHistoryForward",
      async () => {
        const action = actionHistory.next();
        if (!action) {
          vscode.window.showInformationMessage(
            "ts-chef: No operation has been run in this session yet.",
          );
          return;
        }
        await applyHistoryAction(action);
      },
    ),
    vscode.commands.registerCommand(
      "tschef.repeatOperationFromHistory",
      async () => {
        const actions = actionHistory.all();
        if (actions.length === 0) {
          vscode.window.showInformationMessage(
            "ts-chef: No operation has been run in this session yet.",
          );
          return;
        }
        const picked = await vscode.window.showQuickPick(
          actions.map((action, index) => ({
            label: `${index + 1}. ${describeHistoryAction(action)}`,
            description:
              action.kind === "operation"
                ? action.opName
                : action.steps
                    .map((step) => displayNameFor(step.opName))
                    .join(" | "),
            action,
          })),
          {
            title: "Repeat Operation from Session History",
            placeHolder: "1 is the most recently executed action",
            matchOnDescription: true,
          },
        );
        if (picked) await applyHistoryAction(picked.action);
      },
    ),
    vscode.commands.registerCommand("tschef.clearOperationHistory", () => {
      actionHistory.clear();
      vscode.window.setStatusBarMessage(
        "ts-chef: Operation history cleared",
        2500,
      );
    }),
    vscode.commands.registerCommand("tschef.configureShortcuts", async () => {
      const choice = await vscode.window.showInformationMessage(
        "Add entries under tschef.shortcuts, then bind tschef.shortcut.<id> in Keyboard Shortcuts JSON. ts-chef never occupies keys by default.",
        "Open Settings JSON",
        "Open Keyboard Shortcuts JSON",
      );
      if (choice === "Open Settings JSON") {
        await vscode.commands.executeCommand(
          "workbench.action.openSettingsJson",
        );
      } else if (choice === "Open Keyboard Shortcuts JSON") {
        await vscode.commands.executeCommand(
          "workbench.action.openGlobalKeybindingsFile",
        );
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.scanDocument", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("ts-chef: No active editor.");
        return;
      }
      const matches = scanState.scan(editor.document);
      decorations.update(editor);
      log(
        `Scanned "${editor.document.fileName}": ${matches.length} pattern(s) found`,
      );
      vscode.window.showInformationMessage(
        `ts-chef: Found ${matches.length} pattern(s).`,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.toggleHighlight", () => {
      decorations.toggle();
      const state = decorations.isEnabled() ? "enabled" : "disabled";
      log(`Highlighting ${state}`);
      vscode.window.showInformationMessage(`ts-chef: Highlighting ${state}.`);
      if (decorations.isEnabled()) {
        const editor = vscode.window.activeTextEditor;
        if (editor) decorations.update(editor);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.clearScanResults", () => {
      scanState.clear();
      const editor = vscode.window.activeTextEditor;
      if (editor) decorations.update(editor);
      log("Scan results cleared");
    }),
  );

  // tschef.scanWorkspace — scan every (text) file in the workspace for patterns
  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.scanWorkspace", async () => {
      const include =
        "**/*.{txt,log,json,xml,yaml,yml,md,csv,ini,conf,cfg,env,toml,js,jsx,ts,tsx,py,sh,ps1,bat,html,htm,php,java,go,rb,c,cpp,h}";
      const exclude =
        "**/{node_modules,.git,dist,out,build,coverage,vendor}/**";
      const files = await vscode.workspace.findFiles(include, exclude, 300);
      if (!files.length) {
        vscode.window.showInformationMessage(
          "ts-chef: No scannable files found in the workspace.",
        );
        return;
      }

      let totalMatches = 0;
      let filesWithHits = 0;
      let scanned = 0;
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "ts-chef: Scanning workspace",
          cancellable: true,
        },
        async (progress, token) => {
          for (const uri of files) {
            if (token.isCancellationRequested) break;
            progress.report({
              message: `${scanned + 1}/${files.length} — ${uri.path.split("/").pop()}`,
              increment: 100 / files.length,
            });
            try {
              const stat = await vscode.workspace.fs.stat(uri);
              if (stat.size > 512 * 1024) continue; // skip huge files
              const doc = await vscode.workspace.openTextDocument(uri);
              const matches = scanState.scan(doc, false);
              scanned++;
              if (matches.length) {
                filesWithHits++;
                totalMatches += matches.length;
              }
            } catch {
              // unreadable/binary file — skip
            }
          }
        },
      );
      // Show every file's results even while following the active editor.
      patternsTree.pinAll();
      scanState.notify();
      const editor = vscode.window.activeTextEditor;
      if (editor) decorations.update(editor);
      log(
        `Workspace scan: ${scanned} file(s) scanned, ${totalMatches} pattern(s) in ${filesWithHits} file(s)`,
      );
      vscode.window.showInformationMessage(
        `ts-chef: Found ${totalMatches} pattern(s) in ${filesWithHits} of ${scanned} scanned file(s).`,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.refreshScan", () => {
      vscode.commands.executeCommand("tschef.scanDocument");
    }),
  );

  /** Turn Patterns-view following on/off and sync the toggle button + setting. */
  function setPatternsFollow(follow: boolean): void {
    patternsTree.setFollow(follow);
    void vscode.commands.executeCommand(
      "setContext",
      "tschef.patternsFollow",
      follow,
    );
    void vscode.workspace
      .getConfiguration("tschef")
      .update(
        "patterns.followActiveEditor",
        follow,
        vscode.ConfigurationTarget.Global,
      );
    const editor = vscode.window.activeTextEditor;
    if (follow && editor) onEditorFocused(editor);
    vscode.window.setStatusBarMessage(
      follow
        ? "ts-chef: Patterns now follow the active editor"
        : "ts-chef: Patterns pinned — keeping the current results",
      3000,
    );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.followActiveEditorOn", () =>
      setPatternsFollow(true),
    ),
    vscode.commands.registerCommand("tschef.followActiveEditorOff", () =>
      setPatternsFollow(false),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "tschef.revealMatch",
      (uri: vscode.Uri, range: vscode.Range) => {
        vscode.window.showTextDocument(uri).then((editor) => {
          editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
          editor.selection = new vscode.Selection(range.start, range.end);
        });
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.quickConvert", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const selection = editor.selection;
      const target = captureTextEditSnapshot(editor, selection);
      const rawText = target.value;
      if (!rawText) {
        vscode.window.showWarningMessage("ts-chef: Select text first.");
        return;
      }
      const text = resolveVariableTemplates(rawText, varStore);

      const picked = await vscode.window.showQuickPick(buildOpPickItems(), {
        placeHolder: "Pick a ts-chef operation…",
        matchOnDescription: true,
      });
      if (!picked || !picked.opName) return;

      const entry = registry.find((e) => e.opName === picked.opName);
      if (!entry) return;
      const opInstance = entry.factory();
      const args = await promptForArgs(opInstance);
      if (args === null) return;

      try {
        const str = resultToString(
          await runOpAsync(picked.opName, text, args),
          opInstance.outputType,
        );
        if (str === "" && text !== "") {
          vscode.window.showWarningMessage(
            `ts-chef: "${picked.label}" produced an empty result — nothing replaced.`,
          );
          return;
        }
        if (!(await replaceTextEditSnapshot(target, str))) return;
        actionHistory.record(
          operationAction(picked.opName, args, picked.label),
        );
        log(`quickConvert: "${picked.label}" applied`);
        vscode.window.setStatusBarMessage(
          `ts-chef: Applied "${picked.label}"`,
          3000,
        );
      } catch (e) {
        log(`quickConvert error: ${e}`);
        vscode.window.showErrorMessage(`ts-chef: ${e}`);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "tschef.applyConversion",
      async (
        payload:
          | HoverOperationPayload
          | { opName: string; value: string; args: unknown[] }
          | string,
      ) => {
        try {
          const data = parseCommandPayload<
            | HoverOperationPayload
            | { opName: string; value: string; args: unknown[] }
          >(payload);
          let target: TextEditSnapshot;
          if ("target" in data) {
            const resolved = await resolveHoverTarget(data.target);
            if (!resolved) return;
            target = resolved;
          } else {
            // Compatibility with hovers created by releases before exact-range
            // targets were introduced. Never guess when the value is ambiguous.
            const active = vscode.window.activeTextEditor;
            if (!active) return;
            const matches = scanState
              .get(active.document.uri)
              .filter((match) => match.value === data.value);
            if (matches.length !== 1) {
              vscode.window.showWarningMessage(
                "ts-chef: The old hover target is ambiguous. Hover the value again.",
              );
              return;
            }
            target = captureTextEditSnapshot(active, matches[0].range);
            if (target.value !== data.value) {
              vscode.window.showWarningMessage(
                "ts-chef: The old hover target changed. Hover it again.",
              );
              return;
            }
          }

          const operationInput =
            "input" in data && data.input
              ? target.value.slice(data.input.start, data.input.end)
              : target.value;
          const str = resultToString(
            await runOpAsync(data.opName, operationInput, data.args),
            registry.find((entry) => entry.opName === data.opName)?.factory()
              .outputType,
          );
          if (str === "" && target.value !== "") {
            vscode.window.showWarningMessage(
              `ts-chef: Operation produced an empty result — nothing replaced.`,
            );
            return;
          }
          if (!(await replaceTextEditSnapshot(target, str))) return;
          actionHistory.record(operationAction(data.opName, data.args));
          log(`applyConversion: "${data.opName}" applied`);
        } catch (e) {
          log(`applyConversion error: ${e}`);
          vscode.window.showErrorMessage(`ts-chef: ${e}`);
        }
      },
    ),
    vscode.commands.registerCommand(
      "tschef.applyPipelineConversion",
      async (payload: HoverPipelinePayload | string) => {
        try {
          const data = parseCommandPayload<HoverPipelinePayload>(payload);
          const target = await resolveHoverTarget(data.target);
          if (!target) return;
          const input = data.input
            ? target.value.slice(data.input.start, data.input.end)
            : target.value;
          const result = await runPipeline(input, data.steps);
          if (!result && target.value) {
            vscode.window.showWarningMessage(
              "ts-chef: Decode chain produced an empty result — nothing replaced.",
            );
            return;
          }
          if (!(await replaceTextEditSnapshot(target, result))) return;
          actionHistory.record(
            pipelineAction(data.steps, "Hover decode chain"),
          );
          log(`Hover decode chain applied (${data.steps.length} step(s))`);
        } catch (error) {
          log(`Hover decode chain error: ${error}`);
          vscode.window.showErrorMessage(`ts-chef: ${error}`);
        }
      },
    ),
    vscode.commands.registerCommand(
      "tschef.replaceIntegerLiteral",
      async (payload: HoverReplacementPayload | string) => {
        try {
          const data = parseCommandPayload<HoverReplacementPayload>(payload);
          const target = await resolveHoverTarget(data.target);
          if (!target) return;
          if (!(await replaceTextEditSnapshot(target, data.replacement)))
            return;
          log(`Integer literal replaced with "${data.replacement}"`);
        } catch (error) {
          log(`Integer replacement error: ${error}`);
          vscode.window.showErrorMessage(`ts-chef: ${error}`);
        }
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.setVariable", async () => {
      const name = await vscode.window.showInputBox({
        prompt: "Variable name (e.g. aes-key)",
      });
      if (!name) return;
      const value = await vscode.window.showInputBox({
        prompt: `Value for "${name}"`,
      });
      if (value === undefined) return;
      const desc = await vscode.window.showInputBox({
        prompt: "Description (optional)",
        placeHolder: "e.g. AES-256 key for project X",
      });
      const scope = await pickScope(
        defaultScope("defaultVariableScope"),
        `Save variable "${name}"`,
      );
      if (!scope) return;
      if (!varStore.set(scope, name, value, desc ?? undefined)) return;
      varTree.refresh();
      log(`Variable "${name}" set (${scope})`);
      vscode.window.showInformationMessage(
        `ts-chef: Variable "${name}" saved (${scope}).`,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.showVariables", async () => {
      const vars = varStore.loadAll();
      if (!vars.length) {
        vscode.window.showInformationMessage("ts-chef: No variables defined.");
        return;
      }
      const items = vars.map((v) => ({
        label: v.name,
        description: `${v.value}  [${v.scope}]`,
        detail: v.description,
        name: v.name,
        scope: v.scope,
      }));
      const action = await vscode.window.showQuickPick(
        [
          { label: "$(add) Add variable", action: "add" as const },
          ...items.map((i) => ({ ...i, action: "inspect" as const })),
        ],
        { placeHolder: "Variables — pick to delete/edit" },
      );
      if (!action) return;
      if (action.action === "add") {
        vscode.commands.executeCommand("tschef.setVariable");
        return;
      }
      const choice = await vscode.window.showQuickPick(
        [
          { label: "$(edit) Edit value" },
          { label: "$(trash) Delete" },
          { label: "$(copy) Copy value" },
        ],
        { placeHolder: `Variable: ${action.name} (${action.scope})` },
      );
      if (!choice) return;
      if (choice.label.includes("Delete")) {
        if (varStore.delete(action.scope, action.name)) varTree.refresh();
      }
      if (choice.label.includes("Edit")) {
        const newVal = await vscode.window.showInputBox({
          value: varStore.get(action.name),
          prompt: "New value",
        });
        if (newVal !== undefined) {
          if (varStore.set(action.scope, action.name, newVal))
            varTree.refresh();
        }
      }
      if (choice.label.includes("Copy")) {
        const v = varStore.get(action.name);
        if (v) vscode.env.clipboard.writeText(v);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.runPipeline", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const target = capturePipelineResultTarget(editor);
      const text = resolveVariableTemplates(target.value, varStore);

      const raw = await vscode.window.showInputBox({
        prompt: "Pipeline (e.g. From Base64 | To Hex)",
        placeHolder: "op1 | op2(arg=val) | op3",
      });
      if (!raw) return;

      try {
        const steps = parsePipeline(raw);
        const result = await runPipeline(text, steps);
        log(
          `Pipeline ran: "${raw}", input ${text.length} chars → ${result.length} chars`,
        );
        await presentPipelineResult(
          editor,
          result,
          "Result",
          resultRenderers,
          target,
        );
        actionHistory.record(pipelineAction(steps, raw));
      } catch (e) {
        log(`Pipeline error: ${e}`);
        vscode.window.showErrorMessage(`ts-chef pipeline error: ${e}`);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "tschef.openPipelineEditor",
      (value?: PipelineCommandValue) => {
        const pipeline = resolvePipeline(value);
        PipelinePanel.open(context, pipeStore, pipeline, varStore, "list");
        log(
          pipeline
            ? `Pipeline editor opened with "${pipeline.name}"`
            : "Pipeline editor opened",
        );
      },
    ),
    vscode.commands.registerCommand(
      "tschef.openPipelineGraph",
      (value?: PipelineCommandValue) => {
        const pipeline = resolvePipeline(value);
        PipelinePanel.open(context, pipeStore, pipeline, varStore, "graph");
        log(
          pipeline
            ? `Pipeline graph opened with "${pipeline.name}"`
            : "Pipeline graph opened",
        );
      },
    ),
    vscode.commands.registerCommand(
      "tschef.openPipelineInEditor",
      async (value?: PipelineCommandValue) => {
        let pipeline = resolvePipeline(value);
        if (!pipeline) {
          const picked = await vscode.window.showQuickPick(
            allPipelines().map((candidate) => ({
              label: candidate.name,
              description:
                "scope" in candidate
                  ? candidate.scope === "built-in"
                    ? candidate.category
                    : candidate.scope
                  : "saved",
              detail: candidate.description ?? candidate.raw,
              pipeline: candidate,
            })),
            {
              title: "Open Pipeline in Graph/List Editor",
              placeHolder: "Select a built-in or saved pipeline…",
              matchOnDescription: true,
              matchOnDetail: true,
            },
          );
          pipeline = picked?.pipeline;
        }
        if (!pipeline) return;
        PipelinePanel.open(context, pipeStore, pipeline, varStore);
        log(`Pipeline editor opened with "${pipeline.name}"`);
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "tschef.runSavedPipeline",
      async (value: PipelineCommandValue) => {
        const pipeline = resolvePipeline(value);
        if (!pipeline) return;
        const name = pipeline.name;
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage("ts-chef: No active editor.");
          return;
        }
        const target = capturePipelineResultTarget(editor);
        const text = resolveVariableTemplates(target.value, varStore);
        try {
          const executeGraph =
            pipeline.graph && graphSupportsDirectExecution(pipeline.graph);
          const graphResult = executeGraph
            ? await runSavedGraph(
                pipeline.graph as PipelineGraph,
                text,
                pipeline.activeOutputId,
              )
            : undefined;
          if (executeGraph && !graphResult) return;
          const result =
            graphResult?.text ?? (await runPipeline(text, pipeline.steps));
          log(
            `Ran saved pipeline "${name}"${graphResult ? ` (${graphResult.outputName})` : ""}: ${pipeline.steps.length} primary step(s), ${text.length} → ${result.length} chars`,
          );
          await presentPipelineResult(
            editor,
            result,
            `Pipeline "${name}"${graphResult ? ` — ${graphResult.outputName}` : ""}`,
            resultRenderers,
            target,
          );
          actionHistory.record(pipelineAction(pipeline.steps, name));
        } catch (e) {
          log(`Saved pipeline "${name}" error: ${e}`);
          vscode.window.showErrorMessage(
            `ts-chef pipeline "${name}" error: ${e}`,
          );
        }
      },
    ),
  );

  // tschef.runSavedPipelinePicker — pick from saved pipelines via QuickPick
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "tschef.runSavedPipelinePicker",
      async () => {
        const pipelines = allPipelines();
        if (!pipelines.length) {
          vscode.window.showInformationMessage(
            "ts-chef: No saved pipelines. Save one in the Pipeline Editor first.",
          );
          return;
        }
        const picked = await vscode.window.showQuickPick(
          pipelines.map((p) => ({
            label: p.name,
            description: `${p.description ?? ""}  [${"scope" in p ? p.scope : "saved"}]`,
            detail: p.raw,
            pipeline: p,
          })),
          {
            placeHolder: "Select a saved pipeline to run…",
            matchOnDescription: true,
            matchOnDetail: true,
          },
        );
        if (!picked) return;
        vscode.commands.executeCommand(
          "tschef.runSavedPipeline",
          picked.pipeline,
        );
      },
    ),
  );

  // tschef.deepAnalysis — recursively analyse selected text: detect encodings,
  // follow multi-step decode chains (Magic) and show decoded previews.
  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.deepAnalysis", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      if (editor.selection.isEmpty) {
        vscode.window.showWarningMessage("ts-chef: Select text to analyse.");
        return;
      }
      const selectedCharacters = Math.abs(
        editor.document.offsetAt(editor.selection.end) -
          editor.document.offsetAt(editor.selection.start),
      );
      if (selectedCharacters > 256 * 1024) {
        vscode.window.showWarningMessage(
          "ts-chef: Deep Analysis is limited to 256 KiB. Select a smaller value.",
        );
        return;
      }
      const target = captureTextEditSnapshot(editor, editor.selection);
      const text = target.value;
      if (Buffer.byteLength(text, "utf-8") > 256 * 1024) {
        vscode.window.showWarningMessage(
          "ts-chef: Deep Analysis is limited to 256 KiB of UTF-8 data. Select a smaller value.",
        );
        return;
      }

      log(
        `Deep analysis: "${text.slice(0, 40)}${text.length > 40 ? "…" : ""}"`,
      );
      const trimmed = text.trim();
      const stats = stringStats(trimmed);
      const chains = magicAnalyse(trimmed);

      if (!chains.length) {
        vscode.window.showInformationMessage(
          `ts-chef: No recognisable encoding/format detected ` +
            `(${stats.length} chars, entropy ${stats.entropy} bits/char, ${stats.charset}).`,
        );
        return;
      }

      type ChainItem = vscode.QuickPickItem & { chain?: MagicChain };
      const items: ChainItem[] = [
        {
          label: `${stats.length} chars · entropy ${stats.entropy} bits/char · looks like ${stats.charset}`,
          kind: vscode.QuickPickItemKind.Separator,
        },
        ...chains.map((chain) => ({
          label: chain.steps.map((s) => s.label).join(" → "),
          description: `${Math.round(chain.confidence * 100)}%`,
          detail: `→ ${chain.preview.slice(0, 100).replace(/\s+/g, " ")}`,
          chain,
        })),
      ];

      const picked = await vscode.window.showQuickPick(items, {
        placeHolder: `Deep analysis: ${chains.length} decode path(s) found — pick to apply`,
        matchOnDetail: true,
      });
      if (!picked?.chain) return;

      try {
        const steps = picked.chain.steps.map((s) => ({
          opName: s.opName,
          args: s.args,
        }));
        const str = await runPipeline(picked.chain.input ?? trimmed, steps);
        log(
          `Deep analysis applied "${picked.label}": ${trimmed.length} → ${str.length} chars`,
        );
        await presentPipelineResult(
          editor,
          str,
          picked.label,
          resultRenderers,
          target,
        );
      } catch (e) {
        log(`Deep analysis error: ${e}`);
        vscode.window.showErrorMessage(`ts-chef deep analysis error: ${e}`);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.addVariable", () => {
      vscode.commands.executeCommand("tschef.setVariable");
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.refreshPipelines", () =>
      pipeTree.refresh(),
    ),
  );

  // Apply a single operation (with its default args) to the selection — the
  // click action of the Operations sidebar.
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "tschef.applyOperation",
      async (opName: string) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage("ts-chef: No active editor.");
          return;
        }
        const argDefs = argDefsFor(opName);
        if (!argDefs) return;
        const args = argDefs.map(resolveDefaultArg);
        const target = capturePipelineResultTarget(editor);
        try {
          const result = resultToString(
            await runOpAsync(
              opName,
              resolveVariableTemplates(target.value, varStore),
              args,
            ),
            registry.find((entry) => entry.opName === opName)?.factory()
              .outputType,
          );
          log(`applyOperation: "${opName}" applied`);
          await presentPipelineResult(
            editor,
            result,
            displayNameFor(opName),
            resultRenderers,
            target,
          );
          actionHistory.record(operationAction(opName, args));
        } catch (e) {
          log(`applyOperation error: ${e}`);
          vscode.window.showErrorMessage(`ts-chef: ${e}`);
        }
      },
    ),
  );

  // Load a saved pipeline into the working recipe and reveal the recipe pane.
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "tschef.loadRecipe",
      async (
        arg:
          | string
          | Pipeline
          | BuiltInPipeline
          | { pipeline?: Pipeline | BuiltInPipeline },
      ) => {
        let direct: Pipeline | BuiltInPipeline | undefined;
        if (typeof arg === "object" && arg !== null) {
          direct = "steps" in arg ? arg : arg.pipeline;
        }
        const pipeline = resolvePipeline(
          direct ?? (typeof arg === "string" ? arg : undefined),
        );
        if (!pipeline) return;
        recipeView.loadRecipe(
          pipeline.steps.map((s) => ({ opName: s.opName, args: s.args })),
          pipeline.name,
        );
        await vscode.commands.executeCommand("tschef.recipeView.focus");
      },
    ),
    vscode.commands.registerCommand("tschef.browseRecipeLibrary", async () => {
      const picked = await vscode.window.showQuickPick(
        standardPipelines().map((pipeline) => ({
          label: pipeline.name,
          description: pipeline.category,
          detail: pipeline.description,
          pipeline,
        })),
        {
          title: "ts-chef Standard Recipe Library",
          placeHolder: "Search decoding, conversion, malware and IOC recipes…",
          matchOnDescription: true,
          matchOnDetail: true,
        },
      );
      if (!picked) return;
      recipeView.loadRecipe(
        picked.pipeline.steps.map((step) => ({
          opName: step.opName,
          args: [...step.args],
        })),
        picked.pipeline.name,
      );
      await vscode.commands.executeCommand("tschef.recipeView.focus");
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (
        vscode.workspace.getConfiguration("tschef").get("autoScanOnSave", false)
      ) {
        scanState.scan(doc);
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document === doc) decorations.update(editor);
      }
    }),
  );

  /** Open text in a fresh editor beside the current one, in the given language. */
  async function showInNewEditor(
    content: string,
    languageId: string,
  ): Promise<void> {
    const doc = await vscode.workspace.openTextDocument({
      content,
      language: languageId,
    });
    await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
  }

  /** Input text: selection if any, else the whole document. */
  function editorInput(editor: vscode.TextEditor): string {
    return editor.selection.isEmpty
      ? editor.document.getText()
      : editor.document.getText(editor.selection);
  }

  // tschef.toggleEntropyMap — colour lines by Shannon entropy to spot
  // packed/encrypted/encoded blocks at a glance.
  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.toggleEntropyMap", () => {
      const on = entropyMap.toggle();
      log(`Entropy map ${on ? "enabled" : "disabled"}`);
      vscode.window.setStatusBarMessage(
        `ts-chef: Entropy map ${on ? "on" : "off"}`,
        2500,
      );
    }),
  );

  // tschef.malwareTriage — bounded, offline static analysis. It deliberately
  // does not execute payloads, resolve IOCs, start processes or access the net.
  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.malwareTriage", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("ts-chef: No active editor.");
        return;
      }

      try {
        let sample: string | Uint8Array;
        if (!editor.selection.isEmpty) {
          sample = editor.document.getText(editor.selection);
        } else if (editor.document.uri.scheme === "file") {
          const stat = await vscode.workspace.fs.stat(editor.document.uri);
          if (stat.size > 16 * 1024 * 1024) {
            vscode.window.showWarningMessage(
              "ts-chef: Static triage accepts files up to 16 MiB. Select a smaller region to analyse it.",
            );
            return;
          }
          sample = await vscode.workspace.fs.readFile(editor.document.uri);
          if (sample.byteLength > 16 * 1024 * 1024) {
            vscode.window.showWarningMessage(
              "ts-chef: Static triage accepts files up to 16 MiB. Select a smaller region to analyse it.",
            );
            return;
          }
        } else {
          sample = editor.document.getText();
        }

        const report = await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "ts-chef: Static malware triage",
            cancellable: false,
          },
          async () => {
            // Let VS Code paint the progress notification before the bounded,
            // synchronous scanners start.
            await new Promise<void>((resolve) => setTimeout(resolve, 0));
            return analyseMalwarePayload(sample);
          },
        );
        await showInNewEditor(renderMalwareTriageMarkdown(report), "markdown");
        log(
          `Static malware triage: risk ${report.risk.level}/${report.risk.score}, ` +
            `${report.indicators.length} suspicious indicator(s), ${report.iocs.length} IOC(s)`,
        );
      } catch (error) {
        log(`Static malware triage error: ${error}`);
        vscode.window.showErrorMessage(`ts-chef triage error: ${error}`);
      }
    }),
  );

  // tschef.yaraScan — run YARA rules against the selection/document.
  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.yaraScan", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("ts-chef: No active editor.");
        return;
      }
      const source = await vscode.window.showQuickPick<
        vscode.QuickPickItem & { sourceKind: "file" | "inline" }
      >(
        [
          {
            label: "$(file) Load rules from a .yar file",
            sourceKind: "file",
          },
          {
            label: "$(edit) Type/paste rules",
            sourceKind: "inline",
          },
        ],
        { placeHolder: "YARA rules source" },
      );
      if (!source) return;

      let rules: string | undefined;
      if (source.sourceKind === "file") {
        const picked = await vscode.window.showOpenDialog({
          canSelectMany: false,
          filters: { "YARA rules": ["yar", "yara", "rules", "txt"] },
          openLabel: "Use these rules",
        });
        if (!picked?.length) return;
        const stat = await vscode.workspace.fs.stat(picked[0]);
        if (stat.size > MAX_YARA_RULE_BYTES) {
          vscode.window.showWarningMessage(
            "ts-chef: YARA rule files are limited to 2 MiB.",
          );
          return;
        }
        const ruleBytes = await vscode.workspace.fs.readFile(picked[0]);
        if (ruleBytes.byteLength > MAX_YARA_RULE_BYTES) {
          vscode.window.showWarningMessage(
            "ts-chef: YARA rule files are limited to 2 MiB.",
          );
          return;
        }
        rules = Buffer.from(ruleBytes).toString("utf-8");
      } else {
        rules = await vscode.window.showInputBox({
          prompt: "YARA rule(s)",
          placeHolder: 'rule demo { strings: $a = "foo" condition: $a }',
        });
      }
      if (!rules) return;
      const ruleLimitError = yaraLimitError(0, rules);
      if (ruleLimitError) {
        vscode.window.showWarningMessage(`ts-chef: ${ruleLimitError}.`);
        return;
      }

      try {
        let sample: string | ArrayBuffer;
        if (!editor.selection.isEmpty) {
          sample = editor.document.getText(editor.selection);
        } else if (editor.document.uri.scheme === "file") {
          const stat = await vscode.workspace.fs.stat(editor.document.uri);
          if (stat.size > MAX_YARA_SAMPLE_BYTES) {
            vscode.window.showWarningMessage(
              "ts-chef: YARA scans are limited to files of 64 MiB.",
            );
            return;
          }
          const bytes = await vscode.workspace.fs.readFile(editor.document.uri);
          if (bytes.byteLength > MAX_YARA_SAMPLE_BYTES) {
            vscode.window.showWarningMessage(
              "ts-chef: YARA scans are limited to files of 64 MiB.",
            );
            return;
          }
          const buffer = new ArrayBuffer(bytes.byteLength);
          new Uint8Array(buffer).set(bytes);
          sample = buffer;
        } else {
          sample = editorInput(editor);
        }
        const sampleByteLength =
          typeof sample === "string"
            ? Buffer.byteLength(sample, "utf-8")
            : sample.byteLength;
        const sampleLimitError = yaraLimitError(sampleByteLength, rules);
        if (sampleLimitError) {
          vscode.window.showWarningMessage(`ts-chef: ${sampleLimitError}.`);
          return;
        }
        // args: rules, showStrings, showLengths, showMeta, showCounts,
        //       showRuleWarnings, showConsole
        const result = await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "ts-chef: Running bounded YARA scan",
            cancellable: false,
          },
          async () => {
            await new Promise<void>((resolve) => setTimeout(resolve, 0));
            return (await runOpAsync("YARARules", sample, [
              rules,
              true,
              false,
              true,
              true,
              true,
              false,
            ])) as string;
          },
        );
        log(`YARA scan produced ${String(result).length} chars`);
        await showInNewEditor(String(result) || "(no matches)", "plaintext");
      } catch (e) {
        log(`YARA scan error: ${e}`);
        vscode.window.showErrorMessage(`ts-chef YARA error: ${e}`);
      }
    }),
  );

  // tschef.exportScanResults — write all scan matches to JSON or CSV.
  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.exportScanResults", async () => {
      const entries = scanState.entries();
      if (!entries.length) {
        vscode.window.showInformationMessage(
          "ts-chef: No scan results to export. Scan a document or the workspace first.",
        );
        return;
      }
      const format = await vscode.window.showQuickPick(["JSON", "CSV"], {
        placeHolder: "Export format",
      });
      if (!format) return;

      type Row = {
        file: string;
        line: number;
        column: number;
        value: string;
        label: string;
        confidence: number;
        operation: string;
      };
      const rows: Row[] = [];
      for (const { uri, matches } of entries) {
        for (const m of matches) {
          const top = m.matches[0];
          rows.push({
            file: uri.fsPath,
            line: m.range.start.line + 1,
            column: m.range.start.character + 1,
            value: m.value,
            label: top?.label ?? "",
            confidence: top ? Math.round(top.confidence * 100) / 100 : 0,
            operation: top?.opName ?? "",
          });
        }
      }

      let content: string;
      let ext: string;
      if (format === "CSV") {
        const esc = (v: unknown): string => {
          const s = String(v);
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const header = "file,line,column,label,confidence,operation,value";
        content = [
          header,
          ...rows.map((r) =>
            [
              r.file,
              r.line,
              r.column,
              r.label,
              r.confidence,
              r.operation,
              r.value,
            ]
              .map(esc)
              .join(","),
          ),
        ].join("\n");
        ext = "csv";
      } else {
        content = JSON.stringify(rows, null, 2);
        ext = "json";
      }

      const target = await vscode.window.showSaveDialog({
        filters: { [format]: [ext] },
        saveLabel: "Export scan results",
      });
      if (!target) return;
      await vscode.workspace.fs.writeFile(
        target,
        Buffer.from(content, "utf-8"),
      );
      log(`Exported ${rows.length} scan result(s) as ${format}`);
      vscode.window.showInformationMessage(
        `ts-chef: Exported ${rows.length} result(s) to ${target.fsPath}.`,
      );
    }),
  );

  // tschef.smartFormat — auto-detect a structured format and pretty-print it
  // into a new editor with the matching language mode.
  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.smartFormat", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("ts-chef: No active editor.");
        return;
      }
      const text = editorInput(editor);
      if (!text.trim()) {
        vscode.window.showWarningMessage("ts-chef: Nothing to format.");
        return;
      }
      const choice = detectFormat(text);
      if (!choice || !choice.opName) {
        // No structured format recognised — fall back to readable reflow.
        await vscode.commands.executeCommand("tschef.makeReadable");
        return;
      }
      try {
        const operation = registry.find(
          (entry) => entry.opName === choice.opName,
        );
        const formatted = resultToString(
          await runOpAsync(choice.opName, text, choice.args),
          operation?.factory().outputType,
        );
        log(`smartFormat: detected ${choice.label}`);
        await showInNewEditor(formatted, choice.languageId);
        vscode.window.setStatusBarMessage(
          `ts-chef: Formatted as ${choice.label}`,
          2500,
        );
      } catch (e) {
        log(`smartFormat error: ${e}`);
        vscode.window.showErrorMessage(`ts-chef format error: ${e}`);
      }
    }),
  );

  // tschef.makeReadable — reflow extremely long lines/blobs into a readable
  // multi-line form (no data change, whitespace only) in a new editor.
  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.makeReadable", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("ts-chef: No active editor.");
        return;
      }
      const text = editorInput(editor);
      if (!text.trim()) {
        vscode.window.showWarningMessage("ts-chef: Nothing to reflow.");
        return;
      }
      const width = vscode.workspace
        .getConfiguration("tschef")
        .get<number>("readableLineWidth", 100);
      const out = makeReadable(text, width);
      if (out === text) {
        vscode.window.showInformationMessage(
          "ts-chef: Lines are already within a readable width.",
        );
        return;
      }
      log(`makeReadable: reflowed at width ${width}`);
      await showInNewEditor(out, editor.document.languageId);
    }),
  );

  // Apply the entropy map to the editor that is active at startup.
  if (entropyMap.isEnabled() && vscode.window.activeTextEditor) {
    entropyMap.update(vscode.window.activeTextEditor);
  }

  context.subscriptions.push(scanState);
}

/** Called by VS Code when the extension is deactivated; disposables are handled via subscriptions. */
export function deactivate(): void {}

// Build diagnostics used by the production-bundle verifier. They do not load
// operation implementations and are intentionally absent from the VS Code UI.
export {
  findOp as findOperationForDiagnostics,
  loadedOperationChunkIds,
} from "./opsRegistry";
