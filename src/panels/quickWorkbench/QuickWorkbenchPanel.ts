/**
 * @fileoverview Quick Workbench Panel for fast, accessible conversions
 * @package panels
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import * as vscode from "vscode";
import { createWebviewCsp, generateNonce } from "../../webview/security";
import type { OpInfo } from "../../web/common/types";

/**
 * Input source types for the Quick Workbench.
 */
export type InputSource = "manual" | "selection" | "document" | "clipboard";

/**
 * Quick Workbench state for favorites and recents.
 */
export interface QuickWorkbenchState {
  favorites: string[];
  recents: string[];
}

/**
 * Message types from extension to webview.
 */
export type QuickWorkbenchOutgoingMessage =
  | { type: "setInput"; text: string; source: InputSource }
  | { type: "setOperations"; operations: OpInfo[] }
  | { type: "setState"; state: QuickWorkbenchState }
  | { type: "setResult"; result: string; error?: string; requestId: number }
  | { type: "clearResult" }
  | { type: "showInfo"; message: string };

/**
 * Message types from webview to extension.
 */
export type QuickWorkbenchIncomingMessage =
  | { type: "loadSelection" }
  | { type: "loadDocument" }
  | { type: "loadClipboard" }
  | { type: "clearInput" }
  | { type: "inputChanged"; text: string }
  | { type: "applyOperation"; opName: string; args: unknown[]; requestId: number }
  | { type: "searchOperations"; query: string }
  | { type: "addToFavorites"; opName: string }
  | { type: "removeFromFavorites"; opName: string }
  | { type: "copyResult" }
  | { type: "replaceSelection" }
  | { type: "newDocument" }
  | { type: "close" }
  | { type: "getOps" };

/**
 * Dependencies for the Quick Workbench panel.
 */
export interface QuickWorkbenchDeps {
  listOps: () => OpInfo[];
  argDefsFor: (opName: string) => unknown[] | undefined;
  runOperation: (opName: string, input: string, args: unknown[]) => Promise<{ result: string; error?: string }>;
  isSafeForPreview: (opName: string) => boolean;
  getSelection: () => { text: string; editor: vscode.TextEditor | undefined };
  getDocumentText: () => string | undefined;
  getClipboardText: () => Promise<string | undefined>;
  replaceSelection: (text: string) => Promise<boolean>;
  createNewDocument: (content: string) => Promise<void>;
}

const MAX_PREVIEW_RESULT_LENGTH = 100000;

/**
 * Quick Workbench panel for fast data transformations.
 */
export class QuickWorkbenchPanel {
  private panel: vscode.WebviewPanel | undefined;
  private nonce: string;
  private state: QuickWorkbenchState;
  private currentRequestId = 0;
  private pendingRequestId = 0;
  private selectionSnapshot: { target: { value: string; editor: vscode.TextEditor }; timestamp: number } | null = null;
  private currentInputText = "";
  private currentResultText = "";

  constructor(private readonly deps: QuickWorkbenchDeps) {
    this.nonce = "";
    this.state = { favorites: [], recents: [] };
  }

