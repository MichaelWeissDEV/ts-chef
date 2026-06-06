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
import JSZip from "jszip";

export class Unzip extends Operation {
  constructor() {
    super();
    this.name = "Unzip";
    this.module = "Compression";
    this.description =
      "Extracts files from a zip archive. Outputs a summary of all files contained.";
    this.infoURL = "https://wikipedia.org/wiki/ZIP_(file_format)";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      { name: "Password", type: "binaryString", value: "" },
      { name: "Verify", type: "boolean", value: false },
    ];
  }

  async run(input: ArrayBuffer, args: unknown[]): Promise<string> {
    const password = args[0] as string;

    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(input);
    } catch (err) {
      throw new OperationError("Unable to read zip file: " + String(err));
    }

    const files: string[] = [];
    const names = Object.keys(zip.files);

    for (const name of names) {
      const file = zip.files[name];
      if (file.dir) {
        files.push(`[Directory] ${name}`);
      } else {
        try {
          const opts: Parameters<typeof file.async>[0] = "uint8array";
          const data = await (password
            ? zip.file(name)!.async(opts)
            : file.async(opts));
          files.push(`[File] ${name} (${data.length} bytes)`);
        } catch {
          files.push(`[File] ${name} (encrypted or unreadable)`);
        }
      }
    }

    void password;
    return files.join("\n");
  }
}

export default Unzip;
