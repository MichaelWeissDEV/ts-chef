/**
 * PGP functions.
 *
 * @author tlwr [toby@toby.codes]
 * @author Matt C [matt@artemisbot.uk]
 * @author n1474335 [n1474335@gmail.com]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError";
import kbpgp from "kbpgp";
import promisify from "es6-promisify";

/**
 * Progress callback
 */
export const ASP = kbpgp.ASP({
  progress_hook: (info: { what: string }) => {
    // Status updates disabled in VS Code extension context
    void info;
  },
});

/**
 * Get size of subkey
 *
 * @param {number} keySize
 * @returns {number}
 */
export function getSubkeySize(keySize: number): number {
  const map: Record<number, number> = {
    1024: 1024,
    2048: 1024,
    4096: 2048,
    256: 256,
    384: 256,
  };
  return map[keySize];
}

/**
 * Import private key and unlock if necessary
 *
 * @param {string} privateKey
 * @param {string} [passphrase]
 * @returns {Promise<object>}
 */
export async function importPrivateKey(
  privateKey: string,
  passphrase?: string,
): Promise<unknown> {
  try {
    const key = await promisify(kbpgp.KeyManager.import_from_armored_pgp)({
      armored: privateKey,
      opts: {
        no_check_keys: true,
      },
    });
    if ((key as any).is_pgp_locked()) {
      if (passphrase) {
        await promisify((key as any).unlock_pgp.bind(key))({
          passphrase,
        });
      } else {
        throw new OperationError(
          "Did not provide passphrase with locked private key.",
        );
      }
    }
    return key;
  } catch (err) {
    throw new OperationError(`Could not import private key: ${err}`);
  }
}

/**
 * Import public key
 *
 * @param {string} publicKey
 * @returns {Promise<object>}
 */
export async function importPublicKey(publicKey: string): Promise<unknown> {
  try {
    const key = await promisify(kbpgp.KeyManager.import_from_armored_pgp)({
      armored: publicKey,
      opts: {
        no_check_keys: true,
      },
    });
    return key;
  } catch (err) {
    throw new OperationError(`Could not import public key: ${err}`);
  }
}
