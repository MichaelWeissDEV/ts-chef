/**
 * @fileoverview YARARules operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import OperationError from "../errors/OperationError";
import Yara from "libyara-wasm";

export const MAX_YARA_SAMPLE_BYTES = 64 * 1024 * 1024;
export const MAX_YARA_RULE_BYTES = 2 * 1024 * 1024;
const MAX_YARA_REPORT_CHARACTERS = 8 * 1024 * 1024;

/** Validate limits before the synchronous WASM engine is initialised. */
export function yaraLimitError(
  sampleByteLength: number,
  rules: string,
): string | undefined {
  if (sampleByteLength > MAX_YARA_SAMPLE_BYTES)
    return "YARA samples are limited to 64 MiB";
  if (Buffer.byteLength(rules, "utf-8") > MAX_YARA_RULE_BYTES)
    return "YARA rules are limited to 2 MiB";
  return undefined;
}

/**
 * YARA Rules operation
 */
export class YARARules extends TypedOperation<AnyInput, Promise<AnyInput>, unknown[]> {
  /**
   * YARARules constructor
   */
  constructor() {
    super();

    this.name = "YARA Rules";
    this.module = "Yara";
    this.description =
      "YARA is a tool developed at VirusTotal, primarily aimed at helping malware researchers to identify and classify malware samples. It matches based on rules specified by the user containing textual or binary patterns and a boolean expression. For help on writing rules, see the <a href='https://yara.readthedocs.io/en/latest/writingrules.html'>YARA documentation.</a>";
    this.infoURL = "https://wikipedia.org/wiki/YARA";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Rules",
        type: "text",
        value: "",
        rows: 5,
      },
      {
        name: "Show strings",
        type: "boolean",
        value: false,
      },
      {
        name: "Show string lengths",
        type: "boolean",
        value: false,
      },
      {
        name: "Show metadata",
        type: "boolean",
        value: false,
      },
      {
        name: "Show counts",
        type: "boolean",
        value: true,
      },
      {
        name: "Show rule warnings",
        type: "boolean",
        value: true,
      },
      {
        name: "Show console module messages",
        type: "boolean",
        value: true,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  async run(input: AnyInput, args: unknown[]): Promise<AnyInput> {
    const [
      rules,
      showStrings,
      showLengths,
      showMeta,
      showCounts,
      showRuleWarns,
      showConsole,
    ] = args as [string, boolean, boolean, boolean, boolean, boolean, boolean];
    if (!rules?.trim()) throw new OperationError("YARA rules are required");

    const inpArr =
      input instanceof ArrayBuffer
        ? new Uint8Array(input)
        : input instanceof Uint8Array
          ? input
          : new TextEncoder().encode(String(input ?? ""));
    const limitError = yaraLimitError(inpArr.byteLength, rules);
    if (limitError) throw new OperationError(limitError);

    let timeout: NodeJS.Timeout | undefined;
    try {
      const yara = await Promise.race([
        Yara(),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(
            () => reject(new OperationError("YARA engine initialisation timed out")),
            15_000,
          );
        }),
      ]);
      const resp = yara.run(inpArr, rules);
      let matchString = "";
      let reportTruncated = false;
      const append = (value: string): boolean => {
        const remaining = MAX_YARA_REPORT_CHARACTERS - matchString.length;
        if (remaining <= 0) {
          reportTruncated = true;
          return false;
        }
        if (value.length > remaining) {
          matchString += value.slice(0, remaining);
          reportTruncated = true;
          return false;
        }
        matchString += value;
        return true;
      };

      for (let i = 0; i < resp.compileErrors.size(); i++) {
        const compileError = resp.compileErrors.get(i);
        if (!compileError.warning) {
          throw new OperationError(
            `Error on line ${compileError.lineNumber}: ${compileError.message}`,
          );
        }
        if (showRuleWarns) {
          if (!append(`Warning on line ${compileError.lineNumber}: ${compileError.message}\n`)) break;
        }
      }

      if (showConsole) {
        const consoleLogs = resp.consoleLogs;
        for (let i = 0; i < consoleLogs.size(); i++) {
          if (!append(consoleLogs.get(i) + "\n")) break;
        }
      }

      const matchedRules = resp.matchedRules;
      for (let i = 0; i < matchedRules.size() && !reportTruncated; i++) {
        const rule = matchedRules.get(i);
        const matches = rule.resolvedMatches;
        let meta = "";
        if (showMeta && rule.metadata.size() > 0) {
          meta += " [";
          for (let j = 0; j < rule.metadata.size(); j++) {
            meta += `${rule.metadata.get(j).identifier}: ${rule.metadata.get(j).data}, `;
          }
          meta = meta.slice(0, -2) + "]";
        }
        const countString =
          matches.size() === 0
            ? ""
            : showCounts
              ? ` (${matches.size()} time${matches.size() > 1 ? "s" : ""})`
              : "";
        if (matches.size() === 0 || !(showStrings || showLengths)) {
          append(`Input matches rule "${rule.ruleName}"${meta}${countString ? ` ${countString}` : ""}.\n`);
          continue;
        }
        if (!append(`Rule "${rule.ruleName}"${meta} matches${countString}:\n`)) break;
        for (let j = 0; j < matches.size(); j++) {
          const match = matches.get(j);
          if (!append(`Pos ${match.location}, ${showLengths ? `length ${match.matchLength}, ` : ""}identifier ${match.stringIdentifier}${showStrings ? `, data: "${match.data}"` : ""}\n`)) break;
        }
      }
      if (reportTruncated) {
        matchString += "\n[ts-chef: YARA report truncated at 8 MiB]\n";
      }
      return matchString;
    } catch (error) {
      if (error instanceof OperationError) throw error;
      const wrapped = new OperationError(`YARA scan failed: ${String(error)}`);
      wrapped.cause = error;
      throw wrapped;
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
}

export default YARARules;
