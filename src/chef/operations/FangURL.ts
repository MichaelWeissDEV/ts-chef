/**
 * @fileoverview FangURL operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";

/**
 * FangURL operation
 */
export class FangURL extends TypedOperation<string, AnyInput, unknown[]> {
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
  run(input: string, args: unknown[]): AnyInput {
    const [dots, http, slashes] = args as [boolean, boolean, boolean];

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
