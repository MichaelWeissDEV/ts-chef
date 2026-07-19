/**
 * @fileoverview End-to-end tests for the registered OpenPGP operations.
 * @package test/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import { GeneratePGPKeyPair } from "../../src/chef/operations/GeneratePGPKeyPair";
import { PGPDecrypt } from "../../src/chef/operations/PGPDecrypt";
import { PGPDecryptAndVerify } from "../../src/chef/operations/PGPDecryptAndVerify";
import { PGPEncrypt } from "../../src/chef/operations/PGPEncrypt";
import { PGPEncryptAndSign } from "../../src/chef/operations/PGPEncryptAndSign";
import { PGPVerify } from "../../src/chef/operations/PGPVerify";
import kbpgp from "../../src/chef/lib/KbpgpCompat";
import { importPrivateKey } from "../../src/chef/lib/PGP";
import { promisify } from "es6-promisify";

jest.setTimeout(30_000);

describe("OpenPGP operation round-trips", () => {
  let privateKey: string;
  let publicKey: string;

  beforeAll(async () => {
    const exported = String(
      await new GeneratePGPKeyPair().run("", [
        "RSA-1024",
        "",
        "Test Analyst",
        "analyst@example.test",
      ]),
    );
    const publicMarker = "-----BEGIN PGP PUBLIC KEY BLOCK-----";
    const markerIndex = exported.indexOf(publicMarker);
    if (markerIndex < 0) throw new Error("Generated PGP public key is missing");
    privateKey = exported.slice(0, markerIndex).trim();
    publicKey = exported.slice(markerIndex).trim();
  });

  test.each(["malware report", "Grüße 👋", "abc".repeat(1024)])(
    "encrypt/decrypt preserves %p",
    async (plaintext) => {
      const encrypted = await new PGPEncrypt().run(plaintext, [publicKey]);
      expect(encrypted).toContain("-----BEGIN PGP MESSAGE-----");
      await expect(
        new PGPDecrypt().run(encrypted, [privateKey, ""]),
      ).resolves.toBe(plaintext);
    },
  );

  test("encrypt-and-sign/decrypt-and-verify preserves data and signer identity", async () => {
    const encrypted = await new PGPEncryptAndSign().run("signed report", [
      privateKey,
      "",
      publicKey,
    ]);
    const verified = await new PGPDecryptAndVerify().run(encrypted, [
      publicKey,
      privateKey,
      "",
    ]);

    expect(verified).toContain("Signed by Test Analyst <analyst@example.test>");
    expect(verified).toContain("PGP fingerprint:");
    expect(verified).toContain("signed report");
  });

  test("verifies a standalone clear-signed message", async () => {
    const privateKeyManager = await importPrivateKey(privateKey);
    const signingKey = (
      privateKeyManager as { find_signing_pgp_key(): unknown }
    ).find_signing_pgp_key();
    const signed = String(
      await promisify(kbpgp.clearsign)({
        msg: "standalone signed report",
        signing_key: signingKey,
      }),
    );

    expect(signed).toContain("-----BEGIN PGP SIGNED MESSAGE-----");
    const verified = await new PGPVerify().run(signed, [publicKey]);
    expect(verified).toContain("Signed by Test Analyst <analyst@example.test>");
    expect(verified).toContain("standalone signed report");
  });

  test("invalid public and private keys fail with operation errors", async () => {
    await expect(new PGPEncrypt().run("data", ["not a key"])).rejects.toThrow(
      "Could not import public key",
    );
    await expect(
      new PGPDecrypt().run("not a message", ["not a key", ""]),
    ).rejects.toThrow("Could not import private key");
  });
});
