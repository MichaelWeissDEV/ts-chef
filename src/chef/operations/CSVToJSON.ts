/**
 * @fileoverview CSVToJSON operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation,  AnyInput  } from "../Operation";
import OperationError from "../errors/OperationError";
import { Utils } from "../Utils";

/**
 * CSV to JSON operation
 *
 * @category Data formats
 * @see Utils.parseCSV
 */
export class CSVToJSON extends TypedOperation<string, AnyInput, string[]> {
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
  run(input: string, args: string[]): AnyInput {
    const [cellDelims, rowDelims, format] = args;

    let json: string[][];
    try {
      // binaryShortString arguments store escaped control characters (for
      // example the default "\\r\\n") in their printable form. Decode those
      // escapes before handing the individual delimiters to the CSV parser.
      const cells = Array.from(Utils.parseEscapedChars(cellDelims));
      const rows = Array.from(Utils.parseEscapedChars(rowDelims));
      json = Utils.parseCSV(input, cells, rows);
    } catch (err) {
      throw new OperationError("Unable to parse CSV: " + String(err));
    }

    switch (format) {
      case "Array of dictionaries": {
        const header = json[0] as string[];
        return json.slice(1).map((row) => {
          const obj: Record<string, string> = {};
          header.forEach((h, i) => {
            obj[h] = row[i];
          });
          return obj;
        });
      }
      case "Array of arrays":
      default:
        return json;
    }
  }
}

export default CSVToJSON;
