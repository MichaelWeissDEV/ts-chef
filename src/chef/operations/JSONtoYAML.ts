/**
 * @fileoverview JSONtoYAML operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import OperationError from "../errors/OperationError";
import YAML from "yaml";

/**
 * JSON to YAML operation
 */
export class JSONtoYAML extends TypedOperation<AnyInput, AnyInput, unknown[]> {
  /**
   * JSONtoYAML constructor
   */
  constructor() {
    super();

    this.name = "JSON to YAML";
    this.module = "Default";
    this.description = "Format a JSON object into YAML";
    this.infoURL = "https://en.wikipedia.org/wiki/YAML";
    this.inputType = "JSON";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {JSON} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: AnyInput, _args: unknown[]): AnyInput {
    try {
      return YAML.stringify(input);
    } catch {
      throw new OperationError("Test");
    }
  }
}

export default JSONtoYAML;
