/**
 * @fileoverview magic.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

/**
 * Tests for the recursive magic decoder. The real runner pulls in the full ops
 * registry (ESM-only deps jest can't parse), so runOp is mocked with a small
 * dispatcher over directly imported operations — enough to exercise decode
 * chains end to end.
 */

import * as zlib from "zlib";

jest.mock("../src/commands/runner", () => {
  /* eslint-disable @typescript-eslint/no-require-imports --
     jest.mock factories run before hoisted imports, so the operation classes
     must be required lazily inside the factory. */
  const { FromBase64 } = require("../src/chef/operations/FromBase64");
  const { FromHex } = require("../src/chef/operations/FromHex");
  const { Gunzip } = require("../src/chef/operations/Gunzip");
  /* eslint-enable @typescript-eslint/no-require-imports */

  function toBuf(input: unknown): Buffer {
    if (typeof input === "string") return Buffer.from(input, "utf-8");
    if (Array.isArray(input)) return Buffer.from(input as number[]);
    if (input instanceof ArrayBuffer)
      return Buffer.from(new Uint8Array(input));
    if (Buffer.isBuffer(input)) return input as Buffer;
    if (input instanceof Uint8Array) return Buffer.from(input);
    return Buffer.from(String(input), "utf-8");
  }
  function toAB(input: unknown): ArrayBuffer {
    const buf = toBuf(input);
    const ab = new ArrayBuffer(buf.length);
    new Uint8Array(ab).set(buf);
    return ab;
  }

  return {
    readableUtf8: (bytes: Uint8Array): string | undefined => {
      try {
        const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        const chars = Array.from(text);
        const printable = chars.filter((character) => {
          const code = character.codePointAt(0) ?? 0;
          return (
            code === 9 ||
            code === 10 ||
            code === 13 ||
            (code >= 32 && code !== 127)
          );
        }).length;
        return printable / Math.max(1, chars.length) >= 0.75
          ? text
          : undefined;
      } catch {
        return undefined;
      }
    },
    runOp: (opName: string, input: unknown, args: unknown[]): unknown => {
      switch (opName) {
        case "FromBase64":
          return new FromBase64().run(toBuf(input).toString("utf-8"), args);
        case "FromHex":
          return new FromHex().run(toBuf(input).toString("utf-8"), args);
        case "Gunzip":
          return new Gunzip().run(toAB(input), args);
        default:
          // Other detector ops aren't part of this test mock.
          throw new Error(`op not mocked: ${opName}`);
      }
    },
  };
});

import {
  magicAnalyse,
  stringStats,
  printableRatio,
  shannonEntropy,
} from "../src/providers/magic";

const PLAIN = "Hello from the ts-chef magic decoder test!";

describe("shannonEntropy", () => {
  test("zero for a single repeated character", () => {
    expect(shannonEntropy("aaaaaaaa")).toBe(0);
  });

  test("higher for random-looking strings than for uniform ones", () => {
    expect(shannonEntropy("f3A9zQ7xK2mP5vL8")).toBeGreaterThan(
      shannonEntropy("aaaabbbb"),
    );
  });
});

describe("printableRatio", () => {
  test("1 for plain text", () => {
    expect(printableRatio(Buffer.from(PLAIN, "utf-8"))).toBe(1);
  });

  test("low for gzip bytes", () => {
    expect(printableRatio(zlib.gzipSync(PLAIN))).toBeLessThan(0.85);
  });
});

describe("stringStats", () => {
  test("reports length, entropy and charset guess", () => {
    const stats = stringStats("deadbeef");
    expect(stats.length).toBe(8);
    expect(stats.charset).toBe("hex");
    expect(stats.entropy).toBeGreaterThan(0);
  });

  test("classifies base64-looking strings", () => {
    expect(stringStats("SGVsbG8gd29ybGQhIQ+/=").charset).toBe("base64");
  });
});

describe("magicAnalyse", () => {
  test("recognises a complete short Base64 value during explicit analysis", () => {
    const chains = magicAnalyse("SGVsbG8=");
    expect(chains).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          preview: "Hello",
          steps: [
            expect.objectContaining({ opName: "FromBase64" }),
          ],
        }),
      ]),
    );
  });

  test("finds a single-step Base64 chain with a printable preview", () => {
    const encoded = Buffer.from(PLAIN, "utf-8").toString("base64");
    const chains = magicAnalyse(encoded);
    const b64 = chains.find(
      (c) => c.steps.length === 1 && c.steps[0].opName === "FromBase64",
    );
    expect(b64).toBeDefined();
    expect(b64!.preview).toBe(PLAIN);
  });

  test("follows nested Base64 → Base64 chains", () => {
    const once = Buffer.from(PLAIN, "utf-8").toString("base64");
    const twice = Buffer.from(once, "utf-8").toString("base64");
    const chains = magicAnalyse(twice);
    const nested = chains.find(
      (c) =>
        c.steps.length === 2 &&
        c.steps.every((s) => s.opName === "FromBase64"),
    );
    expect(nested).toBeDefined();
    expect(nested!.preview).toBe(PLAIN);
  });

  test("continues through binary gzip data (Base64 → Gunzip)", () => {
    const gzipped = zlib.gzipSync(PLAIN);
    const encoded = gzipped.toString("base64");
    const chains = magicAnalyse(encoded);
    const chain = chains.find(
      (c) =>
        c.steps.map((s) => s.opName).join(">") === "FromBase64>Gunzip",
    );
    expect(chain).toBeDefined();
    expect(chain!.preview).toBe(PLAIN);
  });

  test("bounds gzip expansion and can disable hover decompression", () => {
    const encoded = zlib.gzipSync("A".repeat(1024 * 1024)).toString("base64");
    const started = Date.now();
    const bounded = magicAnalyse(encoded, 3, {
      maxIntermediateBytes: 64 * 1024,
    });
    expect(
      bounded.some((chain) =>
        chain.steps.some((step) => step.opName === "Gunzip"),
      ),
    ).toBe(false);
    expect(Date.now() - started).toBeLessThan(500);

    const small = zlib.gzipSync(PLAIN).toString("base64");
    expect(
      magicAnalyse(small, 3, { allowDecompression: false }).some((chain) =>
        chain.steps.some((step) => step.opName === "Gunzip"),
      ),
    ).toBe(false);
  });

  test("decodes the captured payload inside a data URI", () => {
    const payload = Buffer.from(PLAIN, "utf-8").toString("base64");
    const chains = magicAnalyse(`data:text/plain;base64,${payload}`);
    expect(chains.some((chain) => chain.preview === PLAIN)).toBe(true);
    expect(chains[0]?.input).toBe(payload);
  });

  test("deepest chains are sorted first", () => {
    const once = Buffer.from(PLAIN, "utf-8").toString("base64");
    const twice = Buffer.from(once, "utf-8").toString("base64");
    const chains = magicAnalyse(twice);
    expect(chains.length).toBeGreaterThan(1);
    expect(chains[0].steps.length).toBeGreaterThanOrEqual(
      chains[chains.length - 1].steps.length,
    );
  });

  test("returns no chains for plain prose", () => {
    expect(magicAnalyse("just a short plain sentence")).toEqual([]);
  });
});
