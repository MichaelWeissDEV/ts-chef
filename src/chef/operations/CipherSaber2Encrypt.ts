/**
 * @fileoverview CipherSaber2Encrypt operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, ArgConfig } from "../Operation";
import { encode } from "../lib/CipherSaber2";
import { Utils } from "../Utils";
import * as crypto from "crypto";

/**
 * CipherSaber2 Encrypt operation
 *
 * @category Crypto
 * @see https://wikipedia.org/wiki/CipherSaber
 */
interface ToggleStringArg {
  string: string;
  option: string;
}

export class CipherSaber2Encrypt extends TypedOperation<ArrayBuffer, ArrayBuffer, unknown[]> {
  name = "CipherSaber2 Encrypt";
  module = "Crypto";
  description =
    "CipherSaber is a simple symmetric encryption protocol based on the RC4 stream cipher. It gives reasonably strong protection of message confidentiality, yet it's designed to be simple enough that even novice programmers can memorize the algorithm and implement it from scratch.";
  infoURL = "https://wikipedia.org/wiki/CipherSaber";
  inputType = "ArrayBuffer";
  outputType = "ArrayBuffer";
  args: ArgConfig[] = [
    {
      name: "Key",
      type: "toggleString",
      value: "",
      toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
    },
    {
      name: "Rounds",
      type: "number",
      value: 20,
    },
  ];

  /**
   * Runs the operation.
   *
   * @param {ArrayBuffer} input
   * @param {any[]} args
   * @returns {ArrayBuffer}
   */
  run(input: ArrayBuffer, args: unknown[]): ArrayBuffer {
    const inputBytes = new Uint8Array(input);
    const [keyArg, rounds] = args as [ToggleStringArg, number];
    const key = Utils.convertToByteArray(keyArg.string, keyArg.option);

    const tempIVP = crypto.randomBytes(10);
    const result = Array.from(tempIVP);
    const encrypted = encode(tempIVP, key, rounds, inputBytes);
    return new Uint8Array(result.concat(encrypted)).buffer;
  }
}

export default CipherSaber2Encrypt;
