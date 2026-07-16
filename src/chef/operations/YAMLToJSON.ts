/**
 * @fileoverview YAMLToJSON operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import OperationError from "../errors/OperationError";
import jsYaml from "js-yaml";
import { CST, Lexer } from "yaml";

export const MAX_YAML_INPUT_CHARACTERS = 8 * 1024 * 1024;
export const MAX_YAML_JSON_CHARACTERS = 32 * 1024 * 1024;
export const MAX_YAML_NODES = 100_000;

function closesQuotedScalar(
  source: string,
  quote: "'" | '"',
  openingFragment: boolean,
): boolean {
  if (quote === "'") {
    for (let index = openingFragment ? 1 : 0; index < source.length; index += 1) {
      if (source[index] !== "'") continue;
      if (source[index + 1] === "'") index += 1;
      else return true;
    }
    return false;
  }

  let escaped = false;
  for (let index = openingFragment ? 1 : 0; index < source.length; index += 1) {
    const character = source[index];
    if (escaped) {
      escaped = false;
    } else if (character === "\\") {
      escaped = true;
    } else if (character === '"') {
      return true;
    }
  }
  return false;
}

/**
 * Use the streaming YAML lexer to budget sequence slots before js-yaml builds
 * their arrays. Block-scalar content is emitted as one scalar token. A small
 * quote-state shim covers multiline quoted scalars accepted by js-yaml even
 * when their continuation is not indented.
 */
function assertSequenceItemBudget(input: string, limit: number): void {
  const normalized = input.includes("\r")
    ? input.replace(/\r\n?/g, "\n")
    : input;
  let count = 0;
  let quote: "'" | '"' | undefined;
  for (const source of new Lexer().lex(normalized)) {
    if (quote) {
      if (closesQuotedScalar(source, quote, false)) quote = undefined;
      continue;
    }
    const tokenType = CST.tokenType(source);
    if (
      tokenType === "single-quoted-scalar" ||
      tokenType === "double-quoted-scalar"
    ) {
      const openingQuote = tokenType === "single-quoted-scalar" ? "'" : '"';
      if (!closesQuotedScalar(source, openingQuote, true)) quote = openingQuote;
      continue;
    }
    if (tokenType === "seq-item-ind" && ++count > limit) {
      throw new OperationError(
        `YAML exceeds the ${limit.toLocaleString()} node safety limit.`,
      );
    }
  }
}

/** Catch parser-listener gaps without recursively expanding shared aliases. */
function assertStructureBudget(value: unknown, limit: number): void {
  if (value === null || typeof value !== "object") return;
  const seen = new WeakSet<object>();
  const pending: object[] = [value];
  let slots = 1;
  while (pending.length > 0) {
    const current = pending.pop()!;
    if (seen.has(current)) continue;
    seen.add(current);
    const children = Array.isArray(current)
      ? current
      : Object.values(current);
    slots += children.length;
    if (slots > limit) {
      throw new OperationError(
        `YAML exceeds the ${limit.toLocaleString()} node safety limit.`,
      );
    }
    for (const child of children) {
      if (child !== null && typeof child === "object") pending.push(child);
    }
  }
}

function addSize(current: number, amount: number, limit: number): number {
  if (amount > limit - current) {
    throw new OperationError(
      `YAML output exceeds the ${limit.toLocaleString()} character safety limit.`,
    );
  }
  return current + amount;
}

/**
 * Estimate the exact two-space-indented JSON presentation without expanding
 * YAML aliases. Memoisation keeps alias-heavy graphs linear in their source
 * graph while the accumulated size still counts every serialized reference.
 */
