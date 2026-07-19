/**
 * @fileoverview GeneratePGPKeyPair operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import kbpgp from "../lib/KbpgpCompat";
import { getSubkeySize, ASP } from "../lib/PGP";
import { cryptNotice } from "../lib/Crypt";
import { promisify } from "es6-promisify";

/**
 * Generate PGP Key Pair operation
 */
export class GeneratePGPKeyPair extends TypedOperation<string, Promise<AnyInput>, unknown[]> {
  /**
   * GeneratePGPKeyPair constructor
   */
  constructor() {
    super();

    this.name = "Generate PGP Key Pair";
    this.module = "PGP";
    this.description = `Generates a new public/private PGP key pair. Supports RSA and Eliptic Curve (EC) keys.<br><br>${cryptNotice}`;
    this.infoURL = "https://wikipedia.org/wiki/Pretty_Good_Privacy";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Key type",
        type: "option",
        value: [
          "RSA-1024",
          "RSA-2048",
          "RSA-4096",
          "ECC-256",
          "ECC-384",
          "ECC-521",
        ],
      },
      {
        name: "Password (optional)",
        type: "string",
        value: "",
      },
      {
        name: "Name (optional)",
        type: "string",
        value: "",
      },
      {
        name: "Email (optional)",
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
  async run(input: string, args: unknown[]): Promise<AnyInput> {
    const [, password, name, email] = args as [string, string, string, string];
    const parts = (args[0] as string).split("-");
    const keyType = parts[0].toLowerCase();
    const keySize = parseInt(parts[1], 10);
    let userIdentifier = "";

    if (name) userIdentifier += name;
    if (email) userIdentifier += ` <${email}>`;

    let flags = kbpgp.const.openpgp.certify_keys;
    flags |= kbpgp.const.openpgp.sign_data;
    flags |= kbpgp.const.openpgp.auth;
    flags |= kbpgp.const.openpgp.encrypt_comm;
    flags |= kbpgp.const.openpgp.encrypt_storage;

    const keyGenerationOptions = {
      userid: userIdentifier,
      ecc: keyType === "ecc",
      primary: {
        nbits: keySize,
        flags: flags,
        expire_in: 0,
      },
      subkeys: [
        {
          nbits: getSubkeySize(keySize),
          flags: kbpgp.const.openpgp.sign_data,
          expire_in: 86400 * 365 * 8,
        },
        {
          nbits: getSubkeySize(keySize),
          flags:
            kbpgp.const.openpgp.encrypt_comm |
            kbpgp.const.openpgp.encrypt_storage,
          expire_in: 86400 * 365 * 2,
        },
      ],
      asp: ASP,
    };

    try {
      const unsignedKey: any = await promisify(kbpgp.KeyManager.generate)(
        keyGenerationOptions,
      );
      await promisify(unsignedKey.sign.bind(unsignedKey))({});

      const signedKey = unsignedKey,
        privateKeyExportOptions: any = {};

      if (password) privateKeyExportOptions.passphrase = password;
      const privateKey: any = await promisify(
        signedKey.export_pgp_private.bind(signedKey),
      )(privateKeyExportOptions);
      const publicKey: any = await promisify(
        signedKey.export_pgp_public.bind(signedKey),
      )({});
      return privateKey + "\n" + publicKey.trim();
    } catch (err) {
      throw new Error(`Error whilst generating key pair: ${err}`, {
        cause: err,
      });
    }
  }
}

export default GeneratePGPKeyPair;
