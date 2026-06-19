/**
 * @fileoverview GenerateUUID operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import * as uuidLib from "uuid";
import { OperationError } from "../errors/OperationError";

type UUIDVersion = "v1" | "v3" | "v4" | "v5" | "v6" | "v7";

export class GenerateUUID extends TypedOperation<string, string, unknown[]> {
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
    const fn = uuidLib[version] as ((...args: unknown[]) => string) | undefined;
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
