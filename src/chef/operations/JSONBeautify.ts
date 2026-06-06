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
import JSON5 from "json5";
import { OperationError } from "../errors/OperationError";

export class JSONBeautify extends Operation {
  constructor() {
    super();
    this.name = "JSON Beautify";
    this.module = "Code";
    this.description =
      "Indents and pretty prints JavaScript Object Notation (JSON) code.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Indent string",
        type: "binaryShortString",
        value: "    ",
      },
      {
        name: "Sort Object Keys",
        type: "boolean",
        value: false,
      },
      {
        name: "Formatted",
        type: "boolean",
        value: true,
      },
    ];
  }

  run(input: string, args: unknown[]): string {
    if (!input) return "";

    const [indentStr, sortBool] = args as [string, boolean];
    let json: unknown;

    try {
      json = JSON5.parse(input);
    } catch (err) {
      throw new OperationError("Unable to parse input as JSON.\n" + err);
    }

    if (sortBool) json = sortKeys(json);

    return JSON.stringify(json, null, indentStr);
  }
}

function sortKeys(o: unknown): unknown {
  if (Array.isArray(o)) {
    return o.map(sortKeys);
  } else if (o !== null && typeof o === "object") {
    return Object.keys(o as Record<string, unknown>)
      .sort()
      .reduce(
        (a, k) => {
          a[k] = sortKeys((o as Record<string, unknown>)[k]);
          return a;
        },
        {} as Record<string, unknown>,
      );
  }
  return o;
}

export default JSONBeautify;
