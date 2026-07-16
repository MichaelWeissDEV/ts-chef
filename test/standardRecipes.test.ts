/**
 * @fileoverview Tests for the bundled standard pipeline recipe catalog.
 * @package test
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import { resolveDefaultArg } from "../src/commands/argDefaults";
import { parsePipeline, runPipeline } from "../src/commands/runner";
import { findOp } from "../src/opsRegistry";
import {
  BUILT_IN_RECIPE_SOURCE,
  STANDARD_RECIPE_DEFINITIONS,
  getStandardRecipeDefinitions,
  loadStandardRecipe,
  loadStandardRecipes,
  validateStandardRecipes,
} from "../src/recipes/standardRecipes";

describe("standard recipe catalog", () => {
  test("covers conversion, structured-data and malware-analysis workflows", () => {
    expect(STANDARD_RECIPE_DEFINITIONS.length).toBeGreaterThanOrEqual(25);
    expect(
      new Set(STANDARD_RECIPE_DEFINITIONS.map((recipe) => recipe.category)),
    ).toEqual(
      new Set([
        "Decoding",
        "Encoding",
        "Structured data",
        "Malware analysis",
        "Indicators",
      ]),
    );

    const ids = STANDARD_RECIPE_DEFINITIONS.map((recipe) => recipe.id);
    const names = STANDARD_RECIPE_DEFINITIONS.map((recipe) => recipe.name);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names.map((name) => name.toLocaleLowerCase())).size).toBe(
      names.length,
    );
    for (const definition of STANDARD_RECIPE_DEFINITIONS) {
      expect(definition.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(definition.description.length).toBeGreaterThan(20);
      expect(definition.tags.length).toBeGreaterThan(1);
      expect(Object.isFrozen(definition)).toBe(true);
      expect(Object.isFrozen(definition.tags)).toBe(true);
    }
  });

  test("every operation name and every argument matches the live registry", () => {
    expect(validateStandardRecipes()).toEqual([]);

    for (const definition of STANDARD_RECIPE_DEFINITIONS) {
      const parsed = parsePipeline(definition.raw);
      expect(parsed.length).toBeGreaterThan(0);

      for (const step of parsed) {
        const meta = findOp(step.opName);
        expect(meta).toBeDefined();
        expect(step.opName).toBe(meta?.opName);
        const argumentDefinitions = meta?.factory().args ?? [];
        expect(step.args).toHaveLength(argumentDefinitions.length);
        step.args.forEach((argument) => expect(argument).not.toBeUndefined());
      }
    }
  });

  test("operations without overrides receive resolveDefaultArg values", () => {
    const pipeline = loadStandardRecipe("decode-base64");
    const operation = findOp("FromBase64")?.factory();
    expect(operation).toBeDefined();
    expect(pipeline?.steps[0].args).toEqual(
      operation?.args.map(resolveDefaultArg),
    );
  });

  test("materialises ready-to-run pipelines with built-in provenance", () => {
    const pipelines = loadStandardRecipes();
    expect(pipelines).toHaveLength(STANDARD_RECIPE_DEFINITIONS.length);

    for (const pipeline of pipelines) {
      expect(pipeline.scope).toBe(BUILT_IN_RECIPE_SOURCE);
      expect(pipeline.source).toBe(BUILT_IN_RECIPE_SOURCE);
      expect(pipeline.raw.length).toBeGreaterThan(0);
      expect(pipeline.steps.length).toBeGreaterThan(0);
    }
  });

  test("applies explicit security-analysis arguments", () => {
    expect(
      loadStandardRecipe("decode-powershell-encoded-command")?.steps,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          opName: "DecodeText",
          args: ["UTF-16LE (1200)"],
        }),
      ]),
    );
    expect(loadStandardRecipe("extract-printable-strings")?.steps[0]).toEqual(
      expect.objectContaining({
        opName: "Strings",
        args: ["All", 5, "All printable chars (A)", true, true, true],
      }),
    );
    expect(
      loadStandardRecipe("extract-safe-urls")?.steps.map((step) => step.opName),
    ).toEqual(["FangURL", "ExtractURLs", "DefangURL"]);
    expect(loadStandardRecipe("extract-domains")?.steps[0].args).toEqual([
      true,
      true,
      true,
      true,
    ]);
  });

  test("runs representative decoding recipes end to end", async () => {
    const base64 = loadStandardRecipe("decode-base64");
    expect(base64).toBeDefined();
    await expect(runPipeline("aGVsbG8=", base64?.steps ?? [])).resolves.toBe(
      "hello",
    );

    const command = 'Write-Host "analysis"';
    const encodedCommand = Buffer.from(command, "utf16le").toString("base64");
    const powershell = loadStandardRecipe("decode-powershell-encoded-command");
    expect(powershell).toBeDefined();
    await expect(
      runPipeline(encodedCommand, powershell?.steps ?? []),
    ).resolves.toBe(command);

    const csv = loadStandardRecipe("csv-to-formatted-json");
    expect(csv).toBeDefined();
    await expect(
      runPipeline("name,age\r\nAda,42", csv?.steps ?? []),
    ).resolves.toContain('"name": "Ada"');
  });

  test("supports category, tag and text filters", () => {
    const indicators = loadStandardRecipes({ category: "Indicators" });
    expect(indicators.length).toBeGreaterThanOrEqual(5);
    expect(indicators.every((recipe) => recipe.category === "Indicators")).toBe(
      true,
    );

    const defangedIocs = loadStandardRecipes({ tags: ["IOC", "DEFANG"] });
    expect(defangedIocs.map((recipe) => recipe.id)).toEqual([
      "extract-safe-urls",
      "extract-safe-ip-addresses",
    ]);

    expect(
      loadStandardRecipes({ search: "PowerShell" }).map((recipe) => recipe.id),
    ).toEqual(["decode-powershell-encoded-command"]);
  });

  test("returns detached definitions and fresh editable pipelines", () => {
    const definitions = getStandardRecipeDefinitions();
    (definitions[0].tags as string[]).push("local-only");
    expect(STANDARD_RECIPE_DEFINITIONS[0].tags).not.toContain("local-only");

    const first = loadStandardRecipe("decode-base64");
    const second = loadStandardRecipe("decode-base64");
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    first?.tags.push("local-only");
    first?.steps[0].args.push("local-only");
    expect(second?.tags).not.toContain("local-only");
    expect(second?.steps[0].args).not.toContain("local-only");
    expect(loadStandardRecipe("does-not-exist")).toBeUndefined();
  });
});
