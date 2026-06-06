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

import { streebog256, streebog512 } from "@li0ard/streebog";
import { Operation } from "../Operation";
import { OperationError } from "../errors/OperationError";

export class Streebog extends Operation {
  constructor() {
    super();
    this.name = "Streebog";
    this.module = "Hashing";
    this.description =
      "Streebog is a cryptographic hash function defined in the Russian national standard GOST R 34.11-2012.";
    this.infoURL = "https://wikipedia.org/wiki/Streebog";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      { name: "Digest length", type: "option", value: ["256", "512"] },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): string {
    const length = args[0] as string;
    const buf = new Uint8Array(input);
    let result: Uint8Array;
    if (length === "256") {
      result = streebog256(buf) as Uint8Array;
    } else if (length === "512") {
      result = streebog512(buf) as Uint8Array;
    } else {
      throw new OperationError(`Unsupported digest length: ${length}`);
    }
    return Array.from(result)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

export default Streebog;
