import { generateKeyPairSync, sign, constants } from "node:crypto";
import forge from "node-forge";
import { RSAVerify } from "../../src/chef/operations/RSAVerify";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 1024 });
const privatePem = privateKey.export({ type: "pkcs1", format: "pem" }).toString();
const forgeKey = forge.pki.privateKeyFromPem(privatePem);
const message = Buffer.from([0x61, 0xff, 0, 0x80]);
const op = new RSAVerify();

test.each(["SHA-1", "MD5", "SHA-256", "SHA-384", "SHA-512"])("verifies legitimate %s signatures across PEM and input formats", algo => {
  const signature = sign(algo.toLowerCase().replace("-", ""), message, { key: privateKey, padding: constants.RSA_PKCS1_PADDING }).toString("latin1");
  for (const type of ["pkcs1", "spki"] as const) {
    const pem = publicKey.export({ type, format: "pem" }).toString();
    for (const [format, text] of [["Raw", message.toString("latin1")], ["Hex", message.toString("hex")], ["Base64", message.toString("base64")]]) {
      expect(op.run(signature, [pem, text, format, algo])).toBe("Verified OK");
      expect(op.run(signature, [pem, "changed", "Raw", algo])).toBe("Verification Failure");
    }
  }
});

test.each(["extra-null", "extra-sequence", "unexpected-octet"])("rejects malicious DigestAlgorithm form %s", variant => {
  const { asn1 } = forge;
  const nullNode = () => asn1.create(asn1.Class.UNIVERSAL, asn1.Type.NULL, false, "");
  const oid = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false, asn1.oidToDer(forge.pki.oids.sha256).getBytes());
  const extra = variant === "unexpected-octet" ? asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false, "bad") : variant === "extra-sequence" ? asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [nullNode()]) : nullNode();
  const digest = forge.md.sha256.create().update(message.toString("latin1"), "raw").digest().bytes();
  const digestInfo = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [oid, nullNode(), extra]),
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false, digest),
  ]);
  const der = asn1.toDer(digestInfo).getBytes();
  // Test-only raw RSA signing constructs the malformed DigestInfo without rewriting it.
  const signature = forgeKey.sign(der, "NONE");
  const pem = publicKey.export({ type: "spki", format: "pem" }).toString();
  expect(op.run(signature, [pem, message.toString("latin1"), "Raw", "SHA-256"])).toBe("Verification Failure");
});

test("retains signature-length errors and refuses private-key PEM", () => {
  const pem = publicKey.export({ type: "spki", format: "pem" }).toString();
  expect(() => op.run("short", [pem, "", "Raw", "SHA-256"])).toThrow("Signature length (5) does not match expected length based on key (128).");
  expect(() => op.run("", [privatePem, "", "Raw", "SHA-256"])).toThrow();
});


test.each(["SHA-1", "SHA-256", "SHA-384", "SHA-512"])("preserves omitted-NULL %s and raw Unicode hash semantics", algo => {
  const { asn1 } = forge;
  const name = algo.toLowerCase().replace("-", "") as "sha1" | "sha256" | "sha384" | "sha512";
  const text = "😀";
  const digest = forge.md[name].create().update(text, "raw").digest().bytes();
  const info = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false, asn1.oidToDer(forge.pki.oids[name]).getBytes())]),
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false, digest),
  ]);
  const signature = forgeKey.sign(asn1.toDer(info).getBytes(), "NONE");
  const pem = publicKey.export({ type: "spki", format: "pem" }).toString();
  expect(op.run(signature, [pem, text, "Raw", algo])).toBe("Verified OK");
  expect(op.run(signature, [pem, text, "Raw", algo === "SHA-256" ? "SHA-1" : "SHA-256"])).toBe("Verification Failure");
});
