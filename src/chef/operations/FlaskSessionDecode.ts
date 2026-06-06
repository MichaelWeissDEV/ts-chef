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
import OperationError from "../errors/OperationError";
import { fromBase64 } from "../lib/Base64";

/**
 * Flask Session Decode operation
 */
export class FlaskSessionDecode extends Operation {
  /**
   * FlaskSessionDecode constructor
   */
  constructor() {
    super();

    this.name = "Flask Session Decode";
    this.module = "Crypto";
    this.description =
      "Decodes the payload of a Flask session cookie (itsdangerous) into JSON.";
    this.inputType = "string";
    this.outputType = "JSON";
    this.args = [
      {
        name: "View TimeStamp",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {Object[]}
   */
  run(input: any, args: any[]): any {
    input = input.trim();
    const parts = input.split(".");
    if (parts.length !== 3) {
      throw new OperationError(
        "Invalid Flask token format. Expected payload.timestamp.signature",
      );
    }

    const payloadB64 = parts[0];
    const time = parts[1];

    const timeB64 = time.replace(/-/g, "+").replace(/_/g, "/");
    const binary = fromBase64(timeB64);
    const bytes = new Uint8Array(4);
    for (let i = 0; i < 4; i++) {
      bytes[i] = (binary as string).charCodeAt(i);
    }
    const view = new DataView(bytes.buffer);
    const timestamp = view.getInt32(0, false);

    const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    let payloadJson;
    try {
      payloadJson = fromBase64(padded) as string;
    } catch (e) {
      throw new OperationError("Invalid Base64 payload");
    }

    try {
      let data = JSON.parse(payloadJson);

      if (args[0]) {
        data = { payload: data, timestamp: timestamp };
      }
      return data;
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      throw new OperationError("Unable to decode JSON payload: " + errMsg);
    }
  }
}

export default FlaskSessionDecode;
