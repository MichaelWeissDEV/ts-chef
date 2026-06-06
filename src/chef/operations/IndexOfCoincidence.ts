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
import { Utils } from "../Utils";

export class IndexOfCoincidence extends Operation {
  constructor() {
    super();
    this.name = "Index of Coincidence";
    this.module = "Default";
    this.description =
      "Index of Coincidence (IC) is the probability of two randomly selected characters being the same. English text has an IC of around 0.066.";
    this.infoURL = "https://wikipedia.org/wiki/Index_of_coincidence";
    this.inputType = "string";
    this.outputType = "number";
    this.presentType = "html";
    this.args = [];
  }

  run(input: string, _args: unknown[]): number {
    const text = input.toLowerCase().replace(/[^a-z]/g, "");
    const alphabet = Utils.expandAlphRange("a-z");
    const frequencies = new Array(26).fill(0);

    for (let i = 0; i < alphabet.length; i++) {
      for (let j = 0; j < text.length; j++) {
        if (text[j] === alphabet[i]) frequencies[i]++;
      }
    }

    let coincidence = 0;
    for (const f of frequencies) {
      coincidence += f * (f - 1);
    }

    let density = frequencies.reduce((a, b) => a + b, 0);
    if (density < 2) density = 2;

    return coincidence / (density * (density - 1));
  }

  present(ic: number): string {
    return `Index of Coincidence: ${ic}\nNormalized: ${ic * 26}`;
  }
}

export default IndexOfCoincidence;
