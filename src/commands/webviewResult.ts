import * as vscode from "vscode";
import { replaceTarget } from "./pipelineResult";

/**
 * The source editor + frozen target range a panel result belongs to. Stored so
 * Replace targets the originating editor even though the webview holds focus
 * when its buttons are clicked.
 */
type PanelState = {
  editor: vscode.TextEditor;
  targetRange: vscode.Range;
  result: string;
};
type ResultMessage = { type: "replace" | "copy" | "close" };

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderHtml(result: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body { font-family: var(--vscode-editor-font-family, monospace); color: var(--vscode-foreground); padding: 0.5rem; }
      pre { white-space: pre-wrap; word-break: break-word; max-height: 70vh; overflow: auto;
            background: var(--vscode-textCodeBlock-background); padding: 0.5rem; border-radius: 4px; }
      .actions { margin-top: 0.5rem; }
      button { color: var(--vscode-button-foreground); background: var(--vscode-button-background);
               border: none; padding: 4px 10px; margin-right: 6px; cursor: pointer; border-radius: 2px; }
      button:hover { background: var(--vscode-button-hoverBackground); }
    </style>
  </head>
  <body>
    <pre>${escapeHtml(result)}</pre>
    <div class="actions">
      <button id="replace">Replace</button>
      <button id="copy">Copy</button>
      <button id="close">Close</button>
    </div>
    <script>
      const vscode = acquireVsCodeApi();
      for (const id of ["replace", "copy", "close"]) {
        document.getElementById(id).addEventListener("click", () => vscode.postMessage({ type: id }));
      }
    </script>
  </body>
</html>`;
}

/**
 * Presents pipeline results in a single reusable webview panel beside the
 * editor, themed with VS Code's CSS variables. Subsequent results reuse the
 * same panel rather than spawning new ones.
 *
 * Wired into `presentPipelineResult` via the renderer map as the `panel` mode;
 * call {@link register} once during activation.
 */
export class WebviewResultController {
  private panel: vscode.WebviewPanel | undefined;
  private state: PanelState | undefined;

  register(context: vscode.ExtensionContext): void {
    context.subscriptions.push({ dispose: () => this.panel?.dispose() });
  }

  /** Show `result` in the panel, (re)creating it if necessary. */
  show(editor: vscode.TextEditor, result: string): void {
    this.state = { editor, targetRange: replaceTarget(editor), result };
    if (!this.panel) {
      this.panel = vscode.window.createWebviewPanel(
        "tschef.result",
        "ts-chef result",
        { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
        { enableScripts: true },
      );
      this.panel.webview.onDidReceiveMessage((msg) => this.onMessage(msg));
      this.panel.onDidDispose(() => {
        this.panel = undefined;
        this.state = undefined;
      });
    }
    this.panel.webview.html = renderHtml(result);
    this.panel.reveal(vscode.ViewColumn.Beside, true);
  }

  private async onMessage(msg: ResultMessage): Promise<void> {
    const state = this.state;
    if (!state) return;
    if (msg.type === "replace") {
      if (state.editor.document.isClosed) {
        vscode.window.showWarningMessage(
          "ts-chef: Cannot replace — the editor is no longer open.",
        );
        return;
      }
      try {
        await state.editor.edit((eb) =>
          eb.replace(state.targetRange, state.result),
        );
      } catch {
        vscode.window.showWarningMessage(
          "ts-chef: Could not replace — the editor is no longer available.",
        );
      }
    } else if (msg.type === "copy") {
      vscode.env.clipboard.writeText(state.result);
      vscode.window.setStatusBarMessage(
        "ts-chef: Pipeline result copied",
        3000,
      );
    } else if (msg.type === "close") {
      this.panel?.dispose();
    }
  }
}
