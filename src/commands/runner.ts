/**
 * @fileoverview runner command handler for ts-chef operations
 * @package commands
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import registry, { findOp } from "../opsRegistry";
import type { Operation, AnyInput, ArgConfig } from "../chef/Operation";
import type { PipelineStep } from "../storage/store";
import { resolveDefaultArg } from "./argDefaults";
import { normaliseInput, PipelineData } from "../chef/types";
import Recipe from "../chef/Recipe";
import Dish from "../chef/Dish";
import { splitPipelineParts } from "../panels/pipelinePanelModel";

// Re-exported for callers that already import it from the runner.
export { resolveDefaultArg, normaliseInput };

export function readableUtf8(bytes: Uint8Array): string | undefined {
  if (bytes.byteLength === 0) return "";
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return undefined;
  }
  const characters = Array.from(text);
  const printable = characters.filter((character) => {
    const code = character.codePointAt(0) ?? 0;
    return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
  }).length;
  return printable / Math.max(1, characters.length) >= 0.75 ? text : undefined;
}

export function presentBytes(bytes: Uint8Array): string {
  return readableUtf8(bytes) ?? Buffer.from(bytes).toString("hex");
}

/** Lossless text presentation for the final, still-typed Dish value. */
export function presentPipelineValue(value: unknown, dishType: number): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (dishType === Dish.JSON) return JSON.stringify(value, null, 2);
  if (value instanceof ArrayBuffer)
    return presentBytes(new Uint8Array(value));
  if (value instanceof Uint8Array) return presentBytes(value);
  if (
    dishType === Dish.BYTE_ARRAY &&
    Array.isArray(value) &&
    value.every(
      (item) => Number.isInteger(item) && Number(item) >= 0 && Number(item) <= 255,
    )
  )
    return presentBytes(Uint8Array.from(value as number[]));
  if (typeof value === "bigint") return value.toString(10);
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

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
 * Like {@link runOp} but awaits the operation's result, so operations whose
 * `run` returns a Promise (e.g. YARA Rules) produce their real output instead
 * of an unawaited `[object Promise]`. Safe for synchronous ops too.
 */
export async function runOpAsync(
  opName: string,
  input: AnyInput,
  args: unknown[],
): Promise<AnyInput> {
  const entry = registry.find(
    (e) =>
      e.opName === opName ||
      e.displayName.toLowerCase() === opName.toLowerCase(),
  );
  if (!entry) throw new Error(`Unknown operation: ${opName}`);
  const op = entry.factory();
  const normalised = normaliseInput(input, op.inputType);
  return (await op.run(normalised as AnyInput, args)) as AnyInput;
}

/**
 * Executes a sequence of pipeline steps, feeding each output into the next step's input.
 *
 * @param input - The initial value to feed into the first step.
 * @param steps - Ordered list of operation names and their arguments.
 * @returns The final result serialised as a UTF-8 string.
 */
export interface RunPipelineOptions {
  /** Abort after a step exceeds this size; intended for automatic previews. */
  maxIntermediateSize?: number;
}

export async function runPipeline(
  input: AnyInput,
  steps: PipelineStep[],
  options: RunPipelineOptions = {},
): Promise<string> {
  const recipeConfig = steps.map((step) => ({
    op: step.opName,
    args: step.args as (PipelineData | null)[],
  }));

  const recipe = new Recipe(recipeConfig);
  const dish = new Dish();

  // Set the initial dish value
  if (input instanceof ArrayBuffer) {
    dish.set(input, "ArrayBuffer");
  } else if (Array.isArray(input)) {
    const buffer = Buffer.from(input as number[]);
    const ab = new ArrayBuffer(buffer.length);
    new Uint8Array(ab).set(buffer);
    dish.set(ab, "ArrayBuffer");
  } else if (typeof input === "string") {
    dish.set(input, "string");
  } else {
    dish.set(input, "string");
  }

  await recipe.execute(dish, 0, undefined, {
    maxIntermediateSize: options.maxIntermediateSize,
  });
  const finalOutput = await dish.get();
  return presentPipelineValue(finalOutput, dish.type);
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
  return splitPipelineParts(raw).map((part) => parseStep(part));
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

  if (!part.endsWith(")"))
    throw new Error(`Unexpected text after arguments in pipeline step: "${part}"`);
  const name = part.slice(0, parenIdx).trim();
  const argsStr = part.slice(parenIdx + 1, part.lastIndexOf(")")).trim();
  const op = resolveOp(name);
  const opDef = op.factory();
  const finalArgs = opDef.args.map(resolveDefaultArg);
  const assigned = new Set<number>();
  let panelMetadataSeen = false;

  for (const assignment of splitArgumentAssignments(argsStr)) {
    const equals = topLevelEquals(assignment);
    if (equals < 1)
      throw new Error(`Malformed argument "${assignment}" in "${name}"`);
    const key = assignment.slice(0, equals).trim();
    const value = decodeArgumentValue(assignment.slice(equals + 1).trim());
    if (key === "__tschef_args") {
      if (panelMetadataSeen || !/^[A-Za-z0-9_-]+$/.test(value))
        throw new Error(`Invalid panel argument metadata in "${name}"`);
      panelMetadataSeen = true;
      continue;
    }

    const numeric = /^\d+$/.test(key) ? Number(key) : undefined;
    const argumentIndex =
      numeric !== undefined
        ? numeric
        : opDef.args.findIndex((argument) => argument.name === key);
    if (
      !Number.isSafeInteger(argumentIndex) ||
      argumentIndex < 0 ||
      argumentIndex >= opDef.args.length
    ) {
      throw new Error(`Unknown argument "${key}" for operation "${name}"`);
    }
    if (assigned.has(argumentIndex))
      throw new Error(`Argument "${key}" is assigned more than once in "${name}"`);
    assigned.add(argumentIndex);
    finalArgs[argumentIndex] = castArg(value, opDef.args[argumentIndex]);
  }

  return { opName: op.opName, args: finalArgs };
}

