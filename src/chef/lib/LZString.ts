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
