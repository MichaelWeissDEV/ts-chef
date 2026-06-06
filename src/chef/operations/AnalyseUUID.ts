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

import * as uuid from "uuid";
import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import { toHex } from "../lib/Hex";

/**
 * Analyse UUID operation
 *
 * @category Crypto
 */
export class AnalyseUUID extends Operation {
  /**
   * AnalyseUUID constructor
   */
  constructor() {
    super();

    this.name = "Analyse UUID";
    this.module = "Crypto";
    this.description =
      "Operation for extracting metadata and detecting the version of a given UUID.";
    this.infoURL = "https://wikipedia.org/wiki/Universally_unique_identifier";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Include Metadata",
        type: "boolean",
        value: true,
      },
    ];
  }

  /**
   * Runs the Analyse UUID operation.
   *
   * @param {string} input - Expects a valid UUID string
   * @param {any[]} args
   * @returns {string}
   */
  run(input: string, args: any[]): string {
    const trimmedInput = input.trim();

    let uuidVersion: number, uuidBytes: Uint8Array;
    try {
      uuidVersion = uuid.version(trimmedInput); // Re-using the uuid library to extract version
      uuidBytes = uuid.parse(trimmedInput) as Uint8Array; // Re-using the uuid library to parse bytes
    } catch (error) {
      throw new OperationError("Invalid UUID");
    }

    const [includeMetadata] = args;
    const dv = new DataView(
      uuidBytes.buffer,
      uuidBytes.byteOffset,
      uuidBytes.byteLength,
    ); // Dataview helps handle the multi-byte ints
    const uuidInteger =
      (BigInt(dv.getBigUint64(0)) << 64n) | BigInt(dv.getBigUint64(8));

    const sections = [`Version:\n${uuidVersion}`];

    if (includeMetadata) {
      const parser = UUID_PARSERS[uuidVersion];
      const decoded = parser?.(uuidBytes, dv);
      sections.push(formatDecoded(decoded));
    }

    sections.push(`UUID Integer:\n${uuidInteger}`);

    return sections.filter(Boolean).join("\n\n");
  }
}

/**
 * Metadata can be extracted for versions 1, 6, and 7.
 */
const UUID_PARSERS: Record<
  number,
  (uuidBytes: Uint8Array, dv: DataView) => any
> = Object.freeze({
  1: parsev1v6,
  6: parsev1v6,
  7: parsev7,
});

/**
 * Versions 1 and 6. Note 6 is a re-order of 1.
 * Version 1 == layout: timeLow(32) | timeMid(16) | timeHi(12)
 * Version 6 == layout: timeHi(32)  | timeMid(16) | timeLow(12)
 */
function parsev1v6(uuidBytes: Uint8Array, dv: DataView) {
  const isV1 = uuidBytes[6] >> 4 === 1;

  const timeStamp = isV1
    ? (BigInt(dv.getUint16(6) & 0x0fff) << 48n) | // mask off version bits
      (BigInt(dv.getUint16(4)) << 32n) |
      BigInt(dv.getUint32(0))
    : (BigInt(dv.getUint32(0)) << 28n) |
      (BigInt(dv.getUint16(4)) << 12n) |
      BigInt(dv.getUint16(6) & 0x0fff);

  // Convert to Unix time
  const milliseconds = Number((timeStamp - 122192928000000000n) / 10000n);

  return {
    timestamp: milliseconds,
    isoTimestamp: new Date(milliseconds).toISOString(),
    clock: ((uuidBytes[8] & 0x3f) << 8) | uuidBytes[9],
    node: toHex(uuidBytes.slice(10), ":").toUpperCase(),
  };
}

/** Version 7 */
function parsev7(uuidBytes: Uint8Array, dv: DataView) {
  const milliseconds = Number(
    (BigInt(dv.getUint32(0)) << 16n) | BigInt(dv.getUint16(4)),
  );

  return {
    timestamp: milliseconds,
    isoTimestamp: new Date(milliseconds).toISOString(),
    randA: ((uuidBytes[6] & 0x0f) << 8) | uuidBytes[7],
    randB: toHex(uuidBytes.slice(8), "").toUpperCase(),
  };
}

/**
 * Formats metadata
 *
 * @param {any} decoded
 * @returns {string}
 */
function formatDecoded(decoded: any): string {
  if (!decoded)
    return "No metadata available. Only versions 1, 6, 7 are supported.";

  return Object.entries({
    Timestamp: decoded.timestamp,
    "Timestamp (ISO)": decoded.isoTimestamp,
    Node: decoded.node,
    Clock: decoded.clock,
    "Rand A": decoded.randA,
    "Rand B": decoded.randB,
  })
    .filter(([, value]) => value !== undefined)
    .map(([label, value]) => `${label}:\n${value}`)
    .join("\n\n");
}

export default AnalyseUUID;
