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
import CryptoApi from "crypto-api/src/crypto-api";

/**
 * HMAC operation
 */
export class HMAC extends Operation {
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
  run(input: any, args: any[]): any {
    const key = Utils.convertToByteString(args[0].string || "", args[0].option),
      hashFunc = args[1].toLowerCase(),
      msg = Utils.arrayBufferToStr(input, false),
      hasher = CryptoApi.getHasher(hashFunc);

    const mac = CryptoApi.getHmac(key, hasher);
    mac.update(msg);
    return CryptoApi.encoder.toHex(mac.finalize());
  }
}

export default HMAC;
