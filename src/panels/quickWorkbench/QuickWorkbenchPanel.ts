/**
 * @fileoverview Quick Workbench Panel for fast, accessible conversions
 * @package panels
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * 
 * This panel provides a user-friendly interface for quick data transformations
 * without requiring knowledge of the pipeline architecture.
 */

import * as vscode from "vscode";
import { createWebviewCsp } from "../webview/security";

/**
 * Input source types for the Quick Workbench.
 */
export type InputSource = "manual" | "selection" | "document" | "clipboard";

/**
 * Operation favorite/recents storage.
 */
export interface QuickWorkbenchState {
  favorites: string[];
  recents: string[];
}

/**
 * Message types for Quick Workbench communication.
 */
export type QuickWorkbenchMessage =
  | { type: "setInput"; text: string; source: InputSource }
  | { type: "setInputSource"; source: InputSource }
  | { type: "applyOperation"; opName: string; args: unknown[] }
  | { type: "searchOperations"; query: string }
  | { type: "addToFavorites"; opName: string }
  | { type: "removeFromFavorites"; opName: string }
  | { type: "copyResult" }
  | { type: "replaceSelection" }
  | { type: "newDocument" }
  | { type: "close" }
  | { type: "getState" }
  | { type: "loadState"; state: QuickWorkbenchState };

/**
 * Result message from webview.
 */
export type QuickWorkbenchResultMessage =
  | { type: "inputChanged"; text: string }
  | { type: "operationSelected"; opName: string }
  | { type: "apply"; opName: string; args: unknown[] }
  | { type: "preview"; opName: string; args: unknown[] }
  | { type: "favoritesToggled"; opName: string; isFavorite: boolean };

/**
 * Dependencies for the Quick Workbench panel.
 */
export interface QuickWorkbenchDeps {
  /** List all available operations. */
  listOps: () => { opName: string; displayName: string; module: string }[];
  /** Get argument definitions for an operation. */
  argDefsFor: (opName: string) => unknown[] | undefined;
  /** Run an operation with given arguments. */
  runOperation: (opName: string, input: string, args: unknown[]) => Promise<{ result: string; error?: string }>;
  /** Check if an operation is safe for live preview. */
  isSafeForPreview: (opName: string) => boolean;
  /** Get the current editor selection. */
  getSelection: () => { text: string; editor: vscode.TextEditor | undefined };
  /** Get the current active document text. */
  getDocumentText: () => string | undefined;
  /** Get clipboard text. */
  getClipboardText: () => Promise<string | undefined>;
  /** Replace the current selection. */
  replaceSelection: (text: string) => Promise<boolean>;
  /** Create a new document with the given content. */
  createNewDocument: (content: string) => Promise<void>;
}

/**
 * The Quick Workbench panel for fast data transformations.
 */
export class QuickWorkbenchPanel {
  private panel: vscode.WebviewPanel | undefined;
  private nonce: string;
  private state: QuickWorkbenchState;

  constructor(private readonly deps: QuickWorkbenchDeps) {
    this.nonce = "";
    this.state = { favorites: [], recents: [] };
  }

  /**
   * Create or show the Quick Workbench panel.
   */
  async show(): Promise<void> {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Beside, true);
      return;
    }

    // Generate nonce for this panel instance
    this.nonce = this.generateNonce();
    const csp = createWebviewCsp(this.nonce);

    this.panel = vscode.window.createWebviewPanel(
      "tschef.quickWorkbench",
      "ts-chef Quick Convert",
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
      { enableScripts: true },
    );

    this.panel.webview.html = this.buildHtml(csp, this.nonce);

    this.panel.webview.onDidReceiveMessage((msg: QuickWorkbenchMessage) =>
      this.handleMessage(msg),
    );

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });

    this.panel.reveal(vscode.ViewColumn.Beside, true);
  }

  /**
   * Generate a nonce for CSP.
   */
  private generateNonce(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return timestamp + random;
  }

  /**
   * Build the HTML for the Quick Workbench panel.
   */
  private buildHtml(csp: string, nonce: string): string {
    // This will be implemented with proper modular HTML/CSS/JS
    // For now, return a basic structure
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <style nonce="${nonce}">
    /* CSS will be moved to separate file */
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      display: grid;
      grid-template-rows: auto 1fr auto;
      height: 100vh;
      overflow: hidden;
      padding: 8px;
      gap: 8px;
    }
  </style>
</head>
<body>
  <div>Quick Workbench - Implementation in progress</div>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    // JavaScript will be moved to separate file
  </script>
</body>
</html>`;
  }

  /**
   * Handle messages from the webview.
   */
  private async handleMessage(msg: QuickWorkbenchMessage): Promise<void> {
    // Handle messages from webview
    switch (msg.type) {
      case "applyOperation":
        // Apply operation logic
        break;
      case "copyResult":
        // Copy result to clipboard
        break;
      case "replaceSelection":
        // Replace current selection with result
        break;
      case "newDocument":
        // Create new document with result
        break;
      case "close":
        this.panel?.dispose();
        break;
    }
  }

  /**
   * Dispose the panel.
   */
  dispose(): void {
    this.panel?.dispose();
    this.panel = undefined;
  }
}
