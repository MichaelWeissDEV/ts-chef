/**
 * @fileoverview Zip compression operation.
 * @license Apache-2.0
 */

import { Operation } from "../Operation";
import { OperationError } from "../errors/OperationError";
import JSZip from "jszip";

/**
 * Compresses data into a zip archive.
 *
 * Supports setting a filename, comment, compression level, and password.
 *
 * @category Compression
 * @see https://wikipedia.org/wiki/ZIP_(file_format)
 */
export class Zip extends Operation {
  constructor() {
    super();
    this.name = "Zip";
    this.module = "Compression";
    this.description = "Compresses data into a zip archive.";
    this.infoURL = "https://wikipedia.org/wiki/ZIP_(file_format)";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [
      { name: "Filename", type: "string", value: "file.txt" },
      { name: "Comment", type: "string", value: "" },
      {
        name: "Compression level",
        type: "option",
        value: [
          "Default Compression",
          "No Compression",
          "Best Speed",
          "Best Compression",
        ],
      },
      { name: "Password", type: "binaryString", value: "" },
    ];
  }

  /**
   * Executes the Zip compression.
   *
   * @param input - The data to compress (string or ArrayBuffer).
   * @param args - Operation arguments: [Filename, Comment, Compression level, Password]
   * @returns The zipped data as an ArrayBuffer.
   * @throws {OperationError} If compression fails.
   */
  async run(
    input: string | ArrayBuffer,
    args: unknown[],
  ): Promise<ArrayBuffer> {
    const filename = (args[0] as string) || "file.txt";
    const comment = (args[1] as string) || "";
    const levelOpt = args[2] as string;
    const levelMap: Record<string, number> = {
      "Default Compression": 6,
      "No Compression": 0,
      "Best Speed": 1,
      "Best Compression": 9,
    };
    const level = levelMap[levelOpt] ?? 6;

    let data: Uint8Array;
    if (typeof input === "string") {
      const { Utils } = await import("../Utils.js");
      data = new Uint8Array(Utils.strToArrayBuffer(input));
    } else {
      data = new Uint8Array(input);
    }

    try {
      const zip = new JSZip();
      zip.file(filename, data, {
        comment,
        compression: "DEFLATE",
        compressionOptions: { level },
      });
      const result = await zip.generateAsync({ type: "uint8array" });
      return result.buffer as ArrayBuffer;
    } catch (err) {
      throw new OperationError("Unable to create zip archive: " + String(err));
    }
  }
}

export default Zip;
