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

export class XORBruteForce extends Operation {
  constructor() {
    super();
    this.name = "XOR brute force";
    this.module = "Default";
    this.description =
      "Brute force the XOR key by trying every possible single byte key and printing the output for each.";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      { name: "Key length (bytes)", type: "number", value: 1 },
      { name: "Sample (bytes)", type: "number", value: 100 },
      { name: "Print key", type: "boolean", value: true },
      { name: "Output as hex", type: "boolean", value: false },
      { name: "Null-preserving", type: "boolean", value: false },
      { name: "Differential", type: "boolean", value: false },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): string {
    const keyLen = (args[0] as number) || 1;
    const sample = (args[1] as number) || 100;
    const printKey = args[2] as boolean;
    const outputHex = args[3] as boolean;
    const nullPreserving = args[4] as boolean;

    const data = new Uint8Array(input).slice(0, sample);
    const maxKey = Math.pow(256, keyLen);
    const results: string[] = [];

    for (let k = 0; k < maxKey; k++) {
      const key: number[] = [];
      let tmp = k;
      for (let i = 0; i < keyLen; i++) {
        key.unshift(tmp & 0xff);
        tmp >>= 8;
      }

      const out = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i++) {
        const kb = key[i % keyLen];
        if (nullPreserving && (data[i] === 0 || data[i] === kb)) {
          out[i] = data[i];
        } else {
          out[i] = data[i] ^ kb;
        }
      }

      const keyHex = key.map((b) => b.toString(16).padStart(2, "0")).join("");
      const outStr = outputHex
        ? Array.from(out)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(" ")
        : new TextDecoder("latin1").decode(out);

      results.push(printKey ? `Key: ${keyHex}\n${outStr}\n` : outStr + "\n");
    }

    return results.join("");
  }
}

export default XORBruteForce;
