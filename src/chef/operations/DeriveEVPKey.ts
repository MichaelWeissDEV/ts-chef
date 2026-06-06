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
import Utils from "../Utils";
import CryptoJS from "crypto-js";

/**
 * Derive EVP key operation
 */
export class DeriveEVPKey extends Operation {
  /**
   * DeriveEVPKey constructor
   */
  constructor() {
    super();

    this.name = "Derive EVP key";
    this.module = "Ciphers";
    this.description =
      "This operation performs a password-based key derivation function (PBKDF) used extensively in OpenSSL. In many applications of cryptography, user security is ultimately dependent on a password, and because a password usually can't be used directly as a cryptographic key, some processing is required.<br><br>A salt provides a large set of keys for any given password, and an iteration count increases the cost of producing keys from a password, thereby also increasing the difficulty of attack.<br><br>If you leave the salt argument empty, a random salt will be generated.";
    this.infoURL = "https://wikipedia.org/wiki/Key_derivation_function";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Passphrase",
        type: "toggleString",
        value: "",
        toggleValues: ["UTF8", "Latin1", "Hex", "Base64"],
      },
      {
        name: "Key size",
        type: "number",
        value: 128,
      },
      {
        name: "Iterations",
        type: "number",
        value: 1,
      },
      {
        name: "Hashing function",
        type: "option",
        value: ["SHA1", "SHA256", "SHA384", "SHA512", "MD5"],
      },
      {
        name: "Salt",
        type: "toggleString",
        value: "",
        toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const passphrase = CryptoJS.enc.Latin1.parse(
        Utils.convertToByteString(args[0].string, args[0].option),
      ),
      keySize = args[1] / 32,
      iterations = args[2],
      hasher = args[3],
      salt = CryptoJS.enc.Latin1.parse(
        Utils.convertToByteString(args[4].string, args[4].option),
      ),
      key = CryptoJS.EvpKDF(passphrase as any, salt as any, {
        // lgtm [js/insufficient-password-hash]
        keySize: keySize,
        hasher: (CryptoJS.algo as any)[hasher],
        iterations: iterations,
      });

    return key.toString(CryptoJS.enc.Hex);
  }
}

export default DeriveEVPKey;

/**
 * Overwriting the CryptoJS OpenSSL key derivation function so that it is possible to not pass a
 * salt in.

 * @param {string} password - The password to derive from.
 * @param {number} keySize - The size in words of the key to generate.
 * @param {number} ivSize - The size in words of the IV to generate.
 * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be
 *                 generated randomly. If set to false, no salt will be added.
 *
 * @returns {CipherParams} A cipher params object with the key, IV, and salt.
 *
 * @static
 *
 * @example
 * // Randomly generates a salt
 * var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
 * // Uses the salt 'saltsalt'
 * var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
 * // Does not use a salt
 * var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, false);
 */
(CryptoJS.kdf.OpenSSL as any).execute = function (
  password: any,
  keySize: number,
  ivSize: number,
  salt: any,
) {
  // Generate random salt if no salt specified and not set to false
  // This line changed from `if (!salt) {` to the following
  if (salt === undefined || salt === null) {
    salt = CryptoJS.lib.WordArray.random(64 / 8);
  }

  // Derive key and IV
  const key = (CryptoJS.algo.EvpKDF as any)
    .create({ keySize: keySize + ivSize, iterations: 1 })
    .compute(password, salt);

  // Separate key and IV
  const iv = CryptoJS.lib.WordArray.create(
    key.words.slice(keySize),
    ivSize * 4,
  );
  key.sigBytes = keySize * 4;

  // Return params
  return CryptoJS.lib.CipherParams.create({ key: key, iv: iv, salt: salt });
};

/**
 * Override for the CryptoJS Hex encoding parser to remove whitespace before attempting to parse
 * the hex string.
 *
 * @param {string} hexStr
 * @returns {CryptoJS.lib.WordArray}
 */
(CryptoJS.enc.Hex as any).parse = function (hexStr: string) {
  // Remove whitespace
  hexStr = hexStr.replace(/\s/g, "");

  // Shortcut
  const hexStrLength = hexStr.length;

  // Convert
  const words: number[] = [];
  for (let i = 0; i < hexStrLength; i += 2) {
    words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
  }

  return CryptoJS.lib.WordArray.create(words, hexStrLength / 2);
};
