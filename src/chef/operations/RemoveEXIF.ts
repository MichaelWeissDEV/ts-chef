/**
 * @fileoverview RemoveEXIF operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { removeEXIF } from "../vendor/remove-exif";
import { TypedOperation, AnyInput } from "../Operation_new";
import OperationError from "../errors/OperationError";

/**
 * Remove EXIF operation
 */
export class RemoveEXIF extends TypedOperation<ArrayBuffer, AnyInput, unknown[]> {
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
  run(input: ArrayBuffer, _args: unknown[]): AnyInput {
    const inputBytes = new Uint8Array(input);
    // Do nothing if input is empty
    if (inputBytes.length === 0) return inputBytes;

    try {
      return removeEXIF(inputBytes);
    } catch (err) {
      // Simply return input if no EXIF data is found
      if (err === "Exif not found.") return inputBytes;
      throw new OperationError(`Could not remove EXIF data from image: ${err}`);
    }
  }
}

export default RemoveEXIF;
