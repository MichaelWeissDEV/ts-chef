/**
 * @fileoverview GenerateLoremIpsum operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import OperationError from "../errors/OperationError";
import {
  GenerateParagraphs,
  GenerateSentences,
  GenerateWords,
  GenerateBytes,
} from "../lib/LoremIpsum";

/**
 * Generate Lorem Ipsum operation
 */
export class GenerateLoremIpsum extends TypedOperation<string, string, unknown[]> {
  /**
   * GenerateLoremIpsum constructor
   */
  constructor() {
    super();

    this.name = "Generate Lorem Ipsum";
    this.module = "Default";
    this.description = "Generate varying length lorem ipsum placeholder text.";
    this.infoURL = "https://wikipedia.org/wiki/Lorem_ipsum";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Length",
        type: "number",
        value: "3",
      },
      {
        name: "Length in",
        type: "option",
        value: ["Paragraphs", "Sentences", "Words", "Bytes"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, args: unknown[]): string {
    const [length, lengthType] = args as [number, string];
    if (length < 1) {
      throw new OperationError("Length must be greater than 0");
    }
    switch (lengthType) {
      case "Paragraphs":
        return GenerateParagraphs(length);
      case "Sentences":
        return GenerateSentences(length);
      case "Words":
        return GenerateWords(length);
      case "Bytes":
        return GenerateBytes(length);
      default:
        throw new OperationError("Invalid length type");
    }
  }
}

export default GenerateLoremIpsum;
