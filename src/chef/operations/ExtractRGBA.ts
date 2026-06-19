/**
 * @fileoverview ExtractRGBA operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import OperationError from "../errors/OperationError";
import { isImage } from "../lib/FileType";
import { Jimp } from "jimp";

import { DELIM_OPTIONS as RGBA_DELIM_OPTIONS } from "../lib/Delim";

/**
 * Extract RGBA operation
 */
export class ExtractRGBA extends TypedOperation<ArrayBuffer, Promise<AnyInput>, unknown[]> {
  /**
   * ExtractRGBA constructor
   */
  constructor() {
    super();

    this.name = "Extract RGBA";
    this.module = "Image";
    this.description =
      "Extracts each pixel's RGBA value in an image. These are sometimes used in Steganography to hide text or data.";
    this.infoURL = "https://wikipedia.org/wiki/RGBA_color_space";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Delimiter",
        type: "editableOption",
        value: RGBA_DELIM_OPTIONS,
      },
      {
        name: "Include Alpha",
        type: "boolean",
        value: true,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  async run(input: ArrayBuffer, args: unknown[]): Promise<AnyInput> {
    if (!isImage(input))
      throw new OperationError("Please enter a valid image file.");

    const delimiter = args[0],
      includeAlpha = args[1],
      parsedImage = await Jimp.read(input);

    let bitmap = parsedImage.bitmap.data as any;
    bitmap = includeAlpha
      ? bitmap
      : bitmap.filter((val: any, idx: number) => idx % 4 !== 3);

    return bitmap.join(delimiter);
  }
}

export default ExtractRGBA;
