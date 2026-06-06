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

import { Operation, ArgConfig } from "../Operation";
import { FORMATS, convertCoordinates } from "../lib/ConvertCoordinates";

export class ConvertCoordinateFormat extends Operation {
  name = "Convert co-ordinate format";
  module = "Hashing";
  description =
    "Converts geographical coordinates between different formats.<br><br>Supported formats:<ul><li>Degrees Minutes Seconds (DMS)</li><li>Degrees Decimal Minutes (DDM)</li><li>Decimal Degrees (DD)</li><li>Geohash</li><li>Military Grid Reference System (MGRS)</li><li>Ordnance Survey National Grid (OSNG)</li><li>Universal Transverse Mercator (UTM)</li></ul><br>The operation can try to detect the input co-ordinate format and delimiter automatically, but this may not always work correctly.";
  infoURL = "https://wikipedia.org/wiki/Geographic_coordinate_conversion";
  inputType = "string";
  outputType = "string";
  args: ArgConfig[] = [
    {
      name: "Input Format",
      type: "option",
      value: ["Auto", ...FORMATS],
    },
    {
      name: "Input Delimiter",
      type: "option",
      value: [
        "Auto",
        "Direction Preceding",
        "Direction Following",
        "\\n",
        "Comma",
        "Semi-colon",
        "Colon",
      ],
    },
    {
      name: "Output Format",
      type: "option",
      value: FORMATS,
    },
    {
      name: "Output Delimiter",
      type: "option",
      value: ["Space", "\\n", "Comma", "Semi-colon", "Colon"],
    },
    {
      name: "Include Compass Directions",
      type: "option",
      value: ["None", "Before", "After"],
    },
    {
      name: "Precision",
      type: "number",
      value: 3,
    },
  ];

  run(input: string, args: any[]): string {
    if (input.replace(/[\s+]/g, "") !== "") {
      const [inFormat, inDelim, outFormat, outDelim, incDirection, precision] =
        args;
      const result = convertCoordinates(
        input,
        inFormat,
        inDelim,
        outFormat,
        outDelim,
        incDirection,
        precision,
      );
      return result;
    } else {
      return input;
    }
  }
}

export default ConvertCoordinateFormat;
