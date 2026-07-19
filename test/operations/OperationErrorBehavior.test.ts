/**
 * @fileoverview Invalid-argument and damaged-input contracts for critical operations.
 * @package test/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import { Argon2 } from "../../src/chef/operations/Argon2";
import { Bzip2Decompress } from "../../src/chef/operations/Bzip2Decompress";
import { CSSSelector } from "../../src/chef/operations/CSSSelector";
import { DeriveHKDFKey } from "../../src/chef/operations/DeriveHKDFKey";
import { DisassembleARM } from "../../src/chef/operations/DisassembleARM";
import { DisassembleX86 } from "../../src/chef/operations/DisassembleX86";
import { LZMADecompress } from "../../src/chef/operations/LZMADecompress";
import { MD6 } from "../../src/chef/operations/MD6";
import { OpticalCharacterRecognition } from "../../src/chef/operations/OpticalCharacterRecognition";
import { ParseX509Certificate } from "../../src/chef/operations/ParseX509Certificate";
import { ProtobufEncode } from "../../src/chef/operations/ProtobufEncode";

const bytes = (...values: number[]): ArrayBuffer =>
  Uint8Array.from(values).buffer;

describe("damaged compressed input", () => {
  test("Bzip2 rejects non-Bzip2 bytes", async () => {
    await expect(
      new Bzip2Decompress().run(bytes(0, 1, 2, 3, 4), [false]),
    ).rejects.toThrow();
  });

  test("LZMA rejects a truncated stream", async () => {
    await expect(
      new LZMADecompress().run(bytes(0x5d, 0, 0, 0x80), []),
    ).rejects.toThrow("Failed to decompress input");
  });
});

describe("invalid cryptographic arguments", () => {
  test("HKDF rejects negative and over-limit output lengths", () => {
    const baseArgs = [
      { string: "", option: "Hex" },
      { string: "", option: "Hex" },
      "SHA256",
      "with salt",
    ];
    expect(() => new DeriveHKDFKey().run(bytes(1), [...baseArgs, -1])).toThrow(
      "L must be non-negative",
    );
    expect(() =>
      new DeriveHKDFKey().run(bytes(1), [...baseArgs, 255 * 32 + 1]),
    ).toThrow("L too large");
  });

  test("Argon2 and MD6 enforce their documented ranges", async () => {
    await expect(
      new Argon2().run("password", [
        { string: "salt", option: "UTF8" },
        1,
        7,
        1,
        16,
        "Argon2id",
        "Hex hash",
      ]),
    ).rejects.toThrow("memory cost must be at least 8 KiB");
    expect(() => new MD6().run("input", [513, 64, ""])).toThrow(
      "Size must be between 0 and 512",
    );
  });
});

describe("invalid parser and analysis inputs", () => {
  test("CSS, X.509 and Protobuf surface useful parser errors", () => {
    expect(() => new CSSSelector().run("<p>x</p>", ["[", "\n"])).toThrow(
      "Invalid CSS Selector",
    );
    expect(() =>
      new ParseX509Certificate().run("not a certificate", ["PEM"]),
    ).toThrow("Certificate load error");
    expect(() => new ProtobufEncode().run({ value: 1 }, [""])).toThrow(
      "Schema not defined",
    );
  });

  test("disassemblers reject malformed hexadecimal input", async () => {
    await expect(
      new DisassembleARM().run("zz", [
        "ARM (32-bit)",
        "ARM",
        "Little Endian",
        0,
        true,
        true,
      ]),
    ).rejects.toThrow("Invalid hexadecimal input");
    await expect(
      new DisassembleX86().run("9", [
        "64",
        "Full x86 architecture",
        0,
        0,
        true,
        true,
      ]),
    ).rejects.toThrow("Length must be even");
  });

  test("OCR rejects non-image data before starting a worker", async () => {
    await expect(
      new OpticalCharacterRecognition().run(bytes(1, 2, 3), [
        true,
        "LSTM only",
      ]),
    ).rejects.toThrow("Unsupported file type");
  });
});
