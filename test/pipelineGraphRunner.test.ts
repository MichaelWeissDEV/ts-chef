import type { AnyInput } from "../src/chef/Operation";
import type {
  PipelineGraph,
  PipelineGraphOperationNode,
} from "../src/panels/pipelineGraphModel";
import {
  PipelineGraphExecutionError,
  cloneGraphValue,
  graphValueSize,
  runPipelineGraph,
} from "../src/panels/pipelineGraphRunner";

function fanOutGraph(): PipelineGraph {
  return {
    version: 1,
    nodes: [
      { id: "input", type: "input", x: 0, y: 0 },
      { id: "append", type: "operation", opName: "Append", args: [2], x: 1, y: -1 },
      { id: "inspect", type: "operation", opName: "Inspect", args: [], x: 1, y: 1 },
      { id: "out-a", type: "output", name: "Appended", x: 2, y: -1 },
      { id: "out-b", type: "output", name: "Original", x: 2, y: 1 },
    ],
    edges: [
      { id: "e-a", source: "input", target: "append" },
      { id: "e-b", source: "input", target: "inspect" },
      { id: "e-oa", source: "append", target: "out-a" },
      { id: "e-ob", source: "inspect", target: "out-b" },
    ],
  };
}

type TestValue = { values: number[] };

function testRunner(
  opName: string,
  input: AnyInput,
  args: unknown[],
): AnyInput {
  const value = input as TestValue;
  if (opName === "Append") {
    value.values.push(Number(args[0]));
    return value;
  }
  if (opName === "Inspect") return { values: [...value.values] };
  if (opName === "Upper") return String(input).toUpperCase();
  if (opName === "Fail") throw new Error("deliberate failure");
  if (opName === "Never") throw new Error("must not run");
  return input;
}

