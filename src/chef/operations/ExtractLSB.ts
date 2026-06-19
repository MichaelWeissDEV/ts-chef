/**
 * @fileoverview ExtractLSB operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import { fromBinary } from "../lib/Binary";
import { isImage } from "../lib/FileType";
import { Jimp } from "jimp";

/**
 * Extract LSB operation
 */
export class ExtractLSB extends TypedOperation<ArrayBuffer, Promise<AnyInput>, unknown[]> {
  /**
   * ExtractLSB constructor
   */
  constructor() {
    super();

    this.name = "Extract LSB";
    this.module = "Image";
    this.description =
      "Extracts the Least Significant Bit data from each pixel in an image. This is a common way to hide data in Steganography.";
    this.infoURL =
      "https://wikipedia.org/wiki/Bit_numbering#Least_significant_bit_in_digital_steganography";
    this.inputType = "ArrayBuffer";
    this.outputType = "byteArray";
    this.args = [
      {
        name: "Colour Pattern #1",
        type: "option",
        value: COLOUR_OPTIONS,
      },
      {
        name: "Colour Pattern #2",
        type: "option",
        value: ["", ...COLOUR_OPTIONS],
      },
      {
        name: "Colour Pattern #3",
        type: "option",
        value: ["", ...COLOUR_OPTIONS],
      },
      {
        name: "Colour Pattern #4",
        type: "option",
        value: ["", ...COLOUR_OPTIONS],
      },
      {
        name: "Pixel Order",
        type: "option",
        value: ["Row", "Column"],
      },
      {
        name: "Bit",
        type: "number",
        value: 0,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {byteArray}
   */
  async run(input: ArrayBuffer, args: unknown[]): Promise<AnyInput> {
    const [colourPat1, colourPat2, colourPat3, colourPat4, pixelOrder, bit] =
      args as [string, string, string, string, string, number];
    if (!isImage(input))
      throw new OperationError("Please enter a valid image file.");

    const bitIndex = 7 - bit,
      colours = [colourPat1, colourPat2, colourPat3, colourPat4]
        .filter((option) => option !== "")
        .map((option) => COLOUR_OPTIONS.indexOf(option)),
      parsedImage = await Jimp.read(input),
      width = parsedImage.bitmap.width,
      height = parsedImage.bitmap.height,
      rgba = parsedImage.bitmap.data;

    if (bit < 0 || bit > 7) {
      throw new OperationError("Error: Bit argument must be between 0 and 7");
    }

    let i,
      combinedBinary = "";

    if (pixelOrder === "Row") {
      for (i = 0; i < rgba.length; i += 4) {
        for (const colour of colours) {
          combinedBinary += Utils.bin(rgba[i + colour])[bitIndex];
        }
      }
    } else {
      let rowWidth;
      const pixelWidth = width * 4;
      for (let col = 0; col < width; col++) {
        for (let row = 0; row < height; row++) {
          rowWidth = row * pixelWidth;
          for (const colour of colours) {
            i = rowWidth + (col + colour * 4);
            combinedBinary += Utils.bin(rgba[i])[bitIndex];
          }
        }
      }
    }

    return fromBinary(combinedBinary);
  }
}

const COLOUR_OPTIONS = ["R", "G", "B", "A"];

export default ExtractLSB;
