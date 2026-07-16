import { Position, Selection } from "./vscode-mock";
import {
  assertPipelineInputSize,
  assertPipelineOutputSize,
  deliverPipelineOutput,
  pipelinePreview,
  readPipelineInput,
  type PipelineIODeps,
} from "../src/panels/pipelineIO";

function makeHarness(options: { emptySelection?: boolean } = {}) {
  const writes: string[] = [];
  const replacements: Array<{ range: unknown; text: string }> = [];
  const opened: string[] = [];
  const selection = options.emptySelection
    ? new Selection(new Position(0, 0), new Position(0, 0))
    : new Selection(new Position(0, 0), new Position(0, 4));
  const editor = {
    selection,
    document: {
      version: 3,
      isClosed: false,
      getText: (range?: unknown) => (range ? "part" : "whole document"),
      positionAt: (offset: number) => new Position(0, offset),
    },
    edit: async (
      callback: (builder: {
        replace: (_range: unknown, text: string) => void;
      }) => void,
    ) => {
      callback({
        replace: (range, text) => replacements.push({ range, text }),
      });
      return true;
    },
  };
  const deps: PipelineIODeps = {
    activeEditor: () => editor as never,
    readClipboard: async () => "clipboard value",
    writeClipboard: async (text) => {
      writes.push(text);
    },
    openTextDocument: async (content) => {
      opened.push(content);
      return { content } as never;
    },
    showTextDocument: async () => undefined,
  };
  return { editor, deps, writes, replacements, opened };
}

describe("pipeline IO", () => {
  test("selection input falls back to the whole document when empty", async () => {
    const { deps } = makeHarness({ emptySelection: true });
    const snapshot = await readPipelineInput("selection", "", deps);
    expect(snapshot.text).toBe("whole document");
  });

  test("selection and clipboard are read through their host adapters", async () => {
    const { deps } = makeHarness();
    await expect(
      readPipelineInput("selection", "", deps),
    ).resolves.toMatchObject({
      text: "part",
    });
    await expect(
      readPipelineInput("clipboard", "", deps),
    ).resolves.toMatchObject({
      text: "clipboard value",
    });
  });

  test("always-available result can be delivered to clipboard or new editor", async () => {
    const { deps, writes, opened } = makeHarness();
    const snapshot = await readPipelineInput("manual", "input", deps);
    await deliverPipelineOutput("clipboard", "result", snapshot, deps);
    await deliverPipelineOutput(
      "newDocument",
      "document result",
      snapshot,
      deps,
    );
    expect(writes).toEqual(["result"]);
    expect(opened).toEqual(["document result"]);
  });

  test("replace refuses to overwrite a document changed during execution", async () => {
    const { deps, editor, replacements } = makeHarness();
    const snapshot = await readPipelineInput("manual", "input", deps);
    editor.document.version = 4;
    await expect(
      deliverPipelineOutput("replaceSelection", "result", snapshot, deps),
    ).rejects.toThrow("changed while the pipeline was running");
    expect(replacements).toEqual([]);
  });

  test("replace writes to the captured selection when the version is stable", async () => {
    const { deps, replacements } = makeHarness();
    const snapshot = await readPipelineInput("manual", "input", deps);
    await deliverPipelineOutput("replaceSelection", "result", snapshot, deps);
    expect(replacements).toEqual([expect.objectContaining({ text: "result" })]);
  });

  test("document input captures the whole document as its replace target", async () => {
    const { deps, replacements } = makeHarness();
    const snapshot = await readPipelineInput("document", "", deps);
    await deliverPipelineOutput("replaceSelection", "result", snapshot, deps);
    const range = replacements[0].range as Selection;
    expect((range.anchor as Position).character).toBe(0);
    expect((range.active as Position).character).toBe("whole document".length);
  });

  test("uses a retained editor when the webview currently owns focus", async () => {
    const { deps, editor } = makeHarness();
    const noActive = { ...deps, activeEditor: () => undefined };
    const snapshot = await readPipelineInput(
      "document",
      "",
      noActive,
      editor as never,
    );
    expect(snapshot.text).toBe("whole document");
  });

  test("rejects oversized input before invoking the runner", () => {
    expect(() => assertPipelineInputSize("12345", 4)).toThrow(
      "Input is too large",
    );
  });

  test("caps webview previews and rejects oversized output delivery", () => {
    expect(pipelinePreview("12345", 4)).toEqual({
      value: expect.stringContaining("1234"),
      truncated: true,
      totalLength: 5,
    });
    expect(() => assertPipelineOutputSize("12345", 4)).toThrow(
      "Output is too large",
    );
  });
});
