/**
 * @fileoverview SymmetricDifference operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import { OperationError } from "../errors/OperationError";

export class SymmetricDifference extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "Symmetric Difference";
    this.module = "Default";
    this.description = "Calculates the symmetric difference of two sets.";
    this.infoURL = "https://wikipedia.org/wiki/Symmetric_difference";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Sample delimiter", type: "binaryString", value: "\\n\\n" },
      { name: "Item delimiter", type: "binaryString", value: "," },
    ];
  }

  run(input: string, args: unknown[]): string {
    const [sampleDelim, itemDelimiter] = args as [string, string];
    const sets = input.split(sampleDelim);
    if (!sets || sets.length !== 2) {
      throw new OperationError(
        "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?",
      );
    }
    const [a, b] = sets.map((s) => s.split(itemDelimiter));
    const diffAB = a.filter((item) => !b.includes(item));
    const diffBA = b.filter((item) => !a.includes(item));
    return diffAB.concat(diffBA).join(itemDelimiter);
  }
}

export default SymmetricDifference;
