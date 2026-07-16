/**
 * @fileoverview Tests for grouping bundled and user-created pipelines.
 * @package test
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import { TreeItemCollapsibleState } from "vscode";
import { PipelinesTreeProvider } from "../src/providers/pipelinesTreeProvider";
import type { BuiltInPipeline } from "../src/recipes/standardRecipes";
import type { PipelineStore, ScopedPipeline } from "../src/storage/store";

function standardPipeline(name = "Decode Base64"): BuiltInPipeline {
  return {
    id: "decode-base64",
    name,
    description: "Decode a standard Base64 value.",
    category: "Decoding",
    tags: ["base64", "decode"],
    raw: "FromBase64",
    steps: [{ opName: "FromBase64", args: [] }],
    scope: "built-in",
    source: "built-in",
  };
}

function personalPipeline(
  name: string,
  scope: "global" | "workspace",
): ScopedPipeline {
  return {
    name,
    scope,
    raw: "ToHex",
    steps: [{ opName: "ToHex", args: [] }],
  };
}

function provider(
  personal: ScopedPipeline[],
  standard: readonly BuiltInPipeline[] = [standardPipeline()],
): PipelinesTreeProvider {
  const store = {
    loadAll: jest.fn(() => personal),
  } as unknown as PipelineStore;
  return new PipelinesTreeProvider(store, standard);
}

describe("PipelinesTreeProvider groups", () => {
  test("shows standard and personal pipelines as separate expanded roots", () => {
    const tree = provider([
      personalPipeline("Workspace decoder", "workspace"),
      personalPipeline("Global encoder", "global"),
    ]);

    const roots = tree.getChildren();
    expect(roots).toHaveLength(2);
    expect(roots.map((root) => root.label)).toEqual([
      "Standard Pipelines",
      "My Pipelines",
    ]);
    expect(roots.map((root) => root.collapsibleState)).toEqual([
      TreeItemCollapsibleState.Expanded,
      TreeItemCollapsibleState.Expanded,
    ]);
    expect(roots.map((root) => root.description)).toEqual(["1", "2"]);
    expect(roots.map((root) => root.contextValue)).toEqual([
      "tschef-pipeline-group-standard",
      "tschef-pipeline-group-personal",
    ]);
  });

  test("keeps bundled pipelines exclusively below Standard Pipelines", () => {
    const builtIn = standardPipeline();
    const own = personalPipeline("My decoder", "global");
    const tree = provider([own], [builtIn]);
    const [standardRoot, personalRoot] = tree.getChildren();

    const standardChildren = tree.getChildren(standardRoot);
    const personalChildren = tree.getChildren(personalRoot);

    expect(standardChildren.map((child) => child.label)).toEqual([
      builtIn.name,
    ]);
    expect(personalChildren.map((child) => child.label)).toEqual([own.name]);
    expect(standardChildren[0].contextValue).toBe("pipeline-built-in");
    expect(personalChildren[0].contextValue).toBe("pipeline-global");
  });

  test("pipeline children retain their run command and pipeline argument", () => {
    const pipeline = personalPipeline("My converter", "workspace");
    const tree = provider([pipeline]);
    const personalRoot = tree.getChildren()[1];
    const child = tree.getChildren(personalRoot)[0];

    expect(child.command).toMatchObject({
      command: "tschef.runSavedPipeline",
      title: "Run Pipeline",
      arguments: [pipeline],
    });
    expect(tree.getChildren(child)).toEqual([]);
  });

  test("keeps an empty personal group visible with an editor shortcut", () => {
    const tree = provider([]);
    const personalRoot = tree.getChildren()[1];

    expect(personalRoot.label).toBe("My Pipelines");
    expect(personalRoot.description).toBe("No saved pipelines");

    const children = tree.getChildren(personalRoot);
    expect(children).toHaveLength(1);
    expect(children[0].label).toBe("No saved pipelines yet");
    expect(children[0].command).toMatchObject({
      command: "tschef.openPipelineEditor",
      title: "Open Pipeline Editor",
    });
  });
});
