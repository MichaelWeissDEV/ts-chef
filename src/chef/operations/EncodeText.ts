/**
 * @fileoverview EncodeText operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";
import cptable from "codepage";
import { CHR_ENC_CODE_PAGES } from "../lib/ChrEnc";

/**
 * Encode text operation
 */
export class EncodeText extends Operation {
  /**
   * EncodeText constructor
   */
  constructor() {
    super();

    this.name = "Encode text";
    this.module = "Encodings";
    this.description = [
      "Encodes text into the chosen character encoding.",
      "<br><br>",
      "Supported charsets are:",
      "<ul>",
      Object.keys(CHR_ENC_CODE_PAGES)
        .map((e) => `<li>${e}</li>`)
        .join("\n"),
      "</ul>",
    ].join("\n");
    this.infoURL = "https://wikipedia.org/wiki/Character_encoding";
    this.inputType = "string";
    this.outputType = "ArrayBuffer";
    this.args = [
      {
        name: "Encoding",
        type: "option",
        value: Object.keys(CHR_ENC_CODE_PAGES),
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {ArrayBuffer}
   */
  run(input: string, args: unknown[]): AnyInput {
    const [arg0] = args as [string];
    const format = CHR_ENC_CODE_PAGES[arg0];
    const encoded = cptable.utils.encode(format, input);
    return new Uint8Array(encoded as number[]).buffer;
  }
}

export default EncodeText;
