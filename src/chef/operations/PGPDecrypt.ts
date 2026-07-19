/**
 * @fileoverview PGPDecrypt operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import kbpgp from "../lib/KbpgpCompat";
import { ASP, importPrivateKey } from "../lib/PGP";
import OperationError from "../errors/OperationError";
import { promisify } from "es6-promisify";

/**
 * PGP Decrypt operation
 */
export class PGPDecrypt extends TypedOperation<string, Promise<string>, unknown[]> {
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
  async run(input: string, args: unknown[]): Promise<string> {
    const encryptedMessage = input,
      [privateKey, passphrase] = args as [string, string],
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
