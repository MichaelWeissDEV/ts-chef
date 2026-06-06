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
import { OperationError } from "../errors/OperationError";
import { fromHex } from "../lib/Hex";

type XORScheme =
  | "Standard"
  | "Input differential"
  | "Output differential"
  | "Cascade";

export class XOR extends Operation {
  constructor() {
    super();
    this.name = "XOR";
    this.module = "Default";
    this.description =
      "XOR the input with the given key. The key can be entered as hex or UTF-8.";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [
      {
        name: "Key",
        type: "toggleString",
        value: "",
        toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
      },
      {
        name: "Scheme",
        type: "option",
        value: [
          "Standard",
          "Input differential",
          "Output differential",
          "Cascade",
        ],
      },
      { name: "Null-preserving", type: "boolean", value: false },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): ArrayBuffer {
    const keyObj = args[0] as { string: string; option: string };
    const scheme = args[1] as XORScheme;
    const nullPreserving = args[2] as boolean;

    let keyBytes: number[];
    if (keyObj.option === "Hex") {
      keyBytes = fromHex(keyObj.string);
    } else {
      const enc = new TextEncoder();
      keyBytes = Array.from(enc.encode(keyObj.string));
    }

    if (keyBytes.length === 0) {
      throw new OperationError("No key provided");
    }

    const data = new Uint8Array(input);
    const out = new Uint8Array(data.length);

    if (scheme === "Standard") {
      for (let i = 0; i < data.length; i++) {
        if (
          nullPreserving &&
          (data[i] === 0 || data[i] === keyBytes[i % keyBytes.length])
        ) {
          out[i] = data[i];
        } else {
          out[i] = data[i] ^ keyBytes[i % keyBytes.length];
        }
      }
    } else if (scheme === "Input differential") {
      let prev = 0;
      for (let i = 0; i < data.length; i++) {
        if (nullPreserving && data[i] === 0) {
          out[i] = data[i];
          prev = data[i];
          continue;
        }
        out[i] = (data[i] ^ prev ^ keyBytes[i % keyBytes.length]) & 0xff;
        prev = data[i];
      }
    } else if (scheme === "Output differential") {
      let prev = 0;
      for (let i = 0; i < data.length; i++) {
        if (nullPreserving && data[i] === 0) {
          out[i] = data[i];
          prev = out[i];
          continue;
        }
        out[i] = (data[i] ^ prev ^ keyBytes[i % keyBytes.length]) & 0xff;
        prev = out[i];
      }
    } else if (scheme === "Cascade") {
      for (let i = 0; i < data.length; i++) {
        let val = data[i];
        for (let k = 0; k < keyBytes.length; k++) {
          val ^= keyBytes[k];
        }
        out[i] = val;
      }
    }

    return out.buffer as ArrayBuffer;
  }
}

export default XOR;
