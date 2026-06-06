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

export class HTMLToText extends Operation {
  constructor() {
    super();
    this.name = "HTML To Text";
    this.module = "Default";
    this.description =
      "Converts an HTML output from an operation to a readable string instead of being rendered in the DOM.";
    this.infoURL = "";
    this.inputType = "html";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    return input;
  }
}

export default HTMLToText;
