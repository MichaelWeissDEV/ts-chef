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
import { detectFileType } from "../lib/FileType";
import { FILE_SIGNATURES } from "../lib/FileSignatures";

// Concat all supported extensions into a single flat list
const _allExts: string[][] = Object.keys(FILE_SIGNATURES).map((cat) =>
  ([] as string[]).concat(
    ...FILE_SIGNATURES[cat].map((sig: { extension: string }) =>
      sig.extension.split(","),
    ),
  ),
);
const exts = [...new Set(([] as string[]).concat(..._allExts))]
  .sort()
  .join(", ");

/**
 * Detect File Type operation
 */
export class DetectFileType extends Operation {
  /**
   * DetectFileType constructor
   */
  constructor() {
    super();

    this.name = "Detect File Type";
    this.module = "Default";
    this.description =
      "Attempts to guess the MIME (Multipurpose Internet Mail Extensions) type of the data based on 'magic bytes'.<br><br>Currently supports the following file types: " +
      exts +
      ".";
    this.infoURL = "https://wikipedia.org/wiki/List_of_file_signatures";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = Object.keys(FILE_SIGNATURES).map((cat) => {
      return {
        name: cat,
        type: "boolean",
        value: true,
      };
    });
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const data = new Uint8Array(input),
      categories: string[] = [];

    args.forEach((cat, i) => {
      if (cat) categories.push(Object.keys(FILE_SIGNATURES)[i]);
    });

    const types = detectFileType(data, categories);

    if (!types.length) {
      return "Unknown file type. Have you tried checking the entropy of this data to determine whether it might be encrypted or compressed?";
    } else {
      const results = types.map((type) => {
        let output = `File type:   ${type.name}
Extension:   ${type.extension}
MIME type:   ${type.mime}\n`;

        if (type?.description?.length) {
          output += `Description: ${type.description}\n`;
        }

        return output;
      });

      return results.join("\n");
    }
  }
}

export default DetectFileType;
