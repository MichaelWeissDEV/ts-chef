/**
 * @fileoverview ViewBitPlane operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import { isImage } from "../lib/FileType";
import { toBase64 } from "../lib/Base64";
import { Jimp } from "jimp";

/**
 * View Bit Plane operation
 */
export class ViewBitPlane extends TypedOperation<AnyInput, Promise<AnyInput>, unknown[]> {
  /**
   * ViewBitPlane constructor
   */
  constructor() {
    super();

    this.name = "View Bit Plane";
    this.module = "Image";
    this.description =
      "Extracts and displays a bit plane of any given image. These show only a single bit from each pixel, and can be used to hide messages in Steganography.";
    this.infoURL = "https://wikipedia.org/wiki/Bit_plane";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.presentType = "html";
    this.args = [
      {
        name: "Colour",
        type: "option",
        value: COLOUR_OPTIONS,
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
   * @returns {ArrayBuffer}
   */
  async run(input: AnyInput, args: unknown[]): Promise<AnyInput> {
    if (!isImage(input as ArrayBuffer))
      throw new OperationError("Please enter a valid image file.");

    const [colour, bit] = args as [string, number],
      parsedImage = await Jimp.read(input as ArrayBuffer),
      width = parsedImage.bitmap.width,
      height = parsedImage.bitmap.height,
      colourIndex = COLOUR_OPTIONS.indexOf(colour),
      bitIndex = 7 - bit;

    if (bit < 0 || bit > 7) {
      throw new OperationError("Error: Bit argument must be between 0 and 7");
    }

    let pixel, bin, newPixelValue;

    parsedImage.scan(0, 0, width, height, (x, y, idx) => {
      pixel = parsedImage.bitmap.data[idx + colourIndex];
      bin = Utils.bin(pixel);
      newPixelValue = 255;

      if (bin.charAt(bitIndex) === "1") newPixelValue = 0;

      for (let i = 0; i < 3; i++) {
        parsedImage.bitmap.data[idx + i] = newPixelValue;
      }
      parsedImage.bitmap.data[idx + 3] = 255;
    });

    const imageBuffer = await parsedImage.getBuffer(
      parsedImage.mime as
        | "image/jpeg"
        | "image/gif"
        | "image/png"
        | "image/tiff"
        | "image/bmp"
        | "image/x-ms-bmp",
    );

    return new Uint8Array(imageBuffer).buffer;
  }

  /**
   * Displays the extracted data as an image for web apps.
   * @param {ArrayBuffer} data
   * @returns {html}
   */
  present(data: ArrayBuffer): string {
    if (!data.byteLength) return "";
    const type = isImage(data);

    return `<img src="data:${type};base64,${toBase64(data)}">`;
  }
}

const COLOUR_OPTIONS = ["Red", "Green", "Blue", "Alpha"];

export default ViewBitPlane;
