/**
 * @fileoverview JWTDecode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import jwt from "jsonwebtoken";
import { OperationError } from "../errors/OperationError";

export class JWTDecode extends TypedOperation<string, AnyInput, unknown[]> {
  constructor() {
    super();
    this.name = "JWT Decode";
    this.module = "Crypto";
    this.description =
      "Decodes a JSON Web Token <b>without</b> checking whether the provided secret / private key is valid. Use 'JWT Verify' to check if the signature is valid as well.";
    this.infoURL = "https://wikipedia.org/wiki/JSON_Web_Token";
    this.inputType = "string";
    this.outputType = "JSON";
    this.args = [];
    this.checks = [
      {
        pattern: "^ey([A-Za-z0-9_-]+)\\.ey([A-Za-z0-9_-]+)\\.([A-Za-z0-9_-]+)$",
        flags: "",
        args: [],
      },
    ];
  }

  run(input: string, _args: unknown[]): AnyInput {
    try {
      const decoded = jwt.decode(input, { complete: true });
      if (!decoded) throw new Error("Invalid JWT");
      return (decoded as { payload: AnyInput }).payload;
    } catch (err) {
      throw new OperationError(String(err));
    }
  }
}

export default JWTDecode;
