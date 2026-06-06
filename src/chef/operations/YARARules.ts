/*
 * -----------------------------------------------------------------------------
 * Project:     ts-chef
 * Model:       Qwen 3.5 Coder Next (Local)
 * Version:     1.0.0
 * Author:      Michael Weiss
 * Source:      Ported from GCHQ's CyberChef (JavaScript)
 * License:     Apache License 2.0
 * Description: TypeScript implementation of CyberChef modules.
 * Note:        First Port done by Local Model, Cleanup and fixes by Author
 * -----------------------------------------------------------------------------
 */

import { Operation } from "../Operation";
import OperationError from "../errors/OperationError";
import Yara from "libyara-wasm";

/**
 * YARA Rules operation
 */
export class YARARules extends Operation {
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
  async run(input: any, args: any[]): Promise<any> {
    const [
      rules,
      showStrings,
      showLengths,
      showMeta,
      showCounts,
      showRuleWarns,
      showConsole,
    ] = args;
    return new Promise((resolve, reject) => {
      Yara().then(
        (yara: { run: (arg0: Uint8Array<any>, arg1: any) => any }) => {
          let matchString = "";

          const inpArr = new Uint8Array(input); // Turns out embind knows that JS uint8array <==> C++ std::string

          const resp = yara.run(inpArr, rules);

          if (resp.compileErrors.size() > 0) {
            for (let i = 0; i < resp.compileErrors.size(); i++) {
              const compileError = resp.compileErrors.get(i);
              if (!compileError.warning) {
                reject(
                  new OperationError(
                    `Error on line ${compileError.lineNumber}: ${compileError.message}`,
                  ),
                );
              } else if (showRuleWarns) {
                matchString += `Warning on line ${compileError.lineNumber}: ${compileError.message}\n`;
              }
            }
          }

          if (showConsole) {
            const consoleLogs = resp.consoleLogs;
            for (let i = 0; i < consoleLogs.size(); i++) {
              matchString += consoleLogs.get(i) + "\n";
            }
          }

          const matchedRules = resp.matchedRules;
          for (let i = 0; i < matchedRules.size(); i++) {
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
              matchString += `Input matches rule "${rule.ruleName}"${meta}${countString.length > 0 ? ` ${countString}` : ""}.\n`;
            } else {
              matchString += `Rule "${rule.ruleName}"${meta} matches${countString}:\n`;
              for (let j = 0; j < matches.size(); j++) {
                const match = matches.get(j);
                if (showStrings || showLengths) {
                  matchString += `Pos ${match.location}, ${showLengths ? `length ${match.matchLength}, ` : ""}identifier ${match.stringIdentifier}${showStrings ? `, data: "${match.data}"` : ""}\n`;
                }
              }
            }
          }
          resolve(matchString);
        },
      );
    });
  }
}

export default YARARules;
