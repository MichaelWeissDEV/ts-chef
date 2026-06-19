/**
 * @fileoverview DefangURL operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import { URL_REGEX, DOMAIN_REGEX } from "../lib/Extract";

/**
 * DefangURL operation
 */
export class DefangURL extends TypedOperation<string, AnyInput, unknown[]> {
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
  run(input: string, args: unknown[]): AnyInput {
    const [dots, http, slashes, process] = args as [
      boolean,
      boolean,
      boolean,
      string,
    ];

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
