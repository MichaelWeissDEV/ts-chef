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

import { OperationError } from "../errors/OperationError";
import { fromHex } from "./Hex";
import { Utils } from "../Utils";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const r = require("jsrsasign");

function sm3Bytes(data: number[]): number[] {
  const ROL32 = (x: number, n: number) => ((x << n) >>> 0) | (x >>> (32 - n));
  const msgLen = data.length;
  const bitLen = msgLen * 8;
  const padLen = Math.ceil((msgLen + 9) / 64) * 64;
  const padded = new Uint8Array(padLen);
  padded.set(data);
  padded[msgLen] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padLen - 4, bitLen >>> 0, false);
  dv.setUint32(padLen - 8, Math.floor(bitLen / 2 ** 32), false);

  const T: number[] = [];
  for (let j = 0; j < 16; j++) T[j] = 0x79cc4519;
  for (let j = 16; j < 64; j++) T[j] = 0x7a879d8a;
  const P0 = (x: number) => x ^ ROL32(x, 9) ^ ROL32(x, 17);
  const P1 = (x: number) => x ^ ROL32(x, 15) ^ ROL32(x, 23);
  const FF = (x: number, y: number, z: number, j: number) =>
    j < 16 ? x ^ y ^ z : (x & y) | (x & z) | (y & z);
  const GG = (x: number, y: number, z: number, j: number) =>
    j < 16 ? x ^ y ^ z : (x & y) | (~x & z);

  let V = [
    0x7380166f, 0x4914b2b9, 0x172442d7, 0xda8a0600, 0xa96f30bc, 0x163138aa,
    0xe38dee4d, 0xb0fb0e4e,
  ];

  for (let i = 0; i < padded.length; i += 64) {
    const W: number[] = [];
    for (let j = 0; j < 16; j++) W[j] = dv.getUint32(i + j * 4, false);
    for (let j = 16; j < 68; j++) {
      W[j] =
        (P1(W[j - 16] ^ W[j - 9] ^ ROL32(W[j - 3], 15)) ^
          ROL32(W[j - 13], 7) ^
          W[j - 6]) >>>
        0;
    }
    const W1 = W.slice(0, 64).map((w, j) => (w ^ W[j + 4]) >>> 0);
    let [A, B, C, D, E, F, G, H] = V;
    for (let j = 0; j < 64; j++) {
      const SS1 = ROL32((ROL32(A, 12) + E + ROL32(T[j], j % 32)) >>> 0, 7);
      const SS2 = (SS1 ^ ROL32(A, 12)) >>> 0;
      const TT1 = (FF(A, B, C, j) + D + SS2 + W1[j]) >>> 0;
      const TT2 = (GG(E, F, G, j) + H + SS1 + W[j]) >>> 0;
      D = C;
      C = ROL32(B, 9);
      B = A;
      A = TT1;
      H = G;
      G = ROL32(F, 19);
      F = E;
      E = P0(TT2);
    }
    V = [
      V[0] ^ A,
      V[1] ^ B,
      V[2] ^ C,
      V[3] ^ D,
      V[4] ^ E,
      V[5] ^ F,
      V[6] ^ G,
      V[7] ^ H,
    ].map((x) => x >>> 0);
  }

  const result: number[] = [];
  for (const h of V) {
    result.push(
      (h >>> 24) & 0xff,
      (h >>> 16) & 0xff,
      (h >>> 8) & 0xff,
      h & 0xff,
    );
  }
  return result;
}

