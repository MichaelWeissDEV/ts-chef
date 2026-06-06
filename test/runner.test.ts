/**
 * Tests for the runner utilities (resolveDefaultArg + normaliseInput).
 * These functions are inlined here (same logic as src/commands/runner.ts)
 * to test them without pulling in the vscode bundle.
 */

import { strToAB, byteArrToStr } from "./helpers";
import { AESEncrypt } from "../src/chef/operations/AESEncrypt";
import { ToBase32 } from "../src/chef/operations/ToBase32";
import { FromBase64 } from "../src/chef/operations/FromBase64";

// ── Inline copies of runner utilities under test ──────────────────────────────

function resolveDefaultArg(arg: any) {
  switch (arg.type) {
    case "editableOption":
    case "editableOptionShort": {
      const opts = arg.value;
      if (!Array.isArray(opts)) return arg.value;
      const idx = typeof arg.defaultIndex === "number" ? arg.defaultIndex : 0;
      return opts[idx]?.value ?? opts[0]?.value ?? "";
    }
    case "option": {
      const opts = arg.value;
      return Array.isArray(opts) ? (opts[0] ?? "") : arg.value;
    }
    case "argSelector": {
      const opts = arg.value;
      return Array.isArray(opts) ? (opts[0]?.name ?? "") : arg.value;
    }
    case "toggleString":
      return {
        string: typeof arg.value === "string" ? arg.value : "",
        option: arg.toggleValues?.[0] ?? "Hex",
      };
    default:
      return arg.value;
  }
}

function normaliseInput(input: any, inputType: string) {
  let buf: Buffer;
  if (typeof input === "string") buf = Buffer.from(input, "utf-8");
  else if (Array.isArray(input)) buf = Buffer.from(input);
  else if (input instanceof ArrayBuffer)
    buf = Buffer.from(new Uint8Array(input));
  else if (Buffer.isBuffer(input)) buf = input;
  else if (input instanceof Uint8Array) buf = Buffer.from(input);
  else buf = Buffer.from(String(input), "utf-8");

  switch (inputType) {
    case "string":
      return buf.toString("utf-8");
    case "byteArray":
      return Array.from(buf);
    case "ArrayBuffer": {
      const ab = new ArrayBuffer(buf.length);
      new Uint8Array(ab).set(buf);
      return ab;
    }
    case "number":
      return Number(buf.toString("utf-8").trim());
    default:
      return buf.toString("utf-8");
  }
}

// ── resolveDefaultArg ─────────────────────────────────────────────────────────
describe("resolveDefaultArg", () => {
  test("option: returns first string element", () => {
    const arg = { type: "option", value: ["CBC", "ECB", "CTR"] };
    expect(resolveDefaultArg(arg)).toBe("CBC");
  });

  test("option: returns empty string for empty array", () => {
    expect(resolveDefaultArg({ type: "option", value: [] })).toBe("");
  });

  test("toggleString: returns {string, option} object", () => {
    const arg = {
      type: "toggleString",
      value: "",
      toggleValues: ["Hex", "UTF8", "Latin1"],
    };
    const result = resolveDefaultArg(arg);
    expect(result).toEqual({ string: "", option: "Hex" });
  });

  test("toggleString with non-empty default value", () => {
    const arg = {
      type: "toggleString",
      value: "deadbeef",
      toggleValues: ["Hex", "UTF8"],
    };
    const result = resolveDefaultArg(arg);
    expect(result).toEqual({ string: "deadbeef", option: "Hex" });
  });

  test("argSelector: returns first option name", () => {
    const arg = {
      type: "argSelector",
      value: [
        { name: "CBC", off: [5] },
        { name: "ECB", off: [5] },
      ],
    };
    expect(resolveDefaultArg(arg)).toBe("CBC");
  });

  test("editableOption: returns first item's value", () => {
    const arg = {
      type: "editableOption",
      value: [
        { name: "Standard", value: "A-Za-z0-9+/=" },
        { name: "URL-safe", value: "A-Za-z0-9-_=" },
      ],
    };
    expect(resolveDefaultArg(arg)).toBe("A-Za-z0-9+/=");
  });

  test("editableOptionShort: respects defaultIndex", () => {
    const arg = {
      type: "editableOptionShort",
      defaultIndex: 1,
      value: [
        { name: "A", value: "x" },
        { name: "B", value: "y" },
      ],
    };
    expect(resolveDefaultArg(arg)).toBe("y");
  });

  test("boolean: returns value as-is", () => {
    expect(resolveDefaultArg({ type: "boolean", value: true })).toBe(true);
    expect(resolveDefaultArg({ type: "boolean", value: false })).toBe(false);
  });

  test("number: returns value as-is", () => {
    expect(resolveDefaultArg({ type: "number", value: 13 })).toBe(13);
  });

  test("string: returns value as-is", () => {
    expect(resolveDefaultArg({ type: "string", value: "hello" })).toBe("hello");
  });
});

