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
import OperationError from "../errors/OperationError";
import CryptoApi from "crypto-api/src/crypto-api";

/**
 * Derive HKDF Key operation
 */
export class DeriveHKDFKey extends Operation {
  /**
   * DeriveHKDFKey constructor
   */
  constructor() {
    super();

    this.name = "Derive HKDF key";
    this.module = "Crypto";
    this.description =
      "A simple Hashed Message Authenticaton Code (HMAC)-based key derivation function (HKDF), defined in RFC5869.";
    this.infoURL = "https://wikipedia.org/wiki/HKDF";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Salt",
        type: "toggleString",
        value: "",
        toggleValues: ["Hex", "Decimal", "Base64", "UTF8", "Latin1"],
      },
      {
        name: "Info",
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
        defaultIndex: 6,
      },
      {
        name: "Extract mode",
        type: "argSelector",
        value: [
          {
            name: "with salt",
            on: [0],
          },
          {
            name: "no salt",
            off: [0],
          },
          {
            name: "skip",
            off: [0],
          },
        ],
      },
      {
        name: "L (number of output octets)",
        type: "number",
        value: 16,
        min: 0,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {ArrayBuffer}
   */
  run(input: any, args: any[]): any {
    const argSalt = Utils.convertToByteString(
        args[0].string || "",
        args[0].option,
      ),
      info = Utils.convertToByteString(args[1].string || "", args[1].option),
      hashFunc = args[2].toLowerCase(),
      extractMode = args[3],
      L = args[4],
      IKM = Utils.arrayBufferToStr(input, false),
      hasher = CryptoApi.getHasher(hashFunc),
      HashLen = hasher.finalize().length;

    if (L < 0) {
      throw new OperationError("L must be non-negative");
    }
    if (L > 255 * HashLen) {
      throw new OperationError(
        "L too large (maximum length for " +
          args[2] +
          " is " +
          255 * HashLen +
          ")",
      );
    }

    const hmacHash = function (key: string, data: string) {
      hasher.reset();
      const mac = CryptoApi.getHmac(key, hasher);
      mac.update(data);
      return mac.finalize();
    };
    const salt = extractMode === "with salt" ? argSalt : "\0".repeat(HashLen);
    const PRK = extractMode === "skip" ? IKM : hmacHash(salt, IKM);
    let T = "";
    let result = "";
    for (let i = 1; i <= 255 && result.length < L; i++) {
      const TNext = hmacHash(PRK, T + info + String.fromCharCode(i));
      result += TNext;
      T = TNext;
    }
    return CryptoApi.encoder.toHex(result.substring(0, L));
  }
}

export default DeriveHKDFKey;
