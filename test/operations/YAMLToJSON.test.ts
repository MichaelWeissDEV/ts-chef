/**
 * @fileoverview YAMLToJSON.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import {
  MAX_YAML_INPUT_CHARACTERS,
  MAX_YAML_NODES,
  YAMLToJSON,
} from "../../src/chef/operations/YAMLToJSON";

describe("YAMLToJSON", () => {
  const op = new YAMLToJSON();

  test("Converts simple YAML to JSON object", () => {
    const result = op.run("key: value", []);
    expect(result).toEqual({ key: "value" });
  });

  test("Converts YAML list to JSON array", () => {
    const result = op.run("- a\n- b\n- c", []);
    expect(result).toEqual(["a", "b", "c"]);
  });

  test("Converts nested YAML", () => {
    const result = op.run("outer:\n  inner: 42", []);
    expect((result as { outer: { inner: number } }).outer.inner).toBe(42);
  });

  test("Converts YAML number to number", () => {
    const result = op.run("count: 5", []);
    expect((result as { count: number }).count).toBe(5);
  });

  test("Invalid YAML throws OperationError", () => {
    expect(() => op.run("{ invalid yaml :", [])).toThrow();
  });

  test("supports ordinary aliases without expanding them during validation", () => {
    const result = op.run(
      "base: &base [one, two]\ncopy: *base",
      [],
    ) as { base: string[]; copy: string[] };
    expect(result.copy).toEqual(["one", "two"]);
    expect(result.copy).toBe(result.base);
  });

  test("rejects an exponentially expanding alias graph", () => {
    let bomb = "a: &a [x,x,x,x,x,x,x,x,x,x]\n";
    for (let index = 1; index <= 7; index += 1) {
      const name = String.fromCharCode(97 + index);
      const previous = String.fromCharCode(96 + index);
      bomb += `${name}: &${name} [${Array(10).fill(`*${previous}`).join(",")}]\n`;
    }
    expect(() => op.run(bomb, [])).toThrow(/safety limit/i);
  });

  test("rejects cyclic aliases", () => {
    expect(() => op.run("root: &root\n  self: *root\n", [])).toThrow(
      /cyclic yaml aliases/i,
    );
  });

  test("rejects oversized YAML before parsing", () => {
    expect(() => op.run("x".repeat(MAX_YAML_INPUT_CHARACTERS + 1), [])).toThrow(
      /input exceeds/i,
    );
  });

  test("rejects excessive parser nodes before building a huge object graph", () => {
    const manyEmptyMappings = Array(MAX_YAML_NODES + 1).fill("- {}").join("\n");
    expect(() => op.run(manyEmptyMappings, [])).toThrow(/node safety limit/i);
  });

  test("counts implicit empty sequence values omitted by parser events", () => {
    const manyImplicitNulls = "-\n".repeat(MAX_YAML_NODES + 1);
    expect(() => op.run(manyImplicitNulls, [])).toThrow(/node safety limit/i);
  });

  test("counts implicit empty sequence values with CR-only line endings", () => {
    const manyImplicitNulls = "-\r".repeat(MAX_YAML_NODES + 1);
    expect(() => op.run(manyImplicitNulls, [])).toThrow(/node safety limit/i);
  });

  test("does not count dash lines inside block scalars as sequence nodes", () => {
    const result = op.run(
      `text: |\n${"  -\n".repeat(MAX_YAML_NODES + 1)}`,
      [],
    ) as { text: string };
    expect(result.text.startsWith("-\n-\n")).toBe(true);
  });

  test("does not count dash lines inside multiline quoted scalars", () => {
    const result = op.run(
      `text: "start\n${"-\n".repeat(MAX_YAML_NODES + 1)}end"\n`,
      [],
    ) as { text: string };
    expect(result.text).toContain("start - -");
  });
});
