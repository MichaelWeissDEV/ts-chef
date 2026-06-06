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
import moment from "moment-timezone";
import { UNITS } from "../lib/DateTime";
import { OperationError } from "../errors/OperationError";

export class FromUNIXTimestamp extends Operation {
  constructor() {
    super();
    this.name = "From UNIX Timestamp";
    this.module = "Default";
    this.description =
      "Converts a UNIX timestamp to a datetime string.<br><br>e.g. <code>978346800</code> becomes <code>Mon 1 January 2001 11:00:00 UTC</code><br><br>A UNIX timestamp is a 32-bit value representing the number of seconds since January 1, 1970 UTC (the UNIX epoch).";
    this.infoURL = "https://wikipedia.org/wiki/Unix_time";
    this.inputType = "number";
    this.outputType = "string";
    this.args = [
      {
        name: "Units",
        type: "option",
        value: UNITS,
      },
    ];
    this.checks = [
      { pattern: "^1?\\d{9}$", flags: "", args: ["Seconds (s)"] },
      { pattern: "^1?\\d{12}$", flags: "", args: ["Milliseconds (ms)"] },
      { pattern: "^1?\\d{15}$", flags: "", args: ["Microseconds (us)"] },
      { pattern: "^1?\\d{18}$", flags: "", args: ["Nanoseconds (ns)"] },
    ];
  }

  run(input: number, args: unknown[]): string {
    const units = args[0] as string;
    const val = parseFloat(String(input));

    if (units === "Seconds (s)") {
      return (
        moment.unix(val).tz("UTC").format("ddd D MMMM YYYY HH:mm:ss") + " UTC"
      );
    } else if (units === "Milliseconds (ms)") {
      return (
        moment(val).tz("UTC").format("ddd D MMMM YYYY HH:mm:ss.SSS") + " UTC"
      );
    } else if (units === "Microseconds (us)") {
      return (
        moment(val / 1000)
          .tz("UTC")
          .format("ddd D MMMM YYYY HH:mm:ss.SSS") + " UTC"
      );
    } else if (units === "Nanoseconds (ns)") {
      return (
        moment(val / 1000000)
          .tz("UTC")
          .format("ddd D MMMM YYYY HH:mm:ss.SSS") + " UTC"
      );
    } else {
      throw new OperationError("Unrecognised unit");
    }
  }
}

export default FromUNIXTimestamp;