  async show(): Promise<void> {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Beside, true);
      return;
    }

    this.nonce = generateNonce();
    const csp = createWebviewCsp(this.nonce);

    this.panel = vscode.window.createWebviewPanel(
      "tschef.quickWorkbench",
      "ts-chef Quick Convert",
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
      { enableScripts: true },
    );

    this.panel.webview.html = this.buildHtml(csp, this.nonce);

    this.panel.webview.onDidReceiveMessage((msg: QuickWorkbenchIncomingMessage) =>
      this.handleMessage(msg),
    );

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });

    this.panel.reveal(vscode.ViewColumn.Beside, true);

    this.panel.webview.postMessage({ type: "setOperations", operations: this.deps.listOps() } as QuickWorkbenchOutgoingMessage);
    this.panel.webview.postMessage({ type: "setState", state: this.state } as QuickWorkbenchOutgoingMessage);
  }

  private buildHtml(csp: string, nonce: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <style nonce="${nonce}">
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      display: grid;
      grid-template-rows: auto 1fr auto;
      height: 100vh;
      overflow: hidden;
      padding: 8px;
      gap: 8px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .header h1 {
      font-size: 14px;
      font-weight: 600;
      margin: 0;
    }
    .header-actions { display: flex; gap: 4px; }
    .section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 600;
      opacity: 0.8;
    }
    .section-header label { opacity: 0.7; }
    .input-controls { display: flex; gap: 4px; flex-wrap: wrap; }
    #inputText, #resultText {
      flex: 1;
      min-height: 80px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border,#555);
      padding: 6px 8px;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 12px;
      resize: none;
      outline: none;
    }
    #inputText:focus, #resultText:focus { border-color: var(--vscode-focusBorder); }
    #inputText::placeholder, #resultText::placeholder { color: var(--vscode-input-placeholderForeground); opacity: 0.7; }
    .operations-section { display: flex; flex-direction: column; gap: 8px; }
    #searchOps {
      width: 100%;
      padding: 4px 8px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border,#555);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }
    #searchOps::placeholder { color: var(--vscode-input-placeholderForeground); opacity: 0.7; }
    .op-list {
      flex: 1;
      overflow-y: auto;
      border: 1px solid var(--vscode-panel-border);
      background: var(--vscode-sideBar-background);
    }
    .op-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      cursor: pointer;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .op-item:last-child { border-bottom: none; }
    .op-item:hover { background: var(--vscode-list-hoverBackground); }
    .op-name { flex: 1; font-size: 12px; }
    .op-module { font-size: 10px; opacity: 0.6; color: var(--vscode-descriptionForeground); }
    .op-favorite { cursor: pointer; opacity: 0.5; font-size: 12px; }
    .op-favorite:hover { opacity: 1; }
    .op-favorite.active { opacity: 1; color: var(--vscode-list-activeSelectionForeground); }
    .empty-state { padding: 16px; text-align: center; opacity: 0.6; font-size: 11px; }
    .result-section { display: flex; flex-direction: column; gap: 8px; }
    .result-actions { display: flex; gap: 4px; flex-wrap: wrap; }
    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 2px;
      padding: 4px 12px;
      cursor: pointer;
      font-size: 11px;
      font-family: var(--vscode-font-family);
    }
    button:hover { background: var(--vscode-button-hoverBackground); }
    button:disabled { opacity: 0.4; cursor: not-allowed; }
    .info-message {
      font-size: 11px;
      opacity: 0.7;
      padding: 4px 8px;
      background: var(--vscode-statusBar-item-hoverBackground);
      border-radius: 2px;
    }
    .error-message {
      font-size: 11px;
      color: var(--vscode-errorForeground);
      padding: 4px 8px;
      background: rgba(255, 0, 0, 0.15);
      border-radius: 2px;
    }
    .size-info { font-size: 10px; opacity: 0.6; text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ts-chef Quick Convert</h1>
    <div class="header-actions">
      <button id="closeBtn" type="button">Close</button>
    </div>
  </div>
  <div class="section">
    <div class="section-header">
      <span>Input</span>
      <div class="input-controls">
        <button id="loadSelection" type="button" title="Load from current selection">From Selection</button>
        <button id="loadDocument" type="button" title="Load entire document">From Document</button>
        <button id="loadClipboard" type="button" title="Load from clipboard">From Clipboard</button>
        <button id="clearInput" type="button" title="Clear input">Clear</button>
      </div>
    </div>
    <textarea id="inputText" placeholder="Enter text or load from selection/document/clipboard..."></textarea>
    <div id="inputInfo" class="size-info"></div>
  </div>
  <div class="section operations-section">
    <div class="section-header">
      <span>Operation</span>
      <label id="resultInfo" class="size-info"></label>
    </div>
    <input type="text" id="searchOps" placeholder="Search operations... (e.g., From Base64, To Hex)">
    <div id="opList" class="op-list"></div>
  </div>
  <div class="section result-section">
    <div class="section-header">
      <span>Output</span>
      <div class="result-actions">
        <button id="copyBtn" type="button" title="Copy result to clipboard" disabled>Copy</button>
        <button id="replaceBtn" type="button" title="Replace original selection" disabled>Replace</button>
        <button id="newDocBtn" type="button" title="Open in new document">New Document</button>
      </div>
    </div>
    <textarea id="resultText" placeholder="Result will appear here..." readonly></textarea>
    <div id="statusMessage"></div>
  </div>
  <script nonce="${nonce}">
    (() => {
      const vscode = acquireVsCodeApi();
      const inputText = document.getElementById('inputText');
      const resultText = document.getElementById('resultText');
      const searchOps = document.getElementById('searchOps');
      const opList = document.getElementById('opList');
      const copyBtn = document.getElementById('copyBtn');
      const replaceBtn = document.getElementById('replaceBtn');
      const newDocBtn = document.getElementById('newDocBtn');
      const loadSelection = document.getElementById('loadSelection');
      const loadDocument = document.getElementById('loadDocument');
      const loadClipboard = document.getElementById('loadClipboard');
      const clearInput = document.getElementById('clearInput');
      const closeBtn = document.getElementById('closeBtn');
      const inputInfo = document.getElementById('inputInfo');
      const resultInfo = document.getElementById('resultInfo');
      const statusMessage = document.getElementById('statusMessage');
      let operations = [];
      let favorites = new Set();
      let recents = new Set();
      let currentRequestId = 0;
      let pendingRequestId = 0;
      function updateInputInfo() {
        const text = inputText.value;
        const bytes = new Blob([text]).size;
        inputInfo.textContent = text ? text.length + ' chars, ' + bytes + ' bytes' : '';
      }
      function updateResultInfo() {
        const text = resultText.value;
        const bytes = new Blob([text]).size;
        resultInfo.textContent = text ? text.length + ' chars, ' + bytes + ' bytes' : '';
      }
      function updateButtonStates() {
        const hasResult = resultText.value.length > 0;
        copyBtn.disabled = !hasResult;
        replaceBtn.disabled = !hasResult;
      }
      function escHtml(s) {
        return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
      }
      function renderOperations(filter = '') {
        const query = filter.toLowerCase();
        const filtered = operations.filter(op =>
          op.displayName.toLowerCase().includes(query) ||
          op.opName.toLowerCase().includes(query) ||
          op.module.toLowerCase().includes(query)
        );
        if (filtered.length === 0) {
          opList.innerHTML = '<div class="empty-state">No operations found. Try a different search.</div>';
          return;
        }
        filtered.sort((a, b) => {
          const aFav = favorites.has(a.opName);
          const bFav = favorites.has(b.opName);
          if (aFav !== bFav) return aFav ? -1 : 1;
          const aRecent = recents.has(a.opName);
          const bRecent = recents.has(b.opName);
          if (aRecent !== bRecent) return aRecent ? -1 : 1;
          return a.displayName.localeCompare(b.displayName);
        });
        opList.innerHTML = filtered.map(function(op) {
          const isFav = favorites.has(op.opName);
          const favClass = isFav ? 'active' : '';
          const favTitle = isFav ? 'Remove from favorites' : 'Add to favorites';
          const favStar = isFav ? '\u2605' : '\u2606';
          return '<div class="op-item" data-op="' + escHtml(op.opName) + '" title="' + escHtml(op.displayName) + ' - ' + escHtml(op.module) + '">' +
            '<span class="op-name">' + escHtml(op.displayName) + '</span>' +
            '<span class="op-module">' + escHtml(op.module) + '</span>' +
            '<span class="op-favorite ' + favClass + '" title="' + favTitle + '">' + favStar + '</span>' +
          '</div>';
        }).join('');
      }
      function showMessage(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.className = isError ? 'error-message' : 'info-message';
      }
      function clearMessage() { statusMessage.textContent = ''; statusMessage.className = ''; }
      inputText.addEventListener('input', () => { updateInputInfo(); clearMessage(); });
      resultText.addEventListener('input', () => { updateResultInfo(); updateButtonStates(); });
      searchOps.addEventListener('input', () => { renderOperations(searchOps.value); });
      inputText.addEventListener('change', () => { vscode.postMessage({ type: 'inputChanged', text: inputText.value }); });
      loadSelection.addEventListener('click', () => vscode.postMessage({ type: 'loadSelection' }));
      loadDocument.addEventListener('click', () => vscode.postMessage({ type: 'loadDocument' }));
      loadClipboard.addEventListener('click', () => vscode.postMessage({ type: 'loadClipboard' }));
      clearInput.addEventListener('click', () => { inputText.value = ''; updateInputInfo(); clearMessage(); });
      closeBtn.addEventListener('click', () => vscode.postMessage({ type: 'close' }));
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(resultText.value);
          showMessage('Result copied to clipboard', false);
        } catch (e) {
          showMessage('Failed to copy: ' + e, true);
        }
      });
      replaceBtn.addEventListener('click', () => vscode.postMessage({ type: 'replaceSelection' }));
      newDocBtn.addEventListener('click', () => vscode.postMessage({ type: 'newDocument' }));
      opList.addEventListener('click', (e) => {
        const opItem = e.target.closest('.op-item');
        if (!opItem) return;
        const opName = opItem.dataset.op;
        const favBtn = e.target.closest('.op-favorite');
        if (favBtn && opName) {
          vscode.postMessage({ type: favorites.has(opName) ? 'removeFromFavorites' : 'addToFavorites', opName });
          return;
        }
        if (opName && inputText.value.length <= 10000) {
          vscode.postMessage({ type: 'applyOperation', opName, args: [], requestId: ++currentRequestId });
          pendingRequestId = currentRequestId;
          showMessage('Applying...', false);
        } else {
          showMessage('Input too large', true);
        }
      });
      window.addEventListener('message', (e) => {
        const msg = e.data;
        switch (msg.type) {
          case 'setOperations':
            operations = msg.operations || [];
            renderOperations(searchOps.value);
            break;
          case 'setInput':
            inputText.value = msg.text || '';
            updateInputInfo();
            clearMessage();
            break;
          case 'setState':
            favorites = new Set(msg.state.favorites || []);
            recents = new Set(msg.state.recents || []);
            renderOperations(searchOps.value);
            break;
          case 'setResult':
            if (msg.requestId === pendingRequestId) {
              resultText.value = msg.result || '';
              updateResultInfo();
              updateButtonStates();
              clearMessage();
              if (msg.error) showMessage(msg.error, true);
            }
            break;
          case 'clearResult':
            resultText.value = '';
            updateResultInfo();
            updateButtonStates();
            break;
          case 'showInfo':
            showMessage(msg.message, false);
            break;
        }
      });
      renderOperations();
      updateInputInfo();
      updateButtonStates();
      vscode.postMessage({ type: 'getOps' });
    })();
  </script>
