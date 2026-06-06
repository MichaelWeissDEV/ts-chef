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
import { runHash } from "../lib/Hash";

/**
 * NT Hash operation
 */
export class NTHash extends Operation {
  /**
   * NTHash constructor
   */
  constructor() {
    super();

    this.name = "NT Hash";
    this.module = "Crypto";
    this.description =
      "An NT Hash, sometimes referred to as an NTLM hash, is a method of storing passwords on Windows systems. It works by running MD4 on UTF-16LE encoded input. NTLM hashes are considered weak because they can be brute-forced very easily with modern hardware.";
    this.infoURL = "https://wikipedia.org/wiki/NT_LAN_Manager";
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
    // Convert to UTF-16LE
    const buf = new ArrayBuffer(input.length * 2);
    const bufView = new Uint16Array(buf);
    for (let i = 0; i < input.length; i++) {
      bufView[i] = input.charCodeAt(i);
    }

    const hashed = runHash("md4", buf);
    return hashed.toUpperCase();
  }
}

export default NTHash;
