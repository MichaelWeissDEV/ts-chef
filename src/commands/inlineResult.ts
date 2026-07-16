/**
 * @fileoverview inlineResult command handler for ts-chef operations
 * @package commands
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as vscode from "vscode";
import { capturePipelineResultTarget } from "./pipelineResult";
import {
  replaceTextEditSnapshot,
  type TextEditSnapshot,
} from "./textEditSnapshot";

/**
 * One pinned inline result. Each carries its own source `editor` and a frozen
 * `targetRange`, so Replace targets the line it belongs to — not whichever
 * editor happens to be active when the lens is clicked.
 */
type InlineResult = {
  id: number;
  uri: vscode.Uri;
  target: TextEditSnapshot;
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
 * Replacements are guarded by the captured document version and source text,
 * so a result can never be applied to a shifted range.
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
  show(
    editor: vscode.TextEditor,
    result: string,
    target: TextEditSnapshot = capturePipelineResultTarget(editor),
  ): void {
    this.results.push({
      id: this.seq++,
      uri: editor.document.uri,
      target,
      result,
    });
    this._onDidChangeCodeLenses.fire();
  }

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const uri = document.uri.toString();
    const lenses: vscode.CodeLens[] = [];
    for (const item of this.results) {
      if (item.uri.toString() !== uri) continue;
      const line = item.target.range.start.line;
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
      if (await replaceTextEditSnapshot(item.target, item.result))
        this.remove(id);
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
