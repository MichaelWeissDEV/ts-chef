/**
 * @fileoverview patternsTreeProvider.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { PatternsTreeProvider } from "../src/providers/patternsTreeProvider";
import { ScanState } from "../src/providers/scanState";
import type { DetectionMatch } from "../src/providers/detector";
import {
  Range,
  Uri,
  __reset,
  __setConfig,
  __setActiveEditor,
} from "./vscode-mock";

function match(value: string, label: string): DetectionMatch {
  return {
    range: new Range(0, 0, 0, value.length) as unknown as DetectionMatch["range"],
    value,
    matches: [{ label, opName: "FromBase64", defaultArgs: [], confidence: 0.9 }],
  };
}

/** A minimal fake document that scanState/tree only touch via `.uri`. */
function fakeDoc(path: string) {
  return { uri: Uri.file(path) };
}

/** Seed scanState with matches for a document by scanning a stub. */
function seed(state: ScanState, path: string, matches: DetectionMatch[]): void {
  // scanText is bypassed: directly place results via the public scan of a stub
  // whose getText yields nothing, then overwrite through a second path.
  // Simplest: use the internal map via a tiny scannable stub.
  const doc = {
    uri: Uri.file(path),
    getText: () => "",
    positionAt: () => ({ line: 0, character: 0 }),
  } as never;
  state.scan(doc, false);
  // Replace the (empty) result with our controlled matches.
  (state as unknown as { results: Map<string, DetectionMatch[]> }).results.set(
    Uri.file(path).toString(),
    matches,
  );
}

describe("PatternsTreeProvider follow / pin modes", () => {
  beforeEach(() => __reset());

  test("following shows only the active editor's document", () => {
    __setConfig("patterns.followActiveEditor", true);
    const state = new ScanState();
    seed(state, "/a.txt", [match("QQ==", "Base64")]);
    seed(state, "/b.txt", [match("deadbeef", "Hex string")]);

    const tree = new PatternsTreeProvider(state);
    __setActiveEditor({ document: fakeDoc("/a.txt") });

    const roots = tree.getChildren();
    // Single active file → grouped by label, only a.txt's "Base64" group.
    expect(roots).toHaveLength(1);
    expect((roots[0] as { label: string }).label).toBe("Base64");
  });

  test("switching the active editor switches the shown file", () => {
    __setConfig("patterns.followActiveEditor", true);
    const state = new ScanState();
    seed(state, "/a.txt", [match("QQ==", "Base64")]);
    seed(state, "/b.txt", [match("deadbeef", "Hex string")]);
    const tree = new PatternsTreeProvider(state);

    __setActiveEditor({ document: fakeDoc("/b.txt") });
    const roots = tree.getChildren();
    expect((roots[0] as { label: string }).label).toBe("Hex string");
  });

  test("not following keeps all scanned files regardless of active editor", () => {
    __setConfig("patterns.followActiveEditor", false);
    const state = new ScanState();
    seed(state, "/a.txt", [match("QQ==", "Base64")]);
    seed(state, "/b.txt", [match("deadbeef", "Hex string")]);
    const tree = new PatternsTreeProvider(state);

    __setActiveEditor({ document: fakeDoc("/a.txt") });
    const roots = tree.getChildren();
    // Two files → one FileNode each.
    expect(roots).toHaveLength(2);
  });

  test("pinAll shows every file even while following", () => {
    __setConfig("patterns.followActiveEditor", true);
    const state = new ScanState();
    seed(state, "/a.txt", [match("QQ==", "Base64")]);
    seed(state, "/b.txt", [match("deadbeef", "Hex string")]);
    const tree = new PatternsTreeProvider(state);
    __setActiveEditor({ document: fakeDoc("/a.txt") });

    tree.pinAll();
    expect(tree.getChildren()).toHaveLength(2);

    // Focusing a single file again drops back to the active document.
    tree.focusActive();
    const roots = tree.getChildren();
    expect(roots).toHaveLength(1);
    expect((roots[0] as { label: string }).label).toBe("Base64");
  });

  test("setFollow(false) exposes all files and isFollowing reflects it", () => {
    __setConfig("patterns.followActiveEditor", true);
    const state = new ScanState();
    seed(state, "/a.txt", [match("QQ==", "Base64")]);
    seed(state, "/b.txt", [match("deadbeef", "Hex string")]);
    const tree = new PatternsTreeProvider(state);
    __setActiveEditor({ document: fakeDoc("/a.txt") });

    expect(tree.isFollowing()).toBe(true);
    tree.setFollow(false);
    expect(tree.isFollowing()).toBe(false);
    expect(tree.getChildren()).toHaveLength(2);
  });
});
