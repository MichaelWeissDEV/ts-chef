/**
 * @fileoverview ProtobufEncode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import OperationError from "../errors/OperationError";
import Protobuf from "../lib/Protobuf";

/**
 * Protobuf Encode operation
 */
export class ProtobufEncode extends TypedOperation<AnyInput, AnyInput, unknown[]> {
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
  run(input: AnyInput, args: unknown[]): AnyInput {
    try {
      return Protobuf.encode(input as Record<string, unknown>, args);
    } catch (error) {
      throw new OperationError(
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}

export default ProtobufEncode;
