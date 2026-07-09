/**
 * @fileoverview entropyMapProvider — optional per-line entropy heatmap
 * @package providers
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as vscode from "vscode";
import { shannonEntropy } from "./magic";

/**
 * Entropy buckets from calm (low) to hot (high), rendered as overview-ruler
 * marks plus a faint line background. High-entropy lines (packed/encrypted/
 * compressed data) stand out against ordinary prose or code.
 *
 * bits/char thresholds — English prose ~4.0, source code ~4.5-5.0, Base64 ~6.0,
 * random/compressed bytes approach 8.0.
 */
interface Bucket {
  min: number;
  color: string;
}

const BUCKETS: Bucket[] = [
  { min: 0, color: "#3fb95022" }, // low — green tint
  { min: 3.5, color: "#c9b83722" }, // moderate — yellow tint
  { min: 4.5, color: "#e2953722" }, // elevated — orange tint
  { min: 5.5, color: "#e2593737" }, // high — red tint
  { min: 6.5, color: "#d12b6b4a" }, // very high — magenta tint
];

/** Created once at module scope and reused — never per-update (avoids leaks). */
const DECORATIONS = BUCKETS.map((b) =>
  vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    backgroundColor: b.color,
    overviewRulerColor: b.color.slice(0, 7),
    overviewRulerLane: vscode.OverviewRulerLane.Full,
  }),
);

/** Minimum line length worth scoring — short lines have meaningless entropy. */
const MIN_LINE_LENGTH = 12;

/** Pick the bucket index for an entropy value. */
export function bucketFor(entropy: number): number {
  let idx = 0;
  for (let i = 0; i < BUCKETS.length; i++) {
    if (entropy >= BUCKETS[i].min) idx = i;
  }
  return idx;
}

/**
 * Toggleable heatmap that colours each editor line by its Shannon entropy.
 * Off by default; state is mirrored to the `tschef.entropyMap.enabled` setting
 * so it survives reloads. Decoration types are shared and disposed on
 * deactivation via {@link dispose}.
 */
export class EntropyMapProvider {
  private enabled: boolean;

  constructor() {
    this.enabled = vscode.workspace
      .getConfiguration("tschef")
      .get("entropyMap.enabled", false);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    void vscode.workspace
      .getConfiguration("tschef")
      .update(
        "entropyMap.enabled",
        this.enabled,
        vscode.ConfigurationTarget.Global,
      );
    if (!this.enabled) this.clearAll();
    else {
      const editor = vscode.window.activeTextEditor;
      if (editor) this.update(editor);
    }
    return this.enabled;
  }

  update(editor: vscode.TextEditor): void {
    if (!this.enabled) return;
    const doc = editor.document;
    // Skip very large documents to keep scrolling responsive.
    if (doc.lineCount > 20000) {
      this.clear(editor);
      return;
    }

    const perBucket: vscode.Range[][] = DECORATIONS.map(() => []);
    for (let i = 0; i < doc.lineCount; i++) {
      const text = doc.lineAt(i).text;
      if (text.trim().length < MIN_LINE_LENGTH) continue;
      const idx = bucketFor(shannonEntropy(text));
      perBucket[idx].push(doc.lineAt(i).range);
    }
    DECORATIONS.forEach((deco, i) =>
      editor.setDecorations(deco, perBucket[i]),
    );
  }

  private clear(editor: vscode.TextEditor): void {
    for (const deco of DECORATIONS) editor.setDecorations(deco, []);
  }

  private clearAll(): void {
    for (const editor of vscode.window.visibleTextEditors) this.clear(editor);
  }

  dispose(): void {
    for (const deco of DECORATIONS) deco.dispose();
  }
}
