import {
  PIPELINE_GRAPH_LIMITS,
  PipelineGraph,
  PipelineGraphValidationError,
  graphStepsForOutput,
  graphToPrimarySteps,
  linearPipelineToGraph,
  validatePipelineGraph,
} from "../src/panels/pipelineGraphModel";

function branchingGraph(): PipelineGraph {
  return {
    version: 1,
    nodes: [
      { id: "input", type: "input", x: 0, y: 0 },
      {
        id: "decode",
        type: "operation",
        opName: "FromBase64",
        args: [],
        x: 200,
        y: 0,
      },
      {
        id: "hex",
        type: "operation",
        opName: "ToHex",
        args: ["Space"],
        x: 400,
        y: -100,
      },
      {
        id: "hash",
        type: "operation",
        opName: "SHA2",
        args: [256],
        x: 400,
        y: 100,
      },
      { id: "out-hex", type: "output", name: "Hex", x: 600, y: -100 },
      { id: "out-hash", type: "output", name: "SHA-256", x: 600, y: 100 },
    ],
    edges: [
      { id: "e-input", source: "input", target: "decode" },
      { id: "e-hex", source: "decode", target: "hex" },
      { id: "e-hash", source: "decode", target: "hash" },
      { id: "e-out-hex", source: "hex", target: "out-hex" },
      { id: "e-out-hash", source: "hash", target: "out-hash" },
    ],
  };
}

