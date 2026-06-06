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
import { DELIM_OPTIONS } from "../lib/Delim";
import { OperationError } from "../errors/OperationError";

export class FromCharcode extends Operation {
  constructor() {
    super();
    this.name = "From Charcode";
    this.module = "Default";
    this.description =
      "Converts unicode character codes back into text. e.g. 0393 03b5 03b9 03ac 20 03c3 03bf 03c5 becomes Greek text";
    this.infoURL = "https://wikipedia.org/wiki/Plane_(Unicode)";
    this.inputType = "string";
    this.outputType = "ArrayBuffer";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: DELIM_OPTIONS,
      },
      {
        name: "Base",
        type: "number",
        value: 16,
      },
    ];
  }

  run(input: string, args: unknown[]): ArrayBuffer {
    const delim = Utils.charRep((args[0] as string) || "Space");
    const base = args[1] as number;

    if (base < 2 || base > 36) {
      throw new OperationError("Error: Base argument must be between 2 and 36");
    }

    if (input.length === 0) {
      return new ArrayBuffer(0);
    }

    let bites = input.split(delim);

    // Split into groups of 2 if the whole string is concatenated
    if (bites.length === 1 && input.length > 17) {
      bites = [];
      for (let i = 0; i < input.length; i += 2) {
        bites.push(input.slice(i, i + 2));
      }
    }

    let latin1 = "";
    for (let i = 0; i < bites.length; i++) {
      latin1 += Utils.chr(parseInt(bites[i], base));
    }
    return Utils.strToArrayBuffer(latin1);
  }
}

export default FromCharcode;
