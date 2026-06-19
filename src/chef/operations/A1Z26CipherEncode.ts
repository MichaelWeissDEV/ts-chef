
import { TypedOperation } from "../Operation";
import { Utils } from "../Utils";
import { DELIM_OPTIONS } from "../lib/Delim";

/**
 * A1Z26 Cipher Encode operation
 *
 * @category Ciphers
 */
export class A1Z26CipherEncode extends TypedOperation<string, string, string[]> {
  /**
   * A1Z26CipherEncode constructor
   */
  constructor() {
    super();
    this.name = "A1Z26 Cipher Encode";
    this.module = "Ciphers";
    this.description =
      "Converts alphabet characters into their corresponding alphabet order number.\n\ne.g. a becomes 1 and b becomes 2.\n\nNon-alphabet characters are dropped.";
    this.infoURL = "";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: DELIM_OPTIONS,
      },
    ];
  }

  /**
   * Runs the operation.
   *
   * @param {string} input
   * @param {string[]} args
   * @returns {string}
   */
  run(input: string, args: string[]): string {
    const delim = Utils.charRep(args[0] || "Space");
    const sanitized = input.toLowerCase();
    const charcode = Utils.strToCharcode(sanitized);
    const parts: string[] = [];

    for (let i = 0; i < charcode.length; i++) {
      const ordinal = charcode[i] - 96;
      if (ordinal > 0 && ordinal <= 26) {
        parts.push(ordinal.toString(10));
      }
    }

    return parts.join(delim);
  }
}

export default A1Z26CipherEncode;
