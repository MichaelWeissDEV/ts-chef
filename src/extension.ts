import * as vscode from "vscode";
import { ScanState } from "./providers/scanState";
import { DecorationProvider } from "./providers/decorationProvider";
import { HoverProvider } from "./providers/hoverProvider";
import { PatternsTreeProvider } from "./providers/patternsTreeProvider";
import { VariablesTreeProvider } from "./providers/variablesTreeProvider";
import { PipelinesTreeProvider } from "./providers/pipelinesTreeProvider";
import { VariableStore, PipelineStore } from "./storage/store";
import { PipelinePanel } from "./panels/pipelinePanel";
import {
  runOp,
  parsePipeline,
  runPipeline,
  resolveDefaultArg,
} from "./commands/runner";
import { analyseValue } from "./providers/detector";
import { initOutputChannel, log } from "./logger";
import registry from "./generated/opsRegistry";
import type { Operation } from "./chef/Operation";

function resultToString(result: unknown): string {
  if (Array.isArray(result))
    return Buffer.from(result as number[]).toString("utf-8");
  if (typeof result === "string") return result;
  if (result === null || result === undefined) return "";
  return JSON.stringify(result, null, 2);
}

/** Replace $varName / {{varName}} references with stored variable values. */
function resolveVars(text: string, varStore: VariableStore): string {
  const vars = varStore.load();
  return text
    .replace(
      /\{\{([^}]+)\}\}/g,
      (_, name) => varStore.get(name.trim()) ?? `{{${name}}}`,
    )
    .replace(
      /\$([A-Za-z_][A-Za-z0-9_-]*)/g,
      (_, name) => varStore.get(name) ?? `$${name}`,
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

function buildOpPickItems(): (vscode.QuickPickItem & { opName?: string })[] {
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
  return items;
}

export function activate(context: vscode.ExtensionContext): void {
  initOutputChannel(context);
  log("Extension activated");

  const scanState = new ScanState();
  const decorations = new DecorationProvider(scanState);
  const varStore = new VariableStore();
  const pipeStore = new PipelineStore();

  const patternsTree = new PatternsTreeProvider(scanState);
  const varTree = new VariablesTreeProvider(varStore);
  const pipeTree = new PipelinesTreeProvider(pipeStore);

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("tschef.patternsView", patternsTree),
    vscode.window.registerTreeDataProvider("tschef.variablesView", varTree),
    vscode.window.registerTreeDataProvider("tschef.pipelinesView", pipeTree),
    vscode.languages.registerHoverProvider(
      { scheme: "*" },
      new HoverProvider(scanState),
    ),
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) decorations.update(editor);
    }),
    vscode.workspace.onDidChangeTextDocument((e) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && e.document === editor.document) decorations.update(editor);
    }),
  );

  // ---- Commands ----

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
      const editor = vscode.window.activeTextEditor;
      scanState.clear(editor?.document.uri);
      if (editor) decorations.update(editor);
      log("Scan results cleared");
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.refreshScan", () => {
      vscode.commands.executeCommand("tschef.scanDocument");
    }),
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
      const rawText = editor.document.getText(selection);
      if (!rawText) {
        vscode.window.showWarningMessage("ts-chef: Select text first.");
        return;
      }
      const text = resolveVars(rawText, varStore);

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
        const str = resultToString(runOp(picked.opName, text, args));
        if (str === "" && text !== "") {
          vscode.window.showWarningMessage(
            `ts-chef: "${picked.label}" produced an empty result — nothing replaced.`,
          );
          return;
        }
        await editor.edit((eb) => eb.replace(selection, str));
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
        payload: { opName: string; value: string; args: unknown[] } | string,
      ) => {
        const data =
          typeof payload === "string"
            ? JSON.parse(decodeURIComponent(payload))
            : payload;
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const matches = scanState.get(editor.document.uri);
        const match = matches.find((m) => m.value === data.value);
        if (!match) return;

        try {
          const str = resultToString(runOp(data.opName, data.value, data.args));
          if (str === "" && data.value !== "") {
            vscode.window.showWarningMessage(
              `ts-chef: Operation produced an empty result — nothing replaced.`,
            );
            return;
          }
          await editor.edit((eb) => eb.replace(match.range, str));
          log(`applyConversion: "${data.opName}" applied`);
        } catch (e) {
          log(`applyConversion error: ${e}`);
          vscode.window.showErrorMessage(`ts-chef: ${e}`);
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
      varStore.set(name, value, desc ?? undefined);
      varTree.refresh();
      log(`Variable "${name}" set`);
      vscode.window.showInformationMessage(
        `ts-chef: Variable "${name}" saved.`,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.showVariables", async () => {
      const vars = varStore.load();
      if (!vars.length) {
        vscode.window.showInformationMessage("ts-chef: No variables defined.");
        return;
      }
      const items = vars.map((v) => ({
        label: v.name,
        description: v.value,
        detail: v.description,
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
        { placeHolder: `Variable: ${action.label}` },
      );
      if (!choice) return;
      if (choice.label.includes("Delete")) {
        varStore.delete(action.label);
        varTree.refresh();
      }
      if (choice.label.includes("Edit")) {
        const newVal = await vscode.window.showInputBox({
          value: varStore.get(action.label),
          prompt: "New value",
        });
        if (newVal !== undefined) {
          varStore.set(action.label, newVal);
          varTree.refresh();
        }
      }
      if (choice.label.includes("Copy")) {
        const v = varStore.get(action.label);
        if (v) vscode.env.clipboard.writeText(v);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.runPipeline", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const rawText =
        editor.document.getText(editor.selection) || editor.document.getText();
      const text = resolveVars(rawText, varStore);

      const raw = await vscode.window.showInputBox({
        prompt: "Pipeline (e.g. From Base64 | To Hex)",
        placeHolder: "op1 | op2(arg=val) | op3",
      });
      if (!raw) return;

      try {
        const steps = parsePipeline(raw);
        const result = runPipeline(text, steps);
        log(
          `Pipeline ran: "${raw}", input ${text.length} chars → ${result.length} chars`,
        );
        const action = await vscode.window.showInformationMessage(
          `Result: ${result.slice(0, 80)}${result.length > 80 ? "…" : ""}`,
          "Replace Selection",
          "Copy",
        );
        if (action === "Replace Selection") {
          await editor.edit((eb) => {
            const sel = editor.selection.isEmpty
              ? new vscode.Selection(
                  editor.document.positionAt(0),
                  editor.document.positionAt(editor.document.getText().length),
                )
              : editor.selection;
            eb.replace(sel, result);
          });
        }
        if (action === "Copy") vscode.env.clipboard.writeText(result);
      } catch (e) {
        log(`Pipeline error: ${e}`);
        vscode.window.showErrorMessage(`ts-chef pipeline error: ${e}`);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.openPipelineEditor", () => {
      PipelinePanel.open(context, pipeStore);
      log("Pipeline editor opened");
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "tschef.runSavedPipeline",
      async (name: string) => {
        const pipeline = pipeStore.load().find((p) => p.name === name);
        if (!pipeline) return;
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage("ts-chef: No active editor.");
          return;
        }
        const rawText =
          editor.document.getText(editor.selection) ||
          editor.document.getText();
        const text = resolveVars(rawText, varStore);
        try {
          const result = runPipeline(text, pipeline.steps);
          log(
            `Ran saved pipeline "${name}": ${pipeline.steps.length} step(s), ${text.length} → ${result.length} chars`,
          );
          const action = await vscode.window.showInformationMessage(
            `Pipeline "${name}": ${result.slice(0, 80)}${result.length > 80 ? "…" : ""}`,
            "Replace",
            "Copy",
          );
          if (action === "Replace") {
            await editor.edit((eb) => {
              const sel = editor.selection.isEmpty
                ? new vscode.Selection(
                    editor.document.positionAt(0),
                    editor.document.positionAt(
                      editor.document.getText().length,
                    ),
                  )
                : editor.selection;
              eb.replace(sel, result);
            });
          }
          if (action === "Copy") vscode.env.clipboard.writeText(result);
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
        const pipelines = pipeStore.load();
        if (!pipelines.length) {
          vscode.window.showInformationMessage(
            "ts-chef: No saved pipelines. Save one in the Pipeline Editor first.",
          );
          return;
        }
        const picked = await vscode.window.showQuickPick(
          pipelines.map((p) => ({
            label: p.name,
            description: p.description,
            detail: p.raw,
            name: p.name,
          })),
          {
            placeHolder: "Select a saved pipeline to run…",
            matchOnDescription: true,
            matchOnDetail: true,
          },
        );
        if (!picked) return;
        vscode.commands.executeCommand("tschef.runSavedPipeline", picked.name);
      },
    ),
  );

  // tschef.deepAnalysis — analyse selected text to detect encoding/format
  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.deepAnalysis", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const text = editor.document.getText(editor.selection);
      if (!text) {
        vscode.window.showWarningMessage("ts-chef: Select text to analyse.");
        return;
      }

      log(
        `Deep analysis: "${text.slice(0, 40)}${text.length > 40 ? "…" : ""}"`,
      );
      const matches = analyseValue(text);

      if (!matches.length) {
        vscode.window.showInformationMessage(
          "ts-chef: No recognisable encoding/format detected in selection.",
        );
        return;
      }

      const items = matches.map((m) => ({
        label: m.label,
        description: `${Math.round(m.confidence * 100)}% confidence`,
        detail: `→ Apply operation: ${m.opName}`,
        opName: m.opName,
        defaultArgs: m.defaultArgs,
      }));

      const picked = await vscode.window.showQuickPick(items, {
        placeHolder: `Deep analysis: ${items.length} pattern(s) detected — pick to decode/apply`,
      });
      if (!picked) return;

      try {
        const str = resultToString(
          runOp(picked.opName, text, picked.defaultArgs as unknown[]),
        );
        log(
          `Deep analysis applied "${picked.opName}": ${text.length} → ${str.length} chars`,
        );
        const action = await vscode.window.showInformationMessage(
          `Result: ${str.slice(0, 100)}${str.length > 100 ? "…" : ""}`,
          "Replace",
          "Copy",
        );
        if (action === "Replace")
          await editor.edit((eb) => eb.replace(editor.selection, str));
        if (action === "Copy") vscode.env.clipboard.writeText(str);
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

  context.subscriptions.push(scanState);
}

export function deactivate(): void {}
