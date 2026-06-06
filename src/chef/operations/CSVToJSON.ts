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

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import { Utils } from "../Utils";

/**
 * CSV to JSON operation
 *
 * @category Data formats
 * @see Utils.parseCSV
 */
export class CSVToJSON extends Operation {
  /**
   * CSVToJSON constructor
   */
  constructor() {
    super();

    this.name = "CSV to JSON";
    this.module = "Default";
    this.description = "Converts a CSV file to JSON format.";
    this.infoURL = "https://wikipedia.org/wiki/Comma-separated_values";
    this.inputType = "string";
    this.outputType = "JSON";
    this.args = [
      {
        name: "Cell delimiters",
        type: "binaryShortString",
        value: ",",
      },
      {
        name: "Row delimiters",
        type: "binaryShortString",
        value: "\\r\\n",
      },
      {
        name: "Format",
        type: "option",
        value: ["Array of dictionaries", "Array of arrays"],
      },
    ];
  }

  /**
   * @param {string} input - The CSV string to convert.
   * @param {any[]} args - Operation arguments.
   * @param {string} args[0] - Cell delimiters.
   * @param {string} args[1] - Row delimiters.
   * @param {string} args[2] - Format ("Array of dictionaries" or "Array of arrays").
   * @returns {unknown} - The converted JSON.
   */
  run(input: string, args: any[]): unknown {
    const [cellDelims, rowDelims, format] = args;

    let json: string[][];
    try {
      json = Utils.parseCSV(input, cellDelims.split(""), rowDelims.split(""));
    } catch (err: any) {
      throw new OperationError("Unable to parse CSV: " + err);
    }

    switch (format) {
      case "Array of dictionaries":
        const header = json[0] as string[];
        return json.slice(1).map((row) => {
          const obj: Record<string, string> = {};
          header.forEach((h, i) => {
            obj[h] = row[i];
          });
          return obj;
        });
      case "Array of arrays":
      default:
        return json;
    }
  }
}

export default CSVToJSON;
