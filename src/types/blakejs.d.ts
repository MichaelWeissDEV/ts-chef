/**
 * @fileoverview Type definitions for blakejs.d
 * @package types
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

declare module "blakejs" {
  type Key = Uint8Array | null;

  export function blake2b(
    data: Uint8Array | string,
    key: Key,
    outlen: number,
  ): Uint8Array;
  export function blake2bHex(
    data: Uint8Array | string,
    key: Key,
    outlen: number,
  ): string;
  export function blake2bInit(outlen: number, key: Key): object;
  export function blake2bUpdate(ctx: object, data: Uint8Array | string): void;
  export function blake2bFinal(ctx: object): Uint8Array;

  export function blake2s(
    data: Uint8Array | string,
    key: Key,
    outlen: number,
  ): Uint8Array;
  export function blake2sHex(
    data: Uint8Array | string,
    key: Key,
    outlen: number,
  ): string;
  export function blake2sInit(outlen: number, key: Key): object;
  export function blake2sUpdate(ctx: object, data: Uint8Array | string): void;
  export function blake2sFinal(ctx: object): Uint8Array;
}
