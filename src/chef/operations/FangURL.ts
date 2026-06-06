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

/**
 * FangURL operation
 */
export class FangURL extends Operation {
  /**
   * FangURL constructor
   */
  constructor() {
    super();

    this.name = "Fang URL";
    this.module = "Default";
    this.description =
      "Takes a 'Defanged' Universal Resource Locator (URL) and 'Fangs' it. Meaning, it removes the alterations (defanged) that render it useless so that it can be used again.";
    this.infoURL =
      "https://isc.sans.edu/forums/diary/Defang+all+the+things/22744/";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Restore [.]",
        type: "boolean",
        value: true,
      },
      {
        name: "Restore hxxp",
        type: "boolean",
        value: true,
      },
      {
        name: "Restore ://",
        type: "boolean",
        value: true,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const [dots, http, slashes] = args;

    input = fangURL(input, dots, http, slashes);

    return input;
  }
}

/**
 * Defangs a given URL
 *
 * @param {string} url
 * @param {boolean} dots
 * @param {boolean} http
 * @param {boolean} slashes
 * @returns {string}
 */
function fangURL(
  url: string,
  dots: boolean,
  http: boolean,
  slashes: boolean,
): string {
  if (dots) url = url.replace(/\[\.\]/g, ".");
  if (http) url = url.replace(/hxxp/g, "http");
  if (slashes) url = url.replace(/\[:\/\/\]/g, "://");

  return url;
}

export default FangURL;
