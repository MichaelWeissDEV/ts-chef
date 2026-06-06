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

const EPOCH_DIFF_S = BigInt("11644473600");

export class UNIXTimestampToWindowsFiletime extends Operation {
  constructor() {
    super();
    this.name = "UNIX Timestamp to Windows Filetime";
    this.module = "Default";
    this.description = "Converts a UNIX timestamp to a Windows Filetime value.";
    this.infoURL = "https://wikipedia.org/wiki/NTFS#File_timestamps";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Input units",
        type: "option",
        value: [
          "Seconds (s)",
          "Milliseconds (ms)",
          "Microseconds (us)",
          "Nanoseconds (ns)",
        ],
      },
      { name: "Output format", type: "option", value: ["Hex", "Decimal"] },
    ];
  }

  run(input: string, args: unknown[]): string {
    const inputUnits = args[0] as string;
    const outputFormat = args[1] as string;

    let unixS: bigint;
    try {
      const val = BigInt(input.trim());
      if (inputUnits === "Seconds (s)") unixS = val;
      else if (inputUnits === "Milliseconds (ms)") unixS = val / BigInt(1000);
      else if (inputUnits === "Microseconds (us)")
        unixS = val / BigInt(1000000);
      else unixS = val / BigInt(1000000000);
    } catch {
      throw new OperationError("Invalid UNIX timestamp value");
    }

    const filetimeNs = (unixS + EPOCH_DIFF_S) * BigInt(10000000);

    if (outputFormat === "Hex") return filetimeNs.toString(16).toUpperCase();
    return filetimeNs.toString();
  }
}

export default UNIXTimestampToWindowsFiletime;
