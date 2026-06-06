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
import OperationError from "../errors/OperationError";

const ALPHABETS: Record<string, string> = {
  ASCII85:
    "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstu",
  "RFC 1924":
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~",
  Z85: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#",
};

export class FromBase85 extends Operation {
  constructor() {
    super();
    this.name = "From Base85";
    this.module = "Default";
    this.description =
      "Base85 (Ascii85) decodes data from a Base85-encoded string.";
    this.infoURL = "https://wikipedia.org/wiki/Ascii85";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.args = [
      { name: "Alphabet", type: "option", value: Object.keys(ALPHABETS) },
      { name: "Remove delimiters", type: "boolean", value: true },
    ];
  }

  run(input: string, args: unknown[]): number[] {
    const alphabetKey = (args[0] as string) || "ASCII85";
    const removeDelimiters = (args[1] as boolean) ?? true;
    const alphabet = ALPHABETS[alphabetKey] ?? ALPHABETS["ASCII85"];

    const map = new Map<string, number>();
    for (let i = 0; i < alphabet.length; i++) map.set(alphabet[i], i);

    let cleaned = input;
    if (removeDelimiters)
      cleaned = cleaned.replace(/^<~/, "").replace(/~>$/, "");
    // Remove whitespace
    cleaned = cleaned.replace(/\s/g, "");

    const bytes: number[] = [];
    let i = 0;

    while (i < cleaned.length) {
      // Handle 'z' shorthand for 5 zero chars in ASCII85
      if (cleaned[i] === "z" && alphabetKey === "ASCII85") {
        bytes.push(0, 0, 0, 0);
        i++;
        continue;
      }

      const chunk = cleaned.slice(i, i + 5);
      const pad = 5 - chunk.length;
      let val = 0;

      for (let j = 0; j < 5; j++) {
        const ch = j < chunk.length ? chunk[j] : alphabet[84]; // pad with last char
        const v = map.get(ch);
        if (v === undefined)
          throw new OperationError(`Invalid Base85 character: '${ch}'`);
        val = val * 85 + v;
      }

      // Extract 4 bytes, subtract pads
      const chunkBytes = [
        (val >>> 24) & 0xff,
        (val >>> 16) & 0xff,
        (val >>> 8) & 0xff,
        val & 0xff,
      ];
      bytes.push(...chunkBytes.slice(0, 4 - pad));
      i += 5;
    }

    return bytes;
  }
}

export default FromBase85;
