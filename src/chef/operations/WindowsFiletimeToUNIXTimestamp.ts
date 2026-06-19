/**
 * @fileoverview WindowsFiletimeToUNIXTimestamp operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import { OperationError } from "../errors/OperationError";

// Windows FILETIME is 100-nanosecond intervals since 1 Jan 1601
// UNIX epoch is 1 Jan 1970
// Difference: 11644473600 seconds = 116444736000000000 * 100ns intervals
const EPOCH_DIFF = BigInt("11644473600");

export class WindowsFiletimeToUNIXTimestamp extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "Windows Filetime to UNIX Timestamp";
    this.module = "Default";
    this.description = "Converts a Windows Filetime value to a UNIX timestamp.";
    this.infoURL = "https://wikipedia.org/wiki/NTFS#File_timestamps";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Input units", type: "option", value: ["Hex", "Decimal"] },
      {
        name: "Output units",
        type: "option",
        value: [
          "Seconds (s)",
          "Milliseconds (ms)",
          "Microseconds (us)",
          "Nanoseconds (ns)",
        ],
      },
    ];
  }

  run(input: string, args: unknown[]): string {
    const inputUnits = args[0] as string;
    const outputUnits = args[1] as string;

    let filetimeNs: bigint;
    try {
      filetimeNs = BigInt(
        "0x" +
          (inputUnits === "Hex"
            ? input.trim().replace(/^0x/i, "")
            : parseInt(input.trim(), 10).toString(16)),
      );
    } catch {
      throw new OperationError("Invalid Windows Filetime value");
    }

    const unixSeconds = filetimeNs / BigInt(10000000) - EPOCH_DIFF;

    if (outputUnits === "Seconds (s)") return unixSeconds.toString();
    if (outputUnits === "Milliseconds (ms)")
      return (unixSeconds * BigInt(1000)).toString();
    if (outputUnits === "Microseconds (us)")
      return (unixSeconds * BigInt(1000000)).toString();
    if (outputUnits === "Nanoseconds (ns)")
      return (unixSeconds * BigInt(1000000000)).toString();
    throw new OperationError("Unrecognised unit");
  }
}

export default WindowsFiletimeToUNIXTimestamp;
