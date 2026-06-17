import * as vscode from "vscode";
import type { StorageScope } from "../storage/store";

const LABELS: Record<StorageScope, string> = {
  global: "$(globe) Global — available in all workspaces",
  workspace: "$(folder) Workspace — only this project",
};

/**
 * Ask the user which scope to save into. The configured `defaultScope` is
 * listed first and tagged "(default)", so a single Enter accepts it.
 * Returns the chosen scope, or `undefined` if the picker was dismissed.
 */
export async function pickScope(
  defaultScope: StorageScope,
  title: string,
): Promise<StorageScope | undefined> {
  const other: StorageScope = defaultScope === "global" ? "workspace" : "global";
  const items = [defaultScope, other].map((scope) => ({
    label:
      scope === defaultScope ? `${LABELS[scope]} (default)` : LABELS[scope],
    scope,
  }));
  const picked = await vscode.window.showQuickPick(items, {
    title,
    placeHolder: "Where should this be saved?",
  });
  return picked?.scope;
}
