/**
 * @fileoverview webviewResult.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { WebviewResultController } from "../src/commands/webviewResult";
import {
  __reset,
  __getWebviewPanel,
  clipboardWrite,
  statusBarMessage,
  showWarningMessage,
  Position,
  Selection,
} from "./vscode-mock";

type Editor = Parameters<WebviewResultController["show"]>[0];

type ReplaceCall = { range: unknown; text: string };

function makeEditor(opts: { isClosed?: boolean; failEdit?: boolean } = {}): {
  editor: Editor;
  replaceCalls: ReplaceCall[];
} {
  const replaceCalls: ReplaceCall[] = [];
  const fake = {
    document: {
      uri: { toString: () => "file:///webview-result.txt" },
      version: 1,
      isClosed: opts.isClosed ?? false,
      getText: () => "",
      positionAt: (offset: number) => new Position(0, offset),
    },
    selection: new Selection(new Position(1, 0), new Position(1, 4)),
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

beforeEach(() => __reset());

describe("WebviewResultController", () => {
  test("show() creates a panel whose HTML contains the (escaped) result", () => {
    const ctl = new WebviewResultController();
    ctl.show(makeEditor().editor, "a < b & c");
    const panel = __getWebviewPanel();
    expect(panel).toBeDefined();
    expect(panel?.webview.html).toContain("a &lt; b &amp; c");
    expect(panel?.reveal).toHaveBeenCalled();
  });

  test("a second show() reuses the same panel and refreshes its HTML", () => {
    const ctl = new WebviewResultController();
    ctl.show(makeEditor().editor, "first");
    const firstPanel = __getWebviewPanel();
    ctl.show(makeEditor().editor, "second");
    const secondPanel = __getWebviewPanel();
    expect(secondPanel).toBe(firstPanel);
    expect(secondPanel?.webview.html).toContain("second");
  });

  test("replace message replaces the source editor's target range", async () => {
    const ctl = new WebviewResultController();
    const { editor, replaceCalls } = makeEditor();
    ctl.show(editor, "NEW");
    __getWebviewPanel()?.__fireMessage({ type: "replace" });
    await Promise.resolve();
    expect(replaceCalls).toEqual([expect.objectContaining({ text: "NEW" })]);
  });

  test("replace on a closed editor warns and does not edit", async () => {
    const ctl = new WebviewResultController();
    const { editor, replaceCalls } = makeEditor({ isClosed: true });
    ctl.show(editor, "NEW");
    __getWebviewPanel()?.__fireMessage({ type: "replace" });
    await Promise.resolve();
    expect(replaceCalls).toHaveLength(0);
    expect(showWarningMessage).toHaveBeenCalled();
  });

  test("a failing edit warns rather than throwing", async () => {
    const ctl = new WebviewResultController();
    ctl.show(makeEditor({ failEdit: true }).editor, "NEW");
    __getWebviewPanel()?.__fireMessage({ type: "replace" });
    await Promise.resolve();
    expect(showWarningMessage).toHaveBeenCalled();
  });

  test("copy message writes the clipboard", async () => {
    const ctl = new WebviewResultController();
    ctl.show(makeEditor().editor, "COPYME");
    __getWebviewPanel()?.__fireMessage({ type: "copy" });
    await Promise.resolve();
    expect(clipboardWrite).toHaveBeenCalledWith("COPYME");
    expect(statusBarMessage).toHaveBeenCalled();
  });

  test("close message disposes the panel; the next show() creates a fresh one", async () => {
    const ctl = new WebviewResultController();
    ctl.show(makeEditor().editor, "x");
    const first = __getWebviewPanel();
    first?.__fireMessage({ type: "close" });
    expect(first?.disposed).toBe(true);

    ctl.show(makeEditor().editor, "y");
    expect(__getWebviewPanel()).not.toBe(first);
  });
});
