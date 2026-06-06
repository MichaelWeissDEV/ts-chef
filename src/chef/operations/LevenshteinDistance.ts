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

export class LevenshteinDistance extends Operation {
  constructor() {
    super();
    this.name = "Levenshtein Distance";
    this.module = "Default";
    this.description =
      "Levenshtein Distance (also known as Edit Distance) counts insertions, deletions, and substitutions required to change one string to another.";
    this.infoURL = "https://wikipedia.org/wiki/Levenshtein_distance";
    this.inputType = "string";
    this.outputType = "number";
    this.args = [
      { name: "Sample delimiter", type: "binaryString", value: "\\n" },
      { name: "Insertion cost", type: "number", value: 1 },
      { name: "Deletion cost", type: "number", value: 1 },
      { name: "Substitution cost", type: "number", value: 1 },
    ];
  }

  run(input: string, args: unknown[]): number {
    const [delim, insCost, delCost, subCost] = args as [
      string,
      number,
      number,
      number,
    ];
    const samples = input.split(delim);

    if (samples.length !== 2) {
      throw new OperationError(
        "Incorrect number of samples. Check your input and/or delimiter.",
      );
    }
    if (insCost < 0 || delCost < 0 || subCost < 0) {
      throw new OperationError("Negative costs are not allowed.");
    }

    const src = samples[0];
    const dest = samples[1];
    let currentCost: number[] = new Array(src.length + 1);
    let nextCost: number[] = new Array(src.length + 1);

    for (let i = 0; i < currentCost.length; i++) {
      currentCost[i] = delCost * i;
    }

    for (let i = 0; i < dest.length; i++) {
      const destc = dest.charAt(i);
      nextCost[0] = currentCost[0] + insCost;
      for (let j = 0; j < src.length; j++) {
        let optCost = currentCost[j + 1] + insCost;
        let candidate = nextCost[j] + delCost;
        if (candidate < optCost) optCost = candidate;
        candidate = currentCost[j];
        if (src.charAt(j) !== destc) candidate += subCost;
        if (candidate < optCost) optCost = candidate;
        nextCost[j + 1] = optCost;
      }
      const tempCost = nextCost;
      nextCost = currentCost;
      currentCost = tempCost;
    }

    return currentCost[currentCost.length - 1];
  }
}

export default LevenshteinDistance;
