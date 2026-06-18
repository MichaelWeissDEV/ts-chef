/**
 * @fileoverview TakeNthBytes operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";

export class TakeNthBytes extends Operation {
  constructor() {
    super();
    this.name = "Take nth bytes";
    this.module = "Default";
    this.description =
      "Takes every Nth byte starting from the specified offset.";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [
      { name: "Every", type: "number", value: 4 },
      { name: "Starting at", type: "number", value: 0 },
      { name: "Apply to each line", type: "boolean", value: false },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): ArrayBuffer {
    const every = args[0] as number;
    const start = args[1] as number;
    const applyToEachLine = args[2] as boolean;

    function takeNth(buf: Uint8Array): Uint8Array {
      const result: number[] = [];
      for (let i = start; i < buf.length; i += every) {
        result.push(buf[i]);
      }
      return new Uint8Array(result);
    }

    if (!applyToEachLine) {
      return takeNth(new Uint8Array(input)).buffer as ArrayBuffer;
    }

    const decoder = new TextDecoder();
    const text = decoder.decode(input);
    const lines = text.split("\n");
    const parts: Uint8Array[] = [];
    const nl = new Uint8Array([10]);
    for (let i = 0; i < lines.length; i++) {
      const enc = new TextEncoder().encode(lines[i]);
      parts.push(takeNth(enc));
      if (i < lines.length - 1) parts.push(nl);
    }
    const totalLen = parts.reduce((s, p) => s + p.length, 0);
    const out = new Uint8Array(totalLen);
    let pos = 0;
    for (const p of parts) {
      out.set(p, pos);
      pos += p.length;
    }
    return out.buffer as ArrayBuffer;
  }
}

export default TakeNthBytes;
