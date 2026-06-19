/**
 * @fileoverview GenerateQRCode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import OperationError from "../errors/OperationError";
import { generateQrCode } from "../lib/QRCode";
import { toBase64 } from "../lib/Base64";
import { isImage } from "../lib/FileType";
import Utils from "../Utils";

/**
 * Generate QR Code operation
 */
export class GenerateQRCode extends TypedOperation<string, AnyInput, unknown[]> {
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
  run(input: string, args: unknown[]): AnyInput {
    const [format, size, margin, errorCorrection] = args as [
      string,
      number,
      number,
      string,
    ];

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
