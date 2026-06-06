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

import kbpgp from "kbpgp";
import { ASP, importPublicKey } from "../lib/PGP";
import promisify from "es6-promisify";

/**
 * PGP Verify operation
 */
export class PGPVerify extends Operation {
  /**
   * PGPVerify constructor
   */
  constructor() {
    super();

    this.name = "PGP Verify";
    this.module = "PGP";
    this.description = [
      "Input: the ASCII-armoured encrypted PGP message you want to verify.",
      "<br><br>",
      "Argument: the ASCII-armoured PGP public key of the signer",
      "<br><br>",
      "This operation uses PGP to decrypt a clearsigned message.",
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
        name: "Public key of signer",
        type: "text",
        value: "",
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  async run(input: any, args: any[]): Promise<any> {
    const signedMessage = input,
      [publicKey] = args,
      keyring = new kbpgp.keyring.KeyRing();
    let unboxedLiterals;

    if (!publicKey)
      throw new OperationError("Enter the public key of the signer.");
    const pubKey = await importPublicKey(publicKey);
    keyring.add_key_manager(pubKey);

    try {
      unboxedLiterals = await (promisify(kbpgp.unbox)({
        armored: signedMessage,
        keyfetch: keyring,
        asp: ASP,
      }) as Promise<any>);
      const ds = unboxedLiterals[0].get_data_signer();
      if (ds) {
        const km = ds.get_key_manager();
        if (km) {
          const signer = km.get_userids_mark_primary()[0].components;
          let text = "Signed by ";
          if (signer.email || signer.username || signer.comment) {
            if (signer.username) {
              text += `${signer.username} `;
            }
            if (signer.comment) {
              text += `(${signer.comment}) `;
            }
            if (signer.email) {
              text += `<${signer.email}>`;
            }
            text += "\n";
          }
          text += [
            `PGP key ID: ${km.get_pgp_short_key_id()}`,
            `PGP fingerprint: ${km.get_pgp_fingerprint().toString("hex")}`,
            `Signed on ${new Date(ds.sig.when_generated() * 1000).toUTCString()}`,
            "----------------------------------\n",
          ].join("\n");
          text += unboxedLiterals.toString();
          return text.trim();
        } else {
          throw new OperationError("Could not identify a key manager.");
        }
      } else {
        throw new OperationError("The data does not appear to be signed.");
      }
    } catch (err) {
      throw new OperationError(`Couldn't verify message: ${err}`);
    }
  }
}

export default PGPVerify;
