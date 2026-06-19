/**
 * @fileoverview IndexOfCoincidence operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import { Utils } from "../Utils";

export class IndexOfCoincidence extends TypedOperation<string, number, unknown[]> {
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
