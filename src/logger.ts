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

export function initOutputChannel(context: vscode.ExtensionContext): void {
  _ch = vscode.window.createOutputChannel("ts-chef");
  context.subscriptions.push(_ch);
}

export function log(msg: string): void {
  _ch?.appendLine(`[ts-chef] ${msg}`);
}
