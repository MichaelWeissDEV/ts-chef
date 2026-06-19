/**
 * @fileoverview SetDifference operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import { OperationError } from "../errors/OperationError";

export class SetDifference extends TypedOperation<string, string, unknown[]> {
  private sampleDelim = "\n\n";
  private itemDelimiter = ",";

  constructor() {
    super();
    this.name = "Set Difference";
    this.module = "Default";
    this.description =
      "Calculates the difference, or relative complement, of two sets.";
    this.infoURL =
      "https://wikipedia.org/wiki/Complement_(set_theory)#Relative_complement";
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
    return a.filter((item) => !b.includes(item)).join(this.itemDelimiter);
  }
}

export default SetDifference;
