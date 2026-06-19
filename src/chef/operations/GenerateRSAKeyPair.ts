/**
 * @fileoverview GenerateRSAKeyPair operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import forge from "node-forge";
import { cryptNotice } from "../lib/Crypt";

/**
 * Generate RSA Key Pair operation
 */
export class GenerateRSAKeyPair extends TypedOperation<string, Promise<AnyInput>, unknown[]> {
  /**
   * GenerateRSAKeyPair constructor
   */
  constructor() {
    super();

    this.name = "Generate RSA Key Pair";
    this.module = "Ciphers";
    this.description = `Generate an RSA key pair with a given number of bits.<br><br>${cryptNotice}`;
    this.infoURL = "https://wikipedia.org/wiki/RSA_(cryptosystem)";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "RSA Key Length",
        type: "option",
        value: ["1024", "2048", "4096"],
      },
      {
        name: "Output Format",
        type: "option",
        value: ["PEM", "JSON", "DER"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  async run(input: string, args: unknown[]): Promise<AnyInput> {
    const [keyLength, outputFormat] = args as [string, string];

    return new Promise((resolve, reject) => {
      forge.pki.rsa.generateKeyPair(
        {
          bits: Number(keyLength),
          workers: -1,
          workerScript: "assets/forge/prime.worker.min.js",
        },
        (err, keypair) => {
          if (err) return reject(err);

          let result;

          switch (outputFormat) {
            case "PEM":
              result =
                forge.pki.publicKeyToPem(keypair.publicKey) +
                "\n" +
                forge.pki.privateKeyToPem(keypair.privateKey);
              break;
            case "JSON":
              result = JSON.stringify(keypair);
              break;
            case "DER":
              result = forge.asn1
                .toDer(forge.pki.privateKeyToAsn1(keypair.privateKey))
                .getBytes();
              break;
          }

          resolve(result);
        },
      );
    });
  }
}

export default GenerateRSAKeyPair;