</body>
</html>`;
  }

  private async handleMessage(msg: QuickWorkbenchIncomingMessage): Promise<void> {
    switch (msg.type) {
      case "getOps":
        this.panel?.webview.postMessage({ type: "setOperations", operations: this.deps.listOps() } as QuickWorkbenchOutgoingMessage);
        break;

      case "loadSelection": {
        const selection = this.deps.getSelection();
        this.selectionSnapshot = { target: { value: selection.text, editor: selection.editor }, timestamp: Date.now() };
        this.currentInputText = selection.text;
        this.panel?.webview.postMessage({ type: "setInput", text: selection.text, source: "selection" } as QuickWorkbenchOutgoingMessage);
        break;
      }

      case "loadDocument": {
        const docText = this.deps.getDocumentText() || "";
        this.currentInputText = docText;
        this.panel?.webview.postMessage({ type: "setInput", text: docText, source: "document" } as QuickWorkbenchOutgoingMessage);
        break;
      }

      case "loadClipboard": {
        const clipText = await this.deps.getClipboardText() || "";
        this.currentInputText = clipText;
        this.panel?.webview.postMessage({ type: "setInput", text: clipText, source: "clipboard" } as QuickWorkbenchOutgoingMessage);
        break;
      }

      case "clearInput":
        this.currentInputText = "";
        this.panel?.webview.postMessage({ type: "setInput", text: "", source: "manual" } as QuickWorkbenchOutgoingMessage);
        break;

      case "inputChanged":
        this.currentInputText = msg.text;
        break;

      case "applyOperation": {
        const text = this.currentInputText;
        const opName = msg.opName;
        try {
          const result = await this.deps.runOperation(opName, text, []);
          let displayResult = result.result;
          if (displayResult.length > MAX_PREVIEW_RESULT_LENGTH) {
            displayResult = displayResult.slice(0, MAX_PREVIEW_RESULT_LENGTH) + "... [truncated]";
          }
          this.currentResultText = displayResult;
          this.panel?.webview.postMessage({ type: "setResult", result: displayResult, error: result.error, requestId: msg.requestId } as QuickWorkbenchOutgoingMessage);
          this.addToRecents(opName);
        } catch (e) {
          this.panel?.webview.postMessage({ type: "setResult", result: "", error: `Error: ${e}`, requestId: msg.requestId } as QuickWorkbenchOutgoingMessage);
        }
        break;
      }

      case "addToFavorites":
        this.toggleFavorite(msg.opName);
        this.panel?.webview.postMessage({ type: "setState", state: this.state } as QuickWorkbenchOutgoingMessage);
        break;

      case "removeFromFavorites":
        this.toggleFavorite(msg.opName);
        this.panel?.webview.postMessage({ type: "setState", state: this.state } as QuickWorkbenchOutgoingMessage);
        break;

      case "copyResult":
        if (this.currentResultText) {
          await vscode.env.clipboard.writeText(this.currentResultText);
          this.panel?.webview.postMessage({ type: "showInfo", message: "Result copied to clipboard" } as QuickWorkbenchOutgoingMessage);
        }
        break;

      case "replaceSelection":
        if (this.selectionSnapshot && this.currentResultText) {
          const success = await this.deps.replaceSelection(this.currentResultText);
          if (success) {
            this.panel?.webview.postMessage({ type: "showInfo", message: "Selection replaced" } as QuickWorkbenchOutgoingMessage);
          } else {
            this.panel?.webview.postMessage({ type: "showInfo", message: "Replace failed: selection changed" } as QuickWorkbenchOutgoingMessage);
          }
        }
        break;

      case "newDocument":
        if (this.currentResultText) {
          await this.deps.createNewDocument(this.currentResultText);
        }
        break;

      case "close":
        this.panel?.dispose();
        break;
    }
  }

  private toggleFavorite(opName: string): void {
    if (this.state.favorites.includes(opName)) {
      this.state.favorites = this.state.favorites.filter((op) => op !== opName);
    } else {
      this.state.favorites = [...this.state.favorites, opName];
      if (this.state.favorites.length > 20) this.state.favorites = this.state.favorites.slice(-20);
    }
  }

  private addToRecents(opName: string): void {
    this.state.recents = this.state.recents.filter((op) => op !== opName);
    this.state.recents = [opName, ...this.state.recents];
    if (this.state.recents.length > 20) this.state.recents = this.state.recents.slice(0, 20);
  }

  dispose(): void {
    this.panel?.dispose();
    this.panel = undefined;
  }
}
