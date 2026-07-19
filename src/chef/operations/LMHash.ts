/**
 * @fileoverview LMHash operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import CryptoJS from "crypto-js";

function expandDESKey(key56: Uint8Array): Uint8Array {
  const key64 = new Uint8Array(8);
  key64[0] = key56[0] & 0xfe;
  key64[1] = ((key56[0] << 7) & 0xff) | (key56[1] >> 1);
  key64[2] = ((key56[1] << 6) & 0xff) | (key56[2] >> 2);
  key64[3] = ((key56[2] << 5) & 0xff) | (key56[3] >> 3);
  key64[4] = ((key56[3] << 4) & 0xff) | (key56[4] >> 4);
  key64[5] = ((key56[4] << 3) & 0xff) | (key56[5] >> 5);
  key64[6] = ((key56[5] << 2) & 0xff) | (key56[6] >> 6);
  key64[7] = (key56[6] << 1) & 0xff;

  for (let byte = 0; byte < key64.length; byte++) {
    let parity = 1;
    for (let bit = 1; bit < 8; bit++) {
      parity = (parity + ((key64[byte] >> bit) & 1)) % 2;
    }
    key64[byte] |= parity;
  }
  return key64;
}

function encryptLMMagic(key: Uint8Array): string {
  const plaintext = CryptoJS.enc.Hex.parse(
    Buffer.from("KGS!@#$%", "ascii").toString("hex"),
  );
  const cryptoKey = CryptoJS.enc.Hex.parse(Buffer.from(key).toString("hex"));
  return CryptoJS.DES.encrypt(plaintext, cryptoKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  }).ciphertext.toString(CryptoJS.enc.Hex);
}

/**
 * LM Hash operation
 */
export class LMHash extends TypedOperation<string, string, unknown[]> {
  /**
   * LMHash constructor
   */
  constructor() {
    super();

    this.name = "LM Hash";
    this.module = "Crypto";
    this.description =
      "An LM Hash, or LAN Manager Hash, is a deprecated way of storing passwords on old Microsoft operating systems. It is particularly weak and can be cracked in seconds on modern hardware using rainbow tables.";
    this.infoURL =
      "https://wikipedia.org/wiki/LAN_Manager#Password_hashing_algorithm";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, _args: unknown[]): string {
    const password = Buffer.alloc(14);
    Buffer.from(input.substring(0, 14).toUpperCase(), "ascii").copy(
      password,
      0,
      0,
      14,
    );

    return [password.subarray(0, 7), password.subarray(7, 14)]
      .map((half) => encryptLMMagic(expandDESKey(half)))
      .join("")
      .toUpperCase();
  }
}

export default LMHash;
