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
 * HASSH Server Fingerprint operation
 */
export class HASSHServerFingerprint extends Operation {
  /**
   * HASSHServerFingerprint constructor
   */
  constructor() {
    super();

    this.name = "HASSH Server Fingerprint";
    this.module = "Crypto";
    this.description =
      "Generates a HASSH fingerprint to help identify SSH servers based on hashing together values from the Server Key Exchange Init message.<br><br>Input: A hex stream of the SSH_MSG_KEXINIT packet application layer from Server to Client.";
    this.infoURL =
      "https://engineering.salesforce.com/open-sourcing-hassh-abed3ae5044c";
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
        value: ["Hash digest", "HASSH algorithms string", "Full details"],
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

    // Length
    const length = s.readInt(4);
    if (length === undefined || s.length !== length + 4)
      throw new OperationError("Incorrect packet length.");

    // Padding length
    const paddingLength = s.readInt(1);
    if (paddingLength === undefined)
      throw new OperationError("Could not read padding length.");

    // Message code
    const messageCode = s.readInt(1);
    if (messageCode !== 20)
      throw new OperationError("Not a Key Exchange Init.");

    // Cookie
    s.moveForwardsBy(16);

    // KEX Algorithms
    const kexAlgosLength = s.readInt(4);
    if (kexAlgosLength === undefined)
      throw new OperationError("Could not read KEX algorithms length.");
    const kexAlgos = s.readString(kexAlgosLength) ?? "";

    // Server Host Key Algorithms
    const serverHostKeyAlgosLength = s.readInt(4);
    if (serverHostKeyAlgosLength === undefined)
      throw new OperationError(
        "Could not read server host key algorithms length.",
      );
    s.moveForwardsBy(serverHostKeyAlgosLength);

    // Encryption Algorithms Client to Server
    const encAlgosC2SLength = s.readInt(4);
    if (encAlgosC2SLength === undefined)
      throw new OperationError(
        "Could not read encryption algorithms (C2S) length.",
      );
    s.moveForwardsBy(encAlgosC2SLength);

    // Encryption Algorithms Server to Client
    const encAlgosS2CLength = s.readInt(4);
    if (encAlgosS2CLength === undefined)
      throw new OperationError(
        "Could not read encryption algorithms (S2C) length.",
      );
    const encAlgosS2C = s.readString(encAlgosS2CLength) ?? "";

    // MAC Algorithms Client to Server
    const macAlgosC2SLength = s.readInt(4);
    if (macAlgosC2SLength === undefined)
      throw new OperationError("Could not read MAC algorithms (C2S) length.");
    s.moveForwardsBy(macAlgosC2SLength);

    // MAC Algorithms Server to Client
    const macAlgosS2CLength = s.readInt(4);
    if (macAlgosS2CLength === undefined)
      throw new OperationError("Could not read MAC algorithms (S2C) length.");
    const macAlgosS2C = s.readString(macAlgosS2CLength) ?? "";

    // Compression Algorithms Client to Server
    const compAlgosC2SLength = s.readInt(4);
    if (compAlgosC2SLength === undefined)
      throw new OperationError(
        "Could not read compression algorithms (C2S) length.",
      );
    s.moveForwardsBy(compAlgosC2SLength);

    // Compression Algorithms Server to Client
    const compAlgosS2CLength = s.readInt(4);
    if (compAlgosS2CLength === undefined)
      throw new OperationError(
        "Could not read compression algorithms (S2C) length.",
      );
    const compAlgosS2C = s.readString(compAlgosS2CLength) ?? "";

    // Languages Client to Server
    const langsC2SLength = s.readInt(4);
    if (langsC2SLength === undefined)
      throw new OperationError("Could not read languages (C2S) length.");
    s.moveForwardsBy(langsC2SLength);

    // Languages Server to Client
    const langsS2CLength = s.readInt(4);
    if (langsS2CLength === undefined)
      throw new OperationError("Could not read languages (S2C) length.");
    s.moveForwardsBy(langsS2CLength);

    // First KEX packet follows
    s.moveForwardsBy(1);

    // Reserved
    s.moveForwardsBy(4);

    // Padding string
    s.moveForwardsBy(paddingLength);

    // Output
    const hassh = [kexAlgos, encAlgosS2C, macAlgosS2C, compAlgosS2C];
    const hasshStr = hassh.join(";");
    const hasshHash = runHash("md5", Utils.strToArrayBuffer(hasshStr));

    switch (outputFormat) {
      case "HASSH algorithms string":
        return hasshStr;
      case "Full details":
        return `Hash digest:
${hasshHash}

Full HASSH algorithms string:
${hasshStr}

Key Exchange Algorithms:
${kexAlgos}
Encryption Algorithms Server to Client:
${encAlgosS2C}
MAC Algorithms Server to Client:
${macAlgosS2C}
Compression Algorithms Server to Client:
${compAlgosS2C}`;
      case "Hash digest":
      default:
        return hasshHash;
    }
  }
}

export default HASSHServerFingerprint;
