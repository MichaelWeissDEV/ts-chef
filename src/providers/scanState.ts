/**
 * @fileoverview scanState provider for VS Code extension functionality
 * @package providers
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as vscode from "vscode";
import { DetectionMatch, scanText } from "./detector";

/**
 * In-memory cache of per-document detection results. Fires `onDidChange` after
 * every scan or clear so subscribers (decorations, tree, hover) can refresh.
 */
export class ScanState {
  private results = new Map<string, DetectionMatch[]>();
  private _onChange = new vscode.EventEmitter<void>();
  readonly onDidChange = this._onChange.event;

  scan(doc: vscode.TextDocument, fireEvent = true): DetectionMatch[] {
    const matches = scanText(doc);
    this.results.set(doc.uri.toString(), matches);
    if (fireEvent) this._onChange.fire();
    return matches;
  }

  /** Manually notify subscribers, e.g. after a batch of silent scans. */
  notify(): void {
    this._onChange.fire();
  }

  get(uri: vscode.Uri): DetectionMatch[] {
    return this.results.get(uri.toString()) ?? [];
  }

  /** Whether this document has been scanned (even if it produced no matches). */
  hasScanned(uri: vscode.Uri): boolean {
    return this.results.has(uri.toString());
  }

  /** All scanned documents that produced at least one match. */
  entries(): { uri: vscode.Uri; matches: DetectionMatch[] }[] {
    return [...this.results.entries()]
      .filter(([, matches]) => matches.length > 0)
      .map(([uri, matches]) => ({ uri: vscode.Uri.parse(uri), matches }));
  }

  clear(uri?: vscode.Uri): void {
    if (uri) {
      this.results.delete(uri.toString());
    } else {
      this.results.clear();
    }
    this._onChange.fire();
  }

  dispose(): void {
    this._onChange.dispose();
  }
}
