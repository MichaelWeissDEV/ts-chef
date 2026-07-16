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
import type { BuiltInPipeline } from "../recipes/standardRecipes";

type AvailablePipeline = ScopedPipeline | BuiltInPipeline;

type PipelineGroupKind = "standard" | "personal";

export class PipelineGroupNode extends vscode.TreeItem {
  constructor(
    public readonly kind: PipelineGroupKind,
    count: number,
  ) {
    super(
      kind === "standard" ? "Standard Pipelines" : "My Pipelines",
      vscode.TreeItemCollapsibleState.Expanded,
    );
    this.description =
      kind === "personal" && count === 0
        ? "No saved pipelines"
        : `${count}`;
    this.tooltip =
      kind === "standard"
        ? `${count} bundled, ready-to-use pipeline${count === 1 ? "" : "s"}`
        : count === 0
          ? "Your global and workspace pipelines will appear here."
          : `${count} global and workspace pipeline${count === 1 ? "" : "s"}`;
    this.contextValue = `tschef-pipeline-group-${kind}`;
    this.iconPath = new vscode.ThemeIcon(
      kind === "standard" ? "library" : "account",
    );
  }
}

export class EmptyPersonalPipelinesNode extends vscode.TreeItem {
  constructor() {
    super("No saved pipelines yet", vscode.TreeItemCollapsibleState.None);
    this.description = "Open the Pipeline Editor to create one";
    this.tooltip =
      "Create a pipeline in the Pipeline Editor and save it globally or in this workspace.";
    this.contextValue = "tschef-empty-pipelines";
    this.iconPath = new vscode.ThemeIcon("info");
    this.command = {
      command: "tschef.openPipelineEditor",
      title: "Open Pipeline Editor",
    };
  }
}

export class PipelineNode extends vscode.TreeItem {
  constructor(public readonly pipeline: AvailablePipeline) {
    super(pipeline.name, vscode.TreeItemCollapsibleState.None);
    const scopeLabel =
      pipeline.scope === "global"
        ? "Global"
        : pipeline.scope === "workspace"
          ? "Workspace"
          : "Built-in";
    const summary = pipeline.description ?? pipeline.raw.slice(0, 50);
    this.description = `${scopeLabel} · ${summary}`;
    this.tooltip = `${pipeline.raw}\n(${scopeLabel})`;
    // Scope-qualified for future scope-targeted context menus.
    this.contextValue = `pipeline-${pipeline.scope}`;
    this.iconPath = new vscode.ThemeIcon("symbol-event");
    this.command = {
      command: "tschef.runSavedPipeline",
      title: "Run Pipeline",
      arguments: [pipeline],
    };
  }
}

export type PipelineTreeNode =
  | PipelineGroupNode
  | PipelineNode
  | EmptyPersonalPipelinesNode;

/**
 * Tree data provider for the Pipelines sidebar. Bundled standard pipelines and
 * user-created global/workspace pipelines are kept in separate root groups.
 * Clicking an actual pipeline runs it against the active selection.
 */
export class PipelinesTreeProvider
  implements vscode.TreeDataProvider<PipelineTreeNode>
{
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(
    private store: PipelineStore,
    private readonly builtIns: readonly BuiltInPipeline[] = [],
  ) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  getTreeItem(e: PipelineTreeNode): vscode.TreeItem {
    return e;
  }

  getChildren(element?: PipelineTreeNode): PipelineTreeNode[] {
    if (!element) {
      const personalCount = this.store.loadAll().length;
      return [
        new PipelineGroupNode("standard", this.builtIns.length),
        new PipelineGroupNode("personal", personalCount),
      ];
    }

    if (!(element instanceof PipelineGroupNode)) return [];
    if (element.kind === "standard") {
      return this.builtIns.map((pipeline) => new PipelineNode(pipeline));
    }

    const personalPipelines = this.store.loadAll();
    return personalPipelines.length > 0
      ? personalPipelines.map((pipeline) => new PipelineNode(pipeline))
      : [new EmptyPersonalPipelinesNode()];
  }
}
