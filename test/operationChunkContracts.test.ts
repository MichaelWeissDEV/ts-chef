/**
 * @fileoverview Build and packaging contracts for lazy operation chunks.
 * @package test
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import fs from "node:fs";
import path from "node:path";
import packageManifest from "../package.json";
import chunkOverrides from "../src/operationChunkOverrides.json";
import chunkPlan from "../src/operationChunkPlan.json";
import registry, { operationChunkId } from "../src/opsRegistry";

const projectRoot = path.join(__dirname, "..");
const registeredNames = new Set(registry.map((entry) => entry.opName));

describe("operation chunk build contracts", () => {
  test("builds and verifies operation chunks in every production build", () => {
    const scripts = packageManifest.scripts as Record<string, string>;
    expect(scripts.compile).toContain("compile:extension");
    expect(scripts.compile).toContain("compile:operations");
    expect(scripts["compile:operations"]).toContain(
      "build-operation-chunks.cjs",
    );
    expect(scripts["verify:bundle"]).toContain("verify-bundle.cjs");
    expect(scripts["verify:bundle"]).toContain("verify-operation-chunks.cjs");
    expect(scripts.build).toContain("verify:bundle");
    expect(scripts["vscode:prepublish"]).toContain("build");
  });

  test("keeps the main production bundle under an explicit startup budget", () => {
    const verifier = fs.readFileSync(
      path.join(projectRoot, "scripts", "verify-bundle.cjs"),
      "utf8",
    );
    expect(verifier).toContain("3 * 1024 * 1024");
    expect(verifier).toContain("metadata-only budget");
  });

  test("does not exclude operation chunks from the VSIX", () => {
    const ignore = fs.readFileSync(
      path.join(projectRoot, ".vscodeignore"),
      "utf8",
    );
    const ignoredLines = ignore
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
    expect(ignoredLines).not.toContain("dist/operation-chunks/**");
    expect(ignoredLines).not.toContain("dist/**");
    expect(ignoredLines).not.toContain("dist/*");
  });

  test("defines valid bounded shard counts", () => {
    for (const [moduleName, shards] of Object.entries(chunkPlan)) {
      expect(moduleName.trim()).not.toBe("");
      expect(Number.isInteger(shards)).toBe(true);
      expect(shards).toBeGreaterThanOrEqual(1);
      expect(shards).toBeLessThanOrEqual(64);
    }
  });

  test("every chunk override references a registered operation", () => {
    for (const [opName, chunkId] of Object.entries(chunkOverrides)) {
      expect(registeredNames).toContain(opName);
      expect(chunkId).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)+$/);
      const metadata = registry.find((entry) => entry.opName === opName);
      expect(operationChunkId(metadata!.module, opName)).toBe(chunkId);
    }
  });

  test("isolates dependency-heavy Code operations from common JSON", () => {
    const expected = {
      JSONBeautify: "code-json",
      JSONMinify: "code-json",
      CSSSelector: "code-dom",
      RenderMarkdown: "code-markdown",
      JavaScriptBeautify: "code-javascript",
      SQLBeautify: "code-sql",
      Jsonata: "code-jsonata",
      JPathExpression: "code-jpath",
      XPathExpression: "code-xpath",
    };
    expect(chunkOverrides).toMatchObject(expected);
    expect(new Set(Object.values(expected)).size).toBeGreaterThanOrEqual(8);
  });

  test("keeps common codecs and cipher families in cohesive chunks", () => {
    expect(chunkOverrides).toMatchObject({
      ToBase64: "default-base64",
      FromBase64: "default-base64",
      ToHex: "default-hex",
      FromHex: "default-hex",
      AESEncrypt: "ciphers-aes",
      AESDecrypt: "ciphers-aes",
      GOSTEncrypt: "ciphers-gost",
      GOSTDecrypt: "ciphers-gost",
    });
  });

  test("build tooling validates source files, metadata, plans, and overrides", () => {
    const builder = fs.readFileSync(
      path.join(projectRoot, "scripts", "build-operation-chunks.cjs"),
      "utf8",
    );
    expect(builder).toContain("Missing operation source");
    expect(builder).toContain("Lazy factory metadata mismatch");
    expect(builder).toContain("duplicate names");
    expect(builder).toContain("Invalid shard count");
    expect(builder).toContain("Chunk override references unknown operation");
  });

  test("production verification covers every emitted factory, not samples only", () => {
    const verifier = fs.readFileSync(
      path.join(projectRoot, "scripts", "verify-operation-chunks.cjs"),
      "utf8",
    );
    expect(verifier).toContain("zero eager chunks");
    expect(verifier).toContain("manifest.operationCount");
    expect(verifier).toContain("new candidate()");
    expect(verifier).toContain("do not exactly cover");
    expect(verifier).toContain("Emitted JavaScript chunks do not match");
  });
});
