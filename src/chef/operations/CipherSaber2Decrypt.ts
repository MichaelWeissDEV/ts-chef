/**
 * @fileoverview CipherSaber2Decrypt operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, ArgConfig } from "../Operation_new";
import { encode } from "../lib/CipherSaber2";
import { Utils } from "../Utils";

/**
 * CipherSaber2 Decrypt operation
 *
 * @category Crypto
 * @see https://wikipedia.org/wiki/CipherSaber
 */
interface ToggleStringArg {
  string: string;
  option: string;
}

export class CipherSaber2Decrypt extends TypedOperation<ArrayBuffer, ArrayBuffer, unknown[]> {
  name = "CipherSaber2 Decrypt";
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

    const tempIVP = inputBytes.slice(0, 10);
    const ciphertext = inputBytes.slice(10);
    const result = encode(tempIVP, key, rounds, ciphertext);
    return new Uint8Array(result).buffer;
  }
}

export default CipherSaber2Decrypt;
