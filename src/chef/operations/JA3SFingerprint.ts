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
import Utils from "../Utils";
import Stream from "../lib/Stream";
import { runHash } from "../lib/Hash";

/**
 * JA3S Fingerprint operation
 */
export class JA3SFingerprint extends Operation {
  /**
   * JA3SFingerprint constructor
   */
  constructor() {
    super();

    this.name = "JA3S Fingerprint";
    this.module = "Crypto";
    this.description =
      "Generates a JA3S fingerprint to help identify TLS servers based on hashing together values from the Server Hello.<br><br>Input: A hex stream of the TLS Server Hello record application layer.";
    this.infoURL =
      "https://engineering.salesforce.com/tls-fingerprinting-with-ja3-and-ja3s-247362855967";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Input format",
        type: "option",
        value: ["Hex", "Base64", "Raw"],
      },
      {
        name: "Output format",
        type: "option",
        value: ["Hash digest", "JA3S string", "Full details"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const [inputFormat, outputFormat] = args;

    input = Utils.convertToByteArray(input, inputFormat);
    const s = new Stream(new Uint8Array(input));

    const handshake = s.readInt(1);
    if (handshake !== 0x16) throw new OperationError("Not handshake data.");

    // Version
    s.moveForwardsBy(2);

    // Length
    const length = s.readInt(2);
    if (length === undefined || s.length !== length + 5)
      throw new OperationError("Incorrect handshake length.");

    // Handshake type
    const handshakeType = s.readInt(1);
    if (handshakeType !== 2) throw new OperationError("Not a Server Hello.");

    // Handshake length
    const handshakeLength = s.readInt(3);
    if (handshakeLength === undefined || s.length !== handshakeLength + 9)
      throw new OperationError("Not enough data in Server Hello.");

    // Hello version
    const helloVersion = s.readInt(2);
    if (helloVersion === undefined)
      throw new OperationError("Could not read TLS version.");

    // Random
    s.moveForwardsBy(32);

    // Session ID
    const sessionIDLength = s.readInt(1);
    if (sessionIDLength === undefined)
      throw new OperationError("Could not read session ID length.");
    s.moveForwardsBy(sessionIDLength);

    // Cipher suite
    const cipherSuite = s.readInt(2);
    if (cipherSuite === undefined)
      throw new OperationError("Could not read cipher suite.");

    // Compression Method
    s.moveForwardsBy(1);

    // Extensions
    const extensionsLength = s.readInt(2);
    if (extensionsLength === undefined)
      throw new OperationError("Could not read extensions length.");
    const extensions = s.getBytes(extensionsLength);
    if (extensions === undefined)
      throw new OperationError("Could not read extensions.");
    const es = new Stream(extensions);
    const exts = [];
    while (es.hasMore()) {
      const type = es.readInt(2);
      const length = es.readInt(2);
      if (type === undefined || length === undefined) break;
      es.moveForwardsBy(length);
      exts.push(type);
    }

    // Output
    const ja3s = [helloVersion.toString(), cipherSuite, exts.join("-")];
    const ja3sStr = ja3s.join(",");
    const ja3sHash = runHash("md5", Utils.strToArrayBuffer(ja3sStr));

    switch (outputFormat) {
      case "JA3S string":
        return ja3sStr;
      case "Full details":
        return `Hash digest:
${ja3sHash}

Full JA3S string:
${ja3sStr}

TLS Version:
${helloVersion.toString()}
Cipher Suite:
${cipherSuite}
Extensions:
${exts.join("-")}`;
      case "Hash digest":
      default:
        return ja3sHash;
    }
  }
}

export default JA3SFingerprint;
