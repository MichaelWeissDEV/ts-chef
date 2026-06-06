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
import "reflect-metadata"; // Required as a shim for the amf library
import { AMF0, AMF3 } from "@astronautlabs/amf";

/**
 * AMF Encode operation
 *
 * @category Encodings
 */
export class AMFEncode extends Operation {
  /**
   * AMFEncode constructor
   */
  constructor() {
    super();

    this.name = "AMF Encode";
    this.module = "Encodings";
    this.description =
      "Action Message Format (AMF) is a binary format used to serialize object graphs such as ActionScript objects and XML, or send messages between an Adobe Flash client and a remote service, usually a Flash Media Server or third party alternatives.";
    this.infoURL = "https://wikipedia.org/wiki/Action_Message_Format";
    this.inputType = "JSON";
    this.outputType = "ArrayBuffer";
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
   * @param {any} input - The JSON object to encode.
   * @param {any[]} args - Operation arguments.
   * @param {string} args[0] - The format to use (AMF0 or AMF3).
   * @returns {ArrayBuffer} - The encoded AMF data.
   *
   * @see {@link AMFDecode}
   */
  run(input: any, args: any[]): ArrayBuffer {
    const format = args[0];
    const handler = format === "AMF0" ? AMF0 : AMF3;
    const output = handler.Value.any(input).serialize();
    return output.buffer as ArrayBuffer;
  }
}

export default AMFEncode;
