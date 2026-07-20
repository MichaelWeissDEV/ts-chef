/**
 * @fileoverview Runtime surface used from kbpgp's incomplete type declarations.
 * @package chef/lib
 * @license Apache-2.0
 */

import kbpgpModule from "kbpgp";

type CallbackApi = (...args: unknown[]) => unknown;

export interface PgpKeyManager {
  is_pgp_locked(): boolean;
  unlock_pgp: CallbackApi;
  find_signing_pgp_key(): unknown;
}

export interface GeneratedPgpKeyManager {
  sign: CallbackApi;
  export_pgp_private: CallbackApi;
  export_pgp_public: CallbackApi;
}

interface PgpSignerIdentity {
  email?: string;
  username?: string;
  comment?: string;
}

interface PgpSigningKeyManager {
  get_userids_mark_primary(): Array<{ components: PgpSignerIdentity }>;
  get_pgp_short_key_id(): string;
  get_pgp_fingerprint(): Buffer;
}

interface PgpDataSigner {
  get_key_manager(): PgpSigningKeyManager | null;
  sig: { when_generated(): number };
}

interface UnboxedLiteral {
  get_data_signer(): PgpDataSigner | null;
}

export type UnboxedLiterals = UnboxedLiteral[];

interface KeyRingCompat {
  add_key_manager(keyManager: unknown): void;
}

export interface AsyncProgress {
  delay(callback: (error: unknown) => void): void;
}

interface AsyncProgressConstructor {
  new (options: Record<string, unknown>): AsyncProgress;
  prototype: AsyncProgress;
}

interface KbpgpCompat {
  ASP: AsyncProgressConstructor;
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
