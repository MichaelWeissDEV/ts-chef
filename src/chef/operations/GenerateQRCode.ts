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
import { generateQrCode } from "../lib/QRCode";
import { toBase64 } from "../lib/Base64";
import { isImage } from "../lib/FileType";
import Utils from "../Utils";

/**
 * Generate QR Code operation
 */
export class GenerateQRCode extends Operation {
  /**
   * GenerateQRCode constructor
   */
  constructor() {
    super();

    this.name = "Generate QR Code";
    this.module = "Image";
    this.description =
      "Generates a Quick Response (QR) code from the input text.<br><br>A QR code is a type of matrix barcode (or two-dimensional barcode) first designed in 1994 for the automotive industry in Japan. A barcode is a machine-readable optical label that contains information about the item to which it is attached.";
    this.infoURL = "https://wikipedia.org/wiki/QR_code";
    this.inputType = "string";
    this.outputType = "ArrayBuffer";
    this.presentType = "html";
    this.args = [
      {
        name: "Image Format",
        type: "option",
        value: ["PNG", "SVG", "EPS", "PDF"],
      },
      {
        name: "Module size (px)",
        type: "number",
        value: 5,
        min: 1,
      },
      {
        name: "Margin (num modules)",
        type: "number",
        value: 4,
        min: 0,
      },
      {
        name: "Error correction",
        type: "option",
        value: ["Low", "Medium", "Quartile", "High"],
        defaultIndex: 1,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {ArrayBuffer}
   */
  run(input: any, args: any[]): any {
    const [format, size, margin, errorCorrection] = args;

    return generateQrCode(input, format, size, margin, errorCorrection);
  }

  /**
   * Displays the QR image using HTML for web apps
   *
   * @param {ArrayBuffer} data
   * @returns {html}
   */
  present(data: ArrayBuffer, args: unknown[]) {
    if (!data.byteLength) return "";
    const dataArray = new Uint8Array(data),
      [format] = args;
    if (format === "PNG") {
      const type = isImage(dataArray);
      if (!type) {
        throw new OperationError("Invalid file type.");
      }

      return `<img src="data:${type};base64,${toBase64(dataArray)}">`;
    }

    return Utils.arrayBufferToStr(data);
  }
}

export default GenerateQRCode;
