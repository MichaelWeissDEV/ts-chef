/**
 * @fileoverview Merge operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";

export class Merge extends Operation {
  constructor() {
    super();
    this.name = "Merge";
    this.module = "Default";
    this.description =
      "Consolidate all branches back into a single trunk. The opposite of Fork.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Merge All",
        type: "boolean",
        value: true,
      },
    ];
  }

  run(input: string, _args: unknown[]): string {
    return input;
  }
}

export default Merge;
