import {
  decodePipelinePanelMessage,
  validatePanelSteps,
} from "../src/panels/pipelineProtocol";

const operations = new Set(["FromHex", "ToHex"]);

describe("pipeline webview protocol", () => {
  test("accepts a run invalidation without trusting a client request id", () => {
    expect(
      decodePipelinePanelMessage({ type: "invalidateRuns" }, operations),
    ).toEqual({ ok: true, message: { type: "invalidateRuns" } });
  });

  test("accepts a complete explicit run", () => {
    const decoded = decodePipelinePanelMessage(
      {
        type: "run",
        requestId: 7,
        explicit: true,
        steps: [{ id: "a", opName: "FromHex", args: ["Auto"] }],
        inputSource: "clipboard",
        outputTarget: "newDocument",
        manualInput: "",
      },
      operations,
    );
    expect(decoded).toMatchObject({
      ok: true,
      message: { type: "run", requestId: 7 },
    });
  });

  test("rejects unknown operations and duplicate ids", () => {
    expect(
      validatePanelSteps(
        [{ id: "a", opName: "Missing", args: [] }],
        operations,
      ),
    ).toContain("unknown operation");
    expect(
      validatePanelSteps(
        [
          { id: "a", opName: "FromHex", args: [] },
          { id: "a", opName: "ToHex", args: [] },
        ],
        operations,
      ),
    ).toContain("duplicated");
  });

  test("rejects malformed sources and unsafe argument values", () => {
    const badSource = decodePipelinePanelMessage(
      {
        type: "run",
        requestId: 1,
        explicit: true,
        steps: [],
        inputSource: "filesystem",
        outputTarget: "preview",
        manualInput: "",
      },
      operations,
    );
    expect(badSource).toMatchObject({ ok: false });

    expect(
      validatePanelSteps(
        [{ id: "a", opName: "FromHex", args: [() => "unsafe"] }],
        operations,
      ),
    ).toContain("unsupported argument data");
  });

  test("returns request id with protocol errors for latest-wins routing", () => {
    expect(
      decodePipelinePanelMessage(
        {
          type: "run",
          requestId: 42,
          explicit: "yes",
          steps: [],
          inputSource: "manual",
          outputTarget: "preview",
          manualInput: "",
        },
        operations,
      ),
    ).toMatchObject({ ok: false, requestId: 42 });
  });

  test("enforces an aggregate argument byte budget", () => {
    expect(
      validatePanelSteps(
        [
          {
            id: "large",
            opName: "FromHex",
            args: ["x".repeat(1024 * 1024 + 1)],
          },
        ],
        operations,
      ),
    ).toContain("unsupported argument data");
  });
});
