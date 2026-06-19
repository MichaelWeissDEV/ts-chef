/**
 * @fileoverview RemoveWhitespace operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";

export class RemoveWhitespace extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "Remove whitespace";
    this.module = "Default";
    this.description =
      "Optionally removes all spaces, carriage returns, line feeds, tabs and form feeds from the input data.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Spaces", type: "boolean", value: true },
      { name: "Carriage returns (\\r)", type: "boolean", value: true },
      { name: "Line feeds (\\n)", type: "boolean", value: true },
      { name: "Tabs", type: "boolean", value: true },
      { name: "Form feeds (\\f)", type: "boolean", value: true },
      { name: "Full stops", type: "boolean", value: false },
    ];
  }

  run(input: string, args: unknown[]): string {
    const [
      removeSpaces,
      removeCR,
      removeLF,
      removeTabs,
      removeFF,
      removeFullStops,
    ] = args as boolean[];
    let data = input;
    if (removeSpaces) data = data.replace(/ /g, "");
    if (removeCR) data = data.replace(/\r/g, "");
    if (removeLF) data = data.replace(/\n/g, "");
    if (removeTabs) data = data.replace(/\t/g, "");
    if (removeFF) data = data.replace(/\f/g, "");
    if (removeFullStops) data = data.replace(/\./g, "");
    return data;
  }
}

export default RemoveWhitespace;
