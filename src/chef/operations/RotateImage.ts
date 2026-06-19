/**
 * @fileoverview RotateImage operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import OperationError from "../errors/OperationError";
import { isImage } from "../lib/FileType";
import { toBase64 } from "../lib/Base64";
import { Jimp, JimpMime } from "jimp";

/**
 * Rotate Image operation
 */
export class RotateImage extends TypedOperation<ArrayBuffer, Promise<ArrayBuffer>, unknown[]> {
  /**
   * RotateImage constructor
   */
  constructor() {
    super();

    this.name = "Rotate Image";
    this.module = "Image";
    this.description = "Rotates an image by the specified number of degrees.";
    this.infoURL = "";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.presentType = "html";
    this.args = [
      {
        name: "Rotation amount (degrees)",
        type: "number",
        value: 90,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {byteArray}
   */
  async run(input: ArrayBuffer, args: unknown[]): Promise<ArrayBuffer> {
    const [degrees] = args as [number];

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
      image.rotate(degrees);

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
      throw new OperationError(`Error rotating image. (${err})`);
    }
  }

  /**
   * Displays the rotated image using HTML for web apps
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

export default RotateImage;
