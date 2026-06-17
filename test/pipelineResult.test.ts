import {
  presentPipelineResult,
  replaceTarget,
} from "../src/commands/pipelineResult";
import {
  __reset,
  __setConfig,
  __setInfoResponse,
  clipboardWrite,
  statusBarMessage,
  showInformationMessage,
  Position,
  Selection,
} from "./vscode-mock";

type Editor = Parameters<typeof presentPipelineResult>[0];

type ReplaceCall = { range: unknown; text: string };

function makeEditor(
  text: string,
  opts: { emptySelection?: boolean } = {},
): { editor: Editor; replaceCalls: ReplaceCall[] } {
  const replaceCalls: ReplaceCall[] = [];
  const selection = opts.emptySelection
    ? new Selection(new Position(1, 0), new Position(1, 0)) // isEmpty === true
    : new Selection(new Position(0, 0), new Position(0, 3)); // isEmpty === false
  const fake = {
    document: {
      getText: () => text,
      positionAt: (offset: number) => new Position(0, offset),
    },
    selection,
    edit: async (
      cb: (eb: { replace: (r: unknown, t: string) => void }) => void,
    ) => {
      cb({ replace: (range, t) => replaceCalls.push({ range, text: t }) });
      return true;
    },
  };
  return { editor: fake as unknown as Editor, replaceCalls };
}

beforeEach(() => __reset());

describe("replaceTarget", () => {
  test("empty selection → whole document range", () => {
    const { editor } = makeEditor("hello world", { emptySelection: true });
    const target = replaceTarget(editor) as unknown as Selection;
    expect((target.anchor as Position).character).toBe(0);
    expect((target.active as Position).character).toBe("hello world".length);
  });

  test("non-empty selection → the selection itself", () => {
    const { editor } = makeEditor("hello", { emptySelection: false });
    expect(replaceTarget(editor)).toBe(editor.selection);
  });
});

describe("presentPipelineResult", () => {
  test("copy mode: writes clipboard, no replace, no popup", async () => {
    __setConfig("pipelineResultAction", "copy");
    const { editor, replaceCalls } = makeEditor("");
    await presentPipelineResult(editor, "RESULT", "Result");
    expect(clipboardWrite).toHaveBeenCalledWith("RESULT");
    expect(replaceCalls).toHaveLength(0);
    expect(showInformationMessage).not.toHaveBeenCalled();
    expect(statusBarMessage).toHaveBeenCalled();
  });

  test("replace mode: replaces whole document, no popup", async () => {
    __setConfig("pipelineResultAction", "replace");
    const { editor, replaceCalls } = makeEditor("old text", {
      emptySelection: true,
    });
    await presentPipelineResult(editor, "NEW", "Result");
    expect(replaceCalls).toEqual([expect.objectContaining({ text: "NEW" })]);
    expect(showInformationMessage).not.toHaveBeenCalled();
    expect(clipboardWrite).not.toHaveBeenCalled();
  });

  test("popup mode (default): Replace button replaces", async () => {
    __setInfoResponse("Replace");
    const { editor, replaceCalls } = makeEditor("x", { emptySelection: true });
    await presentPipelineResult(editor, "NEW", "Result");
    expect(showInformationMessage).toHaveBeenCalled();
    expect(replaceCalls).toEqual([expect.objectContaining({ text: "NEW" })]);
  });

  test("popup mode: Copy button copies", async () => {
    __setInfoResponse("Copy");
    const { editor, replaceCalls } = makeEditor("x");
    await presentPipelineResult(editor, "NEW", "Result");
    expect(clipboardWrite).toHaveBeenCalledWith("NEW");
    expect(replaceCalls).toHaveLength(0);
  });

  test("popup mode: dismissed → no action", async () => {
    __setInfoResponse(undefined);
    const { editor, replaceCalls } = makeEditor("x");
    await presentPipelineResult(editor, "NEW", "Result");
    expect(replaceCalls).toHaveLength(0);
    expect(clipboardWrite).not.toHaveBeenCalled();
  });

  test("inline mode without renderer → falls back to popup", async () => {
    __setConfig("pipelineResultAction", "inline");
    __setInfoResponse(undefined);
    const { editor } = makeEditor("x");
    await presentPipelineResult(editor, "NEW", "Result");
    expect(showInformationMessage).toHaveBeenCalled();
  });

  test("inline mode with renderer → renderer used, no popup", async () => {
    __setConfig("pipelineResultAction", "inline");
    const renderer = jest.fn();
    const { editor } = makeEditor("x");
    await presentPipelineResult(editor, "NEW", "Result", { inline: renderer });
    expect(renderer).toHaveBeenCalledWith(editor, "NEW");
    expect(showInformationMessage).not.toHaveBeenCalled();
  });
});