function splitArgumentAssignments(value: string): string[] {
  if (!value) return [];
  const result: string[] = [];
  const stack: string[] = [];
  let current = "";
  let quote = "";
  let escaped = false;
  const closing: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
  for (const character of value) {
    if (escaped) {
      current += character;
      escaped = false;
      continue;
    }
    if (quote) {
      current += character;
      if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      current += character;
      continue;
    }
    if (character in closing) stack.push(character);
    else if (character === ")" || character === "]" || character === "}") {
      const opener = stack.pop();
      if (!opener || closing[opener] !== character)
        throw new Error("Pipeline argument has unbalanced delimiters");
    }
    if (character === "," && stack.length === 0) {
      if (!current.trim()) throw new Error("Pipeline contains an empty argument");
      result.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  if (quote) throw new Error("Pipeline argument has an unterminated quote");
  if (stack.length) throw new Error("Pipeline argument has unbalanced delimiters");
  if (!current.trim()) throw new Error("Pipeline contains a trailing empty argument");
  result.push(current.trim());
  return result;
}

function topLevelEquals(value: string): number {
  let quote = "";
  let escaped = false;
  let depth = 0;
  for (let index = 0; index < value.length; index++) {
    const character = value[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (quote) {
      if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === "(" || character === "[" || character === "{") depth++;
    else if (character === ")" || character === "]" || character === "}") depth--;
    else if (character === "=" && depth === 0) return index;
  }
  return -1;
}

function decodeArgumentValue(value: string): string {
  if (!value) return "";
  const quote = value[0];
  if (quote !== '"' && quote !== "'") {
    if (value.includes('"') || value.includes("'"))
      throw new Error(`Malformed quoted argument value: ${value}`);
    return value;
  }
  if (value.length < 2 || value[value.length - 1] !== quote)
    throw new Error("Pipeline argument has an unterminated quote");
  let decoded = "";
  const body = value.slice(1, -1);
  for (let index = 0; index < body.length; index++) {
    const character = body[index];
    const next = body[index + 1];
    if (character === "\\" && (next === quote || next === "\\")) {
      decoded += next;
      index++;
    } else {
      decoded += character;
    }
  }
  return decoded;
}

function resolveOp(name: string) {
  const op =
    findOp(name) ??
    registry.find((e) => e.opName.toLowerCase() === name.toLowerCase());
  if (!op) throw new Error(`Unknown operation: "${name}"`);
  return op;
}

function castArg(val: string, definition: ArgConfig): unknown {
  if (definition.type === "boolean") {
    if (/^(?:true|1)$/i.test(val)) return true;
    if (/^(?:false|0)$/i.test(val)) return false;
    throw new Error(`Invalid boolean value "${val}" for "${definition.name}"`);
  }
  if (definition.type === "number") {
    const number = Number(val);
    if (!val.trim() || !Number.isFinite(number))
      throw new Error(`Invalid number value "${val}" for "${definition.name}"`);
    return number;
  }
  if (definition.type === "toggleString") {
    return {
      string: val,
      option: definition.toggleValues?.[0] ?? "Hex",
    };
  }
  return val;
}
