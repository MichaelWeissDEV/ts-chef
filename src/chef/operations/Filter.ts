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
import { Utils } from "../Utils";
import { INPUT_DELIM_OPTIONS } from "../lib/Delim";
import { OperationError } from "../errors/OperationError";

export class Filter extends Operation {
  constructor() {
    super();
    this.name = "Filter";
    this.module = "Regex";
    this.description =
      "Splits up the input using the specified delimiter and then filters each branch based on a regular expression.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: INPUT_DELIM_OPTIONS,
      },
      {
        name: "Regex",
        type: "string",
        value: "",
      },
      {
        name: "Invert condition",
        type: "boolean",
        value: false,
      },
    ];
  }

  run(input: string, args: unknown[]): string {
    const delim = Utils.charRep(args[0] as string);
    const reverse = args[2] as boolean;
    let regex: RegExp;

    try {
      regex = new RegExp(args[1] as string);
    } catch (err) {
      throw new OperationError(
        `Invalid regex. Details: ${(err as Error).message}`,
      );
    }

    return input
      .split(delim)
      .filter((value) => (reverse ? !regex.test(value) : regex.test(value)))
      .join(delim);
  }
}

export default Filter;
