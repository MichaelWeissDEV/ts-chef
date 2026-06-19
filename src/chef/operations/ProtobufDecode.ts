/**
 * @fileoverview ProtobufDecode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import OperationError from "../errors/OperationError";
import Protobuf from "../lib/Protobuf";

/**
 * Protobuf Decode operation
 */
export class ProtobufDecode extends TypedOperation<ArrayBuffer, AnyInput, unknown[]> {
  /**
   * ProtobufDecode constructor
   */
  constructor() {
    super();

    this.name = "Protobuf Decode";
    this.module = "Protobuf";
    this.description =
      "Decodes any Protobuf encoded data to a JSON representation of the data using the field number as the field key.<br><br>If a .proto schema is defined, the encoded data will be decoded with reference to the schema. Only one message instance will be decoded. <br><br><u>Show Unknown Fields</u><br>When a schema is used, this option shows fields that are present in the input data but not defined in the schema.<br><br><u>Show Types</u><br>Show the type of a field next to its name. For undefined fields, the wiretype and example types are shown instead.";
    this.infoURL = "https://wikipedia.org/wiki/Protocol_Buffers";
    this.inputType = "ArrayBuffer";
    this.outputType = "JSON";
    this.args = [
      {
        name: "Schema (.proto text)",
        type: "text",
        value: "",
        rows: 8,
        hint: "Drag and drop is enabled on this ingredient",
      },
      {
        name: "Show Unknown Fields",
        type: "boolean",
        value: false,
      },
      {
        name: "Show Types",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {JSON}
   */
  run(input: ArrayBuffer, args: unknown[]): AnyInput {
    const inputBytes = new Uint8Array(input);
    try {
      return Protobuf.decode(inputBytes, args);
    } catch (err) {
      throw new OperationError(
        err instanceof Error ? err.message : String(err),
      );
    }
  }
}

export default ProtobufDecode;
