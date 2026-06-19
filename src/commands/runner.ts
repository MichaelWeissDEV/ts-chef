/**
 * @fileoverview runner command handler for ts-chef operations
 * @package commands
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import registry, { findOp } from "../opsRegistry";
import type { Operation, AnyInput } from "../chef/Operation";
import type { PipelineStep } from "../storage/store";
import { resolveDefaultArg } from "./argDefaults";
import { normaliseInput } from "../chef/types";

// Re-exported for callers that already import it from the runner.
export { resolveDefaultArg, normaliseInput };

/**
 * Whether an operation needs free-text input to be useful — i.e. it has a
 * `toggleString` argument whose value is still empty (e.g. a key/secret the
 * user must supply). Lets callers prompt for input instead of running blindly.
 */
export function operationNeedsInput(op: Operation): boolean {
  return op.args.some(
    (a) => a.type === "toggleString" && (a.value as string) === "",
  );
}

/**
 * Runs a single named operation on `input` with the given argument list.
 *
 * @param opName - The internal or display name of the operation.
 * @param input - The value to transform; will be normalised to the operation's expected type.
 * @param args - Argument list to pass to the operation's `run` method.
 * @returns The operation's output value.
 */
export function runOp(
  opName: string,
  input: AnyInput,
  args: unknown[],
): AnyInput {
  const entry = registry.find(
    (e) =>
      e.opName === opName ||
      e.displayName.toLowerCase() === opName.toLowerCase(),
  );
  if (!entry) throw new Error(`Unknown operation: ${opName}`);
  const op = entry.factory();
  const normalised = normaliseInput(input, op.inputType);
  return op.run(normalised as AnyInput, args) as AnyInput;
}

/**
 * Executes a sequence of pipeline steps, feeding each output into the next step's input.
 *
 * @param input - The initial value to feed into the first step.
 * @param steps - Ordered list of operation names and their arguments.
 * @returns The final result serialised as a UTF-8 string.
 */
export async function runPipeline(input: AnyInput, steps: PipelineStep[]): Promise<string> {
  let current: AnyInput = input;
  for (const step of steps) {
    const result = runOp(step.opName, current, step.args);
    current = result instanceof Promise ? await result : result;
  }
  // Convert final result to displayable string
  if (Array.isArray(current))
    return Buffer.from(current as number[]).toString("utf-8");
  if (current instanceof ArrayBuffer)
    return Buffer.from(new Uint8Array(current as ArrayBuffer)).toString(
      "utf-8",
    );
  if (typeof current === "string") return current;
  return JSON.stringify(current, null, 2);
}

/**
 * Parses a pipe-syntax string into an ordered list of {@link PipelineStep}s.
 *
 * Syntax: `"From Base64 | To Hex | URL Encode(arg1=val1, arg2=val2)"`.
 * Unknown operation names throw. Missing arguments fall back to operation defaults.
 *
 * @param raw - Raw pipe string to parse.
 * @returns Ordered pipeline steps ready for {@link runPipeline}.
 */
export function parsePipeline(raw: string): PipelineStep[] {
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
  return parts.filter(Boolean).map((part) => parseStep(part));
}

function parseStep(part: string): PipelineStep {
  const parenIdx = part.indexOf("(");
  if (parenIdx === -1) {
    const op = resolveOp(part.trim());
    return {
      opName: op.opName,
      args: op.factory().args.map(resolveDefaultArg),
    };
  }

  const name = part.slice(0, parenIdx).trim();
  const argsStr = part.slice(parenIdx + 1, part.lastIndexOf(")")).trim();
  const op = resolveOp(name);
  // Parse key=value pairs, handling quoted strings
  const overrides: Record<string, string> = {};
  const kvRe = /([^,=]+)=("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^,]*)/g;
  let kv: RegExpExecArray | null;
  while ((kv = kvRe.exec(argsStr)) !== null) {
    const key = kv[1].trim();
    let val = kv[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    overrides[key] = val;
  }

  // Apply overrides by name to defaultArgs
  const opDef = op.factory();
  const finalArgs = opDef.args.map((argDef, i) => {
    if (argDef.name in overrides)
      return castArg(overrides[argDef.name], argDef.type);
    if (String(i) in overrides)
      return castArg(overrides[String(i)], argDef.type);
    return resolveDefaultArg(argDef);
  });

  return { opName: op.opName, args: finalArgs };
}

function resolveOp(name: string) {
  const op =
    findOp(name) ??
    registry.find((e) => e.opName.toLowerCase() === name.toLowerCase());
  if (!op) throw new Error(`Unknown operation: "${name}"`);
  return op;
}

function castArg(val: string, type: string): unknown {
  if (type === "boolean") return val === "true" || val === "1";
  if (type === "number") return Number(val);
  return val;
}
