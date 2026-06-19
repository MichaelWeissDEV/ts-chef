/**
 * @fileoverview RisonEncode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import OperationError from "../errors/OperationError";
import rison from "rison";

/**
 * Rison Encode operation
 */
export class RisonEncode extends TypedOperation<AnyInput, string, unknown[]> {
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
  run(input: AnyInput, args: unknown[]): string {
    const [encodeOption] = args as [string];
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
