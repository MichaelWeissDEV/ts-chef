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

import OperationError from "../errors/OperationError";
import { Operation } from "../Operation";
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
  async run(input: any, args: any[]): Promise<any> {
    const result = await terser.minify(input);
    if (result.error) {
      throw new OperationError(`Error minifying JavaScript. (${result.error})`);
    }
    return result.code;
  }
}

export default JavaScriptMinify;
