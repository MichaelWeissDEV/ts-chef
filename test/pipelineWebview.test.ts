import { JSDOM } from "jsdom";
import { buildPipelineWebviewHtml } from "../src/panels/pipelineWebview";

describe("pipeline graph webview", () => {
  const html = buildPipelineWebviewHtml("vscode-webview:", "fixed-nonce");

  function openGraph(
    graph: Record<string, unknown>,
    pipelineSteps: Array<Record<string, unknown>> = [
      { id: "op-1", opName: "Reverse", args: [] },
    ],
  ) {
    const posted: Array<Record<string, unknown>> = [];
    const states: Array<Record<string, unknown>> = [];
    const dom = new JSDOM(html, {
      runScripts: "dangerously",
      beforeParse(window) {
        Object.defineProperty(window, "TextEncoder", { value: TextEncoder });
        Object.defineProperty(window, "acquireVsCodeApi", {
          value: () => ({
            getState: () => ({}),
            setState: (state: Record<string, unknown>) => states.push(state),
            postMessage: (message: Record<string, unknown>) =>
              posted.push(message),
          }),
        });
      },
    });
    dom.window.dispatchEvent(
      new dom.window.MessageEvent("message", {
        data: {
          type: "init",
          mode: "graph",
          ops: [
            {
              opName: "Reverse",
              displayName: "Reverse",
              module: "Text",
              inputType: "string",
              outputType: "string",
              args: [],
              defaults: [],
              liveSafe: true,
            },
          ],
          pipeline: {
            name: "DAG",
            description: "",
            raw: "Reverse",
            steps: pipelineSteps,
          },
          graph,
          limits: { liveInput: 65_536 },
        },
      }),
    );
    return { dom, posted, states };
  }

  const branchingGraph = {
    version: 1,
    nodes: [
      { id: "input", type: "input", x: 30, y: 120 },
      {
        id: "op-1",
        type: "operation",
        opName: "Reverse",
        args: [],
        x: 280,
        y: 120,
      },
      { id: "out-a", type: "output", name: "Text", x: 560, y: 50 },
      { id: "out-b", type: "output", name: "Audit", x: 560, y: 220 },
    ],
    edges: [
      { id: "e1", source: "input", target: "op-1" },
      { id: "e2", source: "op-1", target: "out-a" },
      { id: "e3", source: "op-1", target: "out-b" },
    ],
  };

  test("has strict nonce CSP and no inline event handlers", () => {
    expect(html).toContain("script-src 'nonce-fixed-nonce'");
    expect(html).not.toMatch(/\son(?:click|input|change|drag|drop)=/i);
  });

  test("bootstraps initial state through messages, not script interpolation", () => {
    expect(html).toContain("vscode.postMessage({ type: 'ready' })");
    expect(html).not.toContain("INITIAL_STEPS");
    expect(html).not.toContain("INITIAL_RAW");
  });

  test("contains additive list and graph views plus host IO endpoints", () => {
    expect(html).toContain('id="listView"');
    expect(html).toContain('id="graphView"');
    expect(html).toContain('value="clipboard"');
    expect(html).toContain('value="replaceSelection"');
    expect(html).toContain('value="newDocument"');
  });

  test("host can open and switch the existing editor directly in graph mode", () => {
    const savedStates: Array<Record<string, unknown>> = [];
    const dom = new JSDOM(html, {
      runScripts: "dangerously",
      beforeParse(window) {
        Object.defineProperty(window, "TextEncoder", { value: TextEncoder });
        Object.defineProperty(window, "acquireVsCodeApi", {
          value: () => ({
            getState: () => ({ mode: "list" }),
            setState: (state: Record<string, unknown>) =>
              savedStates.push(state),
            postMessage: () => undefined,
          }),
        });
      },
    });

    try {
      dom.window.dispatchEvent(
        new dom.window.MessageEvent("message", {
          data: {
            type: "init",
            mode: "graph",
            ops: [],
            pipeline: { name: "", description: "", raw: "", steps: [] },
            limits: { liveInput: 65_536 },
          },
        }),
      );
      const graph = dom.window.document.getElementById("graphView");
      const list = dom.window.document.getElementById("listView");
      const graphButton = dom.window.document.getElementById("graphModeButton");
      expect(graph?.classList.contains("hidden")).toBe(false);
      expect(list?.classList.contains("hidden")).toBe(true);
      expect(graphButton?.getAttribute("aria-pressed")).toBe("true");
      expect(savedStates.at(-1)?.mode).toBe("graph");

      dom.window.dispatchEvent(
        new dom.window.MessageEvent("message", {
          data: { type: "setMode", mode: "list" },
        }),
      );
      expect(graph?.classList.contains("hidden")).toBe(true);
      expect(list?.classList.contains("hidden")).toBe(false);
      expect(savedStates.at(-1)?.mode).toBe("list");
    } finally {
      dom.window.close();
    }
  });

  test("contains syntactically valid browser JavaScript", () => {
    const script = html.match(/<script[^>]*>([\s\S]*)<\/script>/)?.[1];
    expect(script).toBeDefined();
    expect(() => new Function(script ?? "")).not.toThrow();
  });

  test("renders dynamic population controls and non-input labels", () => {
    expect(html).toContain("populateOption");
    expect(html).toContain("populateMultiOption");
    expect(html).toContain("definition.type === 'label'");
  });

  test("invalidates stale runs and displays bounded preview metadata", () => {
    expect(html).toContain("type: 'invalidateRuns'");
    expect(html).toContain("liveInputLimit");
    expect(html).toContain("message.inputTruncated");
    expect(html).toContain("message.truncated");
  });

  test("blocks run and save while pipe text is pending or invalid", () => {
    expect(html).toContain("let pipelineTextReady = true");
    expect(html).toContain("pipelineTextReady = false");
    expect(html).toContain("|| !pipelineTextReady");
    expect(html).toContain("Wait for valid pipeline text before running.");
    expect(html).toContain("Wait for valid pipeline text before saving.");
  });

  test("invalidates parse responses on every edit and parses an immutable snapshot", () => {
    expect(html).toContain("function invalidateParseRequests()");
    expect(html).toContain(
      "invalidateParseRequests();\n    pipelineTextReady = false",
    );
    expect(html).toContain("const requestId = latestParseRequest");
    expect(html).toContain("const raw = pipeText.value");
    expect(html).toContain("requestParse(requestId, raw, previousSteps)");
    expect(html).toContain("if (requestId !== latestParseRequest) return");
  });

  test("does not let an older parse response overwrite newer pipeline text", () => {
    jest.useFakeTimers();
    const posted: Array<Record<string, unknown>> = [];
    const dom = new JSDOM(html, {
      runScripts: "dangerously",
      beforeParse(window) {
        Object.defineProperty(window, "TextEncoder", { value: TextEncoder });
        Object.defineProperty(window, "acquireVsCodeApi", {
          value: () => ({
            getState: () => ({}),
            setState: () => undefined,
            postMessage: (message: Record<string, unknown>) =>
              posted.push(message),
          }),
        });
      },
    });

    try {
      const operations = [
        {
          opName: "Reverse",
          displayName: "Reverse",
          module: "Text",
          inputType: "string",
          outputType: "string",
          args: [],
          liveSafe: true,
        },
        {
          opName: "ToHex",
          displayName: "To Hex",
          module: "Encoding",
          inputType: "string",
          outputType: "string",
          args: [],
          liveSafe: true,
        },
      ];
      dom.window.dispatchEvent(
        new dom.window.MessageEvent("message", {
          data: {
            type: "init",
            ops: operations,
            pipeline: { name: "", description: "", raw: "", steps: [] },
            limits: { liveInput: 65_536 },
          },
        }),
      );

      const pipelineText = dom.window.document.getElementById(
        "pipeText",
      ) as HTMLTextAreaElement;
      pipelineText.value = "Reverse";
      pipelineText.dispatchEvent(new dom.window.Event("input"));
      jest.advanceTimersByTime(420);
      const firstRequest = posted
        .filter((message) => message.type === "parseRaw")
        .at(-1);
      expect(firstRequest?.raw).toBe("Reverse");

      pipelineText.value = "To Hex";
      pipelineText.dispatchEvent(new dom.window.Event("input"));
      dom.window.dispatchEvent(
        new dom.window.MessageEvent("message", {
          data: {
            type: "parsed",
            requestId: firstRequest?.requestId,
            steps: [{ id: "old", opName: "Reverse", args: [] }],
          },
        }),
      );
      expect(pipelineText.value).toBe("To Hex");

      jest.advanceTimersByTime(420);
      const secondRequest = posted
        .filter((message) => message.type === "parseRaw")
        .at(-1);
      expect(secondRequest?.requestId).not.toBe(firstRequest?.requestId);
      expect(secondRequest?.raw).toBe("To Hex");
    } finally {
      dom.window.close();
      jest.useRealTimers();
    }
  });

  test("persists freely moved node coordinates and emits graphChanged", () => {
    const { dom, posted, states } = openGraph(branchingGraph);
    try {
      const handle = dom.window.document.querySelector(
        '[data-drag-node-id="op-1"]',
      ) as HTMLElement;
      handle.dispatchEvent(
        new dom.window.MouseEvent("pointerdown", {
          bubbles: true,
          button: 0,
          clientX: 300,
          clientY: 140,
        }),
      );
      dom.window.dispatchEvent(
        new dom.window.MouseEvent("pointermove", {
          bubbles: true,
          clientX: 365,
          clientY: 205,
        }),
      );
      dom.window.dispatchEvent(
        new dom.window.MouseEvent("pointerup", {
          bubbles: true,
          clientX: 365,
          clientY: 205,
        }),
      );

      const change = posted
        .filter((message) => message.type === "graphChanged")
        .at(-1);
      const moved = change?.graph.nodes.find(
        (node: Record<string, unknown>) => node.id === "op-1",
      );
      expect(moved).toMatchObject({ x: 345, y: 185 });
      expect(states.at(-1)?.graph.nodes).toContainEqual(
        expect.objectContaining({ id: "op-1", x: 345, y: 185 }),
      );
    } finally {
      dom.window.close();
    }
  });

  test("connects one operation to several named outputs without flattening branches", () => {
    const singleOutputGraph = {
      ...branchingGraph,
      nodes: branchingGraph.nodes.filter((node) => node.id !== "out-b"),
      edges: branchingGraph.edges.filter((edge) => edge.target !== "out-b"),
    };
    const { dom, posted } = openGraph(singleOutputGraph);
    try {
      (
        dom.window.document.getElementById(
          "addOutputButton",
        ) as HTMLButtonElement
      ).click();
      const added = posted
        .filter((message) => message.type === "graphChanged")
        .at(-1);
      const newOutput = added?.graph.nodes.find(
        (node: Record<string, unknown>) =>
          node.type === "output" && node.id !== "out-a",
      );
      expect(newOutput).toBeDefined();

      (
        dom.window.document.querySelector(
          '.port.output[data-node-id="op-1"]',
        ) as HTMLButtonElement
      ).click();
      (
        dom.window.document.querySelector(
          `.port.input[data-node-id="${newOutput.id}"]`,
        ) as HTMLButtonElement
      ).click();

      const connected = posted
        .filter((message) => message.type === "graphChanged")
        .at(-1)?.graph;
      expect(
        connected.edges.filter(
          (edge: Record<string, unknown>) => edge.source === "op-1",
        ),
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ target: "out-a" }),
          expect.objectContaining({ target: newOutput.id }),
        ]),
      );
      expect(
        connected.edges.filter(
          (edge: Record<string, unknown>) => edge.target === newOutput.id,
        ),
      ).toHaveLength(1);
    } finally {
      dom.window.close();
    }
  });

  test("creates graph operations from the palette and keeps the list step", () => {
    const { dom, posted } = openGraph(branchingGraph);
    try {
      const paletteOperation = dom.window.document.querySelector(
        '.op-item[data-op-name="Reverse"]',
      ) as HTMLElement;
      expect(paletteOperation).not.toBeNull();
      const drop = new dom.window.MouseEvent("drop", {
        bubbles: true,
        cancelable: true,
        clientX: 420,
        clientY: 200,
      });
      Object.defineProperty(drop, "dataTransfer", {
        value: {
          getData: (type: string) =>
            type === "application/x-tschef-operation" ? "Reverse" : "",
        },
      });
      dom.window.document.getElementById("graphScroll")?.dispatchEvent(drop);
      const change = posted
        .filter((message) => message.type === "graphChanged")
        .at(-1);
      expect(
        change?.graph.nodes.filter(
          (node: Record<string, unknown>) => node.type === "operation",
        ),
      ).toHaveLength(2);
      expect(change?.graph.nodes).toContainEqual(
        expect.objectContaining({ type: "operation", x: 320, y: 165 }),
      );
      expect(dom.window.document.querySelectorAll(".step-card")).toHaveLength(
        2,
      );
      expect(change?.graph.edges).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ source: "op-1", target: "out-a" }),
          expect.objectContaining({ source: "op-1", target: "out-b" }),
        ]),
      );
    } finally {
      dom.window.close();
    }
  });

  test("remaps legacy panel-step ids to graph-node ids without duplicating operations", () => {
    const { dom, posted } = openGraph(branchingGraph, [
      { id: "legacy-step-id", opName: "Reverse", args: [] },
    ]);
    try {
      expect(dom.window.document.querySelectorAll(".step-card")).toHaveLength(
        1,
      );
      expect(
        dom.window.document.querySelectorAll(
          '.graph-node[data-node-id="op-1"]',
        ),
      ).toHaveLength(1);
      (
        dom.window.document.getElementById("saveButton") as HTMLButtonElement
      ).click();
      const save = posted.filter((message) => message.type === "save").at(-1);
      expect(save?.steps).toEqual([
        expect.objectContaining({ id: "op-1", opName: "Reverse" }),
      ]);
      expect(
        save?.graph.nodes.filter(
          (node: Record<string, unknown>) => node.type === "operation",
        ),
      ).toHaveLength(1);
    } finally {
      dom.window.close();
    }
  });

  test("sends runGraph and switches between live graph output tabs", () => {
    const { dom, posted } = openGraph(branchingGraph);
    try {
      const input = dom.window.document.getElementById(
        "inputArea",
      ) as HTMLTextAreaElement;
      input.value = "sample";
      (
        dom.window.document.getElementById("runButton") as HTMLButtonElement
      ).click();
      const request = posted
        .filter((message) => message.type === "runGraph")
        .at(-1);
      expect(request).toMatchObject({
        explicit: true,
        activeOutputId: "out-a",
        inputSource: "manual",
        outputTarget: "preview",
        manualInput: "sample",
      });
      expect(request?.graph.edges).toHaveLength(3);

      dom.window.dispatchEvent(
        new dom.window.MessageEvent("message", {
          data: {
            type: "graphResult",
            requestId: request?.requestId,
            outputs: [
              {
                id: "out-a",
                name: "Text",
                preview: "first",
                totalLength: 5,
                truncated: false,
              },
              {
                id: "out-b",
                name: "Audit",
                preview: "second",
                totalLength: 6,
                truncated: false,
              },
            ],
          },
        }),
      );

      expect(dom.window.document.querySelectorAll(".output-tab")).toHaveLength(
        2,
      );
      expect(
        (
          dom.window.document.getElementById(
            "outputArea",
          ) as HTMLTextAreaElement
        ).value,
      ).toBe("first");
      (
        dom.window.document.querySelector(
          'button[data-output-id="out-b"]',
        ) as HTMLButtonElement
      ).click();
      expect(
        (
          dom.window.document.getElementById(
            "outputArea",
          ) as HTMLTextAreaElement
        ).value,
      ).toBe("second");
    } finally {
      dom.window.close();
    }
  });

  test("renders incremental per-node live status from graphNodeResult", () => {
    const { dom, posted } = openGraph(branchingGraph);
    try {
      (
        dom.window.document.getElementById("runButton") as HTMLButtonElement
      ).click();
      const request = posted
        .filter((message) => message.type === "runGraph")
        .at(-1);
      dom.window.dispatchEvent(
        new dom.window.MessageEvent("message", {
          data: {
            type: "graphNodeResult",
            requestId: request?.requestId,
            nodeId: "op-1",
            status: "running",
          },
        }),
      );
      const node = dom.window.document.querySelector(
        '[data-node-id="op-1"]',
      ) as HTMLElement;
      expect(node.classList.contains("running-node")).toBe(true);
      expect(node.textContent).toContain("Processing");

      dom.window.dispatchEvent(
        new dom.window.MessageEvent("message", {
          data: {
            type: "graphNodeResult",
            requestId: request?.requestId,
            nodeId: "op-1",
            status: "complete",
            preview: "elpmas",
            totalLength: 6,
          },
        }),
      );
      const completed = dom.window.document.querySelector(
        '[data-node-id="op-1"]',
      ) as HTMLElement;
      expect(completed.classList.contains("complete-node")).toBe(true);
      expect(completed.textContent).toContain("6 chars");
    } finally {
      dom.window.close();
    }
  });

  test("cancels an explicit run when another output is selected mid-flight", () => {
    const { dom, posted } = openGraph(branchingGraph);
    try {
      (
        dom.window.document.getElementById("runButton") as HTMLButtonElement
      ).click();
      const run = posted
        .filter((message) => message.type === "runGraph")
        .at(-1);
      expect(run?.activeOutputId).toBe("out-a");

      const viewButtons = Array.from(
        dom.window.document.querySelectorAll(
          'button[data-action="view-output"]',
        ),
      ) as HTMLButtonElement[];
      const outputB = viewButtons.find(
        (button) => button.dataset.stepId === "out-b",
      );
      outputB?.click();

      expect(posted.at(-1)).toMatchObject({ type: "invalidateRuns" });
      expect(
        posted.filter((message) => message.type === "runGraph"),
      ).toHaveLength(1);
    } finally {
      dom.window.close();
    }
  });

  test("keeps output selection locked until an explicit side effect finishes", () => {
    const { dom, posted } = openGraph(branchingGraph);
    try {
      const outputTarget = dom.window.document.getElementById(
        "outputTarget",
      ) as HTMLSelectElement;
      outputTarget.value = "clipboard";
      outputTarget.dispatchEvent(
        new dom.window.Event("change", { bubbles: true }),
      );
      (
        dom.window.document.getElementById("runButton") as HTMLButtonElement
      ).click();
      const run = posted
        .filter((message) => message.type === "runGraph")
        .at(-1);
      expect(run?.outputTarget).toBe("clipboard");
      dom.window.dispatchEvent(
        new dom.window.MessageEvent("message", {
          data: {
            type: "graphResult",
            requestId: run?.requestId,
            outputApplied: false,
            outputs: [
              { id: "out-a", name: "Text", preview: "a", totalLength: 1 },
              { id: "out-b", name: "Audit", preview: "b", totalLength: 1 },
            ],
          },
        }),
      );

      const invalidationsBefore = posted.filter(
        (message) => message.type === "invalidateRuns",
      ).length;
      (
        dom.window.document.querySelector(
          'button[data-output-id="out-b"]',
        ) as HTMLButtonElement
      ).click();
      expect(
        posted.filter((message) => message.type === "invalidateRuns"),
      ).toHaveLength(invalidationsBefore + 1);
    } finally {
      dom.window.close();
    }
  });

  test("selects and deletes edges without inline handlers", () => {
    const { dom, posted } = openGraph(branchingGraph);
    try {
      const edge = dom.window.document.querySelector(
        '[data-edge-id="e3"]',
      ) as SVGElement;
      edge.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
      dom.window.dispatchEvent(
        new dom.window.KeyboardEvent("keydown", {
          bubbles: true,
          key: "Delete",
        }),
      );
      const change = posted
        .filter((message) => message.type === "graphChanged")
        .at(-1);
      expect(change?.graph.edges).not.toContainEqual(
        expect.objectContaining({ id: "e3" }),
      );
    } finally {
      dom.window.close();
    }
  });
});
