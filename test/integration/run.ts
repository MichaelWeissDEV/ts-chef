import * as vscode from "vscode";
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import type { QuickWorkbenchPanel } from "../../src/panels/quickWorkbench/QuickWorkbenchPanel";

export async function run(): Promise<void> {
  const timings: Record<string, number> = {};
  const start = performance.now();
  const extension = vscode.extensions.getExtension<{ getQuickWorkbenchPanel(): QuickWorkbenchPanel }>("michaelweiss.vscode-ts-chef");
  assert.ok(extension);
  const api = await extension.activate();
  timings.activationMs = performance.now() - start;
  const openStart = performance.now();
  await vscode.commands.executeCommand("tschef.openQuickWorkbench");
  timings.openMs = performance.now() - openStart;
  const panel = api.getQuickWorkbenchPanel();
  assert.ok(panel);
  const send = (message: unknown) => panel["handleMessage"](message);
  const originalClipboard = await vscode.env.clipboard.readText();
  let checks = 0;
  try {
    assert.equal(extension.isActive, true); checks++;
    assert.ok(panel["panel"]?.webview.html.includes("Run Operation")); checks++;
    const document = await vscode.workspace.openTextDocument({ content: "prefix SGVsbG8= suffix" });
    const editor = await vscode.window.showTextDocument(document, vscode.ViewColumn.One);
    editor.selection = new vscode.Selection(0, 7, 0, 15);
    await send({ type: "loadSelection" });
    assert.equal(panel["inputContext"]?.text, "SGVsbG8="); checks++;
    const transformStart = performance.now();
    await send({ type: "applyOperation", opName: "FromBase64", args: {}, requestId: 90, mode: "manual" });
    timings.firstTransformMs = performance.now() - transformStart;
    assert.equal(panel["resultState"]?.preview, "Hello"); checks++;
    await send({ type: "copyResult" });
    assert.equal(await vscode.env.clipboard.readText(), "Hello"); checks++;
    editor.selection = new vscode.Selection(0, 0, 0, 6);
    await send({ type: "replaceSelection" });
    assert.equal(document.getText(), "prefix Hello suffix");
    assert.equal(panel["inputContext"]?.snapshot, undefined); checks++;
    await send({ type: "inputChanged", text: "a".repeat(100010) });
    await send({ type: "applyOperation", opName: "ToUpperCase", args: {}, requestId: 91, mode: "manual" });
    await send({ type: "newDocument" });
    assert.equal(vscode.window.activeTextEditor?.document.getText(), "A".repeat(100010)); checks++;
    await send({ type: "inputChanged", text: "abc" });
    await send({ type: "applyOperation", opName: "ROT13", args: { "Amount": 1 }, requestId: 92, mode: "manual" });
    assert.equal(panel["resultState"]?.text, "bcd"); checks++;
    await send({ type: "applyOperation", opName: "Unknown", args: {}, requestId: -1 });
    assert.equal(panel["resultState"], null); checks++;
    const pending = send({ type: "applyOperation", opName: "ROT13", args: {}, requestId: 93, mode: "manual" });
    await send({ type: "inputChanged", text: "new input" });
    await pending;
    assert.equal(panel["resultState"], null); checks++;
    panel.dispose();
    await vscode.commands.executeCommand("tschef.openQuickWorkbench");
    await send({ type: "inputChanged", text: "SGVsbG8=" });
    const repeatStart = performance.now();
    for (let i = 0; i < 20; i++) await send({ type: "applyOperation", opName: "FromBase64", args: {}, requestId: i, mode: "manual" });
    timings.repeatedMeanMs = (performance.now() - repeatStart) / 20;
    assert.equal(panel["resultState"]?.text, "Hello"); checks++;
    // Exercise the production snapshot rejection against a real editor/version.
    const reopenedEditor = await vscode.window.showTextDocument(document, vscode.ViewColumn.One);
    reopenedEditor.selection = new vscode.Selection(0, 7, 0, 12);
    await send({ type: "loadSelection" });
    await send({ type: "applyOperation", opName: "ToUpperCase", args: {}, requestId: 100, mode: "manual" });
    await reopenedEditor.edit(edit => edit.insert(new vscode.Position(0, 0), "changed "));
    await send({ type: "replaceSelection" });
    assert.equal(document.getText(), "changed prefix Hello suffix"); checks++;
    timings.heapUsed = process.memoryUsage().heapUsed;
    writeFileSync(process.env.TSCHEF_INTEGRATION_REPORT || "/tmp/ts-chef-integration.json", JSON.stringify({ checks, timings, version: extension.packageJSON.version }, null, 2));
  } finally {
    await vscode.env.clipboard.writeText(originalClipboard);
    panel.dispose();
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");
  }
}
