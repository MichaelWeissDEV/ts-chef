/**
 * @fileoverview variablesTreeProvider provider for VS Code extension functionality
 * @package providers
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as vscode from "vscode";
import { VariableStore, ScopedVariable } from "../storage/store";

class VariableNode extends vscode.TreeItem {
  constructor(public readonly variable: ScopedVariable) {
    super(variable.name, vscode.TreeItemCollapsibleState.None);
    const scopeLabel = variable.scope === "global" ? "Global" : "Workspace";
    const value =
      variable.value.length > 40
        ? variable.value.slice(0, 40) + "…"
        : variable.value;
    this.description = `${scopeLabel} · ${value}`;
    this.tooltip = `${variable.name}: ${variable.value}${variable.description ? "\n" + variable.description : ""}\n(${scopeLabel})`;
    // Scope-qualified for future scope-targeted context menus.
    this.contextValue = `variable-${variable.scope}`;
    this.iconPath = new vscode.ThemeIcon("key");
  }
}

/**
 * Tree data provider for the Variables sidebar, listing all stored scoped variables
 * (workspace and global) with their values and scope shown as item descriptions.
 */
export class VariablesTreeProvider implements vscode.TreeDataProvider<VariableNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private store: VariableStore) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: VariableNode): vscode.TreeItem {
    return element;
  }

  getChildren(): VariableNode[] {
    return this.store.loadAll().map((v) => new VariableNode(v));
  }
}
