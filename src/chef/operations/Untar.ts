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
import { OperationError } from "../errors/OperationError";

export class Untar extends Operation {
  constructor() {
    super();
    this.name = "Untar";
    this.module = "Compression";
    this.description =
      "Extracts files from a tar archive. Outputs a summary of all contained files.";
    this.infoURL = "https://wikipedia.org/wiki/Tar_(computing)";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [];
  }

  run(input: ArrayBuffer, _args: unknown[]): string {
    const bytes = new Uint8Array(input);
    const files: string[] = [];
    let offset = 0;

    function readString(start: number, len: number): string {
      let s = "";
      for (let i = start; i < start + len; i++) {
        if (bytes[i] === 0) break;
        s += String.fromCharCode(bytes[i]);
      }
      return s;
    }

    while (offset + 512 <= bytes.length) {
      const name = readString(offset, 100);
      if (!name) break;

      const sizeOct = readString(offset + 124, 12).trim();
      const size = parseInt(sizeOct, 8) || 0;
      const typeflag = String.fromCharCode(bytes[offset + 156]);

      if (typeflag === "0" || typeflag === "\0" || typeflag === "") {
        files.push(`[File] ${name} (${size} bytes)`);
      } else if (typeflag === "5") {
        files.push(`[Directory] ${name}`);
      } else if (typeflag === "2") {
        const linkname = readString(offset + 157, 100);
        files.push(`[Symlink] ${name} -> ${linkname}`);
      } else {
        files.push(`[${typeflag}] ${name}`);
      }

      offset += 512 + Math.ceil(size / 512) * 512;
    }

    if (files.length === 0) {
      throw new OperationError("No files found in tar archive");
    }

    return files.join("\n");
  }
}

export default Untar;
