import * as vscode from "vscode";
import { captureTextEditSnapshot, replaceTextEditSnapshot } from "../src/commands/textEditSnapshot";

function fixture() {
  let text = "source";
  const range = new vscode.Range(0, 2, 0, 8);
  const document = { isClosed: false, version: 1, uri: { toString: () => "file:///original" }, getText: jest.fn(() => text) };
  const replace = jest.fn();
  const edit = jest.fn(async (callback: (builder: { replace: typeof replace }) => void) => { callback({ replace }); document.version++; return true; });
  const editor = { document, edit } as unknown as vscode.TextEditor;
  return { document, range, replace, edit, snapshot: captureTextEditSnapshot(editor, range), changeText: () => { text = "different"; } };
}
test("uses captured URI/range/text and rejects a second replacement", async () => {
  const f = fixture();
  expect(await replaceTextEditSnapshot(f.snapshot, "result")).toBe(true);
  expect(f.replace).toHaveBeenCalledWith(f.range, "result");
  expect(await replaceTextEditSnapshot(f.snapshot, "again")).toBe(false);
  expect(f.edit).toHaveBeenCalledTimes(1);
});
test.each(["closed", "version", "text", "uri"])("rejects stale %s snapshots", async reason => {
  const f = fixture();
  if (reason === "closed") f.document.isClosed = true;
  if (reason === "version") f.document.version++;
  if (reason === "text") f.changeText();
  if (reason === "uri") f.document.uri.toString = () => "file:///other";
  expect(await replaceTextEditSnapshot(f.snapshot, "result")).toBe(false);
  expect(f.edit).not.toHaveBeenCalled();
});
test("handles rejected or disposed editor edits", async () => {
  const f = fixture();
  f.edit.mockResolvedValueOnce(false);
  expect(await replaceTextEditSnapshot(f.snapshot, "result")).toBe(false);
  f.edit.mockRejectedValueOnce(new Error("closed editor"));
  expect(await replaceTextEditSnapshot(f.snapshot, "result")).toBe(false);
});
