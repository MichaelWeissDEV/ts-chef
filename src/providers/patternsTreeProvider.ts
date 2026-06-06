import * as vscode from "vscode";
import { ScanState } from "./scanState";
import { DetectionMatch } from "./detector";

type TreeNode = GroupNode | MatchNode;

class GroupNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly children: MatchNode[],
  ) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);
    this.description = `${children.length} found`;
    this.contextValue = "group";
  }
}

class MatchNode extends vscode.TreeItem {
  constructor(
    public readonly match: DetectionMatch,
    public readonly docUri: vscode.Uri,
  ) {
    const top = match.matches[0];
    const conf = top ? `${Math.round(top.confidence * 100)}%` : "";
    super(
      match.value.slice(0, 60) + (match.value.length > 60 ? "…" : ""),
      vscode.TreeItemCollapsibleState.None,
    );
    this.description = conf;
    this.tooltip = `${match.matches.map((r) => `${r.label}: ${Math.round(r.confidence * 100)}%`).join(", ")}\n\nLine ${match.range.start.line + 1}`;
    this.contextValue = "match";
    this.command = {
      command: "tschef.revealMatch",
      title: "Go to match",
      arguments: [docUri, match.range],
    };
  }
}

export class PatternsTreeProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private filter = "";

  constructor(private state: ScanState) {
    state.onDidChange(() => this._onDidChangeTreeData.fire());
  }

  setFilter(text: string): void {
    this.filter = text.toLowerCase();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeNode): TreeNode[] {
    if (element) return [];

    const editor = vscode.window.activeTextEditor;
    if (!editor) return [];

    const matches = this.state.get(editor.document.uri);
    const filtered = this.filter
      ? matches.filter(
          (m) =>
            m.value.toLowerCase().includes(this.filter) ||
            m.matches.some((r) => r.label.toLowerCase().includes(this.filter)),
        )
      : matches;

    // Group by top label
    const groups = new Map<string, DetectionMatch[]>();
    for (const m of filtered) {
      const key = m.matches[0]?.label ?? "Unknown";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(m);
    }

    return Array.from(groups.entries()).map(
      ([label, items]) =>
        new GroupNode(
          label,
          items.map((m) => new MatchNode(m, editor.document.uri)),
        ),
    );
  }
}
