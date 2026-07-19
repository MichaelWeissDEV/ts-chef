/**
 * @fileoverview Hash module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import Utils from "../Utils";
import CryptoApi from "./CryptoApiCompat";

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
