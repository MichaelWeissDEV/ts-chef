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
import BigNumber from "bignumber.js";

/**
 * Convert distance operation
 *
 * @category Default
 */
export class ConvertDistance extends Operation {
  name = "Convert distance";
  module = "Default";
  description = "Converts a unit of distance to another format.";
  infoURL = "https://wikipedia.org/wiki/Orders_of_magnitude_(length)";
  inputType = "string";
  outputType = "string";
  args: ArgConfig[] = [
    {
      name: "Input units",
      type: "option",
      value: DISTANCE_UNITS,
    },
    {
      name: "Output units",
      type: "option",
      value: DISTANCE_UNITS,
    },
  ];

  /**
   * @param {string} input
   * @param {any[]} args
   * @returns {string}
   *
   * @see {@link https://wikipedia.org/wiki/Orders_of_magnitude_(length)}
   */
  run(input: string, args: any[]): string {
    const [inputUnits, outputUnits] = args;
    const bnInput = new BigNumber(input);

    const result = bnInput
      .times(DISTANCE_FACTOR[inputUnits])
      .div(DISTANCE_FACTOR[outputUnits]);
    return result.toString();
  }
}

const DISTANCE_UNITS = [
  "[Metric]",
  "Nanometres (nm)",
  "Micrometres (µm)",
  "Millimetres (mm)",
  "Centimetres (cm)",
  "Metres (m)",
  "Kilometers (km)",
  "[/Metric]",
  "[Imperial]",
  "Thou (th)",
  "Inches (in)",
  "Feet (ft)",
  "Yards (yd)",
  "Chains (ch)",
  "Furlongs (fur)",
  "Miles (mi)",
  "Leagues (lea)",
  "[/Imperial]",
  "[Maritime]",
  "Fathoms (ftm)",
  "Cables",
  "Nautical miles",
  "[/Maritime]",
  "[Comparisons]",
  "Cars (4m)",
  "Buses (8.4m)",
  "American football fields (91m)",
  "Football pitches (105m)",
  "[/Comparisons]",
  "[Astronomical]",
  "Earth-to-Moons",
  "Earth's equators",
  "Astronomical units (au)",
  "Light-years (ly)",
  "Parsecs (pc)",
  "[/Astronomical]",
];

const DISTANCE_FACTOR: Record<string, number | string> = {
  "Nanometres (nm)": "1e-9",
  "Micrometres (µm)": "1e-6",
  "Millimetres (mm)": "1e-3",
  "Centimetres (cm)": "1e-2",
  "Metres (m)": 1,
  "Kilometers (km)": 1000,
  "Thou (th)": 0.0000254,
  "Inches (in)": 0.0254,
  "Feet (ft)": 0.3048,
  "Yards (yd)": 0.9144,
  "Chains (ch)": 20.1168,
  "Furlongs (fur)": 201.168,
  "Miles (mi)": 1609.344,
  "Leagues (lea)": 4828.032,
  "Fathoms (ftm)": 1.853184,
  Cables: 185.3184,
  "Nautical miles": 1853.184,
  "Cars (4m)": 4,
  "Buses (8.4m)": 8.4,
  "American football fields (91m)": 91,
  "Football pitches (105m)": 105,
  "Earth-to-Moons": 380000000,
  "Earth's equators": 40075016.686,
  "Astronomical units (au)": 149597870700,
  "Light-years (ly)": "9460730472580800",
  "Parsecs (pc)": "3.0856776e16",
};

export default ConvertDistance;
