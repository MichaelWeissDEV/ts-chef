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
 * JWT Verify operation
 */
export class JWTVerify extends Operation {
  /**
   * JWTVerify constructor
   */
  constructor() {
    super();

    this.name = "JWT Verify";
    this.module = "Crypto";
    this.description =
      "Verifies that a JSON Web Token is valid and has been signed with the provided secret / private key.<br><br>The key should be either the secret for HMAC algorithms or the PEM-encoded public key for RSA and ECDSA.";
    this.infoURL = "https://wikipedia.org/wiki/JSON_Web_Token";
    this.inputType = "string";
    this.outputType = "JSON";
    this.args = [
      {
        name: "Public/Secret Key",
        type: "text",
        value: "secret",
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const [key] = args;
    const algos = [...JWT_ALGORITHMS];
    algos[algos.indexOf("None")] = "none";

    try {
      const verified = jwt.verify(input, key, { algorithms: algos }) as any;

      if (
        verified &&
        Object.prototype.hasOwnProperty.call(verified, "name") &&
        verified.name === "JsonWebTokenError"
      ) {
        throw new OperationError(verified.message);
      }

      return verified;
    } catch (err) {
      throw new OperationError(
        err instanceof Error ? err.message : String(err),
      );
    }
  }
}

export default JWTVerify;
