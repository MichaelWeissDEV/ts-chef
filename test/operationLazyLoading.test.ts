/**
 * @fileoverview Contracts for metadata-only registry and lazy operation chunks.
 * @package test
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import fs from "node:fs";
import path from "node:path";
import operationChunkPlan from "../src/operationChunkPlan.json";
import operationChunkOverrides from "../src/operationChunkOverrides.json";
import registry, {
  findOp,
  loadedOperationChunkIds,
  operationChunkId,
} from "../src/opsRegistry";

const registrySource = fs.readFileSync(
  path.join(__dirname, "..", "src", "opsRegistry.ts"),
  "utf8",
);

const lazyFactoryPattern =
  /opName:\s*"([^"]+)"[\s\S]*?module:\s*"([^"]+)"[\s\S]*?factory:\s*lazyFactory\(\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\s*,?\s*\)/g;
const factoryRecords = [...registrySource.matchAll(lazyFactoryPattern)].map(
  (match) => ({
    opName: match[1],
    module: match[2],
    factoryOpName: match[3],
    factoryModule: match[4],
    constructorName: match[5],
  }),
);

function loadedOperationSources(): string[] {
  return Object.keys(require.cache)
    .filter((file) =>
      file.includes(`${path.sep}chef${path.sep}operations${path.sep}`),
    )
    .sort();
}

function independentHash(value: string): number {
  let hash = 0x811c9dc5;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function independentChunkId(moduleName: string, opName: string): string {
  const override = (operationChunkOverrides as Record<string, string>)[opName];
  if (override) return override;
  const plan = operationChunkPlan as Record<string, number>;
  const shards = plan[moduleName] ?? 1;
  const safeModule = moduleName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${safeModule}-${String(independentHash(opName) % shards).padStart(2, "0")}`;
}

describe("lazy operation registry architecture", () => {
  test("imports metadata without importing any operation implementation", () => {
    expect(registry).toHaveLength(479);
    expect(loadedOperationSources()).toEqual([]);
    expect(loadedOperationChunkIds()).toEqual([]);

    expect(findOp("ToBase64")?.displayName).toBe("To Base64");
    expect(findOp("AES Encrypt")?.opName).toBe("AESEncrypt");
    expect(loadedOperationSources()).toEqual([]);
  });

  test("loads only the requested source module when a factory is invoked", () => {
    const operation = findOp("ToBase64")?.factory();
    expect(operation?.name).toBe("To Base64");
    const loaded = loadedOperationSources();
    expect(loaded.some((file) => file.endsWith(`${path.sep}ToBase64.ts`))).toBe(
      true,
    );
    expect(
      loaded.some((file) => file.endsWith(`${path.sep}AESEncrypt.ts`)),
    ).toBe(false);
  });

  test("contains no static operation imports", () => {
    expect(registrySource).not.toMatch(
      /import[\s\S]*?from\s+["']\.\/chef\/operations\//,
    );
    expect(registrySource).not.toContain("factory: () => new ");
  });

  test("has one self-consistent lazy factory per registered operation", () => {
    expect(factoryRecords).toHaveLength(registry.length);
    expect(new Set(factoryRecords.map((record) => record.opName)).size).toBe(
      registry.length,
    );

    for (const record of factoryRecords) {
      expect(record.factoryOpName).toBe(record.opName);
      expect(record.factoryModule).toBe(record.module);
      expect(record.constructorName).toMatch(
        /^[$_\p{ID_Start}][$_\p{ID_Continue}]*$/u,
      );
      expect(findOp(record.opName)?.module).toBe(record.module);
    }
  });

  test("uses the same stable chunk mapping as the independent build plan", () => {
    for (const entry of registry) {
      expect(operationChunkId(entry.module, entry.opName)).toBe(
        independentChunkId(entry.module, entry.opName),
      );
    }
  });

  test("spreads the catalog across bounded chunks", () => {
    const groups = new Map<string, string[]>();
    for (const entry of registry) {
      const id = operationChunkId(entry.module, entry.opName);
      groups.set(id, [...(groups.get(id) ?? []), entry.opName]);
    }
    const sizes = [...groups.values()].map((operations) => operations.length);

    expect(groups.size).toBeGreaterThanOrEqual(65);
    expect(Math.max(...sizes)).toBeLessThanOrEqual(24);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(1);
    expect(
      [...groups.keys()].filter((id) => id.startsWith("default-")),
    ).toHaveLength(18);
    expect(
      [...groups.keys()].every((id) =>
        /^[a-z0-9-]+(?:-\d{2}|-[a-z0-9-]+)$/.test(id),
      ),
    ).toBe(true);
    expect(groups.get("default-base64")?.sort()).toEqual([
      "FromBase64",
      "ShowBase64Offsets",
      "ToBase64",
    ]);
    expect(groups.get("code-json")?.sort()).toEqual([
      "JSONBeautify",
      "JSONMinify",
    ]);
    expect(groups.get("ciphers-aes")?.sort()).toEqual([
      "AESDecrypt",
      "AESEncrypt",
      "AESKeyUnwrap",
      "AESKeyWrap",
    ]);
  });

  test.each([
    ["ToBase64", "To Base64"],
    ["VigenèreDecode", "Vigenère Decode"],
    ["Jsonata", "Jsonata Query"],
    ["ParseX509Certificate", "Parse X.509 certificate"],
    ["OpticalCharacterRecognition", "Optical Character Recognition"],
  ])("constructs fresh %s instances across export styles", (opName, name) => {
    const factory = findOp(opName)?.factory;
    expect(factory).toBeDefined();
    const first = factory?.();
    const second = factory?.();
    expect(first?.name).toBe(name);
    expect(second?.name).toBe(name);
    expect(first).not.toBe(second);
  });
});
