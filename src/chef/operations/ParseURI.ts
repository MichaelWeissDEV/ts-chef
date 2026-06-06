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

export class ParseURI extends Operation {
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
