/**
 * @fileoverview Catalog-wide contracts for every registered operation.
 * @package test
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import fs from "node:fs";
import path from "node:path";
import registry, { findOp } from "../src/opsRegistry";

const SUPPORTED_DATA_TYPES = new Set([
  "ArrayBuffer",
  "BigNumber",
  "File",
  "JSON",
  "List<File>",
  "Object",
  "byteArray",
  "html",
  "json",
  "number",
  "string",
]);

const SUPPORTED_ARG_TYPES = new Set([
  "argSelector",
  "binaryShortString",
  "binaryString",
  "boolean",
  "editableOption",
  "editableOptionShort",
  "label",
  "number",
  "option",
  "populateMultiOption",
  "populateOption",
  "shortString",
  "string",
  "text",
  "toggleString",
]);

describe("operation catalog contracts", () => {
  test("registers every concrete operation source file", () => {
    const operationDirectory = path.join(
      __dirname,
      "..",
      "src",
      "chef",
      "operations",
    );
    const sourceNames = fs
      .readdirSync(operationDirectory)
      .filter(
        (fileName) =>
          fileName.endsWith(".ts") &&
          !fileName.endsWith(".d.ts") &&
          fileName !== "index.ts" &&
          fileName !== "typed-index.ts",
      )
      .map((fileName) => fileName.slice(0, -3))
      .sort();
    const registeredNames = registry.map((entry) => entry.opName).sort();

    expect(registeredNames).toEqual(sourceNames);
  });

  test("contains a substantial, uniquely addressable operation catalog", () => {
    expect(registry.length).toBeGreaterThanOrEqual(400);
    expect(new Set(registry.map((entry) => entry.opName)).size).toBe(
      registry.length,
    );
    expect(new Set(registry.map((entry) => entry.displayName)).size).toBe(
      registry.length,
    );

    for (const entry of registry) {
      expect(findOp(entry.opName)).toBe(entry);
      expect(findOp(entry.opName.toLowerCase())).toBe(entry);
      expect(findOp(entry.displayName)).toBe(entry);
      expect(findOp(entry.displayName.toUpperCase())).toBe(entry);
    }
  });

  test("every factory exposes complete and supported metadata", () => {
    for (const entry of registry) {
      const operation = entry.factory();

      expect(operation.name).toBe(entry.displayName);
      expect(operation.module).toBe(entry.module);
      expect(operation.description.trim()).not.toBe("");
      expect(SUPPORTED_DATA_TYPES).toContain(operation.inputType);
      expect(SUPPORTED_DATA_TYPES).toContain(operation.outputType);
      expect(typeof operation.run).toBe("function");
      expect(Array.isArray(operation.args)).toBe(true);

      if (operation.infoURL) {
        expect(() => new URL(operation.infoURL as string)).not.toThrow();
      }

      for (const arg of operation.args) {
        expect(arg.name.trim()).not.toBe("");
        expect(SUPPORTED_ARG_TYPES).toContain(arg.type);
        expect(Object.prototype.hasOwnProperty.call(arg, "value")).toBe(true);

        if (arg.type === "option") {
          expect(Array.isArray(arg.value)).toBe(true);
          expect((arg.value as unknown[]).length).toBeGreaterThan(0);
          if (arg.defaultIndex !== undefined) {
            expect(Number.isInteger(arg.defaultIndex)).toBe(true);
            expect(arg.defaultIndex).toBeGreaterThanOrEqual(0);
            expect(arg.defaultIndex).toBeLessThan(
              (arg.value as unknown[]).length,
            );
          }
        }

        if (arg.type === "toggleString") {
          expect(Array.isArray(arg.toggleValues)).toBe(true);
          expect(arg.toggleValues?.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test("every registered operation source has the project documentation header", () => {
    for (const entry of registry) {
      const sourcePath = path.join(
        __dirname,
        "..",
        "src",
        "chef",
        "operations",
        `${entry.opName}.ts`,
      );
      const source = fs.readFileSync(sourcePath, "utf8");
      const operation = entry.factory();

      expect(source).toContain("@fileoverview");
      expect(source).toContain("@license Apache-2.0");
      expect(source).toContain(`class ${operation.constructor.name}`);
    }
  });
});
