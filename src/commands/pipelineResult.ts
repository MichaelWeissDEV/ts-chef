/**
 * @fileoverview pipelineResult command handler for ts-chef operations
 * @package commands
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as vscode from "vscode";
import {
  captureTextEditSnapshot,
  replaceTextEditSnapshot,
  type TextEditSnapshot,
} from "./textEditSnapshot";

/**
 * How a pipeline/operation result is presented, configurable via the
 * `tschef.pipelineResultAction` setting.
 *
 * - `popup`   — information message with Replace/Copy buttons (default).
 * - `replace` — replace the target range immediately.
 * - `copy`    — copy to the clipboard immediately.
 * - `inline`  — custom renderer (e.g. CodeLens), supplied via the renderer map.
 * - `panel`   — custom renderer (e.g. webview), supplied via the renderer map.
 */
export type PipelineResultAction =
  | "popup"
  | "replace"
  | "copy"
  | "inline"
  | "panel";

/** A custom presenter for the `inline` / `panel` modes. */
export type ResultRenderer = (
  editor: vscode.TextEditor,
  result: string,
  target: TextEditSnapshot,
) => void | Promise<void>;

/**
 * The range a result should overwrite: the current selection, or the whole
 * document when the selection is empty. Shared by `replace`/`inline`/`panel`.
 */
export function replaceTarget(editor: vscode.TextEditor): vscode.Selection {
  return editor.selection.isEmpty
    ? new vscode.Selection(
        editor.document.positionAt(0),
        editor.document.positionAt(editor.document.getText().length),
      )
    : editor.selection;
}

export function capturePipelineResultTarget(
  editor: vscode.TextEditor,
): TextEditSnapshot {
  return captureTextEditSnapshot(editor, replaceTarget(editor));
}

function preview(result: string, max = 80): string {
  return `${result.slice(0, max)}${result.length > max ? "…" : ""}`;
}

/**
 * Presents `result` according to the configured `tschef.pipelineResultAction`.
 *
 * Custom modes (`inline`/`panel`) are not hard-wired here — they come from the
 * injected `render` map, so new modes cost almost nothing. If a custom mode is
 * selected but no renderer is wired up, it defensively falls back to `popup`.
 */
export async function presentPipelineResult(
  editor: vscode.TextEditor,
  result: string,
  label: string,
  render?: Partial<Record<"inline" | "panel", ResultRenderer>>,
  target: TextEditSnapshot = capturePipelineResultTarget(editor),
): Promise<void> {
  const mode = vscode.workspace
    .getConfiguration("tschef")
    .get<PipelineResultAction>("pipelineResultAction", "popup");

  if (mode === "replace") {
    if (!(await replaceTextEditSnapshot(target, result))) return;
    vscode.window.setStatusBarMessage(
      "ts-chef: result replaced selection",
      3000,
    );
    return;
  }

  if (mode === "copy") {
    vscode.env.clipboard.writeText(result);
    vscode.window.setStatusBarMessage("ts-chef: result copied", 3000);
    return;
  }

  if (mode === "inline" || mode === "panel") {
    const renderer = render?.[mode];
    if (renderer) {
      await renderer(editor, result, target);
      return;
    }
    // No renderer wired up → fall through to popup.
  }

  const action = await vscode.window.showInformationMessage(
    `${label}: ${preview(result)}`,
    "Replace",
    "Copy",
  );
  if (action === "Replace") {
    await replaceTextEditSnapshot(target, result);
  }
  if (action === "Copy") {
    vscode.env.clipboard.writeText(result);
  }
}
