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
import * as avro from "avsc";

/**
 * Avro to JSON operation
 *
 * @category Serialise
 * @see https://wikipedia.org/wiki/Apache_Avro
 */
export class AvroToJSON extends Operation {
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
  async run(input: ArrayBuffer, args: any[]): Promise<string> {
    if (input.byteLength <= 0) {
      throw new OperationError("Please provide an input.");
    }

    const forceJSON = args[0];

    return new Promise((resolve, reject) => {
      const result: any[] = [];
      const inpArray = new Uint8Array(input);
      const decoder = new (avro.streams as any).BlockDecoder();

      decoder
        .on("data", function (obj: any) {
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
            const data = result.reduce(
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
