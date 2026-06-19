/**
 * @fileoverview PGPEncrypt operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import kbpgp from "kbpgp";
import { ASP, importPublicKey } from "../lib/PGP";
import OperationError from "../errors/OperationError";
import promisify from "es6-promisify";

/**
 * PGP Encrypt operation
 */
export class PGPEncrypt extends TypedOperation<string, Promise<string>, unknown[]> {
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
  async run(input: string, args: unknown[]): Promise<string> {
    const plaintextMessage = input,
      [plainPubKey] = args as [string];
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
