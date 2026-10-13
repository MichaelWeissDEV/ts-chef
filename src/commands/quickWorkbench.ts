/**
 * @fileoverview Quick Workbench command handler
 * @package commands
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import * as vscode from "vscode";
import { QuickWorkbenchPanel } from "../panels/quickWorkbench/QuickWorkbenchPanel";
import { replaceTextEditSnapshot } from "./textEditSnapshot";
import type { TextEditSnapshot } from "./textEditSnapshot";
import type { ArgConfig } from "../chef/Operation";
import type { OpInfo } from "../web/common/types";

/**
 * Quick Workbench panel instance.
 */
let quickWorkbenchPanel: QuickWorkbenchPanel | undefined;

/**
 * Dependencies for Quick Workbench.
 */
export interface QuickWorkbenchDependencies {
  registry: OpInfo[];
  argDefsFor: (opName: string) => ArgConfig[] | undefined;
  runOperation: (opName: string, input: string | Uint8Array | Buffer | ArrayBuffer, args: unknown[]) => Promise<{ result: string | Uint8Array | Buffer | ArrayBuffer; error?: string }>;
  isSafeForPreview: (opName: string) => boolean;
}

/**
 * Create Quick Workbench deps from extension context.
 */
export function createQuickWorkbenchDeps(deps: QuickWorkbenchDependencies): {
  listOps: () => OpInfo[];
  argDefsFor: (opName: string) => ArgConfig[] | undefined;
  runOperation: (opName: string, input: string | Uint8Array | Buffer | ArrayBuffer, args: unknown[]) => Promise<{ result: string | Uint8Array | Buffer | ArrayBuffer; error?: string }>;
  isSafeForPreview: (opName: string) => boolean;
  getSelection: () => { text: string; editor: vscode.TextEditor | undefined };
  getDocumentText: () => string | undefined;
  getClipboardText: () => Promise<string | undefined>;
  replaceSelection: (snapshot: TextEditSnapshot, text: string) => Promise<boolean>;
  createNewDocument: (content: string) => Promise<void>;
} {
  return {
    listOps: () => deps.registry,
    argDefsFor: deps.argDefsFor,
    runOperation: deps.runOperation,
    isSafeForPreview: deps.isSafeForPreview,
    getSelection: () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return { text: "", editor: undefined };
      const selection = editor.selection;
      const text = editor.document.getText(selection);
      return { text, editor };
    },
    getDocumentText: () => {
      const editor = vscode.window.activeTextEditor;
      return editor?.document.getText();
    },
    getClipboardText: async () => {
      try {
        return await vscode.env.clipboard.readText();
      } catch {
        return undefined;
      }
    },
    replaceSelection: async (snapshot: TextEditSnapshot, text: string) => {
      return replaceTextEditSnapshot(snapshot, text);
    },
    createNewDocument: async (content: string) => {
      const doc = await vscode.workspace.openTextDocument({
        content,
        language: "plaintext",
      });
      await vscode.window.showTextDocument(doc);
    },
  };
}

/**
 * Register Quick Workbench command.
 */
export function registerQuickWorkbenchCommand(
  context: vscode.ExtensionContext,
  deps: QuickWorkbenchDependencies,
): void {
  const panelDeps = createQuickWorkbenchDeps(deps);
  quickWorkbenchPanel = new QuickWorkbenchPanel({ ...panelDeps, resourceRoot: context.asAbsolutePath("dist"), stateStore: context.globalState });

  context.subscriptions.push(
    vscode.commands.registerCommand("tschef.openQuickWorkbench", async () => {
      try {
        await quickWorkbenchPanel?.show();
      } catch (e) {
        vscode.window.showErrorMessage(`ts-chef: Failed to open Quick Workbench: ${e}`);
      }
    }),
  );

  context.subscriptions.push({
    dispose: () => {
      quickWorkbenchPanel?.dispose();
      quickWorkbenchPanel = undefined;
    },
  });
}

/**
 * Show Quick Workbench if already created.
 */
export async function showQuickWorkbench(): Promise<void> {
  if (quickWorkbenchPanel) {
    await quickWorkbenchPanel.show();
  }
}

/** Access the singleton for the extension's own integration suite. */
export function getQuickWorkbenchPanel(): QuickWorkbenchPanel | undefined { return quickWorkbenchPanel; }
