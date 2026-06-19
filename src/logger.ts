/**
 * @fileoverview Logging utilities for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as vscode from "vscode";

let _ch: vscode.OutputChannel | undefined;

/**
 * Creates the "ts-chef" output channel and registers it with the extension context
 * so it is disposed automatically on deactivation.
 *
 * @param context - The extension context to attach the channel's disposable to.
 */
export function initOutputChannel(context: vscode.ExtensionContext): void {
  _ch = vscode.window.createOutputChannel("ts-chef");
  context.subscriptions.push(_ch);
}

/**
 * Appends a prefixed message to the "ts-chef" output channel.
 * No-ops silently if {@link initOutputChannel} has not been called yet.
 *
 * @param msg - The message to log.
 */
export function log(msg: string): void {
  _ch?.appendLine(`[ts-chef] ${msg}`);
}
