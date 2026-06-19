/**
 * @fileoverview AvroToJSON operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import OperationError from "../errors/OperationError";
import * as avro from "avsc";

/**
 * Avro to JSON operation
 *
 * @category Serialise
 * @see https://wikipedia.org/wiki/Apache_Avro
 */
export class AvroToJSON extends TypedOperation<ArrayBuffer, Promise<string>, unknown[]> {
  /**
   * AvroToJSON constructor
   */
  constructor() {
    super();

    this.name = "Avro to JSON";
    this.module = "Serialise";
    this.description = "Converts Avro encoded data into JSON.";
    this.infoURL = "https://wikipedia.org/wiki/Apache_Avro";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Force Valid JSON",
        type: "boolean",
        value: true,
      },
    ];
  }

  /**
   * Runs the Avro to JSON operation.
   *
   * @param {ArrayBuffer} input - The Avro encoded data.
   * @param {any[]} args - The operation arguments.
   * @returns {Promise<string>} The resulting JSON string.
   * @throws {OperationError} If parsing fails or input is empty.
   */
  async run(input: ArrayBuffer, args: unknown[]): Promise<string> {
    if (input.byteLength <= 0) {
      throw new OperationError("Please provide an input.");
    }

    const forceJSON = args[0];

    return new Promise((resolve, reject) => {
      const result: unknown[] = [];
      const inpArray = new Uint8Array(input);
      const decoder = new avro.streams.BlockDecoder();

      decoder
        .on("data", function (obj: unknown) {
          result.push(obj);
        })
        .on("error", function () {
          reject(new OperationError("Error parsing Avro file."));
        })
        .on("end", function () {
          if (forceJSON) {
            resolve(
              result.length === 1
                ? JSON.stringify(result[0], null, 4)
                : JSON.stringify(result, null, 4),
            );
          } else {
            const data = result.reduce<string>(
              (res, current) => res + JSON.stringify(current) + "\n",
              "",
            );
            resolve(data);
          }
        });

      decoder.write(Buffer.from(inpArray));
      decoder.end();
    });
  }
}

export default AvroToJSON;
