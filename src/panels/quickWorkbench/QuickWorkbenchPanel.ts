/**
 * @fileoverview Quick Workbench Panel for fast, accessible conversions
 * @package panels
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import * as vscode from "vscode";
import { createWebviewCsp, generateNonce, escapeHtml, WebviewLimits, isKnownOperation, isValidMessageType } from "../../webview/security";
import type { OpInfo } from "../../web/common/types";
import type { TextEditSnapshot } from "../../commands/textEditSnapshot";
import type { ArgConfig } from "../../chef/Operation";

/**
 * Input source types for the Quick Workbench.
 */
export type InputSource = "manual" | "selection" | "document" | "clipboard";

/**
 * Input context for tracking the origin of input data.
 * Used for safe editor replacement.
 */
export interface InputContext {
  source: InputSource;
  text: string;
  snapshot?: TextEditSnapshot;
  contextId: string;
  timestamp: number;
}

/**
 * Result state containing both full result and preview.
 */
export interface ResultState {
  requestId: number;
  inputContextId: string;
  opName: string;
  success: boolean;
  fullResult: string | Uint8Array | Buffer | ArrayBuffer;
  preview: string;
  isPreviewTruncated: boolean;
  error?: string;
  size: number;
}

/**
 * Argument value types supported by the Quick Workbench.
 */
export type ArgValue = string | number | boolean | string[] | Record<string, unknown> | null;

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
  | { type: "setInput"; text: string; source: InputSource; canReplace: boolean }
  | { type: "setOperations"; operations: OpInfo[] }
  | { type: "setState"; state: QuickWorkbenchState }
  | { type: "setArgs"; opName: string; args: ArgConfig[] }
  | { type: "setResult"; result: string; preview: string; isPreviewTruncated: boolean; error?: string; requestId: number; canReplace: boolean }
  | { type: "clearResult" }
  | { type: "showInfo"; message: string }
  | { type: "showError"; message: string }
  | { type: "updateActionStates"; canCopy: boolean; canReplace: boolean; canNewDoc: boolean };

/**
 * Message types from webview to extension.
 */
export type QuickWorkbenchIncomingMessage =
  | { type: "loadSelection" }
  | { type: "loadDocument" }
  | { type: "loadClipboard" }
  | { type: "clearInput" }
  | { type: "inputChanged"; text: string }
  | { type: "applyOperation"; opName: string; args: Record<string, ArgValue>; requestId: number }
  | { type: "searchOperations"; query: string }
  | { type: "addToFavorites"; opName: string }
  | { type: "removeFromFavorites"; opName: string }
  | { type: "copyResult" }
  | { type: "replaceSelection" }
  | { type: "newDocument" }
  | { type: "close" }
  | { type: "getOps" }
  | { type: "getArgDefs"; opName: string };

/**
 * Maximum sizes for Quick Workbench operations.
 */
const MAX_INPUT_LENGTH = 16 * 1024 * 1024; // 16 MiB
const MAX_RESULT_SIZE = 50 * 1024 * 1024; // 50 MiB
const MAX_PREVIEW_LENGTH = 100000; // 100k characters for display

/**
 * Dependencies for the Quick Workbench panel.
 */
export interface QuickWorkbenchDeps {
  listOps: () => OpInfo[];
  argDefsFor: (opName: string) => ArgConfig[] | undefined;
  runOperation: (opName: string, input: string | Uint8Array | Buffer | ArrayBuffer, args: unknown[]) => Promise<{ result: string | Uint8Array | Buffer | ArrayBuffer; error?: string }>;
  isSafeForPreview: (opName: string) => boolean;
  getSelection: () => { text: string; editor: vscode.TextEditor | undefined };
  getDocumentText: () => string | undefined;
  getClipboardText: () => Promise<string | undefined>;
  replaceSelection: (snapshot: TextEditSnapshot, text: string) => Promise<boolean>;
  createNewDocument: (content: string) => Promise<void>;
}

/**
 * Validation result type.
 */
type ValidationResult<T> =
  | { success: true; message: T }
  | { success: false; error: string };

/**
 * Validates incoming Quick Workbench messages.
 */
