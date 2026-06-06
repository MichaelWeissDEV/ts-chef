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
import * as uuidLib from "uuid";
import { OperationError } from "../errors/OperationError";

type UUIDVersion = "v1" | "v3" | "v4" | "v5" | "v6" | "v7";

export class GenerateUUID extends Operation {
  constructor() {
    super();
    this.name = "Generate UUID";
    this.module = "Crypto";
    this.description =
      "Generates an RFC 9562 compliant Universally Unique Identifier (UUID). Supports v1, v3, v4, v5, v6, v7.";
    this.infoURL = "https://wikipedia.org/wiki/Universally_unique_identifier";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Version",
        type: "option",
        value: ["v1", "v3", "v4", "v5", "v6", "v7"],
        defaultIndex: 2,
      },
      {
        name: "Namespace",
        type: "string",
        value: "1b671a64-40d5-491e-99b0-da01ff1f3341",
      },
    ];
  }

  run(input: string, args: unknown[]): string {
    const [version, namespace] = args as [UUIDVersion, string];
    const fn = uuidLib[version] as Function | undefined;
    if (typeof fn !== "function")
      throw new OperationError("Invalid UUID version");

    const requiresNamespace = version === "v3" || version === "v5";
    if (!requiresNamespace) return fn();

    if (typeof namespace !== "string" || !uuidLib.validate(namespace)) {
      throw new OperationError("Invalid UUID namespace");
    }

    return fn(input, namespace);
  }
}

export default GenerateUUID;
