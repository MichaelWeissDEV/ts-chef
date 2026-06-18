/**
 * @fileoverview JavaScriptMinify operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import OperationError from "../errors/OperationError";
import { Operation, AnyInput } from "../Operation";
import * as terser from "terser";

/**
 * JavaScript Minify operation
 */
export class JavaScriptMinify extends Operation {
  /**
   * JavaScriptMinify constructor
   */
  constructor() {
    super();

    this.name = "JavaScript Minify";
    this.module = "Code";
    this.description = "Compresses JavaScript code.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  async run(input: string, _args: unknown[]): Promise<AnyInput> {
    const result = await terser.minify(input);
    if (result.error) {
      throw new OperationError(`Error minifying JavaScript. (${result.error})`);
    }
    return result.code;
  }
}

export default JavaScriptMinify;
