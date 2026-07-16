/**
 * @fileoverview scopePicker command handler for ts-chef operations
 * @package commands
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

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
  const hasWorkspace = Boolean(vscode.workspace.workspaceFolders?.length);
  const effectiveDefault =
    defaultScope === "workspace" && !hasWorkspace ? "global" : defaultScope;
  const other: StorageScope =
    effectiveDefault === "global" ? "workspace" : "global";
  const scopes: StorageScope[] = hasWorkspace
    ? [effectiveDefault, other]
    : ["global"];
  const items = scopes.map((scope) => ({
    label:
      scope === effectiveDefault
        ? `${LABELS[scope]} (default)`
        : LABELS[scope],
    scope,
  }));
  const picked = await vscode.window.showQuickPick(items, {
    title,
    placeHolder: "Where should this be saved?",
  });
  return picked?.scope;
}
