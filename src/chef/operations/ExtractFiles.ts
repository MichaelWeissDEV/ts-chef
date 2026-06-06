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
import { scanForFileTypes, extractFile } from "../lib/FileType";
import { FILE_SIGNATURES } from "../lib/FileSignatures";

/**
 * Extract Files operation
 */
export class ExtractFiles extends Operation {
  /**
   * ExtractFiles constructor
   */
  constructor() {
    super();

    // Get the first extension for each signature that can be extracted
    let supportedExts = Object.keys(FILE_SIGNATURES).map((cat) => {
      return FILE_SIGNATURES[cat]
        .filter((sig) => sig.extractor)
        .map((sig) => sig.extension.toUpperCase());
    });

    // Flatten categories and remove duplicates
    const flattenedExts: string[] = [].concat(...(supportedExts as any));
    const uniqueExts = [...new Set(flattenedExts)];

    this.name = "Extract Files";
    this.module = "Default";
    this.description = `Performs file carving to attempt to extract files from the input.<br><br>This operation is currently capable of carving out the following formats:
            <ul>
                <li>
                ${uniqueExts.join("</li><li>")}
                </li>
            </ul>Minimum File Size can be used to prune small false positives.`;
    this.infoURL = "https://forensics.wiki/file_carving";
    this.inputType = "ArrayBuffer";
    this.outputType = "List<File>";
    this.presentType = "html";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.args = (
      Object.keys(FILE_SIGNATURES).map((cat) => {
        return {
          name: cat,
          type: "boolean",
          value: cat === "Miscellaneous" ? false : true,
        };
      }) as any[]
    ).concat([
      {
        name: "Ignore failed extractions",
        type: "boolean",
        value: true,
      },
      {
        name: "Minimum File Size",
        type: "number",
        value: 100,
      },
    ]);
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {List<File>}
   */
  run(input: any, args: any[]): any {
    const bytes = new Uint8Array(input),
      categories: string[] = [],
      minSize = args.pop(),
      ignoreFailedExtractions = args.pop();

    args.forEach((cat, i) => {
      if (cat) categories.push(Object.keys(FILE_SIGNATURES)[i]);
    });

    // Scan for embedded files
    const detectedFiles = scanForFileTypes(bytes, categories);

    // Extract each file that we support
    const files: any[] = [];
    const errors: string[] = [];
    detectedFiles.forEach((detectedFile) => {
      try {
        const file = extractFile(
          bytes,
          detectedFile.fileDetails,
          detectedFile.offset,
        );
        if (file.size >= minSize) files.push(file);
      } catch (err: any) {
        if (
          !ignoreFailedExtractions &&
          err.message.indexOf("No extraction algorithm available") < 0
        ) {
          errors.push(
            `Error while attempting to extract ${detectedFile.fileDetails.name} ` +
              `at offset ${detectedFile.offset}:\n` +
              `${err.message}`,
          );
        }
      }
    });

    if (errors.length) {
      throw new OperationError(errors.join("\n\n"));
    }

    return files;
  }

  /**
   * Displays the files in HTML for web apps.
   *
   * @param {File[]} files
   * @returns {html}
   */
  async present(files: any[]) {
    return await (Utils as any).displayFilesAsHTML(files);
  }
}

export default ExtractFiles;
