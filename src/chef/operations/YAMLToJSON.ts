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
import jsYaml from "js-yaml";
/**
 * YAML to JSON operation
 */
export class YAMLToJSON extends Operation {
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
  run(input: any, args: any[]): any {
    try {
      return jsYaml.load(input);
    } catch (err) {
      throw new OperationError("Unable to parse YAML: " + err);
    }
  }
}

export default YAMLToJSON;
