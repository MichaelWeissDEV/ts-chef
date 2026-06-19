/**
 * @fileoverview DecodeText operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import cptable from "codepage";
import { CHR_ENC_CODE_PAGES } from "../lib/ChrEnc";

/**
 * Decode text operation
 */
export class DecodeText extends TypedOperation<ArrayBuffer, AnyInput, unknown[]> {
  /**
   * DecodeText constructor
   */
  constructor() {
    super();

    this.name = "Decode text";
    this.module = "Encodings";
    this.description = [
      "Decodes text from the chosen character encoding.",
      "<br><br>",
      "Supported charsets are:",
      "<ul>",
      Object.keys(CHR_ENC_CODE_PAGES)
        .map((e) => `<li>${e}</li>`)
        .join("\n"),
      "</ul>",
    ].join("\n");
    this.infoURL = "https://wikipedia.org/wiki/Character_encoding";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Encoding",
        type: "option",
        value: Object.keys(CHR_ENC_CODE_PAGES),
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: ArrayBuffer, args: unknown[]): AnyInput {
    const [arg0] = args as [string];
    const format = CHR_ENC_CODE_PAGES[arg0];
    return cptable.utils.decode(format, new Uint8Array(input));
  }
}

export default DecodeText;
