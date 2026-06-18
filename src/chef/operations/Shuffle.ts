/**
 * @fileoverview Shuffle operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";
import { Utils } from "../Utils";
import { INPUT_DELIM_OPTIONS } from "../lib/Delim";
import { randomBytes } from "crypto";

export class Shuffle extends Operation {
  constructor() {
    super();
    this.name = "Shuffle";
    this.module = "Default";
    this.description = "Randomly reorders input elements.";
    this.infoURL = "https://wikipedia.org/wiki/Shuffling";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Delimiter", type: "option", value: INPUT_DELIM_OPTIONS },
    ];
  }

  run(input: string, args: unknown[]): string {
    const delim = Utils.charRep(args[0] as string);
    if (input.length === 0) return input;

    const rng = (): number => {
      const buf = randomBytes(8);
      const hi = buf.readUInt32BE(0) >>> 11;
      const lo = buf.readUInt32BE(4);
      return (hi * 4294967296 + lo) / 2 ** 53;
    };

    const toShuffle = input.split(delim);
    for (let i = toShuffle.length - 1; i > 0; i--) {
      const idx = Math.floor(rng() * (i + 1));
      [toShuffle[idx], toShuffle[i]] = [toShuffle[i], toShuffle[idx]];
    }
    return toShuffle.join(delim);
  }
}

export default Shuffle;
