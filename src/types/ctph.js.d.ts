/**
 * @fileoverview Type definitions for ctph.js.d
 * @package types
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

declare module "ctph.js" {
  export function digest(input: string): string;
  export function similarity(hash1: string, hash2: string): number;
}
