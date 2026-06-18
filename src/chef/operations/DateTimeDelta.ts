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
import { DATETIME_FORMATS, FORMAT_EXAMPLES } from "../lib/DateTime";

/**
 * DateTime Delta operation
 */
export class DateTimeDelta extends Operation {
  /**
   * DateTimeDelta constructor
   */
  constructor() {
    super();

    this.name = "DateTime Delta";
    this.module = "Default";
    this.description =
      "Calculates a new DateTime value given an input DateTime value and a time difference (delta) from the input DateTime value.";
    this.inputType = "string";
    this.outputType = "html";
    this.args = [
      {
        name: "Built in formats",
        type: "populateOption",
        value: DATETIME_FORMATS,
        target: 1,
      },
      {
        name: "Input format string",
        type: "binaryString",
        value: "DD/MM/YYYY HH:mm:ss",
      },
      {
        name: "Time Operation",
        type: "option",
        value: ["Add", "Subtract"],
      },
      {
        name: "Days",
        type: "number",
        value: 0,
      },
      {
        name: "Hours",
        type: "number",
        value: 0,
      },
      {
        name: "Minutes",
        type: "number",
        value: 0,
      },
      {
        name: "Seconds",
        type: "number",
        value: 0,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, args: unknown[]): string {
    const [
      arg0,
      arg1,
      arg2,
      daysDelta,
      hoursDelta,
      minutesDelta,
      secondsDelta,
    ] = args as [unknown, string, string, number, number, number, number];
    const inputTimezone = "UTC";
    const inputFormat = arg1;
    const operationType = arg2;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let date: any;

    try {
      date = moment.tz(input, inputFormat, inputTimezone);
      if (!date || date.format() === "Invalid date") throw Error();
    } catch {
      return `Invalid format.\n\n${FORMAT_EXAMPLES}`;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let newDate: any;
    if (operationType === "Add") {
      newDate = date
        .add(daysDelta, "days")
        .add(hoursDelta, "hours")
        .add(minutesDelta, "minutes")
        .add(secondsDelta, "seconds");
    } else {
      newDate = date
        .add(-daysDelta, "days")
        .add(-hoursDelta, "hours")
        .add(-minutesDelta, "minutes")
        .add(-secondsDelta, "seconds");
    }
    return newDate.tz(inputTimezone).format(inputFormat.replace(/[<>]/g, ""));
  }
}

export default DateTimeDelta;
