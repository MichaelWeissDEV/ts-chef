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
import { ASP, importPrivateKey } from "../lib/PGP";
import OperationError from "../errors/OperationError";
import promisify from "es6-promisify";

/**
 * PGP Decrypt operation
 */
export class PGPDecrypt extends Operation {
  /**
   * PGPDecrypt constructor
   */
  constructor() {
    super();

    this.name = "PGP Decrypt";
    this.module = "PGP";
    this.description = [
      "Input: the ASCII-armoured PGP message you want to decrypt.",
      "<br><br>",
      "Arguments: the ASCII-armoured PGP private key of the recipient, ",
      "(and the private key password if necessary).",
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
        name: "Private key of recipient",
        type: "text",
        value: "",
      },
      {
        name: "Private key passphrase",
        type: "string",
        value: "",
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   *
   * @throws {OperationError} if invalid private key
   */
  async run(input: any, args: any[]): Promise<any> {
    const encryptedMessage = input,
      [privateKey, passphrase] = args,
      keyring = new kbpgp.keyring.KeyRing();
    let plaintextMessage: any;

    if (!privateKey)
      throw new OperationError("Enter the private key of the recipient.");

    const key = await importPrivateKey(privateKey, passphrase);
    keyring.add_key_manager(key);

    try {
      plaintextMessage = await promisify(kbpgp.unbox)({
        armored: encryptedMessage,
        keyfetch: keyring,
        asp: ASP,
      });
    } catch (err) {
      throw new OperationError(
        `Couldn't decrypt message with provided private key: ${err}`,
      );
    }

    return plaintextMessage.toString();
  }
}

export default PGPDecrypt;
