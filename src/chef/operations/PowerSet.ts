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

export class PowerSet extends Operation {
  private itemDelimiter = ",";

  constructor() {
    super();
    this.name = "Power Set";
    this.module = "Default";
    this.description = "Calculates all the subsets of a set.";
    this.infoURL = "https://wikipedia.org/wiki/Power_set";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [{ name: "Item delimiter", type: "binaryString", value: "," }];
  }

  run(input: string, args: unknown[]): string {
    this.itemDelimiter = args[0] as string;
    const inputArray = input.split(this.itemDelimiter).filter((a) => a);

    if (inputArray.length) {
      return this.runPowerSet(inputArray);
    }
    return "";
  }

  private runPowerSet(a: string[]): string {
    a = a.filter((i) => i.length);
    if (!a.length) return "";

    const toBinary = (dec: number): string => (dec >>> 0).toString(2);
    const result = new Set<string[]>();
    const maxBinaryValue = parseInt(a.map(() => "1").join(""), 2);
    const binaries = [...Array(maxBinaryValue + 1).keys()]
      .map(toBinary)
      .map((i) => i.padStart(toBinary(maxBinaryValue).length, "0"));

    binaries.forEach((binary) => {
      const split = binary.split("");
      result.add(a.filter((_item, index) => split[index] === "1"));
    });

    return [...result]
      .map((r) => r.join(this.itemDelimiter))
      .sort((a, b) => a.length - b.length)
      .map((i) => `${i}\n`)
      .join("");
  }
}

export default PowerSet;
