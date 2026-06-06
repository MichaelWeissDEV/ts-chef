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
import Protobuf from "../lib/Protobuf";

/**
 * Protobuf Encode operation
 */
export class ProtobufEncode extends Operation {
  /**
   * ProtobufEncode constructor
   */
  constructor() {
    super();

    this.name = "Protobuf Encode";
    this.module = "Protobuf";
    this.description =
      "Encodes a valid JSON object into a protobuf byte array using the input .proto schema.";
    this.infoURL =
      "https://developers.google.com/protocol-buffers/docs/encoding";
    this.inputType = "JSON";
    this.outputType = "ArrayBuffer";
    this.args = [
      {
        name: "Schema (.proto text)",
        type: "text",
        value: "",
        rows: 8,
        hint: "Drag and drop is enabled on this ingredient",
      },
    ];
  }

  /**
   * @param {Object} input
   * @param {Object[]} args
   * @returns {ArrayBuffer}
   */
  run(input: any, args: any[]): any {
    try {
      return Protobuf.encode(input, args);
    } catch (error) {
      throw new OperationError(
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}

export default ProtobufEncode;