function formattedJSONSize(value: unknown, limit: number): number {
  const active = new WeakSet<object>();
  const memo = new WeakMap<object, Map<number, number>>();

  const measure = (item: unknown, depth: number): number => {
    if (item === undefined) return 0;
    if (item === null) return 4;
    if (typeof item === "string") return JSON.stringify(item).length;
    if (typeof item === "boolean") return item ? 4 : 5;
    if (typeof item === "number") return (JSON.stringify(item) ?? "null").length;
    if (typeof item !== "object") {
      throw new OperationError("YAML produced a value that cannot be represented as JSON.");
    }

    if (active.has(item)) {
      throw new OperationError("Cyclic YAML aliases cannot be represented as JSON.");
    }
    const byDepth = memo.get(item);
    const cached = byDepth?.get(depth);
    if (cached !== undefined) return cached;

    active.add(item);
    let size = 2;
    if (Array.isArray(item)) {
      if (item.length > 0) {
        size = addSize(size, 1 + depth * 2, limit);
        for (let index = 0; index < item.length; index += 1) {
          size = addSize(size, (depth + 1) * 2, limit);
          size = addSize(size, measure(item[index] ?? null, depth + 1), limit);
          size = addSize(size, index + 1 < item.length ? 2 : 1, limit);
        }
      }
    } else {
      const prototype = Object.getPrototypeOf(item);
      if (prototype !== Object.prototype && prototype !== null) {
        throw new OperationError(
          "YAML produced a non-JSON object; use plain mappings and sequences.",
        );
      }
      const entries = Object.entries(item).filter(
        ([, child]) => child !== undefined,
      );
      if (entries.length > 0) {
        size = addSize(size, 1 + depth * 2, limit);
        for (let index = 0; index < entries.length; index += 1) {
          const [key, child] = entries[index];
          size = addSize(
            size,
            (depth + 1) * 2 + JSON.stringify(key).length + 2,
            limit,
          );
          size = addSize(size, measure(child, depth + 1), limit);
          size = addSize(size, index + 1 < entries.length ? 2 : 1, limit);
        }
      }
    }
    active.delete(item);
    const depths = byDepth ?? new Map<number, number>();
    depths.set(depth, size);
    if (!byDepth) memo.set(item, depths);
    return size;
  };

  return measure(value, 0);
}
/**
 * YAML to JSON operation
 */
export class YAMLToJSON extends TypedOperation<AnyInput, AnyInput, unknown[]> {
  /**
   * YAMLToJSON constructor
   */
  constructor() {
    super();

    this.name = "YAML to JSON";
    this.module = "Default";
    this.description = "Convert bounded YAML to JSON safely";
    this.infoURL = "https://en.wikipedia.org/wiki/YAML";
    this.inputType = "string";
    this.outputType = "JSON";
    this.args = [];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {JSON}
   */
  run(input: AnyInput, _args: unknown[]): AnyInput {
    if (typeof input !== "string") {
      throw new OperationError("YAML input must be text.");
    }
    if (input.length > MAX_YAML_INPUT_CHARACTERS) {
      throw new OperationError(
        `YAML input exceeds the ${MAX_YAML_INPUT_CHARACTERS.toLocaleString()} character safety limit.`,
      );
    }
    try {
      assertSequenceItemBudget(input, MAX_YAML_NODES);
      let parsedNodes = 0;
      const parsed = jsYaml.load(
        input,
        {
          schema: jsYaml.JSON_SCHEMA,
          maxDepth: 100,
          maxMergeSeqLength: 20,
          listener: (eventType: "open" | "close") => {
            if (eventType === "open" && ++parsedNodes > MAX_YAML_NODES) {
              throw new OperationError(
                `YAML exceeds the ${MAX_YAML_NODES.toLocaleString()} node safety limit.`,
              );
            }
          },
        } as Parameters<typeof jsYaml.load>[1],
      );
      assertStructureBudget(parsed, MAX_YAML_NODES);
      formattedJSONSize(parsed, MAX_YAML_JSON_CHARACTERS);
      return parsed as AnyInput;
    } catch (err) {
      if (err instanceof OperationError) throw err;
      throw new OperationError("Unable to parse YAML: " + err);
    }
  }
}

export default YAMLToJSON;
