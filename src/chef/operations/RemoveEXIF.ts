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

import { removeEXIF } from "../vendor/remove-exif";
import { Operation } from "../Operation";
import OperationError from "../errors/OperationError";

/**
 * Remove EXIF operation
 */
export class RemoveEXIF extends Operation {
  /**
   * RemoveEXIF constructor
   */
  constructor() {
    super();

    this.name = "Remove EXIF";
    this.module = "Image";
    this.description = [
      "Removes EXIF data from a JPEG image.",
      "<br><br>",
      "EXIF data embedded in photos usually contains information about the image file itself as well as the device used to create it.",
    ].join("\n");
    this.infoURL = "https://wikipedia.org/wiki/Exif";
    this.inputType = "ArrayBuffer";
    this.outputType = "byteArray";
    this.args = [];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {byteArray}
   */
  run(input: any, args: any[]): any {
    input = new Uint8Array(input);
    // Do nothing if input is empty
    if (input.length === 0) return input;

    try {
      return removeEXIF(input);
    } catch (err) {
      // Simply return input if no EXIF data is found
      if (err === "Exif not found.") return input;
      throw new OperationError(`Could not remove EXIF data from image: ${err}`);
    }
  }
}

export default RemoveEXIF;
