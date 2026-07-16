import * as vscode from "vscode";
import { replaceTarget } from "../commands/pipelineResult";
import type {
  PipelineInputSource,
  PipelineOutputTarget,
} from "./pipelineProtocol";

export interface PipelineInputSnapshot {
  text: string;
  editor?: vscode.TextEditor;
  target?: vscode.Selection;
  documentVersion?: number;
}

export const MAX_PIPELINE_INPUT_CHARACTERS = 16 * 1024 * 1024;
export const MAX_PIPELINE_OUTPUT_CHARACTERS = 64 * 1024 * 1024;
export const MAX_PIPELINE_PREVIEW_CHARACTERS = 1024 * 1024;

export function assertPipelineInputSize(
  text: string,
  maxCharacters = MAX_PIPELINE_INPUT_CHARACTERS,
): void {
  if (text.length > maxCharacters) {
    throw new Error(
      `Input is too large (${text.length.toLocaleString()} characters; limit ${maxCharacters.toLocaleString()}).`,
    );
  }
}

export function assertPipelineOutputSize(
  text: string,
  maxCharacters = MAX_PIPELINE_OUTPUT_CHARACTERS,
): void {
  if (text.length > maxCharacters) {
    throw new Error(
      `Output is too large (${text.length.toLocaleString()} characters; limit ${maxCharacters.toLocaleString()}).`,
    );
  }
}

export function pipelinePreview(
  text: string,
  maxCharacters = MAX_PIPELINE_PREVIEW_CHARACTERS,
): { value: string; truncated: boolean; totalLength: number } {
  if (text.length <= maxCharacters)
    return { value: text, truncated: false, totalLength: text.length };
  return {
    value:
      text.slice(0, maxCharacters) +
      `\n\n… preview truncated (${text.length.toLocaleString()} characters total)`,
    truncated: true,
    totalLength: text.length,
  };
}

export interface PipelineIODeps {
  activeEditor: () => vscode.TextEditor | undefined;
  readClipboard: () => Thenable<string>;
  writeClipboard: (text: string) => Thenable<void>;
  openTextDocument: (content: string) => Thenable<vscode.TextDocument>;
  showTextDocument: (document: vscode.TextDocument) => Thenable<unknown>;
}

export const vscodePipelineIO: PipelineIODeps = {
  activeEditor: () => vscode.window.activeTextEditor,
  readClipboard: () => vscode.env.clipboard.readText(),
  writeClipboard: (text) => vscode.env.clipboard.writeText(text),
  openTextDocument: (content) => vscode.workspace.openTextDocument({ content }),
  showTextDocument: (document) =>
    vscode.window.showTextDocument(document, {
      preview: false,
      viewColumn: vscode.ViewColumn.Beside,
    }),
};

export async function readPipelineInput(
  source: PipelineInputSource,
  manualInput: string,
  deps: PipelineIODeps = vscodePipelineIO,
  preferredEditor?: vscode.TextEditor,
): Promise<PipelineInputSnapshot> {
  const editor = deps.activeEditor() ?? preferredEditor;
  const snapshot: PipelineInputSnapshot = {
    text: "",
    editor,
    target: editor && source !== "document" ? replaceTarget(editor) : undefined,
    documentVersion: editor?.document.version,
  };

  switch (source) {
    case "manual":
      snapshot.text = manualInput;
      break;
    case "clipboard":
      snapshot.text = await deps.readClipboard();
      break;
    case "document":
      if (!editor) throw new Error("No active editor for document input.");
      snapshot.text = editor.document.getText();
      snapshot.target = new vscode.Selection(
        editor.document.positionAt(0),
        editor.document.positionAt(snapshot.text.length),
      );
      break;
    case "selection":
      if (!editor) throw new Error("No active editor for selection input.");
      if (editor.selection.isEmpty) {
        snapshot.text = editor.document.getText();
        snapshot.target = new vscode.Selection(
          editor.document.positionAt(0),
          editor.document.positionAt(snapshot.text.length),
        );
      } else {
        snapshot.text = editor.document.getText(editor.selection);
      }
      break;
  }
  assertPipelineInputSize(snapshot.text);
  return snapshot;
}

export async function deliverPipelineOutput(
  target: PipelineOutputTarget,
  result: string,
  snapshot: PipelineInputSnapshot,
  deps: PipelineIODeps = vscodePipelineIO,
): Promise<void> {
  switch (target) {
    case "preview":
      return;
    case "clipboard":
      await deps.writeClipboard(result);
      return;
    case "newDocument": {
      const document = await deps.openTextDocument(result);
      await deps.showTextDocument(document);
      return;
    }
    case "replaceSelection": {
      const { editor, target: range, documentVersion } = snapshot;
      if (!editor || !range || editor.document.isClosed)
        throw new Error("The source editor is no longer available.");
      if (
        documentVersion !== undefined &&
        editor.document.version !== documentVersion
      ) {
        throw new Error(
          "The source document changed while the pipeline was running; output was not applied.",
        );
      }
      const applied = await editor.edit((builder) =>
        builder.replace(range, result),
      );
      if (!applied) throw new Error("VS Code rejected the editor change.");
      return;
    }
  }
}
