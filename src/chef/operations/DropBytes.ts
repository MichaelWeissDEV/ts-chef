/**
 * @fileoverview DropBytes operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

export class DropBytes extends TypedOperation<ArrayBuffer, ArrayBuffer, unknown[]> {
  constructor() {
    super();
    this.name = "Drop bytes";
    this.module = "Default";
    this.description =
      "Cuts a slice of the specified number of bytes out of the data. Negative values are allowed.";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [
      { name: "Start", type: "number", value: 0 },
      { name: "Length", type: "number", value: 5 },
      { name: "Apply to each line", type: "boolean", value: false },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): ArrayBuffer {
    let start = args[0] as number;
    let length = args[1] as number;
    const applyToEachLine = args[2] as boolean;

    if (!applyToEachLine) {
      if (start < 0) start = input.byteLength + start;
      if (length < 0) {
        start = start + length;
        if (start < 0) {
          start = input.byteLength + start;
          length = start - length;
        } else {
          length = -length;
        }
      }

      const left = input.slice(0, start);
      const right = input.slice(start + length, input.byteLength);
      const result = new Uint8Array(left.byteLength + right.byteLength);
      result.set(new Uint8Array(left), 0);
      result.set(new Uint8Array(right), left.byteLength);
      return result.buffer;
    }

    const data = new Uint8Array(input);
    const lines: number[][] = [];
    let line: number[] = [];

    for (let i = 0; i < data.length; i++) {
      if (data[i] === 0x0a) {
        lines.push(line);
        line = [];
      } else {
        line.push(data[i]);
      }
    }
    lines.push(line);

    let output: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      let s = start;
      let l = length;
      if (s < 0) s = lines[i].length + s;
      if (l < 0) {
        s = s + l;
        if (s < 0) {
          s = lines[i].length + s;
          l = s - l;
        } else {
          l = -l;
        }
      }
      output = output.concat(
        lines[i].slice(0, s).concat(lines[i].slice(s + l, lines[i].length)),
      );
      output.push(0x0a);
    }
    return new Uint8Array(output.slice(0, output.length - 1)).buffer;
  }
}

export default DropBytes;
