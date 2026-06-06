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
import YAML from "yaml";

/**
 * JSON to YAML operation
 */
export class JSONtoYAML extends Operation {
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
  run(input: any, args: any[]): any {
    try {
      return YAML.stringify(input);
    } catch (err) {
      throw new OperationError("Test");
    }
  }
}

export default JSONtoYAML;
