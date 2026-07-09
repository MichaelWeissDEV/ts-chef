/**
 * @fileoverview patternsTreeProvider provider for VS Code extension functionality
 * @package providers
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as vscode from "vscode";
import * as path from "path";
import { ScanState } from "./scanState";
import { DetectionMatch } from "./detector";

type TreeNode = FileNode | GroupNode | MatchNode;

class FileNode extends vscode.TreeItem {
  constructor(
    uri: vscode.Uri,
    public readonly children: MatchNode[],
  ) {
    super(path.basename(uri.fsPath), vscode.TreeItemCollapsibleState.Expanded);
    this.description = `${children.length} match(es)`;
    this.resourceUri = uri;
    this.iconPath = vscode.ThemeIcon.File;
    this.tooltip = uri.fsPath;
    this.contextValue = "file";
  }
}

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
    showLabel = false,
  ) {
    const top = match.matches[0];
    const conf = top ? `${Math.round(top.confidence * 100)}%` : "";
    super(
      match.value.slice(0, 60) + (match.value.length > 60 ? "…" : ""),
      vscode.TreeItemCollapsibleState.None,
    );
    this.description = showLabel && top ? `${top.label} · ${conf}` : conf;
    this.tooltip = `${match.matches.map((r) => `${r.label}: ${Math.round(r.confidence * 100)}%`).join(", ")}\n\nLine ${match.range.start.line + 1}`;
    this.contextValue = "match";
    this.command = {
      command: "tschef.revealMatch",
      title: "Go to match",
      arguments: [docUri, match.range],
    };
  }
}

/**
 * Tree data provider for the Patterns sidebar.
 *
 * Two display modes, controlled by the `follow` flag:
 * - **follow** (default): the view mirrors the active editor and shows just that
 *   document's matches, grouped by their top classification label. Switching
 *   editors switches the view. A workspace scan temporarily pins the "show all"
 *   view ({@link pinAll}) until the user focuses a single file again.
 * - **not following**: the view keeps whatever has been scanned (all documents,
 *   one node per file when several) and does not change as editors switch — so
 *   the previous scan stays put.
 */
export class PatternsTreeProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private filter = "";
  private follow: boolean;
  /** When following, temporarily show every scanned file (e.g. after a workspace scan). */
  private pinnedAll = false;

  constructor(private state: ScanState) {
    this.follow = vscode.workspace
      .getConfiguration("tschef")
      .get("patterns.followActiveEditor", true);
    state.onDidChange(() => this._onDidChangeTreeData.fire());
  }

  isFollowing(): boolean {
    return this.follow;
  }

  /** Turn active-editor following on/off and refresh. */
  setFollow(follow: boolean): void {
    this.follow = follow;
    this.pinnedAll = false;
    this._onDidChangeTreeData.fire();
  }

  /** Show only the active editor's matches (used when the editor changes). */
  focusActive(): void {
    if (this.pinnedAll) {
      this.pinnedAll = false;
      this._onDidChangeTreeData.fire();
    }
  }

  /** Show every scanned document (used after a workspace scan). */
  pinAll(): void {
    this.pinnedAll = true;
    this._onDidChangeTreeData.fire();
  }

  setFilter(text: string): void {
    this.filter = text.toLowerCase();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeNode): TreeNode[] {
    if (element instanceof FileNode || element instanceof GroupNode)
      return element.children;
    if (element) return [];

    // Follow the active editor: show just that document.
    if (this.follow && !this.pinnedAll) {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return [];
      const matches = this.applyFilter(this.state.get(editor.document.uri));
      return this.groupByLabel(editor.document.uri, matches);
    }

    // Otherwise show every scanned document (persistent view).
    const entries = this.state
      .entries()
      .map(({ uri, matches }) => ({ uri, matches: this.applyFilter(matches) }))
      .filter((e) => e.matches.length > 0);
    if (!entries.length) return [];

    if (entries.length === 1) {
      return this.groupByLabel(entries[0].uri, entries[0].matches);
    }

    // Multiple files: one node per file.
    return entries.map(
      ({ uri, matches }) =>
        new FileNode(
          uri,
          matches.map((m) => new MatchNode(m, uri, true)),
        ),
    );
  }

  /** Group a single document's matches by their top classification label. */
  private groupByLabel(
    uri: vscode.Uri,
    matches: DetectionMatch[],
  ): TreeNode[] {
    if (!matches.length) return [];
    const groups = new Map<string, DetectionMatch[]>();
    for (const m of matches) {
      const key = m.matches[0]?.label ?? "Unknown";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(m);
    }
    return Array.from(groups.entries()).map(
      ([label, items]) =>
        new GroupNode(
          label,
          items.map((m) => new MatchNode(m, uri)),
        ),
    );
  }

  private applyFilter(matches: DetectionMatch[]): DetectionMatch[] {
    if (!this.filter) return matches;
    return matches.filter(
      (m) =>
        m.value.toLowerCase().includes(this.filter) ||
        m.matches.some((r) => r.label.toLowerCase().includes(this.filter)),
    );
  }
}
