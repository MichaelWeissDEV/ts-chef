import type { PipelineStep } from "../src/storage/store";
import {
  mergeParsedPanelSteps,
  serialisePanelPipeline,
  splitPipelineParts,
  toPanelSteps,
  toPipelineSteps,
} from "../src/panels/pipelinePanelModel";
import { parsePipeline } from "../src/commands/runner";

describe("pipelinePanelModel", () => {
  test("splits only top-level pipes", () => {
    expect(
      splitPipelineParts(`Find / Replace(Find="a|b", Replace='x|y') | To Hex`),
    ).toEqual([`Find / Replace(Find="a|b", Replace='x|y')`, "To Hex"]);
  });

  test("parses closing parentheses and pipes inside quoted values", () => {
    const parsed = parsePipeline(
      `Find / Replace(Find=")|(", Replace="x|y") | To Hex`,
    );
    expect(parsed).toHaveLength(2);
    expect(parsed[0].opName).toBe("FindReplace");
    expect(parsed[0].args[0]).toEqual(
      expect.objectContaining({ string: ")|(" }),
    );
    expect(parsed[0].args[1]).toBe("x|y");
    expect(parsed[1].opName).toBe("ToHex");
  });

  test.each([
    "To Hex(Delimiter=Space",
    'To Hex(Delimiter="Space)',
    "To Hex |",
    "To Hex(Delimiter)",
    "To Hex(Unknown=Space)",
    "To Hex(Delimiter=Space,, Bytes per line=0)",
  ])("rejects malformed pipeline syntax: %s", (raw) => {
    expect(() => parsePipeline(raw)).toThrow();
  });

  test("adds unique panel ids and strips them for runner/store", () => {
    const persisted = [
      { opName: "FromHex", args: ["Auto"] },
      { opName: "ToHex", args: ["Space"] },
    ] satisfies PipelineStep[];
    const panel = toPanelSteps(persisted);
    expect(panel[0].id).toBeTruthy();
    expect(panel[1].id).toBeTruthy();
    expect(panel[0].id).not.toBe(panel[1].id);
    expect(toPipelineSteps(panel)).toEqual(persisted);
  });

  test("retains configured args when text names have no arg section", () => {
    const previous = [
      { id: "one", opName: "FromHex", args: ["Custom"] },
      { id: "two", opName: "ToHex", args: ["Comma"] },
    ];
    const parsed: PipelineStep[] = [
      { opName: "ToHex", args: ["Default"] },
      { opName: "FromHex", args: ["Default"] },
    ];
    expect(
      mergeParsedPanelSteps("To Hex | From Hex", parsed, previous),
    ).toEqual([
      { id: "two", opName: "ToHex", args: ["Comma"] },
      { id: "one", opName: "FromHex", args: ["Custom"] },
    ]);
  });

  test("uses host-parsed args when text explicitly supplies arguments", () => {
    const previous = [{ id: "same", opName: "ToHex", args: ["Space"] }];
    const parsed: PipelineStep[] = [{ opName: "ToHex", args: ["Comma"] }];
    expect(
      mergeParsedPanelSteps('To Hex(Delimiter="Comma")', parsed, previous),
    ).toEqual([{ id: "same", opName: "ToHex", args: ["Comma"] }]);
  });

  test("serialises typed arguments through the host parser without loss", () => {
    const previous = [
      {
        id: "hex",
        opName: "ToHex",
        args: ["Comma", 16, { string: "aa", option: "Hex" }],
      },
    ];
    const raw = serialisePanelPipeline(previous, () => "To Hex");
    const hostParsed = parsePipeline(raw);
    expect(raw).toContain("__tschef_args");
    expect(mergeParsedPanelSteps(raw, hostParsed, previous)).toEqual(previous);
  });

  test("keeps parser control characters, quotes and Unicode inside arguments", () => {
    const previous = [
      {
        id: "find",
        opName: "FindReplace",
        args: [`) | ( "quoted" \\ path 🔬`, "replacement | value"],
      },
      { id: "hex", opName: "ToHex", args: ["Space"] },
    ];
    const raw = serialisePanelPipeline(previous, (opName) =>
      opName === "FindReplace" ? "Find / Replace" : "To Hex",
    );
    expect(raw).not.toContain("replacement | value");
    expect(mergeParsedPanelSteps(raw, parsePipeline(raw), previous)).toEqual(
      previous,
    );
  });
});
