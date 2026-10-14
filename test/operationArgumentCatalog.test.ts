import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ArgConfig } from "../src/chef/Operation";
import { resolveDefaultArgs } from "../src/commands/argDefaults";
import { resolveArguments } from "../src/panels/quickWorkbench/arguments";
import { AESEncrypt } from "../src/chef/operations/AESEncrypt";
import { AESDecrypt } from "../src/chef/operations/AESDecrypt";
import { RegularExpression } from "../src/chef/operations/RegularExpression";

const manifest = JSON.parse(readFileSync(join(process.cwd(), "dist/operation-chunks/manifest.json"), "utf8")) as { operations: Record<string, { chunk: string; constructor: string }>; operationCount: number };

test("every shipped factory has supported argument types and valid positional defaults", () => {
  let total = 0;
  for (const [name, record] of Object.entries(manifest.operations)) {
    const chunk = jest.requireActual<{ operationModules: Record<string, Record<string, new () => { args: ArgConfig[] }>> }>(join(process.cwd(), "dist/operation-chunks", record.chunk + ".js"));
    const mod = chunk.operationModules[name];
    const operation = new (mod[record.constructor] ?? mod.default)();
    try {
      const defaults = resolveDefaultArgs(operation.args);
      expect(resolveArguments(operation.args, {})).toEqual(defaults);
      const webviewValues = Object.fromEntries(operation.args.map((def, index) => [def.name, defaults[index]]));
      expect(resolveArguments(operation.args, webviewValues)).toEqual(defaults);
    }
    catch (error) { throw new Error(`${name}: ${error}`, { cause: error }); }
    total++;
  }
  expect(total).toBe(479);
  expect(total).toBe(manifest.operationCount);
});

test("AES Encrypt and Decrypt preserve edited key, IV and GCM-dependent arguments", () => {
  const encrypt = new AESEncrypt(), decrypt = new AESDecrypt();
  const key = { string: "00".repeat(16), option: "Hex" };
  const iv = { string: "01".repeat(16), option: "Hex" };
  const aad = { string: "metadata", option: "UTF8" };
  for (const mode of ["CBC", "GCM"]) {
    const cipher = encrypt.run("Hello 🌍", resolveArguments(encrypt.args, { Key: key, IV: iv, Mode: mode, Input: "UTF8", "Additional Authenticated Data": aad }));
    const [encrypted, tag] = cipher.split("\n\nTag: ");
    const plain = decrypt.run(encrypted, resolveArguments(decrypt.args, { Key: key, IV: iv, Mode: mode, Output: "UTF8", "GCM Tag": { string: tag ?? "", option: "Hex" }, "Additional Authenticated Data": aad }));
    expect(plain).toBe("Hello 🌍");
  }
});

test("populate preset keeps later target edits and runs the actual regex", () => {
  const regex = new RegularExpression();
  const values = resolveArguments(regex.args, { Regex: "[a-z]+", "Output format": "List matches" });
  expect(regex.run("abc 123 def", values)).toContain("abc");
  expect(regex.run("abc 123 def", values)).toContain("def");
});

test("AES Raw refuses Unicode truncation and strict UTF8 output refuses malformed bytes", () => {
  const encrypt = new AESEncrypt(), decrypt = new AESDecrypt();
  const key = { string: "00".repeat(16), option: "Hex" };
  expect(() => encrypt.run("😀", resolveArguments(encrypt.args, { Key: key }))).toThrow("Select UTF8");
  const cipher = encrypt.run("ff00c0", resolveArguments(encrypt.args, { Key: key, Input: "Hex" }));
  expect(() => decrypt.run(cipher, resolveArguments(decrypt.args, { Key: key, Output: "UTF8" }))).toThrow("not valid UTF-8");
  expect(decrypt.run(cipher, resolveArguments(decrypt.args, { Key: key, Output: "Hex" }))).toBe("ff00c0");
});
