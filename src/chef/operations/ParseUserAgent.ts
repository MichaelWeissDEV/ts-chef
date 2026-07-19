/**
 * @fileoverview ParseUserAgent operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import { UAParser } from "ua-parser-js";

/**
 * Parse User Agent operation
 */
export class ParseUserAgent extends TypedOperation<string, string, unknown[]> {
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
  run(input: string, _args: unknown[]): string {
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
