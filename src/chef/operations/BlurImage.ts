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
import { toBase64 } from "../lib/Base64";
import { Jimp, JimpMime } from "jimp";

/**
 * Blur Image operation
 */
export class BlurImage extends Operation {
  /**
   * BlurImage constructor
   */
  constructor() {
    super();

    this.name = "Blur Image";
    this.module = "Image";
    this.description =
      "Applies a blur effect to the image.<br><br>Gaussian blur is much slower than fast blur, but produces better results.";
    this.infoURL = "https://wikipedia.org/wiki/Gaussian_blur";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.presentType = "html";
    this.args = [
      {
        name: "Amount",
        type: "number",
        value: 5,
        min: 1,
      },
      {
        name: "Type",
        type: "option",
        value: ["Fast", "Gaussian"],
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {byteArray}
   */
  async run(input: any, args: any[]): Promise<any> {
    const [blurAmount, blurType] = args;

    if (!isImage(input)) {
      throw new OperationError("Invalid file type.");
    }

    let image;
    try {
      image = await Jimp.read(input);
    } catch (err) {
      throw new OperationError(`Error loading image. (${err})`);
    }
    try {
      switch (blurType) {
        case "Fast":
          image.blur(blurAmount);
          break;
        case "Gaussian":
          image.gaussian(blurAmount);
          break;
      }

      let imageBuffer;
      if (image.mime === "image/gif") {
        imageBuffer = await image.getBuffer(JimpMime.png);
      } else {
        imageBuffer = await image.getBuffer(image.mime as any);
      }
      return imageBuffer.buffer;
    } catch (err) {
      throw new OperationError(`Error blurring image. (${err})`);
    }
  }

  /**
   * Displays the blurred image using HTML for web apps
   *
   * @param {ArrayBuffer} data
   * @returns {html}
   */
  present(data: ArrayBuffer) {
    if (!data.byteLength) return "";
    const dataArray = new Uint8Array(data);

    const type = isImage(dataArray);
    if (!type) {
      throw new OperationError("Invalid file type.");
    }

    return `<img src="data:${type};base64,${toBase64(dataArray)}">`;
  }
}

export default BlurImage;
