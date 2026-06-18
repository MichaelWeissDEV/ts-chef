/**
 * @fileoverview remove-exif - Third-party vendor code (ported from GCHQ CyberChef)
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

export function removeEXIF(data: ArrayBuffer | Uint8Array): ArrayBuffer {
  // Stub: returns input unchanged
  if (data instanceof ArrayBuffer) return data as ArrayBuffer;
  return data.buffer as ArrayBuffer;
}
