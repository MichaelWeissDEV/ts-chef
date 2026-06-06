import * as vscode from "vscode";
import { ScanState } from "./scanState";

const HIGH_CONFIDENCE_DECORATION = vscode.window.createTextEditorDecorationType(
  {
    backgroundColor: new vscode.ThemeColor(
      "editor.findMatchHighlightBackground",
    ),
    border: "1px solid",
    borderColor: new vscode.ThemeColor("editorWarning.foreground"),
    borderRadius: "2px",
  },
);

const LOW_CONFIDENCE_DECORATION = vscode.window.createTextEditorDecorationType({
  backgroundColor: new vscode.ThemeColor("editor.wordHighlightBackground"),
  border: "1px dashed",
  borderColor: new vscode.ThemeColor("editorInfo.foreground"),
  borderRadius: "2px",
});

export class DecorationProvider {
  private enabled: boolean;

  constructor(private state: ScanState) {
    this.enabled = vscode.workspace
      .getConfiguration("tschef")
      .get("highlightingEnabled", true);
  }

  toggle(): void {
    this.enabled = !this.enabled;
    if (!this.enabled) this.clearAll();
    vscode.workspace
      .getConfiguration("tschef")
      .update(
        "highlightingEnabled",
        this.enabled,
        vscode.ConfigurationTarget.Global,
      );
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  update(editor: vscode.TextEditor): void {
    if (!this.enabled) {
      editor.setDecorations(HIGH_CONFIDENCE_DECORATION, []);
      editor.setDecorations(LOW_CONFIDENCE_DECORATION, []);
      return;
    }
    const matches = this.state.get(editor.document.uri);
    const high: vscode.DecorationOptions[] = [];
    const low: vscode.DecorationOptions[] = [];

    for (const m of matches) {
      const topConf = m.matches[0]?.confidence ?? 0;
      const label = m.matches
        .map((r) => `${r.label} (${Math.round(r.confidence * 100)}%)`)
        .join(", ");
      const opts: vscode.DecorationOptions = {
        range: m.range,
        hoverMessage: new vscode.MarkdownString(
          `**ts-chef detected:** ${label}`,
        ),
      };
      if (topConf >= 0.9) high.push(opts);
      else low.push(opts);
    }

    editor.setDecorations(HIGH_CONFIDENCE_DECORATION, high);
    editor.setDecorations(LOW_CONFIDENCE_DECORATION, low);
  }

  private clearAll(): void {
    for (const editor of vscode.window.visibleTextEditors) {
      editor.setDecorations(HIGH_CONFIDENCE_DECORATION, []);
      editor.setDecorations(LOW_CONFIDENCE_DECORATION, []);
    }
  }
}
