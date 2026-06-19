/**
 * @fileoverview Unique operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

export class Unique extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "Unique";
    this.module = "Default";
    this.description = "Removes duplicate lines or values from the input.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: ["Line feed", "CRLF", "Space", "Comma", "Semi-colon", "Colon"],
      },
      { name: "Display count", type: "boolean", value: false },
    ];
  }

  run(input: string, args: unknown[]): string {
    const delims: Record<string, string> = {
      "Line feed": "\n",
      CRLF: "\r\n",
      Space: " ",
      Comma: ",",
      "Semi-colon": ";",
      Colon: ":",
    };
    const delim = delims[args[0] as string] ?? "\n";
    const displayCount = args[1] as boolean;
    const items = input.split(delim);
    const counts = new Map<string, number>();
    const order: string[] = [];
    for (const item of items) {
      if (!counts.has(item)) {
        order.push(item);
        counts.set(item, 0);
      }
      counts.set(item, counts.get(item)! + 1);
    }
    if (displayCount) {
      return order.map((item) => `${counts.get(item)}: ${item}`).join(delim);
    }
    return order.join(delim);
  }
}

export default Unique;
