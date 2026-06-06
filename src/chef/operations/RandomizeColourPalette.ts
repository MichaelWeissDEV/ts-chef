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
import Utils from "../Utils";
import { isImage } from "../lib/FileType";
import { runHash } from "../lib/Hash";
import { toBase64 } from "../lib/Base64";
import { Jimp } from "jimp";

/**
 * Randomize Colour Palette operation
 */
export class RandomizeColourPalette extends Operation {
  /**
   * RandomizeColourPalette constructor
   */
  constructor() {
    super();

    this.name = "Randomize Colour Palette";
    this.module = "Image";
    this.description =
      "Randomizes each colour in an image's colour palette. This can often reveal text or symbols that were previously a very similar colour to their surroundings, a technique sometimes used in Steganography.";
    this.infoURL = "https://wikipedia.org/wiki/Indexed_color";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.presentType = "html";
    this.args = [
      {
        name: "Seed",
        type: "string",
        value: "",
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {ArrayBuffer}
   */
  async run(input: any, args: any[]): Promise<any> {
    if (!isImage(input))
      throw new OperationError("Please enter a valid image file.");

    const seed = args[0] || Math.random().toString().substr(2),
      parsedImage = await Jimp.read(input),
      width = parsedImage.bitmap.width,
      height = parsedImage.bitmap.height;

    let rgbString, rgbHash, rgbHex;

    parsedImage.scan(0, 0, width, height, (x, y, idx) => {
      rgbString = parsedImage.bitmap.data.slice(idx, idx + 3).join(".");
      rgbHash = runHash("md5", Utils.strToArrayBuffer(seed + rgbString));
      rgbHex = rgbHash.substr(0, 6) + "ff";
      parsedImage.setPixelColor(parseInt(rgbHex, 16), x, y);
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
  present(data: ArrayBuffer) {
    if (!data.byteLength) return "";
    const type = isImage(data);

    return `<img src="data:${type};base64,${toBase64(data)}">`;
  }
}

export default RandomizeColourPalette;
