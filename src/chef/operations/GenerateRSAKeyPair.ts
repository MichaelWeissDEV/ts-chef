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
import forge from "node-forge";
import { cryptNotice } from "../lib/Crypt";

/**
 * Generate RSA Key Pair operation
 */
export class GenerateRSAKeyPair extends Operation {
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
  async run(input: any, args: any[]): Promise<any> {
    const [keyLength, outputFormat] = args;

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
