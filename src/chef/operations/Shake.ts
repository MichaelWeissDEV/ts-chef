/**
 * @fileoverview Shake operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as JSSHA3 from "js-sha3";
import { TypedOperation } from "../Operation";
import { OperationError } from "../errors/OperationError";

export class Shake extends TypedOperation<ArrayBuffer, string, unknown[]> {
  constructor() {
    super();
    this.name = "Shake";
    this.module = "Crypto";
    this.description =
      "Shake is an Extendable Output Function (XOF) of the SHA-3 hash algorithm, part of the Keccak family, allowing for variable output length/size.";
    this.infoURL = "https://wikipedia.org/wiki/SHA-3#Instances";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      { name: "Capacity", type: "option", value: ["256", "128"] },
      { name: "Size", type: "number", value: 512 },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): string {
    const capacity = parseInt(args[0] as string, 10);
    const size = args[1] as number;
    if (size < 0) throw new OperationError("Size must be greater than 0");
    const buf = Buffer.from(input);
    switch (capacity) {
      case 128:
        return JSSHA3.shake128(buf, size);
      case 256:
        return JSSHA3.shake256(buf, size);
      default:
        throw new OperationError("Invalid capacity");
    }
  }
}

export default Shake;
