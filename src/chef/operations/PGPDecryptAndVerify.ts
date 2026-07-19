/**
 * @fileoverview PGPDecryptAndVerify operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import kbpgp from "../lib/KbpgpCompat";
import { ASP, importPrivateKey, importPublicKey } from "../lib/PGP";
import OperationError from "../errors/OperationError";
import { promisify } from "es6-promisify";

/**
 * PGP Decrypt and Verify operation
 */
export class PGPDecryptAndVerify extends TypedOperation<string, Promise<string>, unknown[]> {
  /**
   * PGPDecryptAndVerify constructor
   */
  constructor() {
    super();

    this.name = "PGP Decrypt and Verify";
    this.module = "PGP";
    this.description = [
      "Input: the ASCII-armoured encrypted PGP message you want to verify.",
      "<br><br>",
      "Arguments: the ASCII-armoured PGP public key of the signer, ",
      "the ASCII-armoured private key of the recipient (and the private key password if necessary).",
      "<br><br>",
      "This operation uses PGP to decrypt and verify an encrypted digital signature.",
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
      {
        name: "Private key of recipient",
        type: "text",
        value: "",
      },
      {
        name: "Private key password",
        type: "string",
        value: "",
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  async run(input: string, args: unknown[]): Promise<string> {
    const signedMessage = input,
      [publicKey, privateKey, passphrase] = args as [string, string, string],
      keyring = new kbpgp.keyring.KeyRing();
    let unboxedLiterals;

    if (!publicKey)
      throw new OperationError("Enter the public key of the signer.");
    if (!privateKey)
      throw new OperationError("Enter the private key of the recipient.");
    const privKey = await importPrivateKey(privateKey, passphrase);
    const pubKey = await importPublicKey(publicKey);
    keyring.add_key_manager(pubKey);
    // Add the private key last. kbpgp indexes managers by key ID, so for a
    // self-signed/self-encrypted message a later public-only manager would
    // otherwise replace the decrypt-capable manager.
    keyring.add_key_manager(privKey);

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

export default PGPDecryptAndVerify;