function validateQuickWorkbenchMessage(
  msg: unknown,
  knownOpNames: ReadonlySet<string>,
): ValidationResult<QuickWorkbenchIncomingMessage> {
  if (msg === null || typeof msg !== "object") {
    return { success: false, error: "Message must be an object" };
  }

  const message = msg as Record<string, unknown>;
  const messageType = message.type;

  // Validate message type
  const validTypes = [
    "loadSelection", "loadDocument", "loadClipboard", "clearInput",
    "inputChanged", "applyOperation", "searchOperations",
    "addToFavorites", "removeFromFavorites", "copyResult",
    "replaceSelection", "newDocument", "close", "getOps", "getArgDefs"
  ] as const;

  if (!isValidMessageType(messageType, validTypes)) {
    return { success: false, error: `Unknown message type: ${String(messageType)}` };
  }

  try {
    switch (messageType) {
      case "loadSelection":
      case "loadDocument":
      case "loadClipboard":
      case "clearInput":
      case "copyResult":
      case "replaceSelection":
      case "newDocument":
      case "close":
      case "getOps":
        return { success: true, message: { type: messageType as typeof messageType } };

      case "inputChanged": {
        const text = message.text;
        if (typeof text !== "string") {
          return { success: false, error: "text must be a string" };
        }
        if (text.length > WebviewLimits.maxManualInputLength) {
          return { success: false, error: `Input too large: ${text.length} characters` };
        }
        return { success: true, message: { type: "inputChanged", text } };
      }

      case "searchOperations": {
        const query = message.query;
        if (typeof query !== "string") {
          return { success: false, error: "query must be a string" };
        }
        if (query.length > WebviewLimits.maxSearchQueryLength) {
          return { success: false, error: `Search query too long: ${query.length} characters` };
        }
        return { success: true, message: { type: "searchOperations", query } };
      }

      case "addToFavorites":
      case "removeFromFavorites": {
        const opName = message.opName;
        if (typeof opName !== "string") {
          return { success: false, error: "opName must be a string" };
        }
        if (opName.length > WebviewLimits.maxOperationNameLength) {
          return { success: false, error: `opName too long: ${opName.length} characters` };
        }
        if (!isKnownOperation(opName, knownOpNames)) {
          return { success: false, error: `Unknown operation: ${opName}` };
        }
        return { success: true, message: { type: messageType, opName } };
      }

      case "applyOperation": {
        const opName = message.opName;
        const args = message.args;
        const requestId = message.requestId;

        if (typeof opName !== "string") {
          return { success: false, error: "opName must be a string" };
        }
        if (opName.length > WebviewLimits.maxOperationNameLength) {
          return { success: false, error: `opName too long: ${opName.length} characters` };
        }
        if (!isKnownOperation(opName, knownOpNames)) {
          return { success: false, error: `Unknown operation: ${opName}` };
        }
        if (typeof requestId !== "number" || !Number.isFinite(requestId)) {
          return { success: false, error: "requestId must be a valid number" };
        }
        if (args !== undefined && args !== null && (typeof args !== "object" || Array.isArray(args))) {
          return { success: false, error: "args must be an object or null" };
        }
        if (args !== null && args !== undefined) {
          const argsObj = args as Record<string, unknown>;
          const argKeys = Object.keys(argsObj);
          if (argKeys.length > WebviewLimits.maxArgsPerStep) {
            return { success: false, error: `Too many arguments: ${argKeys.length}` };
          }
          for (const [key, value] of Object.entries(argsObj)) {
            if (typeof key !== "string" || key.length > 100) {
              return { success: false, error: `Invalid argument key: ${key}` };
            }
            // Validate value types and sizes
            if (typeof value === "string") {
              if (value.length > WebviewLimits.maxArgumentStringLength) {
                return { success: false, error: `Argument ${key} too long` };
              }
            } else if (Array.isArray(value)) {
              if (value.length > WebviewLimits.maxValueItems) {
                return { success: false, error: `Argument ${key} has too many items` };
              }
            } else if (typeof value === "object" && value !== null) {
              const objSize = JSON.stringify(value).length;
              if (objSize > WebviewLimits.maxArgumentCharacters) {
                return { success: false, error: `Argument ${key} too large` };
              }
            }
          }
        }
        return { success: true, message: { type: "applyOperation", opName, args: args as Record<string, ArgValue>, requestId } };
      }

      case "getArgDefs": {
        const opName = message.opName;
        if (typeof opName !== "string") {
          return { success: false, error: "opName must be a string" };
        }
        if (opName.length > WebviewLimits.maxOperationNameLength) {
          return { success: false, error: `opName too long: ${opName.length} characters` };
        }
        if (!isKnownOperation(opName, knownOpNames)) {
          return { success: false, error: `Unknown operation: ${opName}` };
        }
        return { success: true, message: { type: "getArgDefs", opName } };
      }

      default:
        return { success: false, error: `Unhandled message type: ${String(messageType)}` };
    }
  } catch (e) {
    return { success: false, error: `Invalid message structure: ${e instanceof Error ? e.message : String(e)}` };
  }
}

