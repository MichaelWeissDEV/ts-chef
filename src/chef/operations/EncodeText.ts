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
  run(input: any, args: any[]): any {
    const format = CHR_ENC_CODE_PAGES[args[0]];
    const encoded = cptable.utils.encode(format, input);
    return new Uint8Array(encoded as number[]).buffer;
  }
}

export default EncodeText;
