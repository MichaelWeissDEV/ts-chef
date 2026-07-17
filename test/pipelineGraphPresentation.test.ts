import {
  buildGraphOutputPayloads,
  presentGraphValue,
} from "../src/panels/pipelinePanel";
import type { PipelineGraph } from "../src/panels/pipelineGraphModel";
import type { PipelineGraphOutputResult } from "../src/panels/pipelineGraphRunner";

describe("pipeline graph presentation", () => {
  test("renders byte-array operation output as readable bytes, not JSON numbers", () => {
    expect(
      presentGraphValue([101, 108, 112, 109, 97, 115], "byteArray"),
    ).toBe("elpmas");
  });

  test("uses hexadecimal fallback for non-text binary output", () => {
    expect(presentGraphValue([0, 255, 1], "byteArray")).toBe("00ff01");
  });

  test("pretty-prints graph JSON output", () => {
    expect(presentGraphValue({ decoded: true }, "JSON")).toBe(
      '{\n  "decoded": true\n}',
    );
  });

  test("presents a large terminal fan-out once within one total preview budget", () => {
    const outputCount = 200;
    const graph: PipelineGraph = {
      version: 1,
      nodes: [
        { id: "input", type: "input", x: 0, y: 0 },
        {
          id: "source",
          type: "operation",
          opName: "Large",
          args: [],
          x: 1,
          y: 0,
        },
        ...Array.from({ length: outputCount }, (_, index) => ({
          id: `output-${index}`,
          type: "output" as const,
          name: `Output ${index}`,
          x: 2,
          y: index,
        })),
      ],
      edges: [],
    };
    const sharedValue = new Uint8Array(8 * 1024 * 1024);
    const results = new Map<string, PipelineGraphOutputResult>(
      Array.from({ length: outputCount }, (_, index) => [
        `output-${index}`,
        {
          outputId: `output-${index}`,
          name: `Output ${index}`,
          value: sharedValue,
          path: ["input", "source", `output-${index}`],
        },
      ]),
    );
    const present = jest.fn(() => "x".repeat(8 * 1024 * 1024));

    const payloads = buildGraphOutputPayloads(graph, results, present);

    expect(present).toHaveBeenCalledTimes(1);
    expect(payloads).toHaveLength(outputCount);
    expect(
      payloads.reduce((total, payload) => total + payload.preview.length, 0),
    ).toBeLessThanOrEqual(2 * 1024 * 1024);
  });
});
