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
import { OperationError } from "../errors/OperationError";
import { toBase64 } from "../lib/Base64";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const blakejs = require("blakejs");

interface ToggleStringArg {
  string: string;
  option: string;
}

/**
 * BLAKE2s operation
 *
 * @category Hashing
 * @see https://wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE2
 */
export class BLAKE2s extends Operation {
  constructor() {
    super();
    this.name = "BLAKE2s";
    this.module = "Hashing";
    this.description =
      "Performs BLAKE2s hashing on the input. BLAKE2s is a flavour of the BLAKE cryptographic hash function that is optimized for 8- to 32-bit platforms and produces digests of any size between 1 and 32 bytes. Supports the use of an optional key.";
    this.infoURL = "https://wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE2";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Size",
        type: "option",
        value: ["256", "160", "128"],
      },
      {
        name: "Output Encoding",
        type: "option",
        value: ["Hex", "Base64", "Raw"],
      },
      {
        name: "Key",
        type: "toggleString",
        value: "",
        toggleValues: ["UTF8", "Decimal", "Base64", "Hex", "Latin1"],
      },
    ];
  }

  /**
   * Runs the operation.
   *
   * @param {ArrayBuffer} input
   * @param {unknown[]} args
   * @returns {string}
   */
  run(input: ArrayBuffer, args: unknown[]): string {
    const [outSize, outFormat] = args as [string, string];
    let key: Uint8Array | null = new Uint8Array(
      Utils.convertToByteArray(
        (args[2] as ToggleStringArg).string || "",
        (args[2] as ToggleStringArg).option,
      ),
    );

    if (key.length === 0) {
      key = null;
    } else if (key.length > 32) {
      throw new OperationError(
        "Key cannot be greater than 32 bytes\nIt is currently " +
          key.length +
          " bytes.",
      );
    }

    const data = new Uint8Array(input);
    const sizeBytes = parseInt(outSize, 10) / 8;

    switch (outFormat) {
      case "Hex":
        return blakejs.blake2sHex(data, key, sizeBytes);
      case "Base64":
        return toBase64(blakejs.blake2s(data, key, sizeBytes));
      case "Raw":
        return Utils.arrayBufferToStr(
          blakejs.blake2s(data, key, sizeBytes).buffer,
          false,
        );
      default:
        throw new OperationError("Unsupported Output Type");
    }
  }
}

export default BLAKE2s;
