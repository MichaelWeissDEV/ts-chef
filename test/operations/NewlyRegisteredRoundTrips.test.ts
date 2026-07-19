/**
 * @fileoverview Round-trip, tamper and parser tests for newly registered operations.
 * @package test/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import { Argon2 } from "../../src/chef/operations/Argon2";
import { Argon2Compare } from "../../src/chef/operations/Argon2Compare";
import { DisassembleARM } from "../../src/chef/operations/DisassembleARM";
import { DisassembleX86 } from "../../src/chef/operations/DisassembleX86";
import { FernetDecrypt } from "../../src/chef/operations/FernetDecrypt";
import { FernetEncrypt } from "../../src/chef/operations/FernetEncrypt";
import { FlaskSessionSign } from "../../src/chef/operations/FlaskSessionSign";
import { FlaskSessionVerify } from "../../src/chef/operations/FlaskSessionVerify";
import { GenerateAllHashes } from "../../src/chef/operations/GenerateAllHashes";
import { GenerateQRCode } from "../../src/chef/operations/GenerateQRCode";
import { GOSTDecrypt } from "../../src/chef/operations/GOSTDecrypt";
import { GOSTEncrypt } from "../../src/chef/operations/GOSTEncrypt";
import { GOSTKeyUnwrap } from "../../src/chef/operations/GOSTKeyUnwrap";
import { GOSTKeyWrap } from "../../src/chef/operations/GOSTKeyWrap";
import { GOSTSign } from "../../src/chef/operations/GOSTSign";
import { GOSTVerify } from "../../src/chef/operations/GOSTVerify";
import { ParseQRCode } from "../../src/chef/operations/ParseQRCode";
import { ParseUserAgent } from "../../src/chef/operations/ParseUserAgent";
import { ProtobufDecode } from "../../src/chef/operations/ProtobufDecode";
import { ProtobufEncode } from "../../src/chef/operations/ProtobufEncode";

const hexKey = {
  string: "ffeeddccbbaa99887766554433221100fedcba98765432100123456789abcdef",
  option: "Hex",
};
const emptyHex = { string: "", option: "Hex" };

function textBuffer(input: string): ArrayBuffer {
  const bytes = Buffer.from(input);
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

afterEach(() => jest.restoreAllMocks());

describe("newly registered encryption round-trips", () => {
  const fernetKey = Buffer.alloc(32, 0x5a).toString("base64");

  test.each(["", "malware", "Grüße 👋", "00\u0000ff", "abc".repeat(2048)])(
    "Fernet decrypts an encrypted payload: %p",
    (input) => {
      const encrypted = new FernetEncrypt().run(input, [fernetKey]);
      expect(encrypted).not.toBe(input);
      expect(new FernetDecrypt().run(String(encrypted), [fernetKey])).toBe(
        input,
      );
    },
  );

  test("Fernet rejects a tampered authenticated token", () => {
    const encrypted = String(new FernetEncrypt().run("payload", [fernetKey]));
    const tampered = encrypted.slice(0, -2) + "AA";
    expect(() => new FernetDecrypt().run(tampered, [fernetKey])).toThrow();
  });

  test.each([
    "GOST 28147 (1989)",
    "GOST R 34.12 (Magma, 2015)",
    "GOST R 34.12 (Kuznyechik, 2015)",
  ])("GOST %s preserves hexadecimal payloads", async (version) => {
    const plaintext =
      version.includes("Kuznyechik")
        ? "00112233445566778899aabbccddeeff"
        : "0011223344556677";
    const args = [
      hexKey,
      emptyHex,
      "Hex",
      "Hex",
      version,
      "E-A",
      "ECB",
      "NO",
      "NO",
    ];
    const encrypted = await new GOSTEncrypt().run(plaintext, args);
    expect(encrypted).not.toBe(plaintext);
    await expect(new GOSTDecrypt().run(String(encrypted), args)).resolves.toBe(
      plaintext,
    );
  });

  test("GOST key wrapping and unwrapping preserves a 256-bit key", async () => {
    const keyMaterial =
      "00112233445566778899aabbccddeeffffeeddccbbaa99887766554433221100";
    const args = [
      hexKey,
      { string: "1234567890abcdef", option: "Hex" },
      "Hex",
      "Hex",
      "GOST 28147 (1989)",
      "E-A",
      "CP",
    ];
    const wrapped = await new GOSTKeyWrap().run(keyMaterial, args);
    expect(wrapped).not.toBe(keyMaterial);
    await expect(
      new GOSTKeyUnwrap().run(String(wrapped), args),
    ).resolves.toBe(keyMaterial);
  });

  test("GOST MAC verification detects a one-character mutation", async () => {
    const iv = { string: "1234567890abcdef", option: "Hex" };
    const mac = await new GOSTSign().run("message", [
      hexKey,
      iv,
      "Raw",
      "Hex",
      "GOST 28147 (1989)",
      "E-A",
      32,
    ]);
    const verifyArgs = [
      hexKey,
      iv,
      { string: String(mac), option: "Hex" },
      "Raw",
      "GOST 28147 (1989)",
      "E-A",
    ];

    await expect(new GOSTVerify().run("message", verifyArgs)).resolves.toBe(
      "The signature matches",
    );
    await expect(new GOSTVerify().run("messagf", verifyArgs)).resolves.toBe(
      "The signature does not match",
    );
  });
});

describe("newly registered password and session operations", () => {
  test.each(["Argon2i", "Argon2d", "Argon2id"])(
    "%s encoded hashes verify and reject a changed password",
    async (type) => {
      const encoded = await new Argon2().run("correct horse", [
        { string: "reference-salt", option: "UTF8" },
        2,
        32,
        1,
        16,
        type,
        "Encoded hash",
      ]);
      await expect(
        new Argon2Compare().run("correct horse", [encoded]),
      ).resolves.toBe("Match: correct horse");
      await expect(
        new Argon2Compare().run("correct house", [encoded]),
      ).resolves.toBe("No match");
    },
  );

  test("Flask session signing verifies the payload and rejects tampering", () => {
    jest.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    const payload = { role: "analyst", sample: "eicar" };
    const common = [
      { string: "development-secret", option: "UTF8" },
      { string: "cookie-session", option: "UTF8" },
      "sha256",
    ];
    const signed = String(new FlaskSessionSign().run(payload, common));

    expect(new FlaskSessionVerify().run(signed, [...common, false])).toEqual({
      valid: true,
      payload,
    });
    expect(() =>
      new FlaskSessionVerify().run(signed.slice(0, -1) + "A", [
        ...common,
        false,
      ]),
    ).toThrow("Invalid signature");
  });
});

describe("newly registered data formats and analysis operations", () => {
  const schema = `syntax = "proto3";
message Sample {
  string name = 1;
  uint32 score = 2;
  repeated string tags = 3;
}`;

  test("Protobuf schema encode/decode preserves structured data", () => {
    const input = { name: "sample.exe", score: 95, tags: ["pe", "packed"] };
    const encoded = new ProtobufEncode().run(input, [schema]) as ArrayBuffer;
    expect(new Uint8Array(encoded).length).toBeGreaterThan(0);
    expect(new ProtobufDecode().run(encoded, [schema, false, false])).toEqual(
      input,
    );
  });

  test.each(["malware sample", "Grüße aus Köln 👋", "https://example.test/a?b=1"])(
    "QR PNG generation and parsing preserves %p",
    async (input) => {
      const qr = new GenerateQRCode().run(input, [
        "PNG",
        6,
        4,
        "Medium",
      ]) as ArrayBuffer;
      await expect(new ParseQRCode().run(qr, [false])).resolves.toBe(input);
    },
  );

  test("Generate all hashes produces every configured digest and reacts to mutation", () => {
    const operation = new GenerateAllHashes();
    const first = operation.run(textBuffer("abc"), ["All", true]);
    const changed = operation.run(textBuffer("abd"), ["All", true]);
    const lines = first.trim().split("\n");

    expect(lines).toHaveLength(operation.hashes.length);
    expect(first).toContain("MD5:          900150983cd24fb0d6963f7d28e17f72");
    expect(changed).not.toBe(first);
  });

  test("x86 and ARM disassemblers decode known no-op instructions", async () => {
    const x86 = String(
      await new DisassembleX86().run("90", [
        "64",
        "Full x86 architecture",
        0,
        0,
        true,
        true,
      ]),
    );
    expect(x86.toLowerCase()).toContain("nop");

    const arm = String(
      await new DisassembleARM().run("0000a0e1", [
        "ARM (32-bit)",
        "ARM",
        "Little Endian",
        0,
        true,
        true,
      ]),
    );
    expect(arm).toContain("mov r0, r0");
  });

  test("user-agent parsing extracts stable browser and OS fields", () => {
    const output = new ParseUserAgent().run(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      [],
    );
    expect(output).toContain("Name: Chrome");
    expect(output).toContain("Name: Windows");
    expect(output).toContain("Architecture: amd64");
  });
});