/**
 * Generates a unique context ID.
 */
function generateContextId(): string {
  return `ctx-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Quick Workbench panel for fast data transformations.
 */
export class QuickWorkbenchPanel {
  private panel: vscode.WebviewPanel | undefined;
  private nonce: string;
  private state: QuickWorkbenchState;
  private currentRequestId = 0;
  private pendingRequestId = 0;
  private inputContext: InputContext | null = null;
  private resultState: ResultState | null = null;
  private knownOpNames: ReadonlySet<string> | null = null;
  private currentInputText = "";

  constructor(private readonly deps: QuickWorkbenchDeps) {
    this.nonce = "";
    this.state = { favorites: [], recents: [] };
  }

  /**
   * Initialize known operation names for validation.
   */
  initialize(ops: OpInfo[]): void {
    this.knownOpNames = new Set(ops.map((op) => op.opName));
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

    this.panel.webview.onDidReceiveMessage((msg: unknown) =>
      this.handleMessage(msg),
    );

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });

    this.panel.reveal(vscode.ViewColumn.Beside, true);

    // Initialize operations list
    const ops = this.deps.listOps();
    this.initialize(ops);
    this.panel.webview.postMessage({ type: "setOperations", operations: ops } as QuickWorkbenchOutgoingMessage);
    this.panel.webview.postMessage({ type: "setState", state: this.state } as QuickWorkbenchOutgoingMessage);
    this.updateActionStates();
  }

  /**
   * Update action button states based on current context and result.
   */
  private updateActionStates(): void {
    const canCopy = this.resultState !== null && this.resultState.success && this.resultState.preview.length > 0;
    const canReplace = this.inputContext !== null && 
                      this.inputContext.source === "selection" && 
                      this.inputContext.snapshot !== undefined &&
                      this.resultState !== null && 
                      this.resultState.success &&
                      this.resultState.inputContextId === this.inputContext.contextId;
    const canNewDoc = this.resultState !== null && this.resultState.success && this.resultState.fullResult !== null;

    this.panel?.webview.postMessage({
      type: "updateActionStates",
      canCopy,
      canReplace,
      canNewDoc
    } as QuickWorkbenchOutgoingMessage);
  }

  /**
   * Clear the current result state.
   */
  private clearResult(): void {
    this.resultState = null;
    this.panel?.webview.postMessage({ type: "clearResult" } as QuickWorkbenchOutgoingMessage);
    this.updateActionStates();
  }

  /**
   * Set input text with source and optional snapshot.
   */
  private setInput(text: string, source: InputSource, snapshot?: TextEditSnapshot): void {
    const newContext: InputContext = {
      source,
      text,
      snapshot,
      contextId: generateContextId(),
      timestamp: Date.now(),
    };
    this.inputContext = newContext;
    this.currentInputText = text;
    this.clearResult(); // Clear result when input changes
    
    const canReplace = source === "selection" && snapshot !== undefined;
    
    this.panel?.webview.postMessage({
      type: "setInput",
      text,
      source,
      canReplace
    } as QuickWorkbenchOutgoingMessage);
  }

  /**
   * Convert validated args to array for runOperation.
   */
  private argsToArray(argDefs: ArgConfig[] | undefined, validatedArgs: Record<string, ArgValue>): unknown[] {
    if (!argDefs) return [];

    const result: unknown[] = [];
    for (const argDef of argDefs) {
      const value = validatedArgs[argDef.name];
      if (value !== undefined) {
        result.push(value);
      } else {
        // Use default
        result.push(argDef.value);
      }
    }
    return result;
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
    .op-item.selected { background: var(--vscode-list-activeSelectionBackground); }
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
    button:hover:not(:disabled) { background: var(--vscode-button-hoverBackground); }
    button:disabled { opacity: 0.4; cursor: not-allowed; }
    button:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: 1px; }
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
    .warning-message {
      font-size: 11px;
      color: var(--vscode-warningForeground);
      padding: 4px 8px;
      background: rgba(255, 255, 0, 0.15);
      border-radius: 2px;
    }
    .size-info { font-size: 10px; opacity: 0.6; text-align: right; }
    .input-info { font-size: 10px; opacity: 0.6; }
    .source-indicator { font-size: 10px; opacity: 0.5; }
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
    <div class="input-info">
      <span id="inputSize"></span>
      <span id="inputSource" class="source-indicator"></span>
    </div>
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
      const inputSize = document.getElementById('inputSize');
      const inputSource = document.getElementById('inputSource');
      const resultInfo = document.getElementById('resultInfo');
      const statusMessage = document.getElementById('statusMessage');

      let operations = [];
      let favorites = new Set();
      let recents = new Set();
      let currentRequestId = 0;
      let canReplace = false;
      let canCopy = false;
      let canNewDoc = false;
      let currentOpName = null;

      function escHtml(s) {
        return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
      }

      function updateInputInfo() {
        const text = inputText.value;
        const bytes = new Blob([text]).size;
        inputSize.textContent = text ? text.length + ' chars, ' + bytes + ' bytes' : '';
      }

      function updateResultInfo() {
        const text = resultText.value;
        const bytes = new Blob([text]).size;
        resultInfo.textContent = text ? text.length + ' chars, ' + bytes + ' bytes' : '';
      }

      function updateButtonStates() {
        copyBtn.disabled = !canCopy;
        replaceBtn.disabled = !canReplace;
        newDocBtn.disabled = !canNewDoc;
      }

      function showMessage(message, isError = false, isWarning = false) {
        statusMessage.textContent = message;
        statusMessage.className = isError ? 'error-message' : isWarning ? 'warning-message' : 'info-message';
      }

      function clearMessage() { 
        statusMessage.textContent = ''; 
        statusMessage.className = ''; 
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

        const items = filtered.map(op => {
          const isFav = favorites.has(op.opName);
          const favClass = isFav ? 'active' : '';
          const favTitle = isFav ? 'Remove from favorites' : 'Add to favorites';
          const favStar = isFav ? '\\u2605' : '\\u2606';
          const selectedClass = currentOpName === op.opName ? 'selected' : '';
          return '<div class="op-item ' + selectedClass + '" data-op="' + escHtml(op.opName) + '" title="' + escHtml(op.displayName) + ' - ' + escHtml(op.module) + '">' +
            '<span class="op-name">' + escHtml(op.displayName) + '</span>' +
            '<span class="op-module">' + escHtml(op.module) + '</span>' +
            '<span class="op-favorite ' + favClass + '" title="' + favTitle + '">' + favStar + '</span>' +
          '</div>';
        });

        opList.innerHTML = items.join('');
      }

      function applyOperation(opName) {
        const text = inputText.value;
        if (text.length === 0) {
          showMessage('No input text', true);
          return;
        }
        if (text.length > MAX_LIVE_INPUT_CHARACTERS) {
          showMessage('Input too large for automatic execution', true);
          return;
        }
        const reqId = ++currentRequestId;
        vscode.postMessage({ type: 'applyOperation', opName, args: {}, requestId: reqId });
        showMessage('Applying...', false);
      }

      // Event listeners
      inputText.addEventListener('input', () => { updateInputInfo(); clearMessage(); });
      resultText.addEventListener('input', () => { updateResultInfo(); });
      searchOps.addEventListener('input', () => { renderOperations(searchOps.value); });

      inputText.addEventListener('change', () => { 
        vscode.postMessage({ type: 'inputChanged', text: inputText.value }); 
      });

      loadSelection.addEventListener('click', () => vscode.postMessage({ type: 'loadSelection' }));
      loadDocument.addEventListener('click', () => vscode.postMessage({ type: 'loadDocument' }));
      loadClipboard.addEventListener('click', () => vscode.postMessage({ type: 'loadClipboard' }));
      clearInput.addEventListener('click', () => { inputText.value = ''; updateInputInfo(); clearMessage(); });
      closeBtn.addEventListener('click', () => vscode.postMessage({ type: 'close' }));

      copyBtn.addEventListener('click', () => vscode.postMessage({ type: 'copyResult' }));
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
        if (opName) {
          currentOpName = opName;
          renderOperations(searchOps.value);
          if (inputText.value.length > 0 && inputText.value.length <= MAX_LIVE_INPUT_CHARACTERS) {
            applyOperation(opName);
          }
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
            inputSource.textContent = 'Source: ' + msg.source;
            updateInputInfo();
            clearMessage();
            break;
          case 'setState':
            favorites = new Set(msg.state.favorites || []);
            recents = new Set(msg.state.recents || []);
            renderOperations(searchOps.value);
            break;
          case 'setResult':
            if (msg.requestId !== currentRequestId) {
              // Stale response, ignore
              break;
            }
            resultText.value = msg.result || '';
            updateResultInfo();
            clearMessage();
            if (msg.error) showMessage(msg.error, true);
            if (msg.isPreviewTruncated) {
              showMessage('Result truncated for display', false, true);
            }
            canCopy = msg.canCopy !== undefined ? msg.canCopy : (msg.result && msg.result.length > 0);
            canReplace = msg.canReplace !== undefined ? msg.canReplace : false;
            canNewDoc = msg.canNewDoc !== undefined ? msg.canNewDoc : (msg.result && msg.result.length > 0);
            updateButtonStates();
            break;
          case 'clearResult':
            resultText.value = '';
            updateResultInfo();
            updateButtonStates();
            clearMessage();
            canCopy = false;
            canReplace = false;
            canNewDoc = false;
            break;
          case 'showInfo':
            showMessage(msg.message, false);
            break;
          case 'showError':
            showMessage(msg.message, true);
            break;
          case 'updateActionStates':
            canCopy = msg.canCopy;
            canReplace = msg.canReplace;
            canNewDoc = msg.canNewDoc;
            updateButtonStates();
            break;
        }
      });

      // Initial render
      renderOperations();
      updateInputInfo();
      updateButtonStates();
      vscode.postMessage({ type: 'getOps' });
    })();
  </script>
</body>
</html>`;
  }

  private async handleMessage(msg: unknown): Promise<void> {
    // Validate message
    if (this.knownOpNames === null) {
      // If not initialized, only allow initialization messages
      const initTypes = ["getOps", "close"];
      const message = msg as Record<string, unknown>;
      const messageType = message?.type;
      if (typeof messageType === "string" && initTypes.includes(messageType)) {
        // Allow initialization messages
      } else {
        // Security: Reject messages before initialization
        return;
      }
    }

    const validation = validateQuickWorkbenchMessage(msg, this.knownOpNames || new Set());
    if (!validation.success) {
      // Security: Reject invalid messages
      return;
    }

    const message = validation.message;
    
    switch (message.type) {
      case "getOps":
        this.panel?.webview.postMessage({ type: "setOperations", operations: this.deps.listOps() } as QuickWorkbenchOutgoingMessage);
        break;

      case "loadSelection": {
        const selection = this.deps.getSelection();
        if (!selection.editor) {
          this.panel?.webview.postMessage({ type: "showError", message: "No active editor" } as QuickWorkbenchOutgoingMessage);
          break;
        }
        
        const range = selection.editor.selection;
        const snapshot = {
          editor: selection.editor,
          uri: selection.editor.document.uri.toString(),
          version: selection.editor.document.version,
          range,
          value: selection.text,
        };
        
        this.setInput(selection.text, "selection", snapshot);
        this.inputContext = {
          source: "selection",
          text: selection.text,
          snapshot,
          contextId: generateContextId(),
          timestamp: Date.now(),
        };
        break;
      }

      case "loadDocument": {
        const docText = this.deps.getDocumentText() || "";
        // For document input, no snapshot for replacement (too dangerous)
        this.setInput(docText, "document");
        this.inputContext = {
          source: "document",
          text: docText,
          contextId: generateContextId(),
          timestamp: Date.now(),
        };
        break;
      }

      case "loadClipboard": {
        const clipText = await this.deps.getClipboardText() || "";
        // For clipboard input, no snapshot for replacement
        this.setInput(clipText, "clipboard");
        this.inputContext = {
          source: "clipboard",
          text: clipText,
          contextId: generateContextId(),
          timestamp: Date.now(),
        };
        break;
      }

      case "clearInput":
        this.setInput("", "manual");
        this.inputContext = {
          source: "manual",
          text: "",
          contextId: generateContextId(),
          timestamp: Date.now(),
        };
        break;

      case "inputChanged":
        // Update input context for manual input
        this.setInput(message.text, "manual");
        this.inputContext = {
          source: "manual",
          text: message.text,
          contextId: generateContextId(),
          timestamp: Date.now(),
        };
        break;

      case "applyOperation": {
        const text = this.inputContext?.text || "";
        const opName = message.opName;
        const args = message.args || {};
        const requestId = message.requestId;

        // Check input size
        if (text.length > MAX_INPUT_LENGTH) {
          this.panel?.webview.postMessage({
            type: "setResult",
            result: "",
            preview: "",
            isPreviewTruncated: false,
            error: `Input too large: ${text.length} characters exceeds ${MAX_INPUT_LENGTH} maximum`,
            requestId,
            canReplace: false,
          } as QuickWorkbenchOutgoingMessage);
          break;
        }

        // Get arg definitions and convert to array
        const argDefs = this.deps.argDefsFor(opName);
        const argsArray = argDefs ? this.argsToArray(argDefs, args) : [];

        // Update context ID for this request
        const currentContextId = this.inputContext?.contextId || generateContextId();
        const currentRequestId = ++this.currentRequestId;
        this.pendingRequestId = currentRequestId;

        // Execute operation
        try {
          const result = await this.deps.runOperation(opName, text, argsArray);
          
          // Check if this is still the current request
          if (requestId !== currentRequestId) {
            // Stale request, ignore result
            break;
          }

          // Handle result
          let fullResult: string | Uint8Array | Buffer | ArrayBuffer;
          let preview: string;
          let isPreviewTruncated: boolean;
          let resultSize: number;

          if (typeof result.result === "string") {
            fullResult = result.result;
            resultSize = Buffer.byteLength(result.result, "utf8");
          } else if (result.result instanceof Buffer) {
            fullResult = result.result;
            resultSize = result.result.byteLength;
            // Try to convert to string for display
            try {
              fullResult = result.result.toString("utf8");
            } catch {
              // Invalid UTF-8, use hex
              fullResult = result.result.toString("hex");
            }
          } else if (result.result instanceof Uint8Array) {
            fullResult = Buffer.from(result.result);
            resultSize = fullResult.byteLength;
            try {
              fullResult = fullResult.toString("utf8");
            } catch {
              fullResult = fullResult.toString("hex");
            }
          } else if (result.result instanceof ArrayBuffer) {
            fullResult = Buffer.from(result.result);
            resultSize = fullResult.byteLength;
            try {
              fullResult = fullResult.toString("utf8");
            } catch {
              fullResult = fullResult.toString("hex");
            }
          } else {
            fullResult = String(result.result);
            resultSize = Buffer.byteLength(fullResult, "utf8");
          }

          // Check result size
          if (resultSize > MAX_RESULT_SIZE) {
            this.panel?.webview.postMessage({
              type: "setResult",
              result: "",
              preview: "",
              isPreviewTruncated: false,
              error: `Result too large: ${resultSize} bytes exceeds ${MAX_RESULT_SIZE} maximum`,
              requestId,
              canReplace: false,
            } as QuickWorkbenchOutgoingMessage);
            break;
          }

          // Convert to string if needed
          const resultString = typeof fullResult === "string" ? fullResult : String(fullResult);

          // Create preview
          if (resultString.length <= MAX_PREVIEW_LENGTH) {
            preview = escapeHtml(resultString);
            isPreviewTruncated = false;
          } else {
            preview = escapeHtml(resultString.slice(0, MAX_PREVIEW_LENGTH - 10)) + "... [truncated]";
            isPreviewTruncated = true;
          }

          // Store result state
          this.resultState = {
            requestId: currentRequestId,
            inputContextId: currentContextId,
            opName,
            success: true,
            fullResult: resultString,
            preview,
            isPreviewTruncated,
            error: result.error,
            size: resultSize,
          };

          this.addToRecents(opName);

          // Determine if replace is possible
          const canReplace = this.inputContext?.source === "selection" && 
                            this.inputContext.snapshot !== undefined &&
                            this.resultState.inputContextId === this.inputContext.contextId;

          this.panel?.webview.postMessage({
            type: "setResult",
            result: preview,
            preview,
            isPreviewTruncated,
            error: result.error,
            requestId,
            canReplace,
          } as QuickWorkbenchOutgoingMessage);

          this.updateActionStates();

        } catch (e) {
          if (requestId === this.currentRequestId) {
            this.panel?.webview.postMessage({
              type: "setResult",
              result: "",
              preview: "",
              isPreviewTruncated: false,
              error: `Error: ${e instanceof Error ? e.message : String(e)}`,
              requestId,
              canReplace: false,
            } as QuickWorkbenchOutgoingMessage);
            this.resultState = null;
            this.updateActionStates();
          }
        }
        break;
      }

      case "addToFavorites":
        this.toggleFavorite(message.opName);
        this.panel?.webview.postMessage({ type: "setState", state: this.state } as QuickWorkbenchOutgoingMessage);
        break;

      case "removeFromFavorites":
        this.toggleFavorite(message.opName);
        this.panel?.webview.postMessage({ type: "setState", state: this.state } as QuickWorkbenchOutgoingMessage);
        break;

      case "copyResult": {
        if (this.resultState && this.resultState.success && this.resultState.fullResult) {
          const content = this.resultState.fullResult;
          // Use full result, not preview
          const textToCopy = typeof content === "string" ? content : String(content);
          try {
            await vscode.env.clipboard.writeText(textToCopy);
            this.panel?.webview.postMessage({ type: "showInfo", message: "Result copied to clipboard" } as QuickWorkbenchOutgoingMessage);
          } catch (e) {
            this.panel?.webview.postMessage({ type: "showError", message: `Failed to copy: ${e}` } as QuickWorkbenchOutgoingMessage);
          }
        }
        break;
      }

      case "replaceSelection": {
        if (!this.resultState || !this.resultState.success || !this.inputContext) {
          this.panel?.webview.postMessage({ type: "showError", message: "No valid result to replace" } as QuickWorkbenchOutgoingMessage);
          break;
        }

        // Verify context match
        if (this.resultState.inputContextId !== this.inputContext.contextId) {
          this.panel?.webview.postMessage({ type: "showError", message: "Result context has changed, please run again" } as QuickWorkbenchOutgoingMessage);
          break;
        }

        if (this.inputContext.source !== "selection" || !this.inputContext.snapshot) {
          this.panel?.webview.postMessage({ type: "showError", message: "Replace is only available for selection input" } as QuickWorkbenchOutgoingMessage);
          break;
        }

        const snapshot = this.inputContext.snapshot;
        const content = this.resultState.fullResult;
        const textToReplace = typeof content === "string" ? content : String(content);

        try {
          const success = await this.deps.replaceSelection(snapshot, textToReplace);
          if (success) {
            this.panel?.webview.postMessage({ type: "showInfo", message: "Selection replaced" } as QuickWorkbenchOutgoingMessage);
            // Invalidate the snapshot after use
            this.inputContext = {
              ...this.inputContext,
              snapshot: undefined,
            };
            this.updateActionStates();
          } else {
            this.panel?.webview.postMessage({ type: "showError", message: "Replace failed: source text has changed" } as QuickWorkbenchOutgoingMessage);
          }
        } catch (e) {
          this.panel?.webview.postMessage({ type: "showError", message: `Replace failed: ${e}` } as QuickWorkbenchOutgoingMessage);
        }
        break;
      }

      case "newDocument": {
        if (this.resultState && this.resultState.success && this.resultState.fullResult) {
          const content = this.resultState.fullResult;
          const textToOpen = typeof content === "string" ? content : String(content);
          try {
            await this.deps.createNewDocument(textToOpen);
            this.panel?.webview.postMessage({ type: "showInfo", message: "Result opened in new document" } as QuickWorkbenchOutgoingMessage);
          } catch (e) {
            this.panel?.webview.postMessage({ type: "showError", message: `Failed to open document: ${e}` } as QuickWorkbenchOutgoingMessage);
          }
        }
        break;
      }

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
