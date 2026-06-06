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

import Operation from "../Operation";
import jwt from "jsonwebtoken";
import OperationError from "../errors/OperationError";
import { JWT_ALGORITHMS } from "../lib/JWT";

/**
 * JWT Sign operation
 */
export class JWTSign extends Operation {
  /**
   * JWTSign constructor
   */
  constructor() {
    super();

    this.name = "JWT Sign";
    this.module = "Crypto";
    this.description =
      "Signs a JSON object as a JSON Web Token using a provided secret / private key.<br><br>The key should be either the secret for HMAC algorithms or the PEM-encoded private key for RSA and ECDSA.";
    this.infoURL = "https://wikipedia.org/wiki/JSON_Web_Token";
    this.inputType = "JSON";
    this.outputType = "string";
    this.args = [
      {
        name: "Private/Secret Key",
        type: "text",
        value: "secret",
      },
      {
        name: "Signing algorithm",
        type: "option",
        value: JWT_ALGORITHMS,
      },
      {
        name: "Header",
        type: "text",
        value: "{}",
      },
    ];
  }

  /**
   * @param {JSON} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const [key, algorithm, header] = args;

    try {
      return jwt.sign(input, key, {
        algorithm: algorithm === "None" ? "none" : algorithm,
        header: JSON.parse(header || "{}"),
      });
    } catch (err) {
      throw new OperationError(`Error: Have you entered the key correctly? The key should be either the secret for HMAC algorithms or the PEM-encoded private key for RSA and ECDSA.

${err}`);
    }
  }
}

export default JWTSign;
