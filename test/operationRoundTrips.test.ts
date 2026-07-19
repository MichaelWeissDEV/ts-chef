/**
 * @fileoverview Registry-backed operation round-trip and chaining tests.
 * @package test
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import { Pipeline } from "../src/chef/Pipeline";
import registry, { findOp } from "../src/opsRegistry";
import { resolveDefaultArg } from "../src/commands/argDefaults";

function defaultArgs(opName: string): unknown[] {
  const entry = findOp(opName);
  if (!entry) throw new Error(`Missing test operation: ${opName}`);
  return entry.factory().args.map(resolveDefaultArg);
}

function asBytes(value: unknown): number[] {
  if (
    value instanceof ArrayBuffer ||
    Object.prototype.toString.call(value) === "[object ArrayBuffer]"
  ) {
    return Array.from(new Uint8Array(value as ArrayBuffer));
  }
  if (ArrayBuffer.isView(value)) {
    return Array.from(
      new Uint8Array(value.buffer, value.byteOffset, value.byteLength),
    );
  }
  if (Array.isArray(value)) return value as number[];
  throw new TypeError(`Expected binary pipeline output, got ${typeof value}`);
}

const BYTE_SAMPLES: Array<{ name: string; bytes: number[] }> = [
  { name: "empty", bytes: [] },
  { name: "single zero", bytes: [0] },
  { name: "leading zeros", bytes: [0, 0, 1, 2, 3] },
  { name: "ASCII", bytes: Array.from(Buffer.from("Hello, world!", "utf8")) },
  {
    name: "UTF-8",
    bytes: Array.from(Buffer.from("Grüße aus Köln 👋", "utf8")),
  },
  { name: "all byte boundaries", bytes: [0, 1, 31, 32, 127, 128, 254, 255] },
];

const BYTE_CODEC_PAIRS = [
  ["Base32", "ToBase32", "FromBase32"],
  ["Base45", "ToBase45", "FromBase45"],
  ["Base58", "ToBase58", "FromBase58"],
  ["Base62", "ToBase62", "FromBase62"],
  ["Base64", "ToBase64", "FromBase64"],
  ["Base85", "ToBase85", "FromBase85"],
  ["Base92", "ToBase92", "FromBase92"],
  ["Binary", "ToBinary", "FromBinary"],
  ["Decimal", "ToDecimal", "FromDecimal"],
  ["Hex", "ToHex", "FromHex"],
  ["Hexdump", "ToHexdump", "FromHexdump"],
  ["Modhex", "ToModhex", "FromModhex"],
  ["Octal", "ToOctal", "FromOctal"],
  ["Radix", "ToRadix", "FromRadix"],
] as const;

describe("registry-backed byte codec round-trips", () => {
  const cases = BYTE_CODEC_PAIRS.flatMap(([label, encode, decode]) =>
    BYTE_SAMPLES.map((sample) => ({ label, encode, decode, ...sample })),
  );

  test.each(cases)("$label preserves $name bytes", async (testCase) => {
    const pipeline = Pipeline.of(
      testCase.encode,
      defaultArgs(testCase.encode),
    ).pipe(testCase.decode, defaultArgs(testCase.decode));

    const output = await pipeline.execute(
      Uint8Array.from(testCase.bytes).buffer,
    );
    expect(asBytes(output)).toEqual(testCase.bytes);
  });
});

const BINARY_COMPRESSION_PAIRS = [
  ["Gzip", "Gzip", "Gunzip"],
  ["Zlib", "ZlibDeflate", "ZlibInflate"],
  ["Raw Deflate", "RawDeflate", "RawInflate"],
  ["LZ4", "LZ4Compress", "LZ4Decompress"],
] as const;

describe("registry-backed compression round-trips", () => {
  const cases = BINARY_COMPRESSION_PAIRS.flatMap(
    ([label, compress, decompress]) =>
      BYTE_SAMPLES.map((sample) => ({
        label,
        compress,
        decompress,
        ...sample,
      })),
  );

  test.each(cases)("$label preserves $name bytes", async (testCase) => {
    const pipeline = Pipeline.of(
      testCase.compress,
      defaultArgs(testCase.compress),
    ).pipe(testCase.decompress, defaultArgs(testCase.decompress));

    const output = await pipeline.execute(
      Uint8Array.from(testCase.bytes).buffer,
    );
    expect(asBytes(output)).toEqual(testCase.bytes);
  });

  test.each(["", "Hello, world!", "Grüße aus Köln 👋", "abc".repeat(4096)])(
    "LZString preserves text: %p",
    async (input) => {
      const pipeline = Pipeline.of(
        "LZStringCompress",
        defaultArgs("LZStringCompress"),
      ).pipe("LZStringDecompress", defaultArgs("LZStringDecompress"));
      await expect(pipeline.execute(input)).resolves.toBe(input);
    },
  );

  test.each(BYTE_SAMPLES.filter(({ bytes }) => bytes.length > 0))(
    "Bzip2 preserves $name bytes across a registry pipeline",
    async ({ bytes }) => {
      const pipeline = Pipeline.of(
        "Bzip2Compress",
        defaultArgs("Bzip2Compress"),
      ).pipe("Bzip2Decompress", defaultArgs("Bzip2Decompress"));

      expect(
        asBytes(await pipeline.execute(Uint8Array.from(bytes).buffer)),
      ).toEqual(bytes);
    },
  );

  test.each(BYTE_SAMPLES)(
    "LZMA preserves $name bytes across a registry pipeline",
    async ({ bytes }) => {
      const pipeline = Pipeline.of(
        "LZMACompress",
        defaultArgs("LZMACompress"),
      ).pipe("LZMADecompress", defaultArgs("LZMADecompress"));

      expect(
        asBytes(await pipeline.execute(Uint8Array.from(bytes).buffer)),
      ).toEqual(bytes);
    },
  );
});

describe("mixed multi-operation recipes", () => {
  test.each(BYTE_SAMPLES)(
    "Base64 → Hex → Gzip and reverse preserves $name bytes",
    async ({ bytes }) => {
      const steps = [
        "ToBase64",
        "ToHex",
        "Gzip",
        "Gunzip",
        "FromHex",
        "FromBase64",
      ];
      const pipeline = steps
        .slice(1)
        .reduce(
          (current, opName) => current.pipe(opName, defaultArgs(opName)),
          Pipeline.of(steps[0], defaultArgs(steps[0])),
        );

      expect(
        asBytes(await pipeline.execute(Uint8Array.from(bytes).buffer)),
      ).toEqual(bytes);
    },
  );

  test.each(BYTE_SAMPLES)(
    "Base58 → Hex → Raw Deflate and reverse preserves $name bytes",
    async ({ bytes }) => {
      const steps = [
        "ToBase58",
        "ToHex",
        "RawDeflate",
        "RawInflate",
        "FromHex",
        "FromBase58",
      ];
      const pipeline = steps
        .slice(1)
        .reduce(
          (current, opName) => current.pipe(opName, defaultArgs(opName)),
          Pipeline.of(steps[0], defaultArgs(steps[0])),
        );

      expect(
        asBytes(await pipeline.execute(Uint8Array.from(bytes).buffer)),
      ).toEqual(bytes);
    },
  );

  test("the tested operations all remain registered", () => {
    const tested = new Set<string>([
      ...BYTE_CODEC_PAIRS.flatMap(([, encode, decode]) => [encode, decode]),
      ...BINARY_COMPRESSION_PAIRS.flatMap(([, compress, decompress]) => [
        compress,
        decompress,
      ]),
      "LZStringCompress",
      "LZStringDecompress",
    ]);
    const registered = new Set(registry.map((entry) => entry.opName));
    expect([...tested].filter((opName) => !registered.has(opName))).toEqual([]);
  });
});
