/**
 * @fileoverview LZString module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import LZString from "lz-string";

export const COMPRESSION_OUTPUT_FORMATS = ["default", "UTF16", "Base64"];

export const COMPRESSION_FUNCTIONS: Record<string, (input: string) => string> =
  {
    default: LZString.compress,
    UTF16: LZString.compressToUTF16,
    Base64: LZString.compressToBase64,
  };

export const DECOMPRESSION_FUNCTIONS: Record<
  string,
  (input: string) => string | null
> = {
  default: LZString.decompress,
  UTF16: LZString.decompressFromUTF16,
  Base64: LZString.decompressFromBase64,
};
