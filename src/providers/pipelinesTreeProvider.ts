import * as vscode from "vscode";
import { PipelineStore, Pipeline } from "../storage/store";

class PipelineNode extends vscode.TreeItem {
  constructor(public readonly pipeline: Pipeline) {
    super(pipeline.name, vscode.TreeItemCollapsibleState.None);
    this.description = pipeline.description ?? pipeline.raw.slice(0, 50);
    this.tooltip = pipeline.raw;
    this.contextValue = "pipeline";
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
    return this.store.load().map((p) => new PipelineNode(p));
  }
}
