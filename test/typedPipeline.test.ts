import { runOp, runPipeline } from "../src/commands/runner";

describe("typed pipeline values", () => {
  test("parses JSON text before a JSON operation", () => {
    const result = String(runOp("JSONtoYAML", '{"name":"alice","score":7}', []));
    expect(result).toContain("name: alice");
    expect(result).toContain("score: 7");
  });

  test("keeps structured JSON between pipeline steps", async () => {
    const result = await runPipeline("name,score\nalice,7", [
      {
        opName: "CSVToJSON",
        args: [",", "\n", "Array of dictionaries"],
      },
      { opName: "JSONtoYAML", args: [] },
    ]);
    expect(result).toContain("name: alice");
    expect(result).toContain("score: \"7\"");
    expect(result).not.toContain("\\0");
  });

  test("serialises a final JSON result instead of treating arrays as bytes", async () => {
    const result = await runPipeline("name,score\nalice,7", [
      {
        opName: "CSVToJSON",
        args: [",", "\n", "Array of dictionaries"],
      },
    ]);
    expect(JSON.parse(result)).toEqual([{ name: "alice", score: "7" }]);
  });

  test("parses decoded JSON bytes before a structured-data operation", async () => {
    const result = await runPipeline("eyJhIjoxfQ==", [
      { opName: "FromBase64", args: ["A-Za-z0-9+/=", true, false] },
      { opName: "JSONtoYAML", args: [] },
    ]);
    expect(result.trim()).toBe("a: 1");
  });

  test("renders invalid UTF-8 binary output losslessly as hex", async () => {
    expect(
      await runPipeline("/w==", [
        { opName: "FromBase64", args: ["A-Za-z0-9+/=", true, false] },
      ]),
    ).toBe("ff");
    expect(
      await runPipeline("AP+A", [
        { opName: "FromBase64", args: ["A-Za-z0-9+/=", true, false] },
      ]),
    ).toBe("00ff80");
  });

  test("preserves printable non-ASCII UTF-8 output as text", async () => {
    const encoded = Buffer.from("Grüße 👋", "utf-8").toString("base64");
    expect(
      await runPipeline(encoded, [
        { opName: "FromBase64", args: ["A-Za-z0-9+/=", true, false] },
      ]),
    ).toBe("Grüße 👋");
  });

  test("aborts automatic-style pipelines after an oversized intermediate", async () => {
    const binary = { opName: "ToBinary", args: ["Space", 8] };
    await expect(
      runPipeline("A".repeat(64 * 1024), [binary, binary, binary], {
        maxIntermediateSize: 4 * 1024 * 1024,
      }),
    ).rejects.toMatchObject({
      code: "PIPELINE_SIZE_LIMIT",
      progress: 1,
    });
  });
});
