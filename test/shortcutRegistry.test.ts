/**
 * @fileoverview Shortcut registry and session-history contracts.
 * @package test
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import {
  ActionHistory,
  MAX_SHORTCUTS,
  describeHistoryAction,
  parseShortcutRegistry,
  parseShortcutTarget,
  type HistoryAction,
} from "../src/commands/shortcutRegistry";

const aes: HistoryAction = {
  kind: "operation",
  label: "AES Encrypt",
  opName: "AESEncrypt",
  args: [{ string: "secret", option: "UTF8" }, "", "CBC"],
};
const des: HistoryAction = {
  kind: "operation",
  label: "DES Encrypt",
  opName: "DESEncrypt",
  args: ["key"],
};
const base64: HistoryAction = {
  kind: "pipeline",
  label: "Base64 then JSON",
  steps: [
    { opName: "FromBase64", args: ["A-Za-z0-9+/=", true, false] },
    { opName: "JSONBeautify", args: ["    ", false, true] },
  ],
};

describe("parseShortcutTarget", () => {
  test.each([
    ["history:last", { kind: "history-last" }],
    [" HISTORY : older ", { kind: "history-previous" }],
    ["history:previous", { kind: "history-previous" }],
    ["history:newer", { kind: "history-next" }],
    ["history:next", { kind: "history-next" }],
    ["history:3", { kind: "history-offset", offset: 3 }],
    [
      "pipeline: Daily decode",
      { kind: "saved-pipeline", name: "Daily decode" },
    ],
    [
      "From Base64 | JSON Beautify",
      { kind: "expression", expression: "From Base64 | JSON Beautify" },
    ],
  ])("parses %p", (raw, expected) => {
    expect(parseShortcutTarget(raw)).toEqual(expected);
  });

  test.each(["history:nope", "history:0", "history:-1", "history:1.5"])(
    "rejects invalid selector %p",
    (raw) =>
      expect(() => parseShortcutTarget(raw)).toThrow(/history selector/i),
  );
});

describe("parseShortcutRegistry", () => {
  test("creates unlimited-style dynamic command ids without defaults", () => {
    const result = parseShortcutRegistry({
      base64: "To Base64",
      "decode.daily": "pipeline: Daily decode",
      back_3: "history:3",
    });

    expect(result.issues).toEqual([]);
    expect(result.bindings.map((binding) => binding.command)).toEqual([
      "tschef.shortcut.base64",
      "tschef.shortcut.decode.daily",
      "tschef.shortcut.back_3",
    ]);
  });

  test("ignores bad entries independently", () => {
    const result = parseShortcutRegistry({
      good: "To hex",
      "contains spaces": "From Hex",
      empty: "   ",
      number: 42,
      ["x".repeat(65)]: "ROT13",
    });

    expect(result.bindings.map((binding) => binding.id)).toEqual(["good"]);
    expect(result.issues).toHaveLength(4);
  });

  test.each([[], "To Base64", 42, true])(
    "rejects a non-object top level: %p",
    (raw) => {
      const result = parseShortcutRegistry(raw);
      expect(result.bindings).toEqual([]);
      expect(result.issues).toHaveLength(1);
    },
  );

  test("accepts an absent or empty registry", () => {
    expect(parseShortcutRegistry(undefined)).toEqual({
      bindings: [],
      issues: [],
    });
    expect(parseShortcutRegistry({})).toEqual({ bindings: [], issues: [] });
  });

  test("bounds hostile registries while retaining valid entries", () => {
    const raw = Object.fromEntries(
      Array.from({ length: MAX_SHORTCUTS + 5 }, (_, index) => [
        `slot-${index}`,
        "ROT13",
      ]),
    );
    const result = parseShortcutRegistry(raw);
    expect(result.bindings).toHaveLength(MAX_SHORTCUTS);
    expect(result.issues).toEqual([
      `only the first ${MAX_SHORTCUTS} shortcut entries are loaded`,
    ]);
  });
});

describe("ActionHistory", () => {
  test("uses one-based newest-first offsets", () => {
    const history = new ActionHistory();
    history.record(aes);
    history.record(des);
    history.record(base64);

    expect(history.last()).toEqual(base64);
    expect(history.at(2)).toEqual(des);
    expect(history.at(3)).toEqual(aes);
    expect(history.at(0)).toBeUndefined();
    expect(history.at(4)).toBeUndefined();
  });

  test("cycles backward from Base64 through DES, AES and wraps", () => {
    const history = new ActionHistory();
    [aes, des, base64].forEach((action) => history.record(action));

    expect(history.previous()).toEqual(des);
    expect(history.previous()).toEqual(aes);
    expect(history.previous()).toEqual(base64);
    expect(history.previous()).toEqual(des);
  });

  test("cycles forward and wraps in the opposite direction", () => {
    const history = new ActionHistory();
    [aes, des, base64].forEach((action) => history.record(action));

    expect(history.next()).toEqual(aes);
    expect(history.next()).toEqual(des);
    expect(history.next()).toEqual(base64);
    expect(history.next()).toEqual(aes);
  });

  test("recording resets the cycle cursor", () => {
    const history = new ActionHistory();
    history.record(aes);
    history.record(des);
    expect(history.previous()).toEqual(aes);
    expect(history.previous()).toEqual(des);
    history.record(base64);
    expect(history.previous()).toEqual(des);
  });

  test("enforces capacity and clears all state", () => {
    const history = new ActionHistory(2);
    history.record(aes);
    history.record(des);
    history.record(base64);
    expect(history.size).toBe(2);
    expect(history.all()).toEqual([base64, des]);
    history.clear();
    expect(history.size).toBe(0);
    expect(history.previous()).toBeUndefined();
  });

  test("detaches recorded and returned nested argument values", () => {
    const history = new ActionHistory();
    history.record(aes);
    (aes.args[0] as { string: string }).string = "changed outside";
    const first = history.last() as typeof aes;
    expect((first.args[0] as { string: string }).string).toBe("secret");
    (first.args[0] as { string: string }).string = "changed result";
    expect(
      ((history.last() as typeof aes).args[0] as { string: string }).string,
    ).toBe("secret");
  });

  test("rejects unsafe capacities", () => {
    expect(() => new ActionHistory(0)).toThrow(/capacity/i);
    expect(() => new ActionHistory(10_001)).toThrow(/capacity/i);
    expect(() => new ActionHistory(1.5)).toThrow(/capacity/i);
  });

  test("describes operations and pipelines", () => {
    expect(describeHistoryAction(aes)).toBe("AES Encrypt");
    expect(describeHistoryAction(base64)).toBe("Base64 then JSON (2 steps)");
    expect(
      describeHistoryAction({
        kind: "pipeline",
        label: "Decode",
        steps: [{ opName: "FromBase64", args: [] }],
      }),
    ).toBe("Decode (1 step)");
  });
});
