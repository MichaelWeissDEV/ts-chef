/**
 * @fileoverview ImageHueSaturationLightness operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import OperationError from "../errors/OperationError";
import { isImage } from "../lib/FileType";
import { toBase64 } from "../lib/Base64";
import { Jimp, JimpMime } from "jimp";

/**
 * Image Hue/Saturation/Lightness operation
 */
export class ImageHueSaturationLightness extends TypedOperation<ArrayBuffer, Promise<AnyInput>, unknown[]> {
  /**
   * ImageHueSaturationLightness constructor
   */
  constructor() {
    super();

    this.name = "Image Hue/Saturation/Lightness";
    this.module = "Image";
    this.description =
      "Adjusts the hue / saturation / lightness (HSL) values of an image.";
    this.infoURL = "";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.presentType = "html";
    this.args = [
      {
        name: "Hue",
        type: "number",
        value: 0,
        min: -360,
        max: 360,
      },
      {
        name: "Saturation",
        type: "number",
        value: 0,
        min: -100,
        max: 100,
      },
      {
        name: "Lightness",
        type: "number",
        value: 0,
        min: -100,
        max: 100,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {byteArray}
   */
  async run(input: ArrayBuffer, args: unknown[]): Promise<AnyInput> {
    const [hue, saturation, lightness] = args as [number, number, number];

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
      if (hue !== 0) {
        image.color([
          {
            apply: "hue",
            params: [hue],
          },
        ]);
      }
      if (saturation !== 0) {
        image.color([
          {
            apply: "saturate",
            params: [saturation],
          },
        ]);
      }
      if (lightness !== 0) {
        image.color([
          {
            apply: "lighten",
            params: [lightness],
          },
        ]);
      }

      let imageBuffer;
      if (image.mime === "image/gif") {
        imageBuffer = await image.getBuffer(JimpMime.png);
      } else {
        imageBuffer = await image.getBuffer(
          image.mime as
            | "image/jpeg"
            | "image/gif"
            | "image/png"
            | "image/tiff"
            | "image/bmp"
            | "image/x-ms-bmp",
        );
      }
      return imageBuffer.buffer;
    } catch (err) {
      throw new OperationError(
        `Error adjusting image hue / saturation / lightness. (${err})`,
      );
    }
  }

  /**
   * Displays the image using HTML for web apps
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

export default ImageHueSaturationLightness;
