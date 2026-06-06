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
import Handlebars from "handlebars";

/**
 * Template operation
 */
export class Template extends Operation {
  /**
   * Template constructor
   */
  constructor() {
    super();

    this.name = "Template";
    this.module = "Handlebars";
    this.description =
      "Render a template with Handlebars/Mustache substituting variables using JSON input. Templates will be rendered to plain-text only, to prevent XSS.";
    this.infoURL = "https://handlebarsjs.com/";
    this.inputType = "JSON";
    this.outputType = "string";
    this.args = [
      {
        name: "Template definition (.handlebars)",
        type: "text",
        value: "",
      },
    ];
  }

  /**
   * @param {JSON} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const [templateStr] = args;
    try {
      const template = Handlebars.compile(templateStr);
      return template(input);
    } catch (e) {
      throw new OperationError(e);
    }
  }
}

export default Template;
