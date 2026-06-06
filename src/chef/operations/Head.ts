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

export class Head extends Operation {
  constructor() {
    super();
    this.name = "Head";
    this.module = "Default";
    this.description =
      "Like the UNIX head utility.<br>Gets the first n lines.<br>You can select all but the last n lines by entering a negative value for n.<br>The delimiter can be changed so that instead of lines, fields (i.e. commas) are selected instead.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: INPUT_DELIM_OPTIONS,
      },
      {
        name: "Number",
        type: "number",
        value: 10,
      },
    ];
  }

  run(input: string, args: unknown[]): string {
    const delimiterName = args[0] as string;
    const number = args[1] as number;
    const delimiter = Utils.charRep(delimiterName);
    const splitInput = input.split(delimiter);

    return splitInput
      .filter((_line, lineIndex) => {
        const n = lineIndex + 1;
        return number < 0 ? n <= splitInput.length + number : n <= number;
      })
      .join(delimiter);
  }
}

export default Head;
