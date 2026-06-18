/**
 * @fileoverview NormaliseUnicode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";
import { OperationError } from "../errors/OperationError";

const UNICODE_NORMALISATION_FORMS = ["NFD", "NFC", "NFKD", "NFKC"];

export class NormaliseUnicode extends Operation {
  constructor() {
    super();
    this.name = "Normalise Unicode";
    this.module = "Encodings";
    this.description =
      "Transform Unicode characters to one of the Normalisation Forms";
    this.infoURL =
      "https://wikipedia.org/wiki/Unicode_equivalence#Normal_forms";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Normal Form",
        type: "option",
        value: UNICODE_NORMALISATION_FORMS,
      },
    ];
  }

  run(input: string, args: unknown[]): string {
    const normalForm = args[0] as string;
    if (!["NFD", "NFC", "NFKD", "NFKC"].includes(normalForm)) {
      throw new OperationError("Unknown Normalisation Form");
    }
    return input.normalize(normalForm as "NFD" | "NFC" | "NFKD" | "NFKC");
  }
}

export default NormaliseUnicode;
