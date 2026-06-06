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
import Utils from "../Utils";
import { fromBase64, toBase64 } from "../lib/Base64";
import OperationError from "../errors/OperationError";

/**
 * Show Base64 offsets operation
 */
export class ShowBase64Offsets extends Operation {
  /**
   * ShowBase64Offsets constructor
   */
  constructor() {
    super();

    this.name = "Show Base64 offsets";
    this.module = "Default";
    this.description =
      "When a string is within a block of data and the whole block is Base64'd, the string itself could be represented in Base64 in three distinct ways depending on its offset within the block.<br><br>This operation shows all possible offsets for a given string so that each possible encoding can be considered.";
    this.infoURL = "https://wikipedia.org/wiki/Base64#Output_padding";
    this.inputType = "byteArray";
    this.outputType = "html";
    this.args = [
      {
        name: "Alphabet",
        type: "binaryString",
        value: "A-Za-z0-9+/=",
      },
      {
        name: "Show variable chars and padding",
        type: "boolean",
        value: true,
      },
      {
        name: "Input format",
        type: "option",
        value: ["Raw", "Base64"],
      },
    ];
  }

  /**
   * @param {number[]} input
   * @param {any[]} args
   * @returns {string}
   */
  run(input: number[], args: any[]): string {
    const alphabet: string = args[0],
      showVariable: boolean = args[1],
      format: string = args[2];

    if (format === "Base64") {
      input = fromBase64(
        Utils.byteArrayToUtf8(input),
        alphabet,
        "byteArray",
      ) as number[];
    }

    let offset0 = toBase64(input, alphabet),
      offset1 = toBase64([0].concat(input), alphabet),
      offset2 = toBase64([0, 0].concat(input), alphabet),
      staticSection = "",
      padding = "";

    const len0 = offset0.indexOf("="),
      len1 = offset1.indexOf("="),
      len2 = offset2.indexOf("="),
      script =
        "<script type='application/javascript'>$('[data-toggle=\"tooltip\"]').tooltip()</script>";

    if (input.length < 1) {
      throw new OperationError("Please enter a string.");
    }

    // Highlight offset 0
    if (len0 % 4 === 2) {
      staticSection = offset0.slice(0, -3);
      offset0 =
        "<span data-toggle='tooltip' data-placement='top' title='" +
        Utils.escapeHtml(
          fromBase64(staticSection, alphabet, "string") as string,
        ).slice(0, -2) +
        "'>" +
        Utils.escapeHtml(staticSection) +
        "</span>" +
        "<span class='hl5'>" +
        Utils.escapeHtml(
          offset0.substring(offset0.length - 3, offset0.length - 2),
        ) +
        "</span>" +
        "<span class='hl3'>" +
        Utils.escapeHtml(offset0.substring(offset0.length - 2)) +
        "</span>";
    } else if (len0 % 4 === 3) {
      staticSection = offset0.slice(0, -2);
      offset0 =
        "<span data-toggle='tooltip' data-placement='top' title='" +
        Utils.escapeHtml(
          fromBase64(staticSection, alphabet, "string") as string,
        ).slice(0, -1) +
        "'>" +
        Utils.escapeHtml(staticSection) +
        "</span>" +
        "<span class='hl5'>" +
        Utils.escapeHtml(
          offset0.substring(offset0.length - 2, offset0.length - 1),
        ) +
        "</span>" +
        "<span class='hl3'>" +
        Utils.escapeHtml(offset0.substring(offset0.length - 1)) +
        "</span>";
    } else {
      staticSection = offset0;
      offset0 =
        "<span data-toggle='tooltip' data-placement='top' title='" +
        Utils.escapeHtml(
          fromBase64(staticSection, alphabet, "string") as string,
        ) +
        "'>" +
        Utils.escapeHtml(staticSection) +
        "</span>";
    }

    if (!showVariable) {
      offset0 = Utils.escapeHtml(staticSection);
    }

    // Highlight offset 1
    padding =
      "<span class='hl3'>" +
      Utils.escapeHtml(offset1.substring(0, 1)) +
      "</span>" +
      "<span class='hl5'>" +
      Utils.escapeHtml(offset1.substring(1, 2)) +
      "</span>";
    offset1 = offset1.substring(2);
    if (len1 % 4 === 2) {
      staticSection = offset1.slice(0, -3);
      offset1 =
        padding +
        "<span data-toggle='tooltip' data-placement='top' title='" +
        Utils.escapeHtml(
          fromBase64("AA" + staticSection, alphabet, "string") as string,
        ).slice(1, -2) +
        "'>" +
        Utils.escapeHtml(staticSection) +
        "</span>" +
        "<span class='hl5'>" +
        Utils.escapeHtml(
          offset1.substring(offset1.length - 3, offset1.length - 2),
        ) +
        "</span>" +
        "<span class='hl3'>" +
        Utils.escapeHtml(offset1.substring(offset1.length - 2)) +
        "</span>";
    } else if (len1 % 4 === 3) {
      staticSection = offset1.slice(0, -2);
      offset1 =
        padding +
        "<span data-toggle='tooltip' data-placement='top' title='" +
        Utils.escapeHtml(
          fromBase64("AA" + staticSection, alphabet, "string") as string,
        ).slice(1, -1) +
        "'>" +
        Utils.escapeHtml(staticSection) +
        "</span>" +
        "<span class='hl5'>" +
        Utils.escapeHtml(
          offset1.substring(offset1.length - 2, offset1.length - 1),
        ) +
        "</span>" +
        "<span class='hl3'>" +
        Utils.escapeHtml(offset1.substring(offset1.length - 1)) +
        "</span>";
    } else {
      staticSection = offset1;
      offset1 =
        padding +
        "<span data-toggle='tooltip' data-placement='top' title='" +
        Utils.escapeHtml(
          fromBase64("AA" + staticSection, alphabet, "string") as string,
        ).slice(1) +
        "'>" +
        Utils.escapeHtml(staticSection) +
        "</span>";
    }

    if (!showVariable) {
      offset1 = Utils.escapeHtml(staticSection);
    }

    // Highlight offset 2
    padding =
      "<span class='hl3'>" +
      Utils.escapeHtml(offset2.substring(0, 2)) +
      "</span>" +
      "<span class='hl5'>" +
      Utils.escapeHtml(offset2.substring(2, 3)) +
      "</span>";
    offset2 = offset2.substring(3);
    if (len2 % 4 === 2) {
      staticSection = offset2.slice(0, -3);
      offset2 =
        padding +
        "<span data-toggle='tooltip' data-placement='top' title='" +
        Utils.escapeHtml(
          fromBase64("AAA" + staticSection, alphabet, "string") as string,
        ).slice(2, -2) +
        "'>" +
        Utils.escapeHtml(staticSection) +
        "</span>" +
        "<span class='hl5'>" +
        Utils.escapeHtml(
          offset2.substring(offset2.length - 3, offset2.length - 2),
        ) +
        "</span>" +
        "<span class='hl3'>" +
        Utils.escapeHtml(offset2.substring(offset2.length - 2)) +
        "</span>";
    } else if (len2 % 4 === 3) {
      staticSection = offset2.slice(0, -2);
      offset2 =
        padding +
        "<span data-toggle='tooltip' data-placement='top' title='" +
        Utils.escapeHtml(
          fromBase64("AAA" + staticSection, alphabet, "string") as string,
        ).slice(2, -2) +
        "'>" +
        Utils.escapeHtml(staticSection) +
        "</span>" +
        "<span class='hl5'>" +
        Utils.escapeHtml(
          offset2.substring(offset2.length - 2, offset2.length - 1),
        ) +
        "</span>" +
        "<span class='hl3'>" +
        Utils.escapeHtml(offset2.substring(offset2.length - 1)) +
        "</span>";
    } else {
      staticSection = offset2;
      offset2 =
        padding +
        "<span data-toggle='tooltip' data-placement='top' title='" +
        Utils.escapeHtml(
          fromBase64("AAA" + staticSection, alphabet, "string") as string,
        ).slice(2) +
        "'>" +
        Utils.escapeHtml(staticSection) +
        "</span>";
    }

    if (!showVariable) {
      offset2 = Utils.escapeHtml(staticSection);
    }

    return showVariable
      ? "Characters highlighted in <span class='hl5'>green</span> could change if the input is surrounded by more data." +
          "\nCharacters highlighted in <span class='hl3'>red</span> are for padding purposes only." +
          "\nUnhighlighted characters are <span data-toggle='tooltip' data-placement='top' title='Tooltip on left'>static</span>." +
          "\nHover over the static sections to see what they decode to on their own.\n" +
          "\nOffset 0: " +
          offset0 +
          "\nOffset 1: " +
          offset1 +
          "\nOffset 2: " +
          offset2 +
          script
      : offset0 + "\n" + offset1 + "\n" + offset2;
  }
}

export default ShowBase64Offsets;
