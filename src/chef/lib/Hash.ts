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

import Utils from "../Utils";
// @ts-ignore
import CryptoApi from "crypto-api/src/crypto-api.mjs";

/**
 * Generic hash function.
 */
export function runHash(
  name: string,
  input: ArrayBuffer,
  options: any = {},
): string {
  const msg = Utils.arrayBufferToStr(input, false),
    hasher = CryptoApi.getHasher(name, options);
  hasher.update(msg);
  return CryptoApi.encoder.toHex(hasher.finalize());
}
