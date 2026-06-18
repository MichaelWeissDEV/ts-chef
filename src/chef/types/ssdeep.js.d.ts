/**
 * @fileoverview Type definitions for ssdeep.js.d
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

declare module "ssdeep.js" {
  export function similarity(hash1: string, hash2: string): number;
  export function digest(data: string | Uint8Array): string;
}
