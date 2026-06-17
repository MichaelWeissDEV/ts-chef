import { InlineResultController } from "../src/commands/inlineResult";
import {
  __reset,
  __invokeCommand,
  clipboardWrite,
  statusBarMessage,
  showWarningMessage,
  Position,
  Selection,
  CodeLens,
} from "./vscode-mock";

type Editor = Parameters<InlineResultController["show"]>[0];
type Context = Parameters<InlineResultController["register"]>[0];
type Document = Parameters<InlineResultController["provideCodeLenses"]>[0];

type ReplaceCall = { range: unknown; text: string };

function makeEditor(
  uri: string,
  opts: { isClosed?: boolean; failEdit?: boolean } = {},
): { editor: Editor; replaceCalls: ReplaceCall[] } {
  const replaceCalls: ReplaceCall[] = [];
  const fake = {
    document: {
      uri: { toString: () => uri },
      isClosed: opts.isClosed ?? false,
      getText: () => "",
      positionAt: (offset: number) => new Position(0, offset),
    },
    // non-empty selection → replaceTarget returns the selection itself
    selection: new Selection(new Position(2, 0), new Position(2, 5)),
    edit: async (
      cb: (eb: { replace: (r: unknown, t: string) => void }) => void,
    ) => {
      if (opts.failEdit) throw new Error("editor gone");
      cb({ replace: (range, t) => replaceCalls.push({ range, text: t }) });
      return true;
    },
  };
  return { editor: fake as unknown as Editor, replaceCalls };
}

function makeContext(): Context {
  return { subscriptions: [] } as unknown as Context;
}

function makeDocument(uri: string): Document {
  return { uri: { toString: () => uri } } as unknown as Document;
}

function titleOf(lens: CodeLens): string {
  return (lens.command as { title: string }).title;
}

beforeEach(() => __reset());

describe("InlineResultController", () => {
  test("show() emits a 4-lens row (preview + replace/copy/close) for its document", () => {
    const ctl = new InlineResultController();
    const { editor } = makeEditor("file:///a.txt");
    ctl.show(editor, "HELLO");

    const lenses = ctl.provideCodeLenses(makeDocument("file:///a.txt"));
    expect(lenses).toHaveLength(4);
    expect(titleOf(lenses[0])).toContain("HELLO");
    expect(lenses.slice(1).map(titleOf)).toEqual([
      "$(replace) Replace",
      "$(copy) Copy",
      "$(close) Close",
    ]);
  });

  test("lenses for one document are not shown in another", () => {
    const ctl = new InlineResultController();
    ctl.show(makeEditor("file:///a.txt").editor, "X");
    expect(ctl.provideCodeLenses(makeDocument("file:///b.txt"))).toHaveLength(
      0,
    );
  });

  test("long results are truncated with an ellipsis in the preview", () => {
    const ctl = new InlineResultController();
    ctl.show(makeEditor("file:///a.txt").editor, "z".repeat(200));
    const [first] = ctl.provideCodeLenses(makeDocument("file:///a.txt"));
    expect(titleOf(first)).toContain("…");
  });

  test("replace action replaces the row's own editor and removes the row", async () => {
    const ctl = new InlineResultController();
    ctl.register(makeContext());
    const { editor, replaceCalls } = makeEditor("file:///a.txt");
    ctl.show(editor, "NEW");

    await __invokeCommand("tschef.applyInlineResult", "replace", 0);
    expect(replaceCalls).toEqual([expect.objectContaining({ text: "NEW" })]);
    expect(ctl.provideCodeLenses(makeDocument("file:///a.txt"))).toHaveLength(
      0,
    );
  });

  test("replace on a closed editor warns and keeps the row", async () => {
    const ctl = new InlineResultController();
    ctl.register(makeContext());
    const { editor, replaceCalls } = makeEditor("file:///a.txt", {
      isClosed: true,
    });
    ctl.show(editor, "NEW");

    await __invokeCommand("tschef.applyInlineResult", "replace", 0);
    expect(replaceCalls).toHaveLength(0);
    expect(showWarningMessage).toHaveBeenCalled();
    expect(ctl.provideCodeLenses(makeDocument("file:///a.txt"))).toHaveLength(
      4,
    );
  });

  test("copy action writes the clipboard and keeps the row open", async () => {
    const ctl = new InlineResultController();
    ctl.register(makeContext());
    ctl.show(makeEditor("file:///a.txt").editor, "COPYME");

    await __invokeCommand("tschef.applyInlineResult", "copy", 0);
    expect(clipboardWrite).toHaveBeenCalledWith("COPYME");
    expect(statusBarMessage).toHaveBeenCalled();
    expect(ctl.provideCodeLenses(makeDocument("file:///a.txt"))).toHaveLength(
      4,
    );
  });

  test("close action removes the row without touching clipboard or editor", async () => {
    const ctl = new InlineResultController();
    ctl.register(makeContext());
    ctl.show(makeEditor("file:///a.txt").editor, "BYE");

    await __invokeCommand("tschef.applyInlineResult", "close", 0);
    expect(ctl.provideCodeLenses(makeDocument("file:///a.txt"))).toHaveLength(
      0,
    );
    expect(clipboardWrite).not.toHaveBeenCalled();
  });

  test("multiple results stack independently", () => {
    const ctl = new InlineResultController();
    ctl.register(makeContext());
    ctl.show(makeEditor("file:///a.txt").editor, "first");
    ctl.show(makeEditor("file:///a.txt").editor, "second");
    expect(ctl.provideCodeLenses(makeDocument("file:///a.txt"))).toHaveLength(
      8,
    );
  });

  test("a failing edit warns rather than throwing", async () => {
    const ctl = new InlineResultController();
    ctl.register(makeContext());
    ctl.show(makeEditor("file:///a.txt", { failEdit: true }).editor, "NEW");

    await __invokeCommand("tschef.applyInlineResult", "replace", 0);
    expect(showWarningMessage).toHaveBeenCalled();
    expect(ctl.provideCodeLenses(makeDocument("file:///a.txt"))).toHaveLength(
      4,
    );
  });

  test("applying an unknown id is a no-op", async () => {
    const ctl = new InlineResultController();
    ctl.register(makeContext());
    await __invokeCommand("tschef.applyInlineResult", "replace", 999);
    expect(showWarningMessage).not.toHaveBeenCalled();
  });
});
