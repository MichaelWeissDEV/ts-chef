/**
 * @fileoverview TranslateDateTimeFormat operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";
import { OperationError } from "../errors/OperationError";
import moment from "moment-timezone";

const DATETIME_FORMATS = [
  "DD/MM/YYYY HH:mm:ss",
  "MM/DD/YYYY HH:mm:ss",
  "YYYY-MM-DD HH:mm:ss",
  "YYYY-MM-DDTHH:mm:ss",
  "ddd D MMMM YYYY HH:mm:ss",
  "DD MMMM YYYY",
  "MMMM DD, YYYY",
];

export class TranslateDateTimeFormat extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "Translate DateTime format";
    this.module = "Default";
    this.description =
      "Translates a datetime string from one format to another.";
    this.infoURL = "https://momentjs.com/docs/#/displaying/format/";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Built-in input formats",
        type: "option",
        value: ["Input format"].concat(DATETIME_FORMATS),
      },
      {
        name: "Input format string",
        type: "string",
        value: "DD/MM/YYYY HH:mm:ss",
      },
      { name: "Input timezone", type: "string", value: "UTC" },
      {
        name: "Built-in output formats",
        type: "option",
        value: ["Output format"].concat(DATETIME_FORMATS),
      },
      {
        name: "Output format string",
        type: "string",
        value: "DD/MM/YYYY HH:mm:ss",
      },
      { name: "Output timezone", type: "string", value: "UTC" },
    ];
  }

  run(input: string, args: unknown[]): string {
    let inputFormat = args[1] as string;
    const inputTZ = args[2] as string;
    let outputFormat = args[4] as string;
    const outputTZ = args[5] as string;

    const builtinIn = args[0] as string;
    const builtinOut = args[3] as string;
    if (builtinIn !== "Input format") inputFormat = builtinIn;
    if (builtinOut !== "Output format") outputFormat = builtinOut;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let d: any;
    try {
      d = moment.tz(input, inputFormat, inputTZ || "UTC");
    } catch {
      throw new OperationError("Invalid input date or format");
    }

    if (!d.isValid()) {
      throw new OperationError("Invalid input date or format");
    }

    return d.tz(outputTZ || "UTC").format(outputFormat);
  }
}

export default TranslateDateTimeFormat;
