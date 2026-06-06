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
import UAParser from "ua-parser-js";

/**
 * Parse User Agent operation
 */
export class ParseUserAgent extends Operation {
  /**
   * ParseUserAgent constructor
   */
  constructor() {
    super();

    this.name = "Parse User Agent";
    this.module = "UserAgent";
    this.description =
      "Attempts to identify and categorise information contained in a user-agent string.";
    this.infoURL = "https://wikipedia.org/wiki/User_agent";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
    this.checks = [
      {
        pattern: "^(User-Agent:|Mozilla\\/)[^\\n\\r]+\\s*$",
        flags: "i",
        args: [],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const ua = new UAParser(input).getResult();
    return `Browser
    Name: ${ua.browser.name || "unknown"}
    Version: ${ua.browser.version || "unknown"}
Device
    Model: ${ua.device.model || "unknown"}
    Type: ${ua.device.type || "unknown"}
    Vendor: ${ua.device.vendor || "unknown"}
Engine
    Name: ${ua.engine.name || "unknown"}
    Version: ${ua.engine.version || "unknown"}
OS
    Name: ${ua.os.name || "unknown"}
    Version: ${ua.os.version || "unknown"}
CPU
    Architecture: ${ua.cpu.architecture || "unknown"}`;
  }
}

export default ParseUserAgent;
