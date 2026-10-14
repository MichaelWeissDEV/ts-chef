import { renderResult } from "../src/panels/quickWorkbench/result";
import { resolveArguments } from "../src/panels/quickWorkbench/arguments";
import { FromBase64 } from "../src/chef/operations/FromBase64";
import { FromHex } from "../src/chef/operations/FromHex";
import { ROT13 } from "../src/chef/operations/ROT13";
import { JSONBeautify } from "../src/chef/operations/JSONBeautify";
import { AESDecrypt } from "../src/chef/operations/AESDecrypt";
import { validateQuickWorkbenchMessage } from "../src/panels/quickWorkbench/protocol";

const limit = 50 * 1024 * 1024;
test.each(["<script>&hello</script>", "Grüße 🌍", "\0", "", "a".repeat(100000), "b".repeat(100001)])("preserves text and full result (%#)", text => {
  const result = renderResult(text, limit);
  expect(result.text).toBe(text);
  expect(result.fullResult).toBe(text);
  expect(result.preview).toBe(text.slice(0, 100000));
  expect(result.isPreviewTruncated).toBe(text.length > 100000);
  expect(result.size).toBe(Buffer.byteLength(text));
});
test("preserves invalid UTF-8 as bytes and exports lossless hex", () => {
  const result = renderResult(Uint8Array.of(0xff, 0, 0xc0), limit);
  expect(result.fullResult).toEqual(Buffer.from([0xff, 0, 0xc0]));
  expect(result.binary).toBe(true);
  expect(result.text).toBe("ff00c0");
  expect(result.size).toBe(3);
});
test("valid UTF-8 bytes decode strictly, retaining BOM and original bytes", () => {
  const bytes = Buffer.from("\ufeffHello 🌍");
  const result = renderResult(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), limit);
  expect(result.text).toBe("\ufeffHello 🌍");
  expect(result.fullResult).toEqual(bytes);
  expect(result.binary).toBe(true);
  expect(result.format).toBe("utf8");
});
test("enforces actual byte limit", () => {
  expect(renderResult("😀", 4).size).toBe(4);
  expect(() => renderResult("😀", 3)).toThrow("too large");
  expect(renderResult(Buffer.alloc(limit), limit).size).toBe(limit);
  expect(() => renderResult(Buffer.alloc(limit + 1), limit)).toThrow("too large");
});
test("metadata defaults and edited values reach real operations", () => {
  const b64 = new FromBase64();
  expect(Buffer.from(b64.run("SGVsbG8=", resolveArguments(b64.args, {}))).toString()).toBe("Hello");
  const hex = new FromHex();
  expect(Buffer.from(hex.run("48 69", [String(resolveArguments(hex.args, {})[0])])).toString()).toBe("Hi");
  const rot = new ROT13();
  expect(Buffer.from(rot.run([...Buffer.from("aA1")], resolveArguments(rot.args, { Amount: 1, "Rotate upper case chars": false, "Rotate numbers": true }))).toString()).toBe("bA2");
  const json = new JSONBeautify();
  expect(JSON.parse(json.run('{"a":1}', resolveArguments(json.args, {})) as string)).toEqual({a:1});
  const aes = new AESDecrypt();
  const args = resolveArguments(aes.args, { Key: { string: "00".repeat(16), option: "Hex" } });
  expect(args[0]).toEqual({ string: "00".repeat(16), option: "Hex" });
});
test("rejects names, types, bounds, options, and malformed toggle values", () => {
  const defs = [{ name: "n", type: "number", value: 1, min: 0, max: 10 }];
  for (const args of [{ unknown: 1 }, { n: "1" }, { n: -1 }, { n: 11 }, { n: Infinity }]) expect(() => resolveArguments(defs, args)).toThrow();
  expect(() => resolveArguments([{ name: "o", type: "option", value: ["A", "B"] }], { o: "C" })).toThrow();
  expect(() => resolveArguments(new AESDecrypt().args, { Key: { string: "ff", option: "invalid" } })).toThrow();
});
test.each([-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])("rejects invalid request ID %s", requestId => {
  expect(validateQuickWorkbenchMessage({ type: "applyOperation", opName: "FromBase64", args: {}, requestId }, new Set(["FromBase64"])).success).toBe(false);
});
test.each([undefined, () => 1, Symbol("x"), { a: { b: { c: { d: { e: 1 } } } } }, [Infinity], new Date()])("rejects unsupported nested arguments (%#)", value => {
  expect(validateQuickWorkbenchMessage({ type: "applyOperation", opName: "FromBase64", args: { value }, requestId: 1 }, new Set(["FromBase64"])).success).toBe(false);
});
test("cycles and unexpected fields fail without escaping exceptions", () => {
  const value: Record<string, unknown> = {}; value.self = value;
  expect(validateQuickWorkbenchMessage({ type: "applyOperation", opName: "FromBase64", args: value, requestId: 1 }, new Set(["FromBase64"])).success).toBe(false);
  expect(validateQuickWorkbenchMessage({ type: "clearInput", unexpected: 1 }, new Set()).success).toBe(false);
});
test.each(["loadSelection", "loadDocument", "loadClipboard", "clearInput", "invalidate", "copyResult", "replaceSelection", "newDocument", "close", "getOps"])("accepts %s", type => {
  expect(validateQuickWorkbenchMessage({ type }, new Set()).success).toBe(true);
});

test.each([Buffer.from("Hello 🌍"), Uint8Array.of(0, 255), new Uint8Array([1, 2]).buffer])("explicit formats preserve original bytes (%#)", bytes => {
  const original = Buffer.from(bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes);
  for (const format of ["hex", "base64"] as const) {
    const result = renderResult(bytes, limit, format);
    expect(result.binary).toBe(true);
    expect(result.format).toBe(format);
    expect(Buffer.from(result.text, format)).toEqual(original);
    expect(result.fullResult).toEqual(original);
  }
});
test("multi-megabyte output retains full exports and bounds preview", () => {
  const text = "🌍".repeat(1024 * 1024);
  const rendered = renderResult(text, limit);
  expect(rendered.size).toBe(4 * 1024 * 1024);
  expect(rendered.text).toBe(text);
  expect(rendered.preview.length).toBe(100000);
  expect(rendered.isPreviewTruncated).toBe(true);
});
