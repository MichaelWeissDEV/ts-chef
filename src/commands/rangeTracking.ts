import * as vscode from "vscode";

/** Number of newlines in a string (i.e. lines added by inserting it). */
function newlineCount(text: string): number {
  let n = 0;
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

/**
 * Adjusts a stored target range in response to a single document content
 * change, so a pinned result keeps targeting the right text as the document
 * is edited above it.
 *
 * Line-based and deliberately conservative:
 * - change entirely below the range → range is unchanged;
 * - change entirely above the range → range shifts by the net line delta;
 * - change touching the range's lines → returns `null` (the range is
 *   invalidated; the caller should close the result and let the user re-run).
 */
export function shiftRangeForChange(
  range: vscode.Range,
  change: { range: vscode.Range; text: string },
): vscode.Range | null {
  const rangeStart = range.start.line;
  const rangeEnd = range.end.line;
  const changeStart = change.range.start.line;
  const changeEnd = change.range.end.line;

  // Change is strictly below the stored range: no effect.
  if (changeStart > rangeEnd) return range;

  // Change touches the stored range's line span: invalidate.
  if (changeEnd >= rangeStart) return null;

  // Change is strictly above: shift by the net number of lines added/removed.
  const lineDelta = newlineCount(change.text) - (changeEnd - changeStart);
  if (lineDelta === 0) return range;
  return new vscode.Range(
    rangeStart + lineDelta,
    range.start.character,
    rangeEnd + lineDelta,
    range.end.character,
  );
}

/**
 * Applies every change in a document edit to a stored range in order,
 * returning the shifted range or `null` if any change invalidated it.
 */
export function trackRange(
  range: vscode.Range,
  changes: readonly { range: vscode.Range; text: string }[],
): vscode.Range | null {
  let current: vscode.Range | null = range;
  for (const change of changes) {
    if (current === null) return null;
    current = shiftRangeForChange(current, change);
  }
  return current;
}
