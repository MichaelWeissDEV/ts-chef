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
import kbpgp from "kbpgp";
import { ASP, importPublicKey } from "../lib/PGP";
import OperationError from "../errors/OperationError";
import promisify from "es6-promisify";

/**
 * PGP Encrypt operation
 */
export class PGPEncrypt extends Operation {
  /**
   * PGPEncrypt constructor
   */
  constructor() {
    super();

    this.name = "PGP Encrypt";
    this.module = "PGP";
    this.description = [
      "Input: the message you want to encrypt.",
      "<br><br>",
      "Arguments: the ASCII-armoured PGP public key of the recipient.",
      "<br><br>",
      "Pretty Good Privacy is an encryption standard (OpenPGP) used for encrypting, decrypting, and signing messages.",
      "<br><br>",
      "This function uses the Keybase implementation of PGP.",
    ].join("\n");
    this.infoURL = "https://wikipedia.org/wiki/Pretty_Good_Privacy";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Public key of recipient",
        type: "text",
        value: "",
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   *
   * @throws {OperationError} if failed private key import or failed encryption
   */
  async run(input: any, args: any[]): Promise<any> {
    const plaintextMessage = input,
      plainPubKey = args[0];
    let encryptedMessage;

    if (!plainPubKey)
      throw new OperationError("Enter the public key of the recipient.");

    const key = await importPublicKey(plainPubKey);

    try {
      encryptedMessage = await (promisify(kbpgp.box)({
        msg: plaintextMessage,
        encrypt_for: key,
        asp: ASP,
      }) as Promise<any>);
    } catch (err) {
      throw new OperationError(
        `Couldn't encrypt message with provided public key: ${err}`,
      );
    }

    return encryptedMessage.toString();
  }
}

export default PGPEncrypt;
