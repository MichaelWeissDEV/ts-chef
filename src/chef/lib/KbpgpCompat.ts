/**
 * @fileoverview Runtime surface used from kbpgp's incomplete type declarations.
 * @package chef/lib
 * @license Apache-2.0
 */

import kbpgpModule from "kbpgp";

type CallbackApi = (...args: unknown[]) => unknown;

interface KeyRingCompat {
  add_key_manager(keyManager: unknown): void;
}

interface KbpgpCompat {
  ASP(options: Record<string, unknown>): unknown;
  KeyManager: {
    generate: CallbackApi;
    import_from_armored_pgp: CallbackApi;
  };
  box: CallbackApi;
  clearsign: CallbackApi;
  unbox: CallbackApi;
  const: {
    openpgp: {
      certify_keys: number;
      sign_data: number;
      auth: number;
      encrypt_comm: number;
      encrypt_storage: number;
    };
  };
  keyring: {
    KeyRing: new () => KeyRingCompat;
  };
}

export default kbpgpModule as unknown as KbpgpCompat;
