/**
 * @fileoverview Regression tests for the registered bounded Magic operation.
 * @package core
 * @license Apache-2.0
 */

import * as zlib from "zlib";
import {
  MAGIC_MAX_CRIB_CHARACTERS,
  MAGIC_MAX_INTERMEDIATE_BYTES,
} from "../../src/chef/lib/Magic";
import { Magic } from "../../src/chef/operations/Magic";
import { runPipeline } from "../../src/commands/runner";

const DEFAULT_ARGS = [3, false, false, ""];

function encodeLayers(value: string, layers: number): string {
  let output = value;
  for (let index = 0; index < layers; index++) {
    output = Buffer.from(output, "utf-8").toString("base64");
  }
  return output;
}

describe("Magic operation", () => {
  test("is a normal JSON operation usable by recipes", () => {
    const operation = new Magic();
    expect(operation.flowControl).toBe(false);
    expect(operation.inputType).toBe("string");
    expect(operation.outputType).toBe("json");
    expect(operation.args[0]).toMatchObject({ min: 1, max: 3 });
  });

  test("returns a loadable decode recipe for short Base64", async () => {
    const results = await new Magic().run("SGVsbG8=", DEFAULT_ARGS);
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          data: "Hello",
          recipe: [
            expect.objectContaining({ op: "FromBase64" }),
          ],
          confidence: expect.any(Number),
        }),
      ]),
    );
  });

  test("serialises useful JSON through the real recipe runner", async () => {
    const output = await runPipeline("SGVsbG8=", [
      { opName: "Magic", args: DEFAULT_ARGS },
    ]);
    const results = JSON.parse(output) as Array<{
      data: string;
      recipe: Array<{ op: string }>;
    }>;
    expect(results[0]).toMatchObject({
      data: "Hello",
      recipe: [{ op: "FromBase64" }],
    });
  });

  test("hard-caps recursion depth even when a recipe requests more", async () => {
    const results = await new Magic().run(encodeLayers("Hello", 4), [
      99,
      false,
      false,
      "",
    ]);
    expect(results.length).toBeGreaterThan(0);
    expect(Math.max(...results.map((result) => result.recipe.length))).toBe(3);
    expect(results.some((result) => result.data === "Hello")).toBe(false);
  });

  test("rejects input above the operation safety limit", async () => {
    await expect(
      new Magic().run(
        "A".repeat(MAGIC_MAX_INTERMEDIATE_BYTES + 1),
        DEFAULT_ARGS,
      ),
    ).rejects.toThrow(/safety limit/i);
  });

  test("does not expand compressed data beyond the intermediate limit", async () => {
    const bomb = zlib
      .gzipSync("A".repeat(MAGIC_MAX_INTERMEDIATE_BYTES * 4))
      .toString("base64");
    const results = await new Magic().run(bomb, DEFAULT_ARGS);
    expect(
      results.some((result) =>
        result.recipe.some((step) => step.op === "Gunzip"),
      ),
    ).toBe(false);
  });

  test("uses a bounded case-insensitive literal crib, never a user regex", async () => {
    const operation = new Magic();
    const matching = await operation.run("SGVsbG8=", [
      3,
      false,
      false,
      "HELLO",
    ]);
    expect(matching.some((result) => result.data === "Hello")).toBe(true);

    await expect(
      operation.run("SGVsbG8=", [
        3,
        false,
        false,
        "x".repeat(MAGIC_MAX_CRIB_CHARACTERS + 1),
      ]),
    ).rejects.toThrow(/crib is limited/i);

    await expect(
      operation.run("SGVsbG8=", [3, false, false, "(a+)+$"]),
    ).resolves.toEqual([]);
  });
});
