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
import jwt from "jsonwebtoken";
import { OperationError } from "../errors/OperationError";

export class JWTDecode extends Operation {
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

  run(input: string, _args: unknown[]): unknown {
    try {
      const decoded = jwt.decode(input, { complete: true });
      if (!decoded) throw new Error("Invalid JWT");
      return (decoded as { payload: unknown }).payload;
    } catch (err) {
      throw new OperationError(String(err));
    }
  }
}

export default JWTDecode;
