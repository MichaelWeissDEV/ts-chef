import * as vscode from "vscode";
import { DetectionMatch, scanText } from "./detector";

export class ScanState {
  private results = new Map<string, DetectionMatch[]>();
  private _onChange = new vscode.EventEmitter<void>();
  readonly onDidChange = this._onChange.event;

  scan(doc: vscode.TextDocument): DetectionMatch[] {
    const matches = scanText(doc);
    this.results.set(doc.uri.toString(), matches);
    this._onChange.fire();
    return matches;
  }

  get(uri: vscode.Uri): DetectionMatch[] {
    return this.results.get(uri.toString()) ?? [];
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