// ── normaliseInput ────────────────────────────────────────────────────────────
describe("normaliseInput", () => {
  const hello = "hello";

  test("string input → string output", () => {
    expect(normaliseInput(hello, "string")).toBe("hello");
  });

  test("string input → byteArray output", () => {
    const result = normaliseInput(hello, "byteArray") as number[];
    expect(Array.isArray(result)).toBe(true);
    expect(byteArrToStr(result)).toBe("hello");
  });

  test("string input → ArrayBuffer output", () => {
    const result = normaliseInput(hello, "ArrayBuffer");
    expect(result instanceof ArrayBuffer).toBe(true);
    expect(
      Buffer.from(new Uint8Array(result as ArrayBuffer)).toString("utf-8"),
    ).toBe("hello");
  });

  test("byteArray input → string output", () => {
    const bytes = Array.from(Buffer.from("hello"));
    expect(normaliseInput(bytes, "string")).toBe("hello");
  });

  test("ArrayBuffer input → byteArray output", () => {
    const ab = strToAB("hello");
    const result = normaliseInput(ab, "byteArray") as number[];
    expect(Array.isArray(result)).toBe(true);
    expect(byteArrToStr(result)).toBe("hello");
  });

  test("string number → number output", () => {
    expect(normaliseInput("42", "number")).toBe(42);
  });

  test("preserves binary data through ArrayBuffer", () => {
    const bytes = [0, 1, 127, 128, 255];
    const result = normaliseInput(bytes, "ArrayBuffer");
    expect(result instanceof ArrayBuffer).toBe(true);
    expect(Array.from(new Uint8Array(result as ArrayBuffer))).toEqual(bytes);
  });
});

// ── Integration: resolveDefaultArg feeds real operations correctly ─────────────
describe("resolveDefaultArg → operation integration", () => {
  test("AES Encrypt runs without crash when given resolved defaults", () => {
    const op = new AESEncrypt();
    const args = op.args.map(resolveDefaultArg);
    // Default key = "", which is invalid — expect an error about key length
    expect(() => op.run("hello", args)).toThrow(/key/i);
  });

  test("AES mode arg resolves to string (not array)", () => {
    const op = new AESEncrypt();
    const args = op.args.map(resolveDefaultArg);
    // args[2] is the argSelector (Mode) — must be a string like "CBC"
    expect(typeof args[2]).toBe("string");
    expect(args[2]).toBe("CBC");
  });

  test("Base32 runs with resolved defaults", () => {
    const op = new ToBase32();
    const args = op.args.map(resolveDefaultArg);
    const result = op.run(strToAB("hello"), args);
    expect(typeof result).toBe("string");
    expect((result as string).length).toBeGreaterThan(0);
  });

  test("From Base64 runs with resolved defaults", () => {
    const op = new FromBase64();
    const args = op.args.map(resolveDefaultArg);
    const result = op.run("aGVsbG8=", args);
    expect(Array.isArray(result)).toBe(true);
    expect(byteArrToStr(result as number[])).toBe("hello");
  });
});
