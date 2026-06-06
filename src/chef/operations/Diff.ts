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
import * as JsDiff from "diff";
import OperationError from "../errors/OperationError";

/**
 * Diff operation
 */
export class Diff extends Operation {
  /**
   * Diff constructor
   */
  constructor() {
    super();

    this.name = "Diff";
    this.module = "Diff";
    this.description =
      "Compares two inputs (separated by the specified delimiter) and highlights the differences between them.";
    this.infoURL = "https://wikipedia.org/wiki/File_comparison";
    this.inputType = "string";
    this.outputType = "html";
    this.args = [
      {
        name: "Sample delimiter",
        type: "binaryString",
        value: "\\n\\n",
      },
      {
        name: "Diff by",
        type: "option",
        value: ["Character", "Word", "Line", "Sentence", "CSS", "JSON"],
      },
      {
        name: "Show added",
        type: "boolean",
        value: true,
      },
      {
        name: "Show removed",
        type: "boolean",
        value: true,
      },
      {
        name: "Show subtraction",
        type: "boolean",
        value: false,
      },
      {
        name: "Ignore whitespace",
        type: "boolean",
        value: false,
        hint: "Relevant for word and line",
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {html}
   */
  run(input: any, args: any[]): any {
    const [
        sampleDelim,
        diffBy,
        showAdded,
        showRemoved,
        showSubtraction,
        ignoreWhitespace,
      ] = args,
      samples = input.split(sampleDelim);
    let output = "",
      diff;

    // Node and Webpack load modules slightly differently
    const jsdiff = JsDiff;

    if (!samples || samples.length !== 2) {
      throw new OperationError(
        "Incorrect number of samples, perhaps you need to modify the sample delimiter or add more samples?",
      );
    }

    switch (diffBy) {
      case "Character":
        diff = jsdiff.diffChars(samples[0], samples[1]);
        break;
      case "Word":
        if (ignoreWhitespace) {
          diff = jsdiff.diffWords(samples[0], samples[1]);
        } else {
          diff = jsdiff.diffWordsWithSpace(samples[0], samples[1]);
        }
        break;
      case "Line":
        if (ignoreWhitespace) {
          diff = jsdiff.diffTrimmedLines(samples[0], samples[1]);
        } else {
          diff = jsdiff.diffLines(samples[0], samples[1]);
        }
        break;
      case "Sentence":
        diff = jsdiff.diffSentences(samples[0], samples[1]);
        break;
      case "CSS":
        diff = jsdiff.diffCss(samples[0], samples[1]);
        break;
      case "JSON":
        diff = jsdiff.diffJson(samples[0], samples[1]);
        break;
      default:
        throw new OperationError("Invalid 'Diff by' option.");
    }

    for (let i = 0; i < diff.length; i++) {
      if (diff[i].added) {
        if (showAdded)
          output += "<ins>" + Utils.escapeHtml(diff[i].value) + "</ins>";
      } else if (diff[i].removed) {
        if (showRemoved)
          output += "<del>" + Utils.escapeHtml(diff[i].value) + "</del>";
      } else if (!showSubtraction) {
        output += Utils.escapeHtml(diff[i].value);
      }
    }

    return output;
  }
}

export default Diff;
