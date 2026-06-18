/**
 * @fileoverview LMHash operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";
import * as ntlm from "ntlm";

/**
 * LM Hash operation
 */
export class LMHash extends Operation {
  /**
   * LMHash constructor
   */
  constructor() {
    super();

    this.name = "LM Hash";
    this.module = "Crypto";
    this.description =
      "An LM Hash, or LAN Manager Hash, is a deprecated way of storing passwords on old Microsoft operating systems. It is particularly weak and can be cracked in seconds on modern hardware using rainbow tables.";
    this.infoURL =
      "https://wikipedia.org/wiki/LAN_Manager#Password_hashing_algorithm";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, _args: unknown[]): string {
    return (ntlm as any).smbhash.lmhash(input);
  }
}

export default LMHash;
