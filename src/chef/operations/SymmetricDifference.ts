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
import { OperationError } from "../errors/OperationError";

export class SymmetricDifference extends Operation {
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
