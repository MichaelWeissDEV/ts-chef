import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildHtml } from "./html";
/**
 * @fileoverview Quick Workbench Panel for fast, accessible conversions
 * @package panels
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import * as vscode from "vscode";
import { validateQuickWorkbenchMessage } from "./protocol";
import { MAX_LIVE_INPUT_CHARACTERS, MAX_LIVE_OUTPUT_CHARACTERS, isOperationSafeForLive } from "../pipelineLivePolicy";
import { resolveDefaultArg } from "../../commands/argDefaults";
import { resolveArguments } from "./arguments";
import { renderResult } from "./result";
import { captureTextEditSnapshot } from "../../commands/textEditSnapshot";
import { createWebviewCsp, generateNonce } from "../../webview/security";
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
  revision: number;
  valid: boolean;
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
  text: string;
  binary: boolean;
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
/**
 * Maximum sizes for Quick Workbench operations.
 */
const MAX_INPUT_LENGTH = 16 * 1024 * 1024; // 16 MiB
const MAX_RESULT_SIZE = 50 * 1024 * 1024; // 50 MiB

/**
 * Dependencies for the Quick Workbench panel.
 */
export interface QuickWorkbenchDeps {
  resourceRoot?: string;
  stateStore?: vscode.Memento;
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
  private inputContext: InputContext | null = null;
  private resultState: ResultState | null = null;
  private knownOpNames: ReadonlySet<string> | null = null;

  constructor(private readonly deps: QuickWorkbenchDeps) {
    this.nonce = "";
    const saved = deps.stateStore?.get<QuickWorkbenchState>("quickWorkbench.operations");
    const clean = (items: unknown) => Array.isArray(items) ? [...new Set(items.filter((id): id is string => typeof id === "string" && id.length <= 256))].slice(0, 20) : [];
    this.state = { favorites: clean(saved?.favorites), recents: clean(saved?.recents) };
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
      this.clearResult();
      this.inputContext = null;
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
    const canCopy = this.resultState !== null && this.resultState.success;
    const canReplace = this.inputContext !== null && 
                      this.inputContext.source === "selection" && 
                      this.inputContext.snapshot !== undefined &&
                      !this.resultState?.binary &&
                      this.resultState !== null && 
                      this.resultState.success &&
                      this.resultState.inputContextId === this.inputContext.contextId;
    const canNewDoc = this.resultState !== null && this.resultState.success && this.resultState.fullResult !== null;

    this.panel?.webview.postMessage({
      type: "updateActionStates",
      requestId: this.resultState?.requestId,
      canCopy,
      canReplace,
      canNewDoc
    } as QuickWorkbenchOutgoingMessage);
  }

  /**
   * Clear the current result state.
   */
  private clearResult(): void {
    this.currentRequestId++;
    this.resultState = null;
    this.panel?.webview.postMessage({ type: "clearResult" } as QuickWorkbenchOutgoingMessage);
    this.updateActionStates();
  }

  /**
   * Set input text with source and optional snapshot.
   */
  private setInput(text: string, source: InputSource, snapshot?: TextEditSnapshot, notify = true, revision?: number): void {
    const newContext: InputContext = {
      source,
      text,
      snapshot,
      contextId: generateContextId(),
      timestamp: Date.now(),
      revision: (this.inputContext?.revision ?? 0) + 1,
      valid: text.length <= MAX_INPUT_LENGTH,
    };
    this.inputContext = newContext;
    this.clearResult(); // Clear result when input changes
    
    const canReplace = source === "selection" && snapshot !== undefined;
    
    if (notify) this.panel?.webview.postMessage({
      type: "setInput",
      revision,
      text,
      source,
      canReplace
    } as QuickWorkbenchOutgoingMessage);
  }

  /**
   * Convert validated args to array for runOperation.
   */
  private buildHtml(csp: string, nonce: string): string {
    const root = this.deps.resourceRoot ?? __dirname;
    return buildHtml(csp, nonce, readFileSync(join(root, "quickWorkbench.js"), "utf8"), readFileSync(join(root, "quickWorkbench.css"), "utf8"));
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
      if (msg && typeof msg === "object" && "type" in msg && (msg.type === "inputChanged" || msg.type === "applyOperation")) {
        this.clearResult();
        if (msg.type === "inputChanged") this.inputContext = null;
        this.panel?.webview.postMessage({ type: "showError", message: validation.error });
      }
      return;
    }

    const message = validation.message;
    
