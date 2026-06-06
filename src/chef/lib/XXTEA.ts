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

/**
 * XXTEA library
 *
 * Encryption Algorithm Authors:
 *     David J. Wheeler
 *     Roger M. Needham
 *
 * @author Ma Bingyao [mabingyao@gmail.com]
 * @author n1474335 [n1474335@gmail.com]
 * @license MIT
 */

const DELTA = 0x9e3779b9;

/**
 * Convert a buffer to a Uint8Array
 * @param {Uint32Array} v
 * @param {boolean} includeLength
 * @returns {Uint8Array | null}
 */
function toUint8Array(
  v: Uint32Array,
  includeLength: boolean,
): Uint8Array | null {
  const length = v.length;
  let n = length << 2;
  if (includeLength) {
    const m = v[length - 1];
    n -= 4;
    if (m < n - 3 || m > n) {
      return null;
    }
    n = m;
  }
  const bytes = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    bytes[i] = v[i >> 2] >> ((i & 3) << 3);
  }
  return bytes;
}

/**
 * Convert a buffer to a Uint32Array
 * @param {Uint8Array} bs
 * @param {boolean} includeLength
 * @returns {Uint32Array}
 */
function toUint32Array(bs: Uint8Array, includeLength: boolean): Uint32Array {
  const length = bs.length;
  let n = length >> 2;
  if ((length & 3) !== 0) {
    ++n;
  }
  let v: Uint32Array;
  if (includeLength) {
    v = new Uint32Array(n + 1);
    v[n] = length;
  } else {
    v = new Uint32Array(n);
  }
  for (let i = 0; i < length; ++i) {
    v[i >> 2] |= bs[i] << ((i & 3) << 3);
  }
  return v;
}

/**
 * Mask an int to 32 bits
 * @param {number} i
 * @returns {number}
 */
function int32(i: number): number {
  return i & 0xffffffff;
}

/**
 * MX function for data randomisation
 * @param {number} sum
 * @param {number} y
 * @param {number} z
 * @param {number} p
 * @param {number} e
 * @param {Uint32Array} k
 * @returns {number}
 */
function mx(
  sum: number,
  y: number,
  z: number,
  p: number,
  e: number,
  k: Uint32Array,
): number {
  return (
    (((z >>> 5) ^ (y << 2)) + ((y >>> 3) ^ (z << 4))) ^
    ((sum ^ y) + (k[(p & 3) ^ e] ^ z))
  );
}

/**
 * Ensure an array is a multiple of 16 bits
 * @param {Uint8Array} k
 * @returns {Uint8Array}
 */
function fixk(k: Uint8Array): Uint8Array {
  if (k.length < 16) {
    const key = new Uint8Array(16);
    key.set(k);
    return key;
  }
  return k;
}

/**
 * Performs XXTEA encryption on a Uint32Array
 * @param {Uint32Array} v
 * @param {Uint32Array} k
 * @returns {Uint32Array}
 */
function encryptUint32Array(v: Uint32Array, k: Uint32Array): Uint32Array {
  const length = v.length;
  if (length <= 1) return v;
  const n = length - 1;
  let y, z, sum, e, p, q;
  z = v[n];
  sum = 0;
  for (q = Math.floor(6 + 52 / length) | 0; q > 0; --q) {
    sum = int32(sum + DELTA);
    e = (sum >>> 2) & 3;
    for (p = 0; p < n; ++p) {
      y = v[p + 1];
      z = v[p] = int32(v[p] + mx(sum, y, z, p, e, k));
    }
    y = v[0];
    z = v[n] = int32(v[n] + mx(sum, y, z, n, e, k));
  }
  return v;
}

/**
 * Performs XXTEA decryption on a Uint32Array
 * @param {Uint32Array} v
 * @param {Uint32Array} k
 * @returns {Uint32Array}
 */
function decryptUint32Array(v: Uint32Array, k: Uint32Array): Uint32Array {
  const length = v.length;
  if (length <= 1) return v;
  const n = length - 1;
  let y, z, sum, e, p;
  y = v[0];
  const q = Math.floor(6 + 52 / length);
  for (sum = int32(q * DELTA); sum !== 0; sum = int32(sum - DELTA)) {
    e = (sum >>> 2) & 3;
    for (p = n; p > 0; --p) {
      z = v[p - 1];
      y = v[p] = int32(v[p] - mx(sum, y, z, p, e, k));
    }
    z = v[n];
    y = v[0] = int32(v[0] - mx(sum, y, z, 0, e, k));
  }
  return v;
}

/**
 * Encrypt function
 * @param {Uint8Array} data
 * @param {Uint8Array} key
 * @returns {Uint8Array | null}
 */
export function encrypt(data: Uint8Array, key: Uint8Array): Uint8Array | null {
  if (data === undefined || data === null || data.length === 0) {
    return data;
  }
  return toUint8Array(
    encryptUint32Array(
      toUint32Array(data, true),
      toUint32Array(fixk(key), false),
    ),
    false,
  );
}

/**
 * Decrypt function
 * @param {Uint8Array} data
 * @param {Uint8Array} key
 * @returns {Uint8Array | null}
 */
export function decrypt(data: Uint8Array, key: Uint8Array): Uint8Array | null {
  if (data === undefined || data === null || data.length === 0) {
    return data;
  }
  return toUint8Array(
    decryptUint32Array(
      toUint32Array(data, false),
      toUint32Array(fixk(key), false),
    ),
    true,
  );
}
