import {
  decodePipelinePanelMessage,
  validatePanelSteps,
} from "../src/panels/pipelineProtocol";

const operations = new Set(["FromHex", "ToHex"]);

const graph = {
  version: 1 as const,
  nodes: [
    { id: "input", type: "input" as const, x: 0, y: 80 },
    {
      id: "decode",
      type: "operation" as const,
      opName: "FromHex",
      args: ["Auto"],
      x: 240,
      y: 20,
    },
    { id: "decoded", type: "output" as const, name: "Decoded", x: 500, y: 20 },
    { id: "original", type: "output" as const, name: "Original", x: 500, y: 160 },
  ],
  edges: [
    { id: "input-decode", source: "input", target: "decode" },
    { id: "decode-output", source: "decode", target: "decoded" },
    { id: "input-original", source: "input", target: "original" },
  ],
};

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

  test("accepts a branched graph run with a selected output", () => {
    const decoded = decodePipelinePanelMessage(
      {
        type: "runGraph",
        requestId: 8,
        explicit: true,
        graph,
        activeOutputId: "decoded",
        inputSource: "selection",
        outputTarget: "replaceSelection",
        manualInput: "",
      },
      operations,
    );

    expect(decoded).toMatchObject({
      ok: true,
      message: {
        type: "runGraph",
        requestId: 8,
        activeOutputId: "decoded",
        graph,
      },
    });
  });

  test("accepts graph changes and graph-backed saves", () => {
    expect(
      decodePipelinePanelMessage(
        { type: "graphChanged", graph, steps: [] },
        operations,
      ),
    ).toMatchObject({ ok: true, message: { type: "graphChanged", graph } });
    expect(
      decodePipelinePanelMessage(
        {
          type: "save",
          name: "Branches",
          description: "",
          raw: "From Hex",
          steps: [{ id: "decode", opName: "FromHex", args: ["Auto"] }],
          graph,
          activeOutputId: "original",
        },
        operations,
      ),
    ).toMatchObject({
      ok: true,
      message: { type: "save", activeOutputId: "original", graph },
    });
  });

  test("rejects graph cycles, unknown operations and invalid output selection", () => {
    const cyclic = {
      ...graph,
      edges: [
        { id: "decode-loop", source: "decode", target: "decode" },
      ],
    };
    expect(
      decodePipelinePanelMessage(
        {
          type: "runGraph",
          requestId: 9,
          explicit: true,
          graph: cyclic,
          inputSource: "manual",
          outputTarget: "preview",
          manualInput: "",
        },
        operations,
      ),
    ).toMatchObject({ ok: false, requestId: 9 });

    const unknown = {
      ...graph,
      nodes: graph.nodes.map((node) =>
        node.id === "decode" ? { ...node, opName: "RunMalware" } : node,
      ),
    };
    expect(
      decodePipelinePanelMessage(
        { type: "graphChanged", graph: unknown },
        operations,
      ),
    ).toMatchObject({ ok: false });

    expect(
      decodePipelinePanelMessage(
        {
          type: "runGraph",
          requestId: 10,
          explicit: true,
          graph,
          activeOutputId: "decode",
          inputSource: "manual",
          outputTarget: "preview",
          manualInput: "",
        },
        operations,
      ),
    ).toMatchObject({ ok: false, requestId: 10 });
  });

  test("allows list flow-control operations but rejects them in DAG runs", () => {
    const allOperations = new Set(["FromHex", "ToHex", "Jump"]);
    const graphOperations = new Set(["FromHex", "ToHex"]);
    const flowGraph = {
      ...graph,
      nodes: graph.nodes.map((node) =>
        node.id === "decode" ? { ...node, opName: "Jump" } : node,
      ),
    };

    expect(
      decodePipelinePanelMessage(
        {
          type: "run",
          requestId: 20,
          explicit: true,
          steps: [{ id: "jump", opName: "Jump", args: [1] }],
          inputSource: "manual",
          outputTarget: "preview",
          manualInput: "",
        },
        allOperations,
        graphOperations,
      ),
    ).toMatchObject({ ok: true });
    expect(
      decodePipelinePanelMessage(
        {
          type: "runGraph",
          requestId: 21,
          explicit: true,
          graph: flowGraph,
          inputSource: "manual",
          outputTarget: "preview",
          manualInput: "",
        },
        allOperations,
        graphOperations,
      ),
    ).toMatchObject({ ok: false, requestId: 21 });

    const disconnectedDraft = {
      ...flowGraph,
      edges: flowGraph.edges.filter((edge) => edge.id !== "input-decode"),
    };
    expect(
      decodePipelinePanelMessage(
        {
          type: "runGraph",
          requestId: 22,
          explicit: true,
          graph: disconnectedDraft,
          inputSource: "manual",
          outputTarget: "preview",
          manualInput: "",
        },
        allOperations,
        graphOperations,
      ),
    ).toMatchObject({ ok: true });
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
