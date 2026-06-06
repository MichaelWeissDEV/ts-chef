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
  run(input: any, args: any[]): any {
    return (ntlm as any).smbhash.lmhash(input);
  }
}

export default LMHash;
