/**
 * @fileoverview ToBase64 operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, HighlightPos, HighlightResult } from "../Operation";
import { toBase64 } from "../lib/Base64";
import { ALPHABET_OPTIONS } from "./FromBase64";

export class ToBase64 extends TypedOperation<number[], string, unknown[]> {
  constructor() {
    super();
    this.name = "To Base64";
    this.module = "Default";
    this.description =
      "Base64 is a notation for encoding arbitrary byte data using a restricted set of symbols that can be conveniently used by humans and processed by computers.<br><br>This operation encodes data in an ASCII Base64 string.<br><br>e.g. <code>hello</code> becomes <code>aGVsbG8=</code>";
    this.infoURL = "https://wikipedia.org/wiki/Base64";
    this.inputType = "byteArray";
    this.outputType = "string";
    this.args = [
      {
        name: "Alphabet",
        type: "editableOption",
        value: ALPHABET_OPTIONS,
      },
    ];
    this.checks = [
      {
        pattern:
          "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$",
        flags: "",
        args: ["A-Za-z0-9+/="],
      },
    ];
  }

  run(input: number[], args: unknown[]): string {
    const alphabet = args[0] as string;
    return toBase64(input, alphabet);
  }

  highlight(pos: HighlightPos, _args: unknown[]): HighlightResult {
    pos[0].start = Math.floor((pos[0].start / 3) * 4);
    pos[0].end = Math.ceil((pos[0].end / 3) * 4);
    return pos;
  }

  highlightReverse(pos: HighlightPos, _args: unknown[]): HighlightResult {
    pos[0].start = Math.ceil((pos[0].start / 4) * 3);
    pos[0].end = Math.floor((pos[0].end / 4) * 3);
    return pos;
  }
}

export default ToBase64;
