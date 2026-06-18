/**
 * @fileoverview AMFDecode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import Operation, { AnyInput } from "../Operation";
import "reflect-metadata"; // Required as a shim for the amf library
import { AMF0, AMF3 } from "@astronautlabs/amf";

/**
 * AMF Decode operation
 *
 * @category Encodings
 * @see https://wikipedia.org/wiki/Action_Message_Format
 * @see AMFEncode
 */
export class AMFDecode extends Operation {
  /**
   * AMFDecode constructor
   */
  constructor() {
    super();

    this.name = "AMF Decode";
    this.module = "Encodings";
    this.description =
      "Action Message Format (AMF) is a binary format used to serialize object graphs such as ActionScript objects and XML, or send messages between an Adobe Flash client and a remote service, usually a Flash Media Server or third party alternatives.";
    this.infoURL = "https://wikipedia.org/wiki/Action_Message_Format";
    this.inputType = "ArrayBuffer";
    this.outputType = "JSON";
    this.args = [
      {
        name: "Format",
        type: "option",
        value: ["AMF0", "AMF3"],
        defaultIndex: 1,
      },
    ];
  }

  /**
   * Runs the operation.
   *
   * @param {ArrayBuffer} input - The AMF encoded data.
   * @param {any[]} args - Operation arguments.
   * @param {string} args[0] - The AMF format version (AMF0 or AMF3).
   * @returns {any} The decoded object.
   */
  run(input: ArrayBuffer, args: unknown[]): AnyInput {
    const format = args[0];
    const handler = format === "AMF0" ? AMF0 : AMF3;
    const encoded = new Uint8Array(input);
    const result = handler.Value.deserialize(encoded);

    return this.unwrap(result);
  }

  private unwrap(obj: AnyInput): AnyInput {
    if (!obj || typeof obj !== "object") return obj;
    const o = obj as {
      value?: AnyInput;
      $value?: AnyInput;
      stringOrReference?: { $value?: AnyInput };
    };
    if (typeof o.value !== "undefined") return o.value;
    if (typeof o.$value !== "undefined") return o.$value;
    if (
      o.stringOrReference &&
      typeof o.stringOrReference.$value !== "undefined"
    )
      return o.stringOrReference.$value;
    return obj;
  }
}

export default AMFDecode;
