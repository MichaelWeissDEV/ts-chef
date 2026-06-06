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
import { Utils } from "../Utils";
import { DELIM_OPTIONS } from "../lib/Delim";
import { randomBytes } from "crypto";

const BUFFER_SIZE = 1024;
const MAX_RANGE = Number.MAX_SAFE_INTEGER;

export class PseudoRandomIntegerGenerator extends Operation {
  private randomBuffer: Uint32Array;
  private randomBufferOffset: number;

  constructor() {
    super();
    this.name = "Pseudo-Random Integer Generator";
    this.module = "Ciphers";
    this.description =
      "A cryptographically-secure pseudo-random number generator (PRNG). Generates random integers within a specified range.";
    this.infoURL = "https://wikipedia.org/wiki/Pseudorandom_number_generator";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Number of Integers", type: "number", value: 1, min: 1 },
      { name: "Min Value", type: "number", value: 0 },
      { name: "Max Value", type: "number", value: 99 },
      { name: "Delimiter", type: "option", value: DELIM_OPTIONS },
      { name: "Output", type: "option", value: ["Raw", "Hex", "Decimal"] },
    ];
    this.randomBuffer = new Uint32Array(BUFFER_SIZE);
    this.randomBufferOffset = BUFFER_SIZE;
  }

  run(_input: string, args: unknown[]): string {
    const [numInts, minInt, maxInt, delimiter, outputType] = args as [
      number,
      number,
      number,
      string,
      string,
    ];

    if (minInt === null || maxInt === null) return "";

    const min = Math.ceil(minInt);
    const max = Math.floor(maxInt);
    const delim = Utils.charRep(delimiter || "Space");

    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) {
      throw new OperationError(
        "Min and Max must be between `-(2^53 - 1)` and `2^53 - 1`.",
      );
    }
    if (min > max) throw new OperationError("Min cannot be larger than Max.");

    const range = max - min + 1;
    if (range > MAX_RANGE) {
      throw new OperationError(
        "Range between Min and Max cannot be larger than `2^53`",
      );
    }

    const rejectionThreshold = MAX_RANGE - (MAX_RANGE % range);
    const output: string[] = [];

    for (let i = 0; i < numInts; i++) {
      const result = this._generateRandomValue(rejectionThreshold);
      const intValue = min + (result % range);

      switch (outputType) {
        case "Hex":
          output.push(intValue.toString(16));
          break;
        case "Decimal":
          output.push(intValue.toString(10));
          break;
        default:
          output.push(Utils.chr(intValue));
      }
    }

    return outputType === "Raw" ? output.join("") : output.join(delim);
  }

  private _generateRandomValue(rejectionThreshold: number): number {
    let result: number;
    do {
      if (this.randomBufferOffset + 2 > this.randomBuffer.length) {
        this._resetRandomBuffer();
      }
      result =
        (this.randomBuffer[this.randomBufferOffset++] & 0x1fffff) *
          0x100000000 +
        this.randomBuffer[this.randomBufferOffset++];
    } while (result >= rejectionThreshold);
    return result;
  }

  private _resetRandomBuffer(): void {
    const buf = randomBytes(this.randomBuffer.length * 4);
    for (let j = 0; j < this.randomBuffer.length; j++) {
      this.randomBuffer[j] =
        (buf[j * 4] << 24) |
        (buf[j * 4 + 1] << 16) |
        (buf[j * 4 + 2] << 8) |
        buf[j * 4 + 3];
    }
    this.randomBufferOffset = 0;
  }
}

export default PseudoRandomIntegerGenerator;
