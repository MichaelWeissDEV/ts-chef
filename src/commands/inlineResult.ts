import * as vscode from "vscode";
import { replaceTarget } from "./pipelineResult";

/**
 * One pinned inline result. Each carries its own source `editor` and a frozen
 * `targetRange`, so Replace targets the line it belongs to — not whichever
 * editor happens to be active when the lens is clicked.
 */
type InlineResult = {
  id: number;
  editor: vscode.TextEditor;
  uri: vscode.Uri;
  targetRange: vscode.Range;
  result: string;
};
type InlineAction = "replace" | "copy" | "close";

const MAX_PREVIEW = 80;

/**
 * Presents pipeline results as persistent, stackable CodeLens rows. Each result
 * renders a preview lens plus Replace / Copy / Close action lenses at the start
 * line of its target range.
 *
 * Wired into `presentPipelineResult` via the renderer map as the `inline` mode;
 * call {@link register} once during activation.
 *
 * Caveat (intentional): ranges are frozen — no edit-tracking — so edits above a
 * result can make Replace target the wrong span. The escape hatch is Close and
 * re-run; live range tracking is deferred to a later hardening pass.
 */
export class InlineResultController implements vscode.CodeLensProvider {
  private results: InlineResult[] = [];
  private seq = 0;
  private readonly _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
  readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

  register(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      vscode.languages.registerCodeLensProvider({ scheme: "*" }, this),
      vscode.commands.registerCommand(
        "tschef.applyInlineResult",
        (action: InlineAction, id: number) => this.apply(action, id),
      ),
      this._onDidChangeCodeLenses,
    );
  }

  /** Pin a new inline result at the target range of `editor`. */
  show(editor: vscode.TextEditor, result: string): void {
    this.results.push({
      id: this.seq++,
      editor,
      uri: editor.document.uri,
      targetRange: replaceTarget(editor),
      result,
    });
    this._onDidChangeCodeLenses.fire();
  }

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const uri = document.uri.toString();
    const lenses: vscode.CodeLens[] = [];
    for (const item of this.results) {
      if (item.uri.toString() !== uri) continue;
      const line = item.targetRange.start.line;
      const range = new vscode.Range(line, 0, line, 0);
      const preview =
        item.result.replace(/\s+/g, " ").slice(0, MAX_PREVIEW) +
        (item.result.length > MAX_PREVIEW ? "…" : "");
      lenses.push(
        new vscode.CodeLens(range, {
          title: `$(output) ${preview}`,
          command: "",
        }),
        new vscode.CodeLens(range, {
          title: "$(replace) Replace",
          command: "tschef.applyInlineResult",
          arguments: ["replace", item.id],
        }),
        new vscode.CodeLens(range, {
          title: "$(copy) Copy",
          command: "tschef.applyInlineResult",
          arguments: ["copy", item.id],
        }),
        new vscode.CodeLens(range, {
          title: "$(close) Close",
          command: "tschef.applyInlineResult",
          arguments: ["close", item.id],
        }),
      );
    }
    return lenses;
  }

  private async apply(action: InlineAction, id: number): Promise<void> {
    const item = this.results.find((r) => r.id === id);
    if (!item) return;

    if (action === "replace") {
      if (item.editor.document.isClosed) {
        vscode.window.showWarningMessage(
          "ts-chef: Cannot replace — the editor is no longer open.",
        );
        return;
      }
      try {
        await item.editor.edit((eb) =>
          eb.replace(item.targetRange, item.result),
        );
        this.remove(id);
      } catch {
        vscode.window.showWarningMessage(
          "ts-chef: Could not replace — the editor is no longer available.",
        );
      }
      return;
    }

    if (action === "copy") {
      vscode.env.clipboard.writeText(item.result);
      vscode.window.setStatusBarMessage(
        "ts-chef: Pipeline result copied",
        3000,
      );
      return; // keep the row open
    }

    this.remove(id); // close
  }

  private remove(id: number): void {
    this.results = this.results.filter((r) => r.id !== id);
    this._onDidChangeCodeLenses.fire();
  }
}
