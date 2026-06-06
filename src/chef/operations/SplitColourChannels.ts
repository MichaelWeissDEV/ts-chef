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
  async run(input: any, args: any[]): Promise<any> {
    input = new Uint8Array(input);
    // Make sure that the input is an image
    if (!isImage(input)) throw new OperationError("Invalid file type.");

    const parsedImage = await Jimp.read(Buffer.from(input));

    const red = new Promise(async (resolve, reject) => {
      try {
        const split = parsedImage
          .clone()
          .color([
            { apply: "blue", params: [-255] },
            { apply: "green", params: [-255] },
          ])
          .getBuffer(JimpMime.png);
        resolve(
          new File([new Uint8Array((await split).values())], "red.png", {
            type: "image/png",
          }),
        );
      } catch (err) {
        reject(new OperationError(`Could not split red channel: ${err}`));
      }
    });

    const green = new Promise(async (resolve, reject) => {
      try {
        const split = parsedImage
          .clone()
          .color([
            { apply: "red", params: [-255] },
            { apply: "blue", params: [-255] },
          ])
          .getBuffer(JimpMime.png);
        resolve(
          new File([new Uint8Array((await split).values())], "green.png", {
            type: "image/png",
          }),
        );
      } catch (err) {
        reject(new OperationError(`Could not split green channel: ${err}`));
      }
    });

    const blue = new Promise(async (resolve, reject) => {
      try {
        const split = parsedImage
          .color([
            { apply: "red", params: [-255] },
            { apply: "green", params: [-255] },
          ])
          .getBuffer(JimpMime.png);
        resolve(
          new File([new Uint8Array((await split).values())], "blue.png", {
            type: "image/png",
          }),
        );
      } catch (err) {
        reject(new OperationError(`Could not split blue channel: ${err}`));
      }
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
