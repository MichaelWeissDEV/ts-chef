/**
 * @fileoverview End-to-end execution tests for shortcut pipeline expressions.
 * @package test
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import { parsePipeline, runPipeline } from "../src/commands/runner";
import {
  ActionHistory,
  parseShortcutRegistry,
  type PipelineHistoryAction,
} from "../src/commands/shortcutRegistry";

async function runExpression(
  expression: string,
  input: string,
): Promise<string> {
  const parsed = parseShortcutRegistry({ test: expression });
  expect(parsed.issues).toEqual([]);
  expect(parsed.bindings[0].target.kind).toBe("expression");
  return runPipeline(input, parsePipeline(expression));
}

describe("registered shortcut expressions execute through the real operation catalog", () => {
  test.each([
    ["To Base64", "hello", "aGVsbG8="],
    ["From Base64", "aGVsbG8=", "hello"],
    ["ROT13", "Hello, World!", "Uryyb, Jbeyq!"],
    ["URL encode", "a b+c", "a+b%2Bc"],
    ["URL decode", "a%20b%2Bc", "a b+c"],
    ["Remove whitespace", " a\n b\t c ", "abc"],
  ])("runs %s", async (expression, input, expected) => {
    await expect(runExpression(expression, input)).resolves.toBe(expected);
  });

  test.each([
    ["hello"],
    ["Grüße 👋"],
    ["line one\nline two"],
    ["\u0000\u0001binary"],
  ])("round-trips Base64 for %p", async (input) => {
    await expect(runExpression("To Base64 | From Base64", input)).resolves.toBe(
      input,
    );
  });

  test("runs a multi-stage decode and formatting pipeline", async () => {
    const encoded = Buffer.from('{"answer":42,"ok":true}').toString("base64");
    const output = await runExpression("From Base64 | JSON Beautify", encoded);
    expect(output).toContain('"answer": 42');
    expect(JSON.parse(output)).toEqual({ answer: 42, ok: true });
  });

  test("honors inline named arguments", async () => {
    await expect(runExpression("To hex(Delimiter=None)", "ABC")).resolves.toBe(
      "414243",
    );
  });

  test("a history-retained pipeline can be replayed with identical arguments", async () => {
    const history = new ActionHistory();
    const action: PipelineHistoryAction = {
      kind: "pipeline",
      label: "decode-json",
      steps: parsePipeline("From Base64 | JSON Beautify"),
    };
    history.record(action);
    const replay = history.last();
    expect(replay?.kind).toBe("pipeline");
    const encoded = Buffer.from('{"sample":"payload"}').toString("base64");
    await expect(
      runPipeline(encoded, replay?.kind === "pipeline" ? replay.steps : []),
    ).resolves.toContain('"sample": "payload"');
  });

  test.each([
    ["Unknown Shortcut Operation", /Unknown operation/],
    ["To hex(Unknown=value)", /Unknown argument/],
    ['To hex(Delimiter="unterminated)', /unterminated/],
  ])("rejects invalid registry expression %p", (expression, expected) => {
    expect(() => parsePipeline(expression)).toThrow(expected);
  });
});
