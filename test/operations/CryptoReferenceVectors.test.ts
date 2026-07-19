/**
 * @fileoverview Independent reference-vector tests for core cryptographic operations.
 * @package test/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import { DeriveHKDFKey } from "../../src/chef/operations/DeriveHKDFKey";
import { GenerateHOTP } from "../../src/chef/operations/GenerateHOTP";
import { GenerateTOTP } from "../../src/chef/operations/GenerateTOTP";
import { HAS160 } from "../../src/chef/operations/HAS160";
import { HMAC } from "../../src/chef/operations/HMAC";
import { LMHash } from "../../src/chef/operations/LMHash";
import { MD2 } from "../../src/chef/operations/MD2";
import { MD4 } from "../../src/chef/operations/MD4";
import { MD5 } from "../../src/chef/operations/MD5";
import { MD6 } from "../../src/chef/operations/MD6";
import { NTHash } from "../../src/chef/operations/NTHash";
import { RIPEMD } from "../../src/chef/operations/RIPEMD";

function arrayBuffer(input: string | number[]): ArrayBuffer {
  const bytes = typeof input === "string" ? Buffer.from(input) : Buffer.from(input);
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

function password(output: unknown): string {
  const match = String(output).match(/Password: (\d+)/);
  if (!match) throw new Error(`Missing password in OTP output: ${output}`);
  return match[1];
}

describe("cryptographic reference vectors", () => {
  test.each([
    ["MD2", new MD2(), [18], "da853b0d3f88d99b30283a69e6ded6bb"],
    ["MD4", new MD4(), [], "a448017aaf21d8525fc10ae87aa6729d"],
    ["MD5", new MD5(), [], "900150983cd24fb0d6963f7d28e17f72"],
    ["HAS-160", new HAS160(), [], "975e810488cf2a3d49838478124afce4b1c78804"],
    ["RIPEMD-160", new RIPEMD(), ["160"], "8eb208f7e05d987a9b044a8e98c6b087f15a0bfc"],
  ])("matches the published %s digest for abc", (_name, operation, args, expected) => {
    expect(operation.run(arrayBuffer("abc"), args)).toBe(expected);
  });

  test("matches the node-md6 reference implementation vector", () => {
    expect(new MD6().run("abc", [256, 64, ""])).toBe(
      "230637d4e6845cf0d092b558e87625f03881dd53a7439da34cf3b94ed0d8b2c5",
    );
  });

  test("matches the RFC 4231 HMAC-SHA-256 test case", () => {
    const key = "0b".repeat(20);
    expect(
      new HMAC().run(arrayBuffer("Hi There"), [
        { string: key, option: "Hex" },
        "SHA256",
      ]),
    ).toBe("b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7");
  });

  test("matches RFC 5869 HKDF-SHA-256 test case 1", () => {
    expect(
      new DeriveHKDFKey().run(arrayBuffer(new Array(22).fill(0x0b)), [
        { string: "000102030405060708090a0b0c", option: "Hex" },
        { string: "f0f1f2f3f4f5f6f7f8f9", option: "Hex" },
        "SHA256",
        "with salt",
        42,
      ]),
    ).toBe(
      "3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865",
    );
  });

  test("matches RFC 4226 HOTP counter zero", () => {
    const secret = arrayBuffer("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ");
    expect(password(new GenerateHOTP().run(secret, ["RFC", 6, 0]))).toBe(
      "755224",
    );
  });

  test("matches RFC 6238 TOTP at Unix time 59", () => {
    jest.spyOn(Date, "now").mockReturnValue(59_000);
    const secret = arrayBuffer("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ");

    expect(password(new GenerateTOTP().run(secret, ["RFC", 8, 0, 30]))).toBe(
      "94287082",
    );
  });

  test("matches the canonical NT hash for password", () => {
    expect(new NTHash().run("password", [])).toBe(
      "8846F7EAEE8FB117AD06BDD830B7586C",
    );
  });

  test("matches the canonical LM hash for password", () => {
    expect(new LMHash().run("password", [])).toBe(
      "E52CAC67419A9A224A3B108F3FA6CB6D",
    );
  });
});

describe("hash mutation sensitivity", () => {
  test.each([
    ["MD2", new MD2(), [18]],
    ["MD4", new MD4(), []],
    ["MD5", new MD5(), []],
    ["MD6", new MD6(), [256, 64, ""]],
    ["HAS-160", new HAS160(), []],
    ["LM Hash", new LMHash(), []],
    ["RIPEMD-128", new RIPEMD(), ["128"]],
    ["RIPEMD-160", new RIPEMD(), ["160"]],
    ["RIPEMD-256", new RIPEMD(), ["256"]],
    ["RIPEMD-320", new RIPEMD(), ["320"]],
  ])("%s changes after a one-character input mutation", (_name, operation, args) => {
    const usesText = operation instanceof MD6 || operation instanceof LMHash;
    const first = usesText
      ? operation.run("malware-sample", args as unknown[])
      : operation.run(arrayBuffer("malware-sample"), args as unknown[]);
    const changed = usesText
      ? operation.run("malware-samplf", args as unknown[])
      : operation.run(arrayBuffer("malware-samplf"), args as unknown[]);

    expect(changed).not.toBe(first);
  });
});
