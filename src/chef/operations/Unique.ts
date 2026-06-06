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

export class Unique extends Operation {
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
