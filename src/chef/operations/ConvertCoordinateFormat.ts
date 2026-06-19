/**
 * @fileoverview ConvertCoordinateFormat operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, ArgConfig } from "../Operation";
import { FORMATS, convertCoordinates } from "../lib/ConvertCoordinates";

export class ConvertCoordinateFormat extends TypedOperation<string, string, unknown[]> {
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

  run(input: string, args: unknown[]): string {
    if (input.replace(/[\s+]/g, "") !== "") {
      const [inFormat, inDelim, outFormat, outDelim, incDirection, precision] =
        args as [string, string, string, string, string, number];
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
