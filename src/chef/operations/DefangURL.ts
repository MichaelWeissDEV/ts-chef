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
import { URL_REGEX, DOMAIN_REGEX } from "../lib/Extract";

/**
 * DefangURL operation
 */
export class DefangURL extends Operation {
  /**
   * DefangURL constructor
   */
  constructor() {
    super();

    this.name = "Defang URL";
    this.module = "Default";
    this.description =
      "Takes a Universal Resource Locator (URL) and 'Defangs' it; meaning the URL becomes invalid, neutralising the risk of accidentally clicking on a malicious link.<br><br>This is often used when dealing with malicious links or IOCs.<br><br>Works well when combined with the 'Extract URLs' operation.";
    this.infoURL =
      "https://isc.sans.edu/forums/diary/Defang+all+the+things/22744/";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Escape dots",
        type: "boolean",
        value: true,
      },
      {
        name: "Escape http",
        type: "boolean",
        value: true,
      },
      {
        name: "Escape ://",
        type: "boolean",
        value: true,
      },
      {
        name: "Process",
        type: "option",
        value: ["Valid domains and full URLs", "Only full URLs", "Everything"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const [dots, http, slashes, process] = args;

    switch (process) {
      case "Valid domains and full URLs":
        input = input.replace(URL_REGEX, (x: string) => {
          return defangURL(x, dots, http, slashes);
        });
        input = input.replace(DOMAIN_REGEX, (x: string) => {
          return defangURL(x, dots, http, slashes);
        });
        break;
      case "Only full URLs":
        input = input.replace(URL_REGEX, (x: string) => {
          return defangURL(x, dots, http, slashes);
        });
        break;
      case "Everything":
        input = defangURL(input, dots, http, slashes);
        break;
    }

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
function defangURL(
  url: string,
  dots: boolean,
  http: boolean,
  slashes: boolean,
): string {
  if (dots) url = url.replace(/\./g, "[.]");
  if (http) url = url.replace(/http/gi, "hxxp");
  if (slashes) url = url.replace(/:\/\//g, "[://]");

  return url;
}

export default DefangURL;
