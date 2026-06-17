import * as vscode from "vscode";
import { PipelineStore, ScopedPipeline } from "../storage/store";

class PipelineNode extends vscode.TreeItem {
  constructor(public readonly pipeline: ScopedPipeline) {
    super(pipeline.name, vscode.TreeItemCollapsibleState.None);
    const summary = pipeline.description ?? pipeline.raw.slice(0, 50);
    this.description = `${summary}  [${pipeline.scope}]`;
    this.tooltip = `${pipeline.raw}\n(${pipeline.scope})`;
    // Scope-qualified for future scope-targeted context menus.
    this.contextValue = `pipeline-${pipeline.scope}`;
    this.iconPath = new vscode.ThemeIcon("symbol-event");
    this.command = {
      command: "tschef.runSavedPipeline",
      title: "Run Pipeline",
      arguments: [pipeline.name],
    };
  }
}

export class PipelinesTreeProvider implements vscode.TreeDataProvider<PipelineNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private store: PipelineStore) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  getTreeItem(e: PipelineNode): vscode.TreeItem {
    return e;
  }
  getChildren(): PipelineNode[] {
    return this.store.loadAll().map((p) => new PipelineNode(p));
  }
}
