/**
 * @fileoverview HMAC operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import Utils from "../Utils";
import CryptoApi from "crypto-api/src/crypto-api";

/**
 * HMAC operation
 */
export class HMAC extends TypedOperation<ArrayBuffer, AnyInput, unknown[]> {
  /**
   * HMAC constructor
   */
  constructor() {
    super();

    this.name = "HMAC";
    this.module = "Crypto";
    this.description =
      "Keyed-Hash Message Authentication Codes (HMAC) are a mechanism for message authentication using cryptographic hash functions.";
    this.infoURL = "https://wikipedia.org/wiki/HMAC";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Key",
        type: "toggleString",
        value: "",
        toggleValues: ["Hex", "Decimal", "Base64", "UTF8", "Latin1"],
      },
      {
        name: "Hashing function",
        type: "option",
        value: [
          "MD2",
          "MD4",
          "MD5",
          "SHA0",
          "SHA1",
          "SHA224",
          "SHA256",
          "SHA384",
          "SHA512",
          "SHA512/224",
          "SHA512/256",
          "RIPEMD128",
          "RIPEMD160",
          "RIPEMD256",
          "RIPEMD320",
          "HAS160",
          "Whirlpool",
          "Whirlpool-0",
          "Whirlpool-T",
          "Snefru",
        ],
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: ArrayBuffer, args: unknown[]): AnyInput {
    const [keyObj, hashFuncArg] = args as [
      { string: string; option: string },
      string,
    ];
    const key = Utils.convertToByteString(keyObj.string || "", keyObj.option),
      hashFunc = hashFuncArg.toLowerCase(),
      msg = Utils.arrayBufferToStr(input, false),
      hasher = CryptoApi.getHasher(hashFunc);

    const mac = CryptoApi.getHmac(key, hasher);
    mac.update(msg);
    return CryptoApi.encoder.toHex(mac.finalize());
  }
}

export default HMAC;
