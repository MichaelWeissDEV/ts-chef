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
import { fromHex } from "../lib/Hex";

export class FromHexdump extends Operation {
  constructor() {
    super();
    this.name = "From Hexdump";
    this.module = "Default";
    this.description =
      "Attempts to convert a hexdump back into raw data. This operation supports many different hexdump variations, but probably not all. Make sure you verify that the data it gives you is correct before continuing analysis.";
    this.infoURL = "https://wikipedia.org/wiki/Hex_dump";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.args = [];
    this.checks = [
      {
        pattern:
          "^(?:(?:[\\dA-F]{4,16}h?:?)?[ \\t]*((?:[\\dA-F]{2} ){1,8}(?:[ \\t]|[\\dA-F]{2}-)(?:[\\dA-F]{2} ){1,8}|(?:[\\dA-F]{4} )*[\\dA-F]{4}|(?:[\\dA-F]{2} )*[\\dA-F]{2})[^\\n]*\\n?){2,}$",
        flags: "i",
        args: [],
      },
    ];
  }

  run(input: string, _args: unknown[]): number[] {
    const output: number[] = [];
    const regex =
      /^\s*(?:[\dA-F]{4,16}h?:?)?[ \t]+((?:[\dA-F]{2} ){1,8}(?:[ \t]|[\dA-F]{2}-)(?:[\dA-F]{2} ){1,8}|(?:[\dA-F]{4} )+(?:[\dA-F]{2})?|(?:[\dA-F]{2} )*[\dA-F]{2})/gim;
    let block: RegExpExecArray | null;

    while ((block = regex.exec(input))) {
      const line = fromHex(block[1].replace(/-/g, " "));
      for (let i = 0; i < line.length; i++) {
        output.push(line[i]);
      }
    }

    return output;
  }

  highlight(pos: HighlightPos, args: unknown[]): HighlightResult {
    const w = (args[0] as number) || 16;
    const width = 14 + w * 4;

    let line = Math.floor(pos[0].start / width);
    let offset = pos[0].start % width;

    if (offset < 10) {
      pos[0].start = line * w;
    } else if (offset > 10 + w * 3) {
      pos[0].start = (line + 1) * w;
    } else {
      pos[0].start = line * w + Math.floor((offset - 10) / 3);
    }

    line = Math.floor(pos[0].end / width);
    offset = pos[0].end % width;

    if (offset < 10) {
      pos[0].end = line * w;
    } else if (offset > 10 + w * 3) {
      pos[0].end = (line + 1) * w;
    } else {
      pos[0].end = line * w + Math.ceil((offset - 10) / 3);
    }

    return pos;
  }

  highlightReverse(pos: HighlightPos, args: unknown[]): HighlightResult {
    const w = (args[0] as number) || 16;
    const width = 14 + w * 4;
    let line = Math.floor(pos[0].start / w);
    let offset = pos[0].start % w;

    pos[0].start = line * width + 10 + offset * 3;

    line = Math.floor(pos[0].end / w);
    offset = pos[0].end % w;
    if (offset === 0) {
      line--;
      offset = w;
    }
    pos[0].end = line * width + 10 + offset * 3 - 1;

    let startLineNum = Math.floor(pos[0].start / width);
    const endLineNum = Math.floor(pos[0].end / width);

    if (startLineNum === endLineNum) {
      pos.push({ ...pos[0] });
    } else {
      let start = pos[0].start;
      let end = (startLineNum + 1) * width - w - 5;
      pos.push({ start, end });
      while (end < pos[0].end) {
        startLineNum++;
        start = startLineNum * width + 10;
        end = (startLineNum + 1) * width - w - 5;
        if (end > pos[0].end) end = pos[0].end;
        pos.push({ start, end });
      }
    }

    const len = pos.length;
    for (let i = 1; i < len; i++) {
      const lineNum = Math.floor(pos[i].start / width);
      const start =
        (pos[i].start - lineNum * width - 10) / 3 +
        (width - w - 2) +
        lineNum * width;
      const end =
        (pos[i].end + 1 - lineNum * width - 10) / 3 +
        (width - w - 2) +
        lineNum * width;
      pos.push({ start, end });
    }

    return pos;
  }
}

export default FromHexdump;
