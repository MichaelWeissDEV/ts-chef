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

/**
 * Cartesian Product operation
 *
 * @category Default
 */
export class CartesianProduct extends Operation {
  private sampleDelim: string = "\n\n";
  private itemDelimiter: string = ",";

  /**
   * CartesianProduct constructor
   */
  constructor() {
    super();
    this.name = "Cartesian Product";
    this.module = "Default";
    this.description =
      "Calculates the cartesian product of multiple sets of data, returning all possible combinations.";
    this.infoURL = "https://wikipedia.org/wiki/Cartesian_product";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Sample delimiter",
        type: "binaryString",
        value: "\\n\\n",
      },
      {
        name: "Item delimiter",
        type: "binaryString",
        value: ",",
      },
    ];
  }

  private validateSampleNumbers(sets: string[]): void {
    if (!sets || sets.length < 2) {
      throw new OperationError(
        "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?",
      );
    }
  }

  private computeCartesian(sets: string[][]): string[][] {
    const f = (a: string[][], b: string[]): string[][] =>
      ([] as string[][]).concat(
        ...(a.map((d) =>
          b.map((e) => ([] as string[]).concat(d, e)),
        ) as string[][][]),
      );

    let result: string[][] = sets[0].map((item) => [item]);
    for (let i = 1; i < sets.length; i++) {
      result = f(result, sets[i]);
    }
    return result;
  }

  /**
   * @param {string} input - The sets of data.
   * @param {string[]} args - Operation arguments.
   * @param {string} args[0] - Sample delimiter.
   * @param {string} args[1] - Item delimiter.
   * @returns {string} - The Cartesian product.
   */
  run(input: string, args: string[]): string {
    [this.sampleDelim, this.itemDelimiter] = args;
    const sets = input.split(this.sampleDelim);

    this.validateSampleNumbers(sets);

    const splitSets = sets.map((s) => s.split(this.itemDelimiter));
    return this.computeCartesian(splitSets)
      .map((set) => `(${set.join(",")})`)
      .join(this.itemDelimiter);
  }
}

export default CartesianProduct;