function bytesToHex(bytes: number[]): string {
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export class SM2 {
  private ecParams: {
    G: unknown;
    n: unknown;
    curve: unknown;
    keycharlen: number;
  };
  private rng: unknown;
  private format: string;
  private publicKey: unknown = null;
  private privateKey: unknown = null;

  constructor(curve: string, format: string) {
    this.rng = new r.SecureRandom();
    r.crypto.ECParameterDB.regist(
      "sm2p256v1",
      256,
      "FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFF",
      "FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFC",
      "28E9FA9E9D9F5E344D5A9E4BCF6509A7F39789F515AB8F92DDBCBD414D940E93",
      "FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFF7203DF6B21C6052B53BBF40939D54123",
      "1",
      "32C4AE2C1F1981195F9904466A39C9948FE30BBFF2660BE1715A4589334C74C7",
      "BC3736A2F4F6779C59BDCEE36B692153D0A9877CC62A474002DF32E52139F0A0",
      [],
    );
    this.ecParams = r.crypto.ECParameterDB.getByName(curve);
    this.format = format;
  }

  setPublicKey(publicKeyX: string, publicKeyY: string): void {
    this.publicKey = (
      this.ecParams.curve as { decodePointHex: (h: string) => unknown }
    ).decodePointHex("04" + publicKeyX + publicKeyY);
    if ((this.publicKey as { isInfinity: () => boolean }).isInfinity()) {
      throw new OperationError("Invalid Public Key");
    }
  }

  setPrivateKey(privateKeyHex: string): void {
    this.privateKey = new r.BigInteger(privateKeyHex, 16);
  }

  private getPointAsHex(point: unknown): [string, string] {
    const biX = (
      point as {
        getX: () => { toBigInteger: () => { toString: (r: number) => string } };
      }
    )
      .getX()
      .toBigInteger();
    const biY = (
      point as {
        getY: () => { toBigInteger: () => { toString: (r: number) => string } };
      }
    )
      .getY()
      .toBigInteger();
    const charlen = this.ecParams.keycharlen;
    const hX = ("0000000000" + biX.toString(16)).slice(-charlen);
    const hY = ("0000000000" + biY.toString(16)).slice(-charlen);
    return [hX, hY];
  }

  private sm3Compute(data: number[]): number[] {
    return sm3Bytes(data);
  }

  private kdf(p2: unknown, len: number): string {
    const [hX, hY] = this.getPointAsHex(p2);
    const total = Math.ceil(len / 32) + 1;
    let keyMaterial = "";
    for (let cnt = 1; cnt < total; cnt++) {
      const num = Utils.intToByteArray(cnt, 4, "big");
      const overall = fromHex(hX).concat(fromHex(hY)).concat(num);
      keyMaterial += bytesToHex(this.sm3Compute(overall));
    }
    return keyMaterial;
  }

  private c3(p2: unknown, input: Uint8Array): string {
    const [hX, hY] = this.getPointAsHex(p2);
    const overall = fromHex(hX).concat(Array.from(input)).concat(fromHex(hY));
    return bytesToHex(this.sm3Compute(overall));
  }

  private getBigRandom(limit: unknown): unknown {
    const lim = limit as {
      bitLength: () => number;
      subtract: (o: unknown) => unknown;
    };
    return new r.BigInteger(lim.bitLength(), this.rng)
      .mod(lim.subtract(r.BigInteger.ONE))
      .add(r.BigInteger.ONE);
  }

  encrypt(input: Uint8Array): string {
    const G = this.ecParams.G as { multiply: (k: unknown) => unknown };
    const k = this.getBigRandom(this.ecParams.n);
    const c1 = G.multiply(k);
    const [hexC1X, hexC1Y] = this.getPointAsHex(c1);
    const p2 = (
      this.publicKey as { multiply: (k: unknown) => unknown }
    ).multiply(k);
    const c3 = this.c3(p2, input);
    const key = this.kdf(p2, input.byteLength);
    const inputCopy = new Uint8Array(input);
    for (let i = 0; i < inputCopy.byteLength; i++) {
      inputCopy[i] ^= Utils.ord(key[i]);
    }
    const c2 = Buffer.from(inputCopy).toString("hex");
    return this.format === "C1C3C2"
      ? hexC1X + hexC1Y + c3 + c2
      : hexC1X + hexC1Y + c2 + c3;
  }

  decrypt(input: string): ArrayBuffer {
    const c1X = input.slice(0, 64);
    const c1Y = input.slice(64, 128);
    let c3: string, c2Hex: string;
    if (this.format === "C1C3C2") {
      c3 = input.slice(128, 192);
      c2Hex = input.slice(192);
    } else {
      c2Hex = input.slice(128, -64);
      c3 = input.slice(-64);
    }
    const c2 = new Uint8Array(fromHex(c2Hex));
    const c1 = (
      this.ecParams.curve as { decodePointHex: (h: string) => unknown }
    ).decodePointHex("04" + c1X + c1Y);
    const p2 = (c1 as { multiply: (k: unknown) => unknown }).multiply(
      this.privateKey,
    );
    const key = this.kdf(p2, c2.byteLength);
    for (let i = 0; i < c2.byteLength; i++) {
      c2[i] ^= Utils.ord(key[i]);
    }
    const check = this.c3(p2, c2);
    if (check === c3) {
      return c2.buffer as ArrayBuffer;
    } else {
      throw new OperationError(
        "Decryption Error -- Computed Hashes Do Not Match",
      );
    }
  }
}
