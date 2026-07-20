/**
 * @fileoverview Extension-manifest contracts for opt-in keyboard shortcuts.
 * @package test
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import fs from "node:fs";
import path from "node:path";

const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
) as {
  contributes: {
    commands: Array<{ command: string; title: string }>;
    keybindings?: unknown[];
    configuration: {
      properties: Record<string, Record<string, unknown>>;
    };
  };
};

describe("keyboard shortcut manifest", () => {
  test("ships no default keybindings", () => {
    expect(manifest.contributes.keybindings ?? []).toEqual([]);
  });

  test("contributes the complete direct history command surface", () => {
    const commands = new Set(
      manifest.contributes.commands.map((entry) => entry.command),
    );
    expect(commands.size).toBeGreaterThan(20);
    for (const command of [
      "tschef.runShortcut",
      "tschef.configureShortcuts",
      "tschef.repeatLastOperation",
      "tschef.cycleOperationHistoryBack",
      "tschef.cycleOperationHistoryForward",
      "tschef.repeatOperationFromHistory",
      "tschef.clearOperationHistory",
    ]) {
      expect(commands.has(command)).toBe(true);
    }
  });

  test("declares an empty and bounded registry by default", () => {
    const setting =
      manifest.contributes.configuration.properties["tschef.shortcuts"];
    expect(setting.type).toBe("object");
    expect(setting.default).toEqual({});
    expect(setting.maxProperties).toBe(1000);
    expect(setting.additionalProperties).toEqual(
      expect.objectContaining({ type: "string", minLength: 1 }),
    );
  });

  test("documents generated commands and all target syntaxes in settings", () => {
    const description = String(
      manifest.contributes.configuration.properties["tschef.shortcuts"]
        .markdownDescription,
    );
    for (const fragment of [
      "tschef.shortcut.<id>",
      "From Base64 | JSON Beautify",
      "pipeline:<saved name>",
      "history:last",
      "history:previous",
      "history:next",
      "history:<1-based offset>",
    ]) {
      expect(description).toContain(fragment);
    }
  });

  test("keeps history session-only and configurable within safe bounds", () => {
    const setting =
      manifest.contributes.configuration.properties[
        "tschef.shortcutHistorySize"
      ];
    expect(setting).toEqual(
      expect.objectContaining({
        type: "number",
        default: 100,
        minimum: 1,
        maximum: 10000,
      }),
    );
    expect(String(setting.description)).toMatch(/in-memory|never persisted/i);
  });
});
