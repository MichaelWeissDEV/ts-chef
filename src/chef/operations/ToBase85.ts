/**
 * @fileoverview ToBase85 operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

const ALPHABETS: Record<string, string> = {
  ASCII85:
    "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstu",
  "RFC 1924":
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~",
  Z85: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#",
};

export class ToBase85 extends TypedOperation<ArrayBuffer, string, unknown[]> {
  constructor() {
    super();
    this.name = "To Base85";
    this.module = "Default";
    this.description =
      "Base85 (Ascii85) encodes data using a set of 85 printable ASCII characters.";
    this.infoURL = "https://wikipedia.org/wiki/Ascii85";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      { name: "Alphabet", type: "option", value: Object.keys(ALPHABETS) },
      { name: "Add delimiters", type: "boolean", value: false },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): string {
    const alphabetKey = args[0] as string;
    const addDelimiters = args[1] as boolean;
    const alphabet = ALPHABETS[alphabetKey] ?? ALPHABETS["ASCII85"];
    const bytes = new Uint8Array(input);
    let result = "";

    for (let i = 0; i < bytes.length; i += 4) {
      const chunk = bytes.slice(i, i + 4);
      const pad = 4 - chunk.length;
      let val = 0;
      for (let j = 0; j < 4; j++) {
        val = val * 256 + (j < chunk.length ? chunk[j] : 0);
      }
      if (val === 0 && pad === 0 && alphabetKey === "ASCII85") {
        result += "z";
      } else {
        let encoded = "";
        for (let j = 4; j >= 0; j--) {
          encoded = alphabet[val % 85] + encoded;
          val = (val / 85) | 0;
        }
        result += encoded.slice(0, 5 - pad);
      }
    }

    if (addDelimiters) return "<~" + result + "~>";
    return result;
  }
}

export default ToBase85;
