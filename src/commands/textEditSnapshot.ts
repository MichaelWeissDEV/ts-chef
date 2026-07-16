import * as vscode from "vscode";

export interface TextEditSnapshot {
  editor: vscode.TextEditor;
  uri: string;
  version: number;
  range: vscode.Range;
  value: string;
}

/** Capture the exact source span an asynchronous transformation started from. */
export function captureTextEditSnapshot(
  editor: vscode.TextEditor,
  range: vscode.Range,
): TextEditSnapshot {
  return {
    editor,
    uri: editor.document.uri.toString(),
    version: editor.document.version,
    range,
    value: editor.document.getText(range),
  };
}

/**
 * Replace only when the original editor, document version, range and text are
 * still current. This prevents delayed transformations from editing shifted or
 * unrelated text.
 */
export async function replaceTextEditSnapshot(
  snapshot: TextEditSnapshot,
  replacement: string,
  staleMessage =
    "ts-chef: The source text changed while processing. Run the conversion again.",
): Promise<boolean> {
  const document = snapshot.editor.document;
  if (
    document.isClosed ||
    document.uri.toString() !== snapshot.uri ||
    document.version !== snapshot.version ||
    document.getText(snapshot.range) !== snapshot.value
  ) {
    void vscode.window.showWarningMessage(staleMessage);
    return false;
  }
  try {
    const applied = await snapshot.editor.edit((edit) =>
      edit.replace(snapshot.range, replacement),
    );
    if (!applied) {
      void vscode.window.showWarningMessage(
        "ts-chef: VS Code rejected the edit; the source was not changed.",
      );
      return false;
    }
    return true;
  } catch {
    void vscode.window.showWarningMessage(
      "ts-chef: The source editor is no longer available; nothing was changed.",
    );
    return false;
  }
}
