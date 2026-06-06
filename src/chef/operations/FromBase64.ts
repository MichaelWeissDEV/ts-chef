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
import { fromBase64 } from "../lib/Base64";

export const ALPHABET_OPTIONS = [
  { name: "Standard (RFC 4648): A-Za-z0-9+/=", value: "A-Za-z0-9+/=" },
  { name: "URL safe (RFC 4648 §5): A-Za-z0-9-_", value: "A-Za-z0-9-_" },
  { name: "Filename safe: A-Za-z0-9+\\-=", value: "A-Za-z0-9+\\-=" },
  { name: "itoa64: ./0-9A-Za-z=", value: "./0-9A-Za-z=" },
  { name: "XML: A-Za-z0-9_.", value: "A-Za-z0-9_." },
  { name: "y64: A-Za-z0-9._-", value: "A-Za-z0-9._-" },
  { name: "z64: 0-9a-zA-Z+/=", value: "0-9a-zA-Z+/=" },
  { name: "Radix-64 (RFC 4880): 0-9A-Za-z+/=", value: "0-9A-Za-z+/=" },
  {
    name: "Uuencoding: [space]-_",
    value: " -_",
  },
  { name: "Xxencoding: +-0-9A-Za-z", value: "+\\-0-9A-Za-z" },
  {
    name: "BinHex: !-,-0-689@A-NP-VX-Z[`a-fh-mp-r",
    value: "!-,-0-689@A-NP-VX-Z[`a-fh-mp-r",
  },
  { name: "ROT13: N-ZA-Mn-za-m0-9+/=", value: "N-ZA-Mn-za-m0-9+/=" },
  { name: "Unix crypt: ./0-9A-Za-z", value: "./0-9A-Za-z" },
];

export class FromBase64 extends Operation {
  constructor() {
    super();
    this.name = "From Base64";
    this.module = "Default";
    this.description =
      "Base64 is a notation for encoding arbitrary byte data using a restricted set of symbols that can be conveniently used by humans and processed by computers. This operation decodes data from an ASCII Base64 string back into its raw format. e.g. aGVsbG8= becomes hello";
    this.infoURL = "https://wikipedia.org/wiki/Base64";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.args = [
      {
        name: "Alphabet",
        type: "editableOption",
        value: ALPHABET_OPTIONS,
      },
      {
        name: "Remove non-alphabet chars",
        type: "boolean",
        value: true,
      },
      {
        name: "Strict mode",
        type: "boolean",
        value: false,
      },
    ];
  }

  run(input: string, args: unknown[]): number[] {
    const [alphabet, removeNonAlphChars, strictMode] = args as [
      string,
      boolean,
      boolean,
    ];
    return fromBase64(
      input,
      alphabet,
      "byteArray",
      removeNonAlphChars,
      strictMode,
    ) as number[];
  }

  highlight(pos: HighlightPos, _args: unknown[]): HighlightResult {
    pos[0].start = Math.ceil((pos[0].start / 4) * 3);
    pos[0].end = Math.floor((pos[0].end / 4) * 3);
    return pos;
  }

  highlightReverse(pos: HighlightPos, _args: unknown[]): HighlightResult {
    pos[0].start = Math.floor((pos[0].start / 3) * 4);
    pos[0].end = Math.ceil((pos[0].end / 3) * 4);
    return pos;
  }
}

export default FromBase64;
