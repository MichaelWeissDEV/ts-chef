/**
 * @fileoverview JWTSign operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation,  AnyInput  } from "../Operation_new";
import jwt from "jsonwebtoken";
import OperationError from "../errors/OperationError";
import { JWT_ALGORITHMS } from "../lib/JWT";

/**
 * JWT Sign operation
 */
export class JWTSign extends TypedOperation<AnyInput, AnyInput, unknown[]> {
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
  run(input: AnyInput, args: unknown[]): AnyInput {
    const [key, algorithm, header] = args as [string, string, string];

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