    switch (message.type) {
      case "getOps":
        this.persistState();
        this.panel?.webview.postMessage({ type: "setOperations", operations: this.deps.listOps() } as QuickWorkbenchOutgoingMessage);
        break;

      case "loadSelection": {
        const selection = this.deps.getSelection();
        if (!selection.editor) {
          this.panel?.webview.postMessage({ type: "showError", message: "No active editor" } as QuickWorkbenchOutgoingMessage);
          break;
        }
        
        const snapshot = captureTextEditSnapshot(selection.editor, selection.editor.selection);
        this.setInput(selection.text, "selection", snapshot, true, message.revision);
        break;
      }

      case "loadDocument": {
        const docText = this.deps.getDocumentText() || "";
        // For document input, no snapshot for replacement (too dangerous)
        this.setInput(docText, "document", undefined, true, message.revision);
        break;
      }

      case "loadClipboard": {
        this.clearResult();
        const generation = this.currentRequestId;
        const clipText = await this.deps.getClipboardText() || "";
        if (generation !== this.currentRequestId) break;
        // For clipboard input, no snapshot for replacement
        this.setInput(clipText, "clipboard", undefined, true, message.revision);
        break;
      }

      case "clearInput":
        this.setInput("", "manual", undefined, true, message.revision);
        break;

      case "inputChanged":
        // Update input context for manual input
        this.setInput(message.text, "manual", undefined, false);
        break;

      case "invalidate":
        this.clearResult();
        break;
      case "getArgDefs": {
        this.clearResult();
        const args = this.deps.argDefsFor(message.opName);
        this.panel?.webview.postMessage({ type: "setArgs", opName: message.opName, args: args || [], defaults: (args || []).map(resolveDefaultArg), safe: isOperationSafeForLive(message.opName) && this.deps.isSafeForPreview(message.opName) });
        break;
      }
      case "applyOperation": {
        this.clearResult();
        const generation = this.currentRequestId;
        const context = this.inputContext;
        const { opName, requestId } = message;
        const current = () => generation === this.currentRequestId && context === this.inputContext;
        try {
          if (!context?.valid) throw new Error("No valid input");
          const previewMode = message.mode !== "manual";
          if (previewMode && (!isOperationSafeForLive(opName) || !this.deps.isSafeForPreview(opName) || context.text.length > MAX_LIVE_INPUT_CHARACTERS)) throw new Error("Automatic preview unavailable. Use Run Operation.");
          const defs = this.deps.argDefsFor(opName);
          const args = resolveArguments(defs, message.args);
          if (previewMode && JSON.stringify(args) !== JSON.stringify(resolveArguments(defs, {}))) throw new Error("Modified parameters require Run Operation.");
          const output = await this.deps.runOperation(opName, context.text, args);
          if (!current()) break;
          if (output.error) throw new Error(output.error);
          const rendered = renderResult(output.result, previewMode ? MAX_LIVE_OUTPUT_CHARACTERS : MAX_RESULT_SIZE);
          this.resultState = { ...rendered, requestId, inputContextId: context.contextId, opName, success: true };
          this.addToRecents(opName);
          this.panel?.webview.postMessage({ type: "setResult", result: rendered.preview, preview: rendered.preview,
            isPreviewTruncated: rendered.isPreviewTruncated, requestId, canCopy: true, canNewDoc: true,
            binary: rendered.binary, canReplace: !rendered.binary && context.snapshot !== undefined });
          this.updateActionStates();
        } catch (error) {
          if (current()) {
            this.resultState = null;
            this.panel?.webview.postMessage({ type: "setResult", result: "", requestId, error: String(error), canCopy: false, canNewDoc: false, canReplace: false });
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
        if (this.resultState && this.resultState.success) {
            // Use full result, not preview
          const textToCopy = this.resultState.text;
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
        if (!this.resultState || !this.resultState.success || this.resultState.binary || !this.inputContext) {
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
        this.inputContext.snapshot = undefined;
        this.updateActionStates();
        const textToReplace = this.resultState.text;

        try {
          const success = await this.deps.replaceSelection(snapshot, textToReplace);
          if (success) {
            this.panel?.webview.postMessage({ type: "showInfo", message: "Selection replaced" } as QuickWorkbenchOutgoingMessage);
            // Invalidate the snapshot after use

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
        if (this.resultState && this.resultState.success) {
            const textToOpen = this.resultState.text;
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

  private persistState(): void {
    void this.deps.stateStore?.update("quickWorkbench.operations", this.state);
    this.panel?.webview.postMessage({ type: "setState", state: this.state });
  }

  private toggleFavorite(opName: string): void {
    if (this.state.favorites.includes(opName)) {
      this.state.favorites = this.state.favorites.filter((op) => op !== opName);
    } else {
      this.state.favorites = [...this.state.favorites, opName];
      if (this.state.favorites.length > 20) this.state.favorites = this.state.favorites.slice(-20);
    }
    this.persistState();
  }

  private addToRecents(opName: string): void {
    this.state.recents = this.state.recents.filter((op) => op !== opName);
    this.state.recents = [opName, ...this.state.recents];
    if (this.state.recents.length > 20) this.state.recents = this.state.recents.slice(0, 20);
    this.persistState();
  }

  dispose(): void {
    this.clearResult();
    this.inputContext = null;
    this.panel?.dispose();
    this.panel = undefined;
  }
}
