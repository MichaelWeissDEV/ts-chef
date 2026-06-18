/**
 * @fileoverview SplitColourChannels operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import { isImage } from "../lib/FileType";
import { Jimp, JimpMime } from "jimp";

/**
 * Split Colour Channels operation
 */
export class SplitColourChannels extends Operation {
  /**
   * SplitColourChannels constructor
   */
  constructor() {
    super();

    this.name = "Split Colour Channels";
    this.module = "Image";
    this.description =
      "Splits the given image into its red, green and blue colour channels.";
    this.infoURL = "https://wikipedia.org/wiki/Channel_(digital_image)";
    this.inputType = "ArrayBuffer";
    this.outputType = "List<File>";
    this.presentType = "html";
    this.args = [];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {List<File>}
   */
  async run(input: AnyInput, _args: unknown[]): Promise<AnyInput> {
    const inputBytes = new Uint8Array(input as ArrayBuffer);
    // Make sure that the input is an image
    if (!isImage(inputBytes)) throw new OperationError("Invalid file type.");

    const parsedImage = await Jimp.read(Buffer.from(inputBytes));

    const red = parsedImage
      .clone()
      .color([
        { apply: "blue", params: [-255] },
        { apply: "green", params: [-255] },
      ])
      .getBuffer(JimpMime.png)
      .then(
        (split) =>
          new File([new Uint8Array(split.values())], "red.png", {
            type: "image/png",
          }),
      )
      .catch((err: unknown) => {
        throw new OperationError(`Could not split red channel: ${err}`);
      });

    const green = parsedImage
      .clone()
      .color([
        { apply: "red", params: [-255] },
        { apply: "blue", params: [-255] },
      ])
      .getBuffer(JimpMime.png)
      .then(
        (split) =>
          new File([new Uint8Array(split.values())], "green.png", {
            type: "image/png",
          }),
      )
      .catch((err: unknown) => {
        throw new OperationError(`Could not split green channel: ${err}`);
      });

    const blue = parsedImage
      .color([
        { apply: "red", params: [-255] },
        { apply: "green", params: [-255] },
      ])
      .getBuffer(JimpMime.png)
      .then(
        (split) =>
          new File([new Uint8Array(split.values())], "blue.png", {
            type: "image/png",
          }),
      )
      .catch((err: unknown) => {
        throw new OperationError(`Could not split blue channel: ${err}`);
      });

    return await Promise.all([red, green, blue]);
  }

  /**
   * Displays the files in HTML for web apps.
   *
   * @param {File[]} files
   * @returns {html}
   */
  async present(files: File[]) {
    return await (Utils as any).displayFilesAsHTML(files);
  }
}

export default SplitColourChannels;
