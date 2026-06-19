/**
 * @fileoverview Flow control pipeline integration tests
 * @package test
 * @license Apache-2.0
 */

import { runPipeline } from "../src/commands/runner";

describe("Flow Control Pipeline Integration", () => {
  test("Fork and Merge round-trip over line-separated inputs", async () => {
    const input = "SGVsbG8=\nd29ybGQ=";
    const steps = [
      { opName: "Fork", args: ["\n", "\n", false] },
      { opName: "From Base64", args: ["A-Za-z0-9+/=", true, false] },
      { opName: "Merge", args: [true] },
    ];
    const result = await runPipeline(input, steps);
    expect(result).toBe("Hello\nworld");
  });
});
