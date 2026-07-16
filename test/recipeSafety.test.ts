import { parsePipeline, runPipeline } from "../src/commands/runner";

describe("recipe execution safety", () => {
  test("throws instead of silently skipping an unavailable operation", async () => {
    await expect(
      runPipeline("sensitive", [
        { opName: "DefinitelyMissingOperation", args: [] },
      ]),
    ).rejects.toThrow('Unknown operation: "DefinitelyMissingOperation"');
  });

  test("operations cannot mutate the saved step argument arrays", async () => {
    const steps = parsePipeline("ExtractFiles");
    const originalLength = steps[0].args.length;
    await runPipeline(new ArrayBuffer(0), steps);
    expect(steps[0].args).toHaveLength(originalLength);
  });
});