describe("pipelineGraphModel", () => {
  test("validates a branching graph and derives stable output paths", () => {
    const validated = validatePipelineGraph(branchingGraph());
    expect(validated.inputId).toBe("input");
    expect(validated.topologicalOrder).toEqual([
      "input",
      "decode",
      "hash",
      "hex",
      "out-hash",
      "out-hex",
    ]);
    expect(validated.disconnectedNodeIds).toEqual([]);
    expect(graphStepsForOutput(validated.graph, "out-hex")).toEqual([
      { opName: "FromBase64", args: [] },
      { opName: "ToHex", args: ["Space"] },
    ]);
    expect(graphStepsForOutput(validated.graph, "out-hash")).toEqual([
      { opName: "FromBase64", args: [] },
      { opName: "SHA2", args: [256] },
    ]);
    expect(graphToPrimarySteps(validated.graph)).toBeUndefined();
  });

  test("migrates linear pipelines losslessly and back", () => {
    const steps = [
      { opName: "FromHex", args: ["Auto"] },
      {
        opName: "FindReplace",
        args: [{ string: "a", option: "Regex" }, "b"],
      },
    ];
    const graph = linearPipelineToGraph(steps, { outputName: "Decoded" });
    expect(validatePipelineGraph(graph).graph.nodes).toHaveLength(4);
    expect(graphToPrimarySteps(graph)).toEqual(steps);
    expect(
      graph.nodes.find((node) => node.type === "output"),
    ).toMatchObject({ name: "Decoded" });
  });

  test("migrates the full legacy limit of 512 operations", () => {
    const steps = Array.from({ length: 512 }, (_, index) => ({
      opName: `Operation${index}`,
      args: [],
    }));
    const graph = linearPipelineToGraph(steps);

    expect(graph.nodes).toHaveLength(514);
    expect(graph.edges).toHaveLength(513);
    expect(graphToPrimarySteps(graph)).toEqual(steps);
  });

  test("reports disconnected editor nodes without rejecting the graph", () => {
    const graph = branchingGraph();
    graph.nodes.push({
      id: "unused",
      type: "operation",
      opName: "ToHex",
      args: [],
      x: 0,
      y: 500,
    });
    const first = validatePipelineGraph(graph);
    const reordered = validatePipelineGraph({
      ...graph,
      nodes: [...graph.nodes].reverse(),
      edges: [...graph.edges].reverse(),
    });
    expect(first.disconnectedNodeIds).toEqual(["unused"]);
    expect(reordered.topologicalOrder).toEqual(first.topologicalOrder);
    expect(graphStepsForOutput(graph, "missing")).toBeUndefined();
  });

  test("rejects cycles, including cycles in disconnected components", () => {
    const graph: PipelineGraph = {
      version: 1,
      nodes: [
        { id: "input", type: "input", x: 0, y: 0 },
        { id: "a", type: "operation", opName: "A", args: [], x: 1, y: 1 },
        { id: "b", type: "operation", opName: "B", args: [], x: 2, y: 2 },
      ],
      edges: [
        { id: "ab", source: "a", target: "b" },
        { id: "ba", source: "b", target: "a" },
      ],
    };
    expect(() => validatePipelineGraph(graph)).toThrow(
      expect.objectContaining({ code: "GRAPH_CYCLE" }),
    );
  });

  test("enforces one inbound connection but permits unlimited fan-out", () => {
    expect(() => validatePipelineGraph(branchingGraph())).not.toThrow();
    const graph = branchingGraph();
    graph.edges.push({ id: "second", source: "input", target: "hex" });
    expect(() => validatePipelineGraph(graph)).toThrow(
      expect.objectContaining({ code: "MULTIPLE_INBOUND" }),
    );
  });

  test.each([
    {
      name: "no input",
      mutate: (graph: PipelineGraph) => {
        graph.nodes = graph.nodes.filter((node) => node.type !== "input");
      },
      code: "INVALID_GRAPH",
    },
    {
      name: "second input",
      mutate: (graph: PipelineGraph) => {
        graph.nodes.push({ id: "input-2", type: "input", x: 0, y: 0 });
      },
      code: "INVALID_GRAPH",
    },
    {
      name: "edge into input",
      mutate: (graph: PipelineGraph) => {
        graph.edges.push({ id: "bad", source: "decode", target: "input" });
      },
      code: "INVALID_CONNECTION",
    },
    {
      name: "edge out of output",
      mutate: (graph: PipelineGraph) => {
        graph.edges.push({ id: "bad", source: "out-hex", target: "hash" });
      },
      code: "INVALID_CONNECTION",
    },
    {
      name: "unknown endpoint",
      mutate: (graph: PipelineGraph) => {
        graph.edges.push({ id: "bad", source: "missing", target: "hash" });
      },
      code: "INVALID_EDGE",
    },
    {
      name: "unsafe identifier",
      mutate: (graph: PipelineGraph) => {
        graph.nodes[0].id = "../input";
      },
      code: "INVALID_NODE",
    },
    {
      name: "unbounded coordinate",
      mutate: (graph: PipelineGraph) => {
        graph.nodes[0].x = Number.POSITIVE_INFINITY;
      },
      code: "INVALID_NODE",
    },
  ])("rejects invalid graph structure: $name", ({ mutate, code }) => {
    const graph = branchingGraph();
    mutate(graph);
    try {
      validatePipelineGraph(graph);
      throw new Error("expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(PipelineGraphValidationError);
      expect((error as PipelineGraphValidationError).code).toBe(code);
    }
  });

  test("enforces node and edge caps before traversing attacker-controlled data", () => {
    const tooManyNodes = {
      version: 1,
      nodes: Array.from(
        { length: PIPELINE_GRAPH_LIMITS.maxNodes + 1 },
        (_, index) => ({ id: `n-${index}`, type: "input", x: 0, y: 0 }),
      ),
      edges: [],
    };
    expect(() => validatePipelineGraph(tooManyNodes)).toThrow(
      expect.objectContaining({ code: "GRAPH_LIMIT" }),
    );
    const graph = branchingGraph();
    graph.edges = Array.from(
      { length: PIPELINE_GRAPH_LIMITS.maxEdges + 1 },
      (_, index) => ({ id: `e-${index}`, source: "input", target: "decode" }),
    );
    expect(() => validatePipelineGraph(graph)).toThrow(
      expect.objectContaining({ code: "GRAPH_LIMIT" }),
    );
  });

  test("rejects cyclic and excessively nested arguments", () => {
    const graph = branchingGraph();
    const operation = graph.nodes.find(
      (node) => node.type === "operation",
    );
    if (!operation || operation.type !== "operation") throw new Error("fixture");
    const cyclic: unknown[] = [];
    cyclic.push(cyclic);
    operation.args = [cyclic] as never;
    expect(() => validatePipelineGraph(graph)).toThrow(
      expect.objectContaining({ code: "INVALID_NODE" }),
    );

    let nested: unknown = "value";
    for (let index = 0; index < PIPELINE_GRAPH_LIMITS.maxArgumentDepth + 2; index += 1) {
      nested = [nested];
    }
    operation.args = [nested] as never;
    expect(() => validatePipelineGraph(graph)).toThrow(
      expect.objectContaining({ code: "GRAPH_LIMIT" }),
    );
  });

  test("optionally rejects operation names outside the host registry", () => {
    expect(() =>
      validatePipelineGraph(branchingGraph(), {
        isKnownOperation: (name) => name !== "SHA2",
      }),
    ).toThrow("unknown operation 'SHA2'");
  });
});
