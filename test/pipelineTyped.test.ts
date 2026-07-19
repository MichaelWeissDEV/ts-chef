/**
 * @fileoverview Compile-time and runtime tests for strongly typed operation chains.
 * @package test
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import {
  OperationWithArgs,
  PipelinedOperation,
  TypedOperation,
} from "../src/chef/Operation";
import { Pipeline } from "../src/chef/Pipeline";

class Prefix extends TypedOperation<string, string, [prefix: string]> {
  name = "Prefix";
  inputType = "string";
  outputType = "string";

  run(input: string, [prefix]: [string]): string {
    return prefix + input;
  }
}

class TextLength extends TypedOperation<string, number, []> {
  name = "Text length";
  inputType = "string";
  outputType = "number";

  run(input: string): number {
    return input.length;
  }
}

describe("typed pipeline system", () => {
  test("withArgs preserves argument, input and output types", async () => {
    const configured: OperationWithArgs<string, string, [string]> =
      new Prefix().withArgs("pre-");

    await expect(configured.run("value")).resolves.toBe("pre-value");

    // This line is intentionally compile-checked by ts-jest/tsc.
    // @ts-expect-error Prefix accepts a string argument, not a number.
    new Prefix().withArgs(123);
  });

  test("pipeWithArgs infers the output of the final operation", async () => {
    const chain: PipelinedOperation<string, number> = new Prefix()
      .withArgs("pre-")
      .pipeWithArgs(new TextLength());

    expect(chain.operationNames).toEqual(["Prefix", "Text length"]);
    expect(chain.length).toBe(2);
    await expect(chain.run("value")).resolves.toBe(9);
  });

  test("Pipeline.fromOperation remains typed through instance chaining", async () => {
    const pipeline: Pipeline<string, number> = Pipeline.fromOperation(
      new Prefix(),
      ["pre-"],
    ).pipeOperation(new TextLength(), []);

    await expect(pipeline.execute("value")).resolves.toBe(9);
  });

  test("a preconfigured typed chain can be appended to a Pipeline", async () => {
    const chain = new Prefix()
      .withArgs("pre-")
      .pipeWithArgs(new TextLength());
    const pipeline: Pipeline<string, number> = new Pipeline<string, string>()
      .pipePipelined(chain);

    await expect(pipeline.execute("value")).resolves.toBe(9);
  });
});
