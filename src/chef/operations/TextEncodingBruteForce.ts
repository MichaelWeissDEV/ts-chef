/**
 * @fileoverview TextEncodingBruteForce operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";
import Utils from "../Utils";
import cptable from "codepage";
import { CHR_ENC_CODE_PAGES } from "../lib/ChrEnc";

/**
 * Text Encoding Brute Force operation
 */
export class TextEncodingBruteForce extends Operation {
  /**
   * TextEncodingBruteForce constructor
   */
  constructor() {
    super();

    this.name = "Text Encoding Brute Force";
    this.module = "Encodings";
    this.description = [
      "Enumerates all supported text encodings for the input, allowing you to quickly spot the correct one.",
      "<br><br>",
      "Supported charsets are:",
      "<ul>",
      Object.keys(CHR_ENC_CODE_PAGES)
        .map((e) => `<li>${e}</li>`)
        .join("\n"),
      "</ul>",
    ].join("\n");
    this.infoURL = "https://wikipedia.org/wiki/Character_encoding";
    this.inputType = "string";
    this.outputType = "json";
    this.presentType = "html";
    this.args = [
      {
        name: "Mode",
        type: "option",
        value: ["Encode", "Decode"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {json}
   */
  run(input: AnyInput, args: unknown[]): AnyInput {
    const [mode] = args as [string];
    const output: Record<string, string> = {},
      charsets = Object.keys(CHR_ENC_CODE_PAGES);

    charsets.forEach((charset) => {
      try {
        if (mode === "Decode") {
          output[charset] = cptable.utils.decode(
            CHR_ENC_CODE_PAGES[charset],
            input as string,
          );
        } else {
          output[charset] = Utils.arrayBufferToStr(
            (
              cptable.utils.encode(
                CHR_ENC_CODE_PAGES[charset],
                input as string,
              ) as unknown as Uint8Array
            ).buffer as ArrayBuffer,
          );
        }
      } catch (_err) {
        output[charset] = "Could not decode.";
      }
    });

    return output;
  }

  /**
   * Displays the encodings in an HTML table for web apps.
   *
   * @param {Object[]} encodings
   * @returns {html}
   */
  present(encodings: Record<string, string>) {
    let table =
      "<table class='table table-hover table-sm table-bordered table-nonfluid'><tr><th>Encoding</th><th>Value</th></tr>";

    for (const enc in encodings) {
      const value = Utils.escapeHtml(Utils.escapeWhitespace(encodings[enc]));
      table += `<tr><td>${enc}</td><td>${value}</td></tr>`;
    }

    table += "<table>";
    return table;
  }
}

export default TextEncodingBruteForce;
