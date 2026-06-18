/**
 * @fileoverview RSA module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import forge from "node-forge";

export const MD_ALGORITHMS = {
  "SHA-1": forge.md.sha1,
  MD5: forge.md.md5,
  "SHA-256": forge.md.sha256,
  "SHA-384": forge.md.sha384,
  "SHA-512": forge.md.sha512,
};
