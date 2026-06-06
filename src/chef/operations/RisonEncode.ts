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
 * Rison Encode operation
 */
export class RisonEncode extends Operation {
  /**
   * RisonEncode constructor
   */
  constructor() {
    super();

    this.name = "Rison Encode";
    this.module = "Encodings";
    this.description =
      "Rison, a data serialization format optimized for compactness in URIs. Rison is a slight variation of JSON that looks vastly superior after URI encoding. Rison still expresses exactly the same set of data structures as JSON, so data can be translated back and forth without loss or guesswork.";
    this.infoURL = "https://github.com/Nanonid/rison";
    this.inputType = "Object";
    this.outputType = "string";
    this.args = [
      {
        name: "Encode Option",
        type: "option",
        value: ["Encode", "Encode Object", "Encode Array", "Encode URI"],
      },
    ];
  }

  /**
   * @param {Object} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const [encodeOption] = args;
    switch (encodeOption) {
      case "Encode":
        return rison.encode(input);
      case "Encode Object":
        return rison.encode_object(input);
      case "Encode Array":
        return rison.encode_array(input);
      case "Encode URI":
        return rison.encode_uri(input);
      default:
        throw new OperationError("Invalid encode option");
    }
  }
}

export default RisonEncode;
