/**
 * @fileoverview Sort operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import { Utils } from "../Utils";
import { INPUT_DELIM_OPTIONS } from "../lib/Delim";
import {
  caseInsensitiveSort,
  ipSort,
  numericSort,
  hexadecimalSort,
  lengthSort,
} from "../lib/Sort";

export class Sort extends TypedOperation<string, string, unknown[]> {
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
