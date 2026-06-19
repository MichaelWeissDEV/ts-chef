/**
 * @fileoverview Mock for @li0ard/streebog to avoid ES Module errors in Jest.
 */

export function streebog256(_buf: Uint8Array): Uint8Array {
  return new Uint8Array(32);
}

export function streebog512(_buf: Uint8Array): Uint8Array {
  return new Uint8Array(64);
}
