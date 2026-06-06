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
import moment from "moment-timezone";
import { UNITS } from "../lib/DateTime";

export class ToUNIXTimestamp extends Operation {
  constructor() {
    super();
    this.name = "To UNIX Timestamp";
    this.module = "Default";
    this.description =
      "Parses a datetime string and converts to a UNIX timestamp.";
    this.infoURL = "https://wikipedia.org/wiki/Unix_time";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "Units", type: "option", value: UNITS },
      { name: "Treat as UTC", type: "boolean", value: true },
    ];
  }

  run(input: string, args: unknown[]): string {
    const units = args[0] as string;
    const treatAsUTC = args[1] as boolean;

    const d = treatAsUTC ? moment.utc(input) : moment(input);
    if (!d.isValid()) {
      throw new OperationError("Invalid date string: " + input);
    }

    const ms = d.valueOf();
    if (units === "Seconds (s)") return Math.floor(ms / 1000).toString();
    if (units === "Milliseconds (ms)") return ms.toString();
    if (units === "Microseconds (us)") return (ms * 1000).toString();
    if (units === "Nanoseconds (ns)") return (ms * 1000000).toString();
    throw new OperationError("Unrecognised unit");
  }
}

export default ToUNIXTimestamp;
