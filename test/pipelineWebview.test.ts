import { JSDOM } from "jsdom";
import { buildPipelineWebviewHtml } from "../src/panels/pipelineWebview";

describe("pipeline graph webview", () => {
  const html = buildPipelineWebviewHtml("vscode-webview:", "fixed-nonce");

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
            setState: (state: Record<string, unknown>) => savedStates.push(state),
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
    expect(html).toContain("invalidateParseRequests();\n    pipelineTextReady = false");
    expect(html).toContain("const requestId = latestParseRequest");
    expect(html).toContain("const raw = pipeText.value");
    expect(html).toContain(
      "requestParse(requestId, raw, previousSteps)",
    );
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
      const firstRequest = posted.filter(
        (message) => message.type === "parseRaw",
      ).at(-1);
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
      const secondRequest = posted.filter(
        (message) => message.type === "parseRaw",
      ).at(-1);
      expect(secondRequest?.requestId).not.toBe(firstRequest?.requestId);
      expect(secondRequest?.raw).toBe("To Hex");
    } finally {
      dom.window.close();
      jest.useRealTimers();
    }
  });
});
