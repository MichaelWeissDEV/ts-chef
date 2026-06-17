import * as vscode from "vscode";
import { VariableStore, ScopedVariable } from "../storage/store";

class VariableNode extends vscode.TreeItem {
  constructor(public readonly variable: ScopedVariable) {
    super(variable.name, vscode.TreeItemCollapsibleState.None);
    const value =
      variable.value.length > 40
        ? variable.value.slice(0, 40) + "…"
        : variable.value;
    this.description = `${value}  [${variable.scope}]`;
    this.tooltip = `${variable.name}: ${variable.value}${variable.description ? "\n" + variable.description : ""}\n(${variable.scope})`;
    // Scope-qualified for future scope-targeted context menus.
    this.contextValue = `variable-${variable.scope}`;
    this.iconPath = new vscode.ThemeIcon("key");
  }
}

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
