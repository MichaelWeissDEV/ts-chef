/**
 * @fileoverview ResizeImage operation - Ported from GCHQ's CyberChef
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
import { Jimp, JimpMime, ResizeStrategy } from "jimp";

/**
 * Resize Image operation
 */
export class ResizeImage extends TypedOperation<ArrayBuffer, Promise<ArrayBuffer>, unknown[]> {
  /**
   * ResizeImage constructor
   */
  constructor() {
    super();

    this.name = "Resize Image";
    this.module = "Image";
    this.description =
      "Resizes an image to the specified width and height values.";
    this.infoURL = "https://wikipedia.org/wiki/Image_scaling";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.presentType = "html";
    this.args = [
      {
        name: "Width",
        type: "number",
        value: 100,
        min: 1,
      },
      {
        name: "Height",
        type: "number",
        value: 100,
        min: 1,
      },
      {
        name: "Unit type",
        type: "option",
        value: ["Pixels", "Percent"],
      },
      {
        name: "Maintain aspect ratio",
        type: "boolean",
        value: false,
      },
      {
        name: "Resizing algorithm",
        type: "option",
        value: [
          "Nearest Neighbour",
          "Bilinear",
          "Bicubic",
          "Hermite",
          "Bezier",
        ],
        defaultIndex: 1,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {byteArray}
   */
  async run(input: ArrayBuffer, args: unknown[]): Promise<ArrayBuffer> {
    const [widthArg, heightArg, unit, aspect, resizeAlg] = args as [
      number,
      number,
      string,
      boolean,
      string,
    ];
    let width = widthArg,
      height = heightArg;

    const resizeMap = {
      "Nearest Neighbour": ResizeStrategy.NEAREST_NEIGHBOR,
      Bilinear: ResizeStrategy.BILINEAR,
      Bicubic: ResizeStrategy.BICUBIC,
      Hermite: ResizeStrategy.HERMITE,
      Bezier: ResizeStrategy.BEZIER,
    };

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
      if (unit === "Percent") {
        width = image.width * (width / 100);
        height = image.height * (height / 100);
      }

      if (aspect) {
        image.scaleToFit({
          w: width,
          h: height,
          mode: resizeMap[resizeAlg],
        });
      } else {
        image.resize({
          w: width,
          h: height,
          mode: resizeMap[resizeAlg],
        });
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
      throw new OperationError(`Error resizing image. (${err})`);
    }
  }

  /**
   * Displays the resized image using HTML for web apps
   * @param {ArrayBuffer} data
   * @returns {html}
   */
  present(data: AnyInput, _args: unknown[]): AnyInput {
    const buf = data as ArrayBuffer;
    if (!buf.byteLength) return "";
    const dataArray = new Uint8Array(buf);

    const type = isImage(dataArray);
    if (!type) {
      throw new OperationError("Invalid file type.");
    }

    return `<img src="data:${type};base64,${toBase64(dataArray)}">`;
  }
}

export default ResizeImage;
