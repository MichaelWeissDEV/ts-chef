/**
 * @fileoverview DerivePBKDF2Key operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import Utils from "../Utils";
import forge from "node-forge";

/**
 * Derive PBKDF2 key operation
 */
export class DerivePBKDF2Key extends TypedOperation<string, AnyInput, unknown[]> {
  /**
   * DerivePBKDF2Key constructor
   */
  constructor() {
    super();

    this.name = "Derive PBKDF2 key";
    this.module = "Ciphers";
    this.description =
      "PBKDF2 is a password-based key derivation function. It is part of RSA Laboratories' Public-Key Cryptography Standards (PKCS) series, specifically PKCS #5 v2.0, also published as Internet Engineering Task Force's RFC 2898.<br><br>In many applications of cryptography, user security is ultimately dependent on a password, and because a password usually can't be used directly as a cryptographic key, some processing is required.<br><br>A salt provides a large set of keys for any given password, and an iteration count increases the cost of producing keys from a password, thereby also increasing the difficulty of attack.<br><br>If you leave the salt argument empty, a random salt will be generated.";
    this.infoURL = "https://wikipedia.org/wiki/PBKDF2";
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
  run(input: string, args: unknown[]): AnyInput {
    const [arg0, arg1, arg2, arg3, arg4] = args as [
      { string: string; option: string },
      number,
      number,
      string,
      { string: string; option: string },
    ];
    const passphrase = Utils.convertToByteString(arg0.string, arg0.option),
      keySize = arg1,
      iterations = arg2,
      hasher = arg3,
      salt =
        Utils.convertToByteString(arg4.string, arg4.option) ||
        forge.random.getBytesSync(keySize),
      derivedKey = forge.pkcs5.pbkdf2(
        passphrase,
        salt,
        iterations,
        keySize / 8,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        hasher.toLowerCase() as any,
      );

    return forge.util.bytesToHex(derivedKey);
  }
}

export default DerivePBKDF2Key;
