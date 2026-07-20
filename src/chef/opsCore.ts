/**
 * @fileoverview opsCore - low-level op lookup used by Pipeline to avoid circular deps.
 * Pipeline_new.ts imports from here instead of from runner.ts.
 * @package chef
 * @license Apache-2.0
 */

import { findOp } from "../opsRegistry";
import type { AnyInput } from "./Operation";
import { normaliseInput } from "./types";

/**
 * Run a single named operation on input with given args.
 * Does not import from runner.ts — avoids Pipeline → runner circular dependency.
 */
export function runOpCore(
  opName: string,
  input: AnyInput,
  args: unknown[],
): AnyInput | Promise<AnyInput> {
  const entry = findOp(opName);
  if (!entry) throw new Error(`Unknown operation: ${opName}`);
  const op = entry.factory();
  const normalised = normaliseInput(input, op.inputType);
  return op.run(normalised as AnyInput, args) as AnyInput | Promise<AnyInput>;
}

/**
 * Parse a simple pipe string into step descriptors.
 * Handles | inside parentheses by tracking depth.
 */
export function parsePipelineCore(
  raw: string,
): Array<{ opName: string; args: unknown[] }> {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of raw) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "|" && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());

  return parts.filter(Boolean).map((part) => {
    const parenIdx = part.indexOf("(");
    if (parenIdx === -1) {
      const entry = findOp(part.trim());
      if (!entry) throw new Error(`Unknown operation: "${part.trim()}"`);
      return { opName: entry.opName, args: [] };
    }
    const name = part.slice(0, parenIdx).trim();
    const entry = findOp(name);
    if (!entry) throw new Error(`Unknown operation: "${name}"`);
    return { opName: entry.opName, args: [] };
  });
}
