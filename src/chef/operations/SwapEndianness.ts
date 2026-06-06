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

import { Operation, HighlightPos, HighlightResult } from "../Operation";
import { Utils } from "../Utils";
import { toHex, fromHex } from "../lib/Hex";
import { OperationError } from "../errors/OperationError";

export class SwapEndianness extends Operation {
  constructor() {
    super();
    this.name = "Swap endianness";
    this.module = "Default";
    this.description =
      "Switches the data from big-endian to little-endian or vice-versa. Data can be read in as hexadecimal or raw bytes. It will be returned in the same format as it is entered.";
    this.infoURL = "https://wikipedia.org/wiki/Endianness";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Data format", type: "option", value: ["Hex", "Raw"] },
      { name: "Word length (bytes)", type: "number", value: 4 },
      { name: "Pad incomplete words", type: "boolean", value: true },
    ];
  }

  run(input: string, args: unknown[]): string {
    const [dataFormat, wordLength, padIncompleteWords] = args as [
      string,
      number,
      boolean,
    ];

    if (wordLength <= 0) {
      throw new OperationError("Word length must be greater than 0");
    }

    let data: number[];
    switch (dataFormat) {
      case "Hex":
        data = fromHex(input);
        break;
      default:
        data = Utils.strToByteArray(input);
    }

    const words: number[][] = [];
    for (let i = 0; i < data.length; i += wordLength) {
      const word = data.slice(i, i + wordLength);
      if (padIncompleteWords && word.length < wordLength) {
        for (let j = word.length; j < wordLength; j++) {
          word.push(0);
        }
      }
      words.push(word);
    }

    const result: number[] = [];
    for (const word of words) {
      for (let j = word.length - 1; j >= 0; j--) {
        result.push(word[j]);
      }
    }

    switch (dataFormat) {
      case "Hex":
        return toHex(result);
      default:
        return Utils.byteArrayToUtf8(result);
    }
  }

  highlight(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }

  highlightReverse(pos: HighlightPos, _args: unknown[]): HighlightResult {
    return pos;
  }
}

export default SwapEndianness;
