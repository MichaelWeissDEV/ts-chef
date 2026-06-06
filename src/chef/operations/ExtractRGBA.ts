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
import { Jimp } from "jimp";

import { DELIM_OPTIONS as RGBA_DELIM_OPTIONS } from "../lib/Delim";

/**
 * Extract RGBA operation
 */
export class ExtractRGBA extends Operation {
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
  async run(input: any, args: any[]): Promise<any> {
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
