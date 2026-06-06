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
import rison from "rison";

/**
 * Rison Decode operation
 */
export class RisonDecode extends Operation {
  /**
   * RisonDecode constructor
   */
  constructor() {
    super();

    this.name = "Rison Decode";
    this.module = "Encodings";
    this.description =
      "Rison, a data serialization format optimized for compactness in URIs. Rison is a slight variation of JSON that looks vastly superior after URI encoding. Rison still expresses exactly the same set of data structures as JSON, so data can be translated back and forth without loss or guesswork.";
    this.infoURL = "https://github.com/Nanonid/rison";
    this.inputType = "string";
    this.outputType = "Object";
    this.args = [
      {
        name: "Decode Option",
        type: "editableOption",
        value: ["Decode", "Decode Object", "Decode Array"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {Object}
   */
  run(input: any, args: any[]): any {
    const [decodeOption] = args;
    switch (decodeOption) {
      case "Decode":
        return rison.decode(input);
      case "Decode Object":
        return rison.decode_object(input);
      case "Decode Array":
        return rison.decode_array(input);
      default:
        throw new OperationError("Invalid Decode option");
    }
  }
}

export default RisonDecode;
