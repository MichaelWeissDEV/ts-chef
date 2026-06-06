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
import OperationError from "../errors/OperationError";
import { isImage } from "../lib/FileType";
import { parseQrCode } from "../lib/QRCode";

/**
 * Parse QR Code operation
 */
export class ParseQRCode extends Operation {
  /**
   * ParseQRCode constructor
   */
  constructor() {
    super();

    this.name = "Parse QR Code";
    this.module = "Image";
    this.description =
      "Reads an image file and attempts to detect and read a Quick Response (QR) code from the image.<br><br><u>Normalise Image</u><br>Attempts to normalise the image before parsing it to improve detection of a QR code.";
    this.infoURL = "https://wikipedia.org/wiki/QR_code";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Normalise image",
        type: "boolean",
        value: false,
      },
    ];
    this.checks = [
      {
        pattern:
          "^(?:\\xff\\xd8\\xff|\\x89\\x50\\x4e\\x47|\\x47\\x49\\x46|.{8}\\x57\\x45\\x42\\x50|\\x42\\x4d)",
        flags: "",
        args: [false],
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  async run(input: any, args: any[]): Promise<any> {
    const [normalise] = args;

    if (!isImage(input)) {
      throw new OperationError("Invalid file type.");
    }
    return parseQrCode(input, normalise);
  }
}

export default ParseQRCode;
