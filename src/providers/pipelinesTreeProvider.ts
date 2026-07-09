/**
 * @fileoverview pipelinesTreeProvider provider for VS Code extension functionality
 * @package providers
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as vscode from "vscode";
import { PipelineStore, ScopedPipeline } from "../storage/store";

class PipelineNode extends vscode.TreeItem {
  constructor(public readonly pipeline: ScopedPipeline) {
    super(pipeline.name, vscode.TreeItemCollapsibleState.None);
    const scopeLabel = pipeline.scope === "global" ? "Global" : "Workspace";
    const summary = pipeline.description ?? pipeline.raw.slice(0, 50);
    this.description = `${scopeLabel} · ${summary}`;
    this.tooltip = `${pipeline.raw}\n(${scopeLabel})`;
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

/**
 * Tree data provider for the Pipelines sidebar, listing all saved scoped pipelines
 * (workspace and global). Clicking a node runs the pipeline against the active selection.
 */
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
