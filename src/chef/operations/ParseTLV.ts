/**
 * @fileoverview ParseTLV operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import TLVParser from "../lib/TLVParser";
import OperationError from "../errors/OperationError";

/**
 * Parse TLV operation
 */
export class ParseTLV extends TypedOperation<ArrayBuffer, AnyInput, unknown[]> {
  /**
   * ParseTLV constructor
   */
  constructor() {
    super();

    this.name = "Parse TLV";
    this.module = "Default";
    this.description =
      "Converts a Type-Length-Value (TLV) encoded string into a JSON object.  Can optionally include a <code>Key</code> / <code>Type</code> entry. <br><br>Tags: Key-Length-Value, KLV, Length-Value, LV";
    this.infoURL = "https://wikipedia.org/wiki/Type-length-value";
    this.inputType = "ArrayBuffer";
    this.outputType = "JSON";
    this.args = [
      {
        name: "Type/Key size",
        type: "number",
        value: 1,
      },
      {
        name: "Length size",
        type: "number",
        value: 1,
      },
      {
        name: "Use BER",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: ArrayBuffer, args: unknown[]): AnyInput {
    const [bytesInKey, bytesInLength, basicEncodingRules] = args as [
      number,
      number,
      boolean,
    ];
    const inputBytes = new Uint8Array(input);

    if (bytesInKey <= 0 && bytesInLength <= 0)
      throw new OperationError("Type or Length size must be greater than 0");

    const tlv = new TLVParser(inputBytes, {
      bytesInLength,
      basicEncodingRules,
    });

    const data = [];

    while (!tlv.atEnd()) {
      const key = bytesInKey ? tlv.getValue(bytesInKey) : undefined;
      const length = tlv.getLength();
      const value = tlv.getValue(length);

      data.push({ key, length, value });
    }

    return data;
  }
}

export default ParseTLV;
