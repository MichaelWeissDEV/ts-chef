import * as vscode from "vscode";
import { VariableStore, Variable } from "../storage/store";

class VariableNode extends vscode.TreeItem {
  constructor(public readonly variable: Variable) {
    super(variable.name, vscode.TreeItemCollapsibleState.None);
    this.description =
      variable.value.length > 40
        ? variable.value.slice(0, 40) + "…"
        : variable.value;
    this.tooltip = `${variable.name}: ${variable.value}${variable.description ? "\n" + variable.description : ""}`;
    this.contextValue = "variable";
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
    return this.store.load().map((v) => new VariableNode(v));
  }
}
