/**
 * @fileoverview YAMLToJSON operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import OperationError from "../errors/OperationError";
import jsYaml from "js-yaml";
/**
 * YAML to JSON operation
 */
export class YAMLToJSON extends TypedOperation<AnyInput, AnyInput, unknown[]> {
  /**
   * YAMLToJSON constructor
   */
  constructor() {
    super();

    this.name = "YAML to JSON";
    this.module = "Default";
    this.description = "Convert YAML to JSON";
    this.infoURL = "https://en.wikipedia.org/wiki/YAML";
    this.inputType = "string";
    this.outputType = "JSON";
    this.args = [];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {JSON}
   */
  run(input: AnyInput, _args: unknown[]): AnyInput {
    try {
      return jsYaml.load(input as string);
    } catch (err) {
      throw new OperationError("Unable to parse YAML: " + err);
    }
  }
}

export default YAMLToJSON;
