/**
 * @fileoverview ParseURI operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

export class ParseURI extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "Parse URI";
    this.module = "URL";
    this.description =
      "Pretty prints complicated Uniform Resource Identifier (URI) strings for ease of reading.";
    this.infoURL = "https://wikipedia.org/wiki/Uniform_Resource_Identifier";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    let uri: URL;
    try {
      uri = new URL(input);
    } catch {
      return "Invalid URI";
    }

    let output = "";

    if (uri.protocol) output += "Protocol:\t" + uri.protocol + "\n";
    if (uri.username || uri.password)
      output +=
        "Auth:\t\t" +
        uri.username +
        (uri.password ? ":" + uri.password : "") +
        "\n";
    if (uri.hostname) output += "Hostname:\t" + uri.hostname + "\n";
    if (uri.port) output += "Port:\t\t" + uri.port + "\n";
    if (uri.pathname) output += "Path name:\t" + uri.pathname + "\n";

    const params = uri.searchParams;
    const keys = [...params.keys()];
    if (keys.length > 0) {
      const padding = Math.max(...keys.map((k) => k.length));
      output += "Arguments:\n";
      for (const [key, val] of params.entries()) {
        output += "\t" + key.padEnd(padding, " ");
        if (val.length) output += " = " + val + "\n";
        else output += "\n";
      }
    }

    if (uri.hash) output += "Hash:\t\t" + uri.hash + "\n";

    return output;
  }
}

export default ParseURI;
