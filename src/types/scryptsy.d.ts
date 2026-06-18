/**
 * @fileoverview Type definitions for scryptsy.d
 * @package types
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

declare module "scryptsy" {
  function scryptsy(
    key: Buffer | string,
    salt: Buffer | string,
    N: number,
    r: number,
    p: number,
    dkLen: number,
    progressCallback?: (progress: number) => void,
  ): Buffer;
  export = scryptsy;
}
