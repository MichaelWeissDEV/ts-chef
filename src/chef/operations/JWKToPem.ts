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

import r from "jsrsasign";
import { Operation } from "../Operation";
import OperationError from "../errors/OperationError";

/**
 * PEM to JWK operation
 */
export class PEMToJWK extends Operation {
  /**
   * PEMToJWK constructor
   */
  constructor() {
    super();

    this.name = "JWK to PEM";
    this.module = "PublicKey";
    this.description =
      "Converts Keys in JSON Web Key format to PEM format (PKCS#8).";
    this.infoURL = "https://datatracker.ietf.org/doc/html/rfc7517";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
    this.checks = [
      {
        pattern: '"kty":\\s*"(EC|RSA)"',
        flags: "gm",
        args: [],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const inputJson = JSON.parse(input);

    let keys = [];
    if (Array.isArray(inputJson)) {
      // list of keys => transform all keys
      keys = inputJson;
    } else if (Array.isArray(inputJson.keys)) {
      // JSON Web Key Set => transform all keys
      keys = inputJson.keys;
    } else if (typeof inputJson === "object") {
      // single key
      keys.push(inputJson);
    } else {
      throw new OperationError("Input is not a JSON Web Key");
    }

    let output = "";
    for (let i = 0; i < keys.length; i++) {
      const jwk = keys[i];
      if (typeof jwk.kty !== "string") {
        throw new OperationError("Invalid JWK format");
      } else if ("|RSA|EC|".indexOf(jwk.kty) === -1) {
        throw new OperationError(`Unsupported JWK key type '${inputJson.kty}'`);
      }

      const key = r.KEYUTIL.getKey(jwk);
      const pem = key.isPrivate
        ? r.KEYUTIL.getPEM(key, "PKCS8PRV")
        : r.KEYUTIL.getPEM(key);

      // PEM ends with '\n', so a new key always starts on a new line
      output += pem;
    }

    return output;
  }
}

export default PEMToJWK;
