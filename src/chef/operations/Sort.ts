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
import { Utils } from "../Utils";
import { INPUT_DELIM_OPTIONS } from "../lib/Delim";
import {
  caseInsensitiveSort,
  ipSort,
  numericSort,
  hexadecimalSort,
  lengthSort,
} from "../lib/Sort";

export class Sort extends Operation {
  constructor() {
    super();
    this.name = "Sort";
    this.module = "Default";
    this.description =
      "Alphabetically sorts strings separated by the specified delimiter.<br><br>The IP address option supports IPv4 only.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Delimiter", type: "option", value: INPUT_DELIM_OPTIONS },
      { name: "Reverse", type: "boolean", value: false },
      {
        name: "Order",
        type: "option",
        value: [
          "Alphabetical (case sensitive)",
          "Alphabetical (case insensitive)",
          "IP address",
          "Numeric",
          "Numeric (hexadecimal)",
          "Length",
        ],
      },
    ];
  }

  run(input: string, args: unknown[]): string {
    const [delimName, sortReverse, order] = args as [string, boolean, string];
    const delim = Utils.charRep(delimName);
    let sorted = input.split(delim);

    switch (order) {
      case "Alphabetical (case sensitive)":
        sorted = sorted.sort();
        break;
      case "Alphabetical (case insensitive)":
        sorted = sorted.sort(caseInsensitiveSort);
        break;
      case "IP address":
        sorted = sorted.sort(ipSort);
        break;
      case "Numeric":
        sorted = sorted.sort(numericSort);
        break;
      case "Numeric (hexadecimal)":
        sorted = sorted.sort(hexadecimalSort);
        break;
      case "Length":
        sorted = sorted.sort(lengthSort);
        break;
    }

    if (sortReverse) sorted.reverse();
    return sorted.join(delim);
  }
}

export default Sort;
