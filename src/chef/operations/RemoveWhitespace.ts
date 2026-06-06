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

export class RemoveWhitespace extends Operation {
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
