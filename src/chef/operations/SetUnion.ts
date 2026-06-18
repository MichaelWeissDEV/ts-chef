/**
 * @fileoverview SetUnion operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";
import { OperationError } from "../errors/OperationError";

export class SetUnion extends Operation {
  private sampleDelim = "\n\n";
  private itemDelimiter = ",";

  constructor() {
    super();
    this.name = "Set Union";
    this.module = "Default";
    this.description = "Calculates the union of two sets.";
    this.infoURL = "https://wikipedia.org/wiki/Union_(set_theory)";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Sample delimiter", type: "binaryString", value: "\\n\\n" },
      { name: "Item delimiter", type: "binaryString", value: "," },
    ];
  }

  run(input: string, args: unknown[]): string {
    [this.sampleDelim, this.itemDelimiter] = args as [string, string];
    const sets = input.split(this.sampleDelim);
    if (!sets || sets.length !== 2) {
      throw new OperationError(
        "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?",
      );
    }
    const [a, b] = sets.map((s) => s.split(this.itemDelimiter));
    const result: Record<string, boolean> = {};
    for (const item of a) result[item] = true;
    for (const item of b) result[item] = true;
    return Object.keys(result).join(this.itemDelimiter);
  }
}

export default SetUnion;
