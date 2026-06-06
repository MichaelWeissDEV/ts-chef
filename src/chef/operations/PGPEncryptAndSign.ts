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
import { ASP, importPrivateKey, importPublicKey } from "../lib/PGP";
import OperationError from "../errors/OperationError";
import promisify from "es6-promisify";

/**
 * PGP Encrypt and Sign operation
 */
export class PGPEncryptAndSign extends Operation {
  /**
   * PGPEncryptAndSign constructor
   */
  constructor() {
    super();

    this.name = "PGP Encrypt and Sign";
    this.module = "PGP";
    this.description = [
      "Input: the cleartext you want to sign.",
      "<br><br>",
      "Arguments: the ASCII-armoured private key of the signer (plus the private key password if necessary)",
      "and the ASCII-armoured PGP public key of the recipient.",
      "<br><br>",
      "This operation uses PGP to produce an encrypted digital signature.",
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
        name: "Private key of signer",
        type: "text",
        value: "",
      },
      {
        name: "Private key passphrase",
        type: "string",
        value: "",
      },
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
   * @throws {OperationError} if failure to sign message
   */
  async run(input: any, args: any[]): Promise<any> {
    const message = input,
      [privateKey, passphrase, publicKey] = args;
    let signedMessage;

    if (!privateKey)
      throw new OperationError("Enter the private key of the signer.");
    if (!publicKey)
      throw new OperationError("Enter the public key of the recipient.");
    const privKey = await importPrivateKey(privateKey, passphrase);
    const pubKey = await importPublicKey(publicKey);

    try {
      signedMessage = await promisify(kbpgp.box)({
        msg: message,
        encrypt_for: pubKey,
        sign_with: privKey,
        asp: ASP,
      });
    } catch (err) {
      throw new OperationError(`Couldn't sign message: ${err}`);
    }

    return signedMessage;
  }
}

export default PGPEncryptAndSign;