describe("pipelineGraphRunner", () => {
  test("fans out with defensive values so sibling operations cannot mutate each other", async () => {
    const input: TestValue = { values: [1] };
    const outputs = await runPipelineGraph(fanOutGraph(), input, {
      runOperation: testRunner,
    });
    expect(outputs.get("out-a")).toMatchObject({
      name: "Appended",
      value: { values: [1, 2] },
      path: ["input", "append", "out-a"],
    });
    expect(outputs.get("out-b")).toMatchObject({
      name: "Original",
      value: { values: [1] },
      path: ["input", "inspect", "out-b"],
    });
    expect(input).toEqual({ values: [1] });
    (outputs.get("out-a")?.value as TestValue).values.push(99);
    expect(outputs.get("out-b")?.value).toEqual({ values: [1] });
  });

  test("one transformed branch can feed multiple independently cloned outputs", async () => {
    const graph = fanOutGraph();
    graph.nodes = graph.nodes.filter(
      (node) => !["inspect", "out-b"].includes(node.id),
    );
    graph.edges = graph.edges.filter(
      (edge) => !["e-b", "e-ob"].includes(edge.id),
    );
    graph.nodes.push({ id: "out-c", type: "output", name: "Copy", x: 2, y: 2 });
    graph.edges.push({ id: "e-oc", source: "append", target: "out-c" });
    const outputs = await runPipelineGraph(graph, { values: [1] }, {
      runOperation: testRunner,
    });
    expect(outputs.get("out-a")?.value).toEqual({ values: [1, 2] });
    expect(outputs.get("out-c")?.value).toEqual({ values: [1, 2] });
    expect(outputs.get("out-a")?.value).toBe(outputs.get("out-c")?.value);
  });

  test("keeps hundreds of terminal fan-outs as O(1) source references", async () => {
    const outputCount = 200;
    const graph: PipelineGraph = {
      version: 1,
      nodes: [
        { id: "input", type: "input", x: 0, y: 0 },
        { id: "value", type: "operation", opName: "Value", args: [], x: 1, y: 0 },
        ...Array.from({ length: outputCount }, (_, index) => ({
          id: `out-${index}`,
          type: "output" as const,
          name: `Output ${index}`,
          x: 2,
          y: index,
        })),
      ],
      edges: [
        { id: "e1", source: "input", target: "value" },
        ...Array.from({ length: outputCount }, (_, index) => ({
          id: `e-out-${index}`,
          source: "value",
          target: `out-${index}`,
        })),
      ],
    };
    const retained = { bytes: new Uint8Array(1_024) };
    const outputs = await runPipelineGraph(graph, "x", {
      maxNodeOutputSize: 2_048,
      maxTotalOutputSize: 2_048,
      runOperation: () => retained,
    });
    expect(outputs.size).toBe(outputCount);
    const first = outputs.get("out-0")?.value;
    expect(first).toEqual(retained);
    for (const output of outputs.values()) expect(output.value).toBe(first);
  });

  test("isolates a failed branch while independent branches complete", async () => {
    const graph: PipelineGraph = {
      version: 1,
      nodes: [
        { id: "input", type: "input", x: 0, y: 0 },
        { id: "fail", type: "operation", opName: "Fail", args: [], x: 1, y: -1 },
        { id: "blocked", type: "operation", opName: "Never", args: [], x: 2, y: -1 },
        { id: "good", type: "operation", opName: "Upper", args: [], x: 1, y: 1 },
        { id: "out-error", type: "output", name: "Failed", x: 3, y: -1 },
        { id: "out-good", type: "output", name: "Good", x: 2, y: 1 },
      ],
      edges: [
        { id: "e1", source: "input", target: "fail" },
        { id: "e2", source: "fail", target: "blocked" },
        { id: "e3", source: "blocked", target: "out-error" },
        { id: "e4", source: "input", target: "good" },
        { id: "e5", source: "good", target: "out-good" },
      ],
    };
    const calls: string[] = [];
    const outputs = await runPipelineGraph(graph, "hello", {
      runOperation: (name, input, args) => {
        calls.push(name);
        return testRunner(name, input, args);
      },
    });
    expect(calls).toEqual(["Fail", "Upper"]);
    expect(outputs.get("out-good")?.value).toBe("HELLO");
    expect(outputs.get("out-error")?.error).toMatchObject({
      code: "OPERATION_FAILED",
      nodeId: "fail",
      message: "deliberate failure",
    });
    expect(outputs.get("out-error")?.path).toEqual([
      "input",
      "fail",
      "blocked",
      "out-error",
    ]);
  });

  test("does not execute disconnected operations and marks their outputs", async () => {
    const graph = fanOutGraph();
    graph.nodes.push(
      { id: "unused", type: "operation", opName: "Never", args: [], x: 4, y: 4 },
      { id: "out-unused", type: "output", name: "Unused", x: 5, y: 4 },
    );
    graph.edges.push({ id: "unused-edge", source: "unused", target: "out-unused" });
    const calls: string[] = [];
    const outputs = await runPipelineGraph(graph, { values: [1] }, {
      runOperation: (name, input, args) => {
        calls.push(name);
        return testRunner(name, input, args);
      },
    });
    expect(calls).toEqual(["Append", "Inspect"]);
    expect(outputs.get("out-unused")).toMatchObject({
      name: "Unused",
      error: { code: "OUTPUT_DISCONNECTED", nodeId: "out-unused" },
      path: ["out-unused"],
    });
  });

  test("requires an explicit allowlist for live execution", async () => {
    await expect(
      runPipelineGraph(fanOutGraph(), { values: [1] }, {
        live: true,
        runOperation: testRunner,
      }),
    ).rejects.toMatchObject({ code: "LIVE_POLICY_REQUIRED" });
  });

  test("uses the live allowlist callback and propagates rejected-node errors", async () => {
    const checked: string[] = [];
    const outputs = await runPipelineGraph(fanOutGraph(), { values: [1] }, {
      live: true,
      allowedOperations: (name: string, _node: PipelineGraphOperationNode) => {
        checked.push(name);
        return name === "Inspect";
      },
      runOperation: testRunner,
    });
    expect(checked).toEqual(["Append", "Inspect"]);
    expect(outputs.get("out-a")?.error).toMatchObject({
      code: "OPERATION_NOT_ALLOWED",
      nodeId: "append",
    });
    expect(outputs.get("out-b")?.value).toEqual({ values: [1] });
  });

  test("applies input and per-node live size limits", async () => {
    await expect(
      runPipelineGraph(fanOutGraph(), "0123456789", {
        maxInputSize: 5,
        runOperation: testRunner,
      }),
    ).rejects.toMatchObject({ code: "INPUT_LIMIT" });

    const graph: PipelineGraph = {
      version: 1,
      nodes: [
        { id: "input", type: "input", x: 0, y: 0 },
        { id: "large", type: "operation", opName: "Large", args: [], x: 1, y: 0 },
        { id: "out", type: "output", name: "Output", x: 2, y: 0 },
      ],
      edges: [
        { id: "e1", source: "input", target: "large" },
        { id: "e2", source: "large", target: "out" },
      ],
    };
    const outputs = await runPipelineGraph(graph, "x", {
      maxNodeOutputSize: 4,
      runOperation: () => "12345",
    });
    expect(outputs.get("out")?.error).toMatchObject({
      code: "NODE_OUTPUT_LIMIT",
      nodeId: "large",
    });
  });

  test("emits ordered defensive node events for live previews", async () => {
    const graph: PipelineGraph = {
      version: 1,
      nodes: [
        { id: "input", type: "input", x: 0, y: 0 },
        { id: "upper", type: "operation", opName: "Upper", args: [], x: 1, y: 0 },
        { id: "out", type: "output", name: "Output", x: 2, y: 0 },
      ],
      edges: [
        { id: "e1", source: "input", target: "upper" },
        { id: "e2", source: "upper", target: "out" },
      ],
    };
    const events: string[] = [];
    await runPipelineGraph(graph, "hello", {
      runOperation: testRunner,
      onNodeSettled: (event) => {
        events.push(`${event.nodeId}:${event.status}:${String(event.value ?? "")}`);
      },
    });
    expect(events).toEqual([
      "input:success:hello",
      "upper:running:",
      "upper:success:HELLO",
      "out:success:",
    ]);
  });

  test("bounds value-size traversal and validates run limit configuration", async () => {
    expect(graphValueSize({ a: "1234", b: new Uint8Array(4) }, 4)).toBeGreaterThan(4);
    await expect(
      runPipelineGraph(fanOutGraph(), "x", {
        maxInputSize: -1,
        runOperation: testRunner,
      }),
    ).rejects.toBeInstanceOf(PipelineGraphExecutionError);
  });

  test("copies shared memory instead of leaking mutations across branches", () => {
    const shared = new SharedArrayBuffer(4);
    new Uint8Array(shared)[0] = 7;
    const cloned = cloneGraphValue({ nested: new Uint8Array(shared) });
    const clonedBytes = (cloned as { nested: Uint8Array }).nested;
    clonedBytes[0] = 99;
    expect(new Uint8Array(shared)[0]).toBe(7);
    expect(graphValueSize(shared)).toBe(4);
  });

  test("supports cancellation before executing the first operation", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      runPipelineGraph(fanOutGraph(), { values: [1] }, {
        signal: controller.signal,
        runOperation: testRunner,
      }),
    ).rejects.toMatchObject({ code: "GRAPH_ABORTED" });
  });

  test("stops before sizing or emitting a result that completed after cancellation", async () => {
    const graph: PipelineGraph = {
      version: 1,
      nodes: [
        { id: "input", type: "input", x: 0, y: 0 },
        { id: "slow", type: "operation", opName: "Slow", args: [], x: 1, y: 0 },
        { id: "out", type: "output", name: "Output", x: 2, y: 0 },
      ],
      edges: [
        { id: "e1", source: "input", target: "slow" },
        { id: "e2", source: "slow", target: "out" },
      ],
    };
    let finish: ((value: AnyInput) => void) | undefined;
    const operation = new Promise<AnyInput>((resolve) => {
      finish = resolve;
    });
    const controller = new AbortController();
    const events: string[] = [];
    const execution = runPipelineGraph(graph, "input", {
      signal: controller.signal,
      runOperation: () => operation,
      onNodeSettled: (event) => {
        events.push(`${event.nodeId}:${event.status}`);
      },
    });
    await new Promise((resolve) => setImmediate(resolve));
    expect(events).toContain("slow:running");

    controller.abort();
    finish?.(new Uint8Array(1024 * 1024));

    await expect(execution).rejects.toMatchObject({ code: "GRAPH_ABORTED" });
    expect(events).not.toContain("slow:success");
    expect(events).not.toContain("out:success");
  });
});
