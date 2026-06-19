/**
 * @fileoverview JSONBeautify operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import JSON5 from "json5";
import { OperationError } from "../errors/OperationError";

export class JSONBeautify extends TypedOperation<string, string, unknown[]> {
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
