/**
 * @fileoverview Template operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import OperationError from "../errors/OperationError";
import Handlebars from "handlebars";

/**
 * Template operation
 */
export class Template extends TypedOperation<AnyInput, AnyInput, unknown[]> {
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
  run(input: AnyInput, args: unknown[]): AnyInput {
    const [templateStr] = args as [string];
    try {
      const template = Handlebars.compile(templateStr);
      return template(input);
    } catch (e) {
      throw new OperationError(e);
    }
  }
}

export default Template;
