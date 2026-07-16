/**
 * @fileoverview argDefaults command handler for ts-chef operations
 * @package commands
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import type { ArgConfig } from "../chef/Operation";

/**
 * Extracts the actual default value from an ArgConfig so it matches
 * what the operation's run() method expects for each arg type.
 *
 * Registry-free on purpose, so UI code (e.g. the recipe pane) can compute
 * defaults without pulling in the whole operations registry.
 */
export function resolveDefaultArg(arg: ArgConfig): unknown {
  switch (arg.type) {
    case "editableOption":
    case "editableOptionShort": {
      const opts = arg.value as Array<{ name: string; value: unknown }>;
      if (!Array.isArray(opts)) return arg.value;
      const idx = typeof arg.defaultIndex === "number" ? arg.defaultIndex : 0;
      return opts[idx]?.value ?? opts[0]?.value ?? "";
    }
    case "option": {
      const opts = arg.value as unknown[];
      if (!Array.isArray(opts)) return arg.value;
      const idx = typeof arg.defaultIndex === "number" ? arg.defaultIndex : 0;
      return opts[idx] ?? opts[0] ?? "";
    }
    case "argSelector": {
      // run() receives the selected option name string (e.g. "CBC")
      const opts = arg.value as Array<{ name: string }>;
      return Array.isArray(opts) ? (opts[0]?.name ?? "") : arg.value;
    }
    case "toggleString": {
      // run() receives { string: value, option: encoding }
      return {
        string: typeof arg.value === "string" ? arg.value : "",
        option: arg.toggleValues?.[0] ?? "Hex",
      };
    }
    default:
      return arg.value;
  }
}
