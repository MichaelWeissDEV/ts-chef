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
import { UNITS } from "../lib/DateTime";

export class GetTime extends Operation {
  constructor() {
    super();
    this.name = "Get Time";
    this.module = "Default";
    this.description =
      "Generates a timestamp showing the amount of time since the UNIX epoch (1970-01-01 00:00:00 UTC). Uses the W3C High Resolution Time API.";
    this.infoURL = "https://wikipedia.org/wiki/Unix_time";
    this.inputType = "string";
    this.outputType = "number";
    this.args = [
      {
        name: "Granularity",
        type: "option",
        value: UNITS,
      },
    ];
  }

  run(_input: string, args: unknown[]): number {
    const granularity = args[0] as string;
    const nowMs = Date.now();

    switch (granularity) {
      case "Nanoseconds (ns)":
        return Math.round(nowMs * 1000 * 1000);
      case "Microseconds (us)":
        return Math.round(nowMs * 1000);
      case "Milliseconds (ms)":
        return Math.round(nowMs);
      case "Seconds (s)":
        return Math.round(nowMs / 1000);
      default:
        throw new OperationError("Unknown granularity value: " + granularity);
    }
  }
}

export default GetTime;
