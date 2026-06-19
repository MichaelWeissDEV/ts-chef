/**
 * @fileoverview Sleep operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";

export class Sleep extends TypedOperation<ArrayBuffer, Promise<ArrayBuffer>, unknown[]> {
  constructor() {
    super();
    this.name = "Sleep";
    this.module = "Default";
    this.description =
      "Sleep causes the recipe to wait for a specified number of milliseconds before continuing execution.";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [{ name: "Time (ms)", type: "number", value: 1000 }];
  }

  async run(input: ArrayBuffer, args: unknown[]): Promise<ArrayBuffer> {
    const ms = args[0] as number;
    await new Promise((r) => setTimeout(r, ms));
    return input;
  }
}

export default Sleep;
