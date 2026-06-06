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
import OperationError from "../errors/OperationError";

/**
 * HaversineDistance operation
 */
export class HaversineDistance extends Operation {
  /**
   * HaversineDistance constructor
   */
  constructor() {
    super();

    this.name = "Haversine distance";
    this.module = "Default";
    this.description =
      "Returns the distance between two pairs of GPS latitude and longitude co-ordinates in metres.<br><br>e.g. <code>51.487263,-0.124323, 38.9517,-77.1467</code>";
    this.infoURL = "https://wikipedia.org/wiki/Haversine_formula";
    this.inputType = "string";
    this.outputType = "number";
    this.args = [];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {number}
   */
  run(input: any, args: any[]): any {
    const values = input.match(
      /^(-?\d+(\.\d+)?), ?(-?\d+(\.\d+)?), ?(-?\d+(\.\d+)?), ?(-?\d+(\.\d+)?)$/,
    );
    if (!values) {
      throw new OperationError(
        "Input must in the format lat1, lng1, lat2, lng2",
      );
    }

    const lat1 = parseFloat(values[1]);
    const lng1 = parseFloat(values[3]);
    const lat2 = parseFloat(values[5]);
    const lng2 = parseFloat(values[7]);

    const TO_RAD = Math.PI / 180;
    const dLat = (lat2 - lat1) * TO_RAD;
    const dLng = (lng2 - lng1) * TO_RAD;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * TO_RAD) *
        Math.cos(lat2 * TO_RAD) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const metres = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return metres;
  }
}

export default HaversineDistance;
