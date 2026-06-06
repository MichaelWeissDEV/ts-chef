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

const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

function polymod(values: number[]): number {
  let chk = 1;
  const gen = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  for (const v of values) {
    const b = chk >>> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      chk ^= (b >> i) & 1 ? gen[i] : 0;
    }
  }
  return chk;
}

function hrpExpand(hrp: string): number[] {
  const ret: number[] = [];
  for (const c of hrp) ret.push(c.charCodeAt(0) >> 5);
  ret.push(0);
  for (const c of hrp) ret.push(c.charCodeAt(0) & 31);
  return ret;
}

function convertBits(
  data: number[],
  fromBits: number,
  toBits: number,
  pad: boolean,
): number[] {
  let acc = 0,
    bits = 0;
  const ret: number[] = [];
  const maxV = (1 << toBits) - 1;
  for (const value of data) {
    acc = (acc << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      ret.push((acc >> bits) & maxV);
    }
  }
  if (pad && bits > 0) ret.push((acc << (toBits - bits)) & maxV);
  return ret;
}

export class ToBech32 extends Operation {
  constructor() {
    super();
    this.name = "To Bech32";
    this.module = "Default";
    this.description =
      "Encodes data into Bech32 format, used for Bitcoin SegWit addresses.";
    this.infoURL =
      "https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      { name: "Human-readable part", type: "string", value: "bc" },
      { name: "Version", type: "number", value: 0 },
    ];
  }

  run(input: ArrayBuffer, args: unknown[]): string {
    const hrp = (args[0] as string).toLowerCase();
    const version = args[1] as number;

    const data = Array.from(new Uint8Array(input));
    const converted = convertBits(data, 8, 5, true);
    if (!converted)
      throw new OperationError("Unable to convert bits for Bech32");

    const values = [version].concat(converted);
    const checkValues = hrpExpand(hrp)
      .concat(values)
      .concat([0, 0, 0, 0, 0, 0]);
    const polyVal = polymod(checkValues) ^ 1;
    const checksum: number[] = [];
    for (let i = 0; i < 6; i++) {
      checksum.push((polyVal >> (5 * (5 - i))) & 31);
    }

    return (
      hrp +
      "1" +
      values
        .concat(checksum)
        .map((v) => CHARSET[v])
        .join("")
    );
  }
}

export default ToBech32;
