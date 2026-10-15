import * as vscode from "vscode";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { resolveArguments } from "../../src/panels/quickWorkbench/arguments";
import type { QuickWorkbenchPanel } from "../../src/panels/quickWorkbench/QuickWorkbenchPanel";

export async function run(): Promise<void> {
  const timings: Record<string, number> = {};
  if (process.env.TSCHEF_INTEGRATION_REPORT) writeFileSync(process.env.TSCHEF_INTEGRATION_REPORT, JSON.stringify({ status: "started", phase: "activation" }));
  const start = performance.now();
  const extension = vscode.extensions.getExtension<{ getQuickWorkbenchPanel(): QuickWorkbenchPanel }>("michaelweiss.vscode-ts-chef");
  assert.ok(extension);
  assert.equal(extension.packageJSON.version, process.env.TSCHEF_EXPECTED_VERSION);
  assert.equal(vscode.extensions.all.filter(item => item.id === extension.id).length, 1);
  const api = await extension.activate();
  timings.activationMs = performance.now() - start;
  const openStart = performance.now();
  await vscode.commands.executeCommand("tschef.openQuickWorkbench");
  timings.openMs = performance.now() - openStart;
  const panel = api.getQuickWorkbenchPanel();
  assert.ok(panel);
  const result = () => panel["resultState"];
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
    assert.equal(result()?.preview, "Hello"); checks++;
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
    assert.equal(result()?.text, "bcd"); checks++;
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
    assert.equal(result()?.text, "Hello"); checks++;
    // Exercise the production snapshot rejection against a real editor/version.
    const reopenedEditor = await vscode.window.showTextDocument(document, vscode.ViewColumn.One);
    reopenedEditor.selection = new vscode.Selection(0, 7, 0, 12);
    await send({ type: "loadSelection" });
    await send({ type: "applyOperation", opName: "ToUpperCase", args: {}, requestId: 100, mode: "manual" });
    await reopenedEditor.edit(edit => edit.insert(new vscode.Position(0, 0), "changed "));
    await send({ type: "replaceSelection" });
    assert.equal(document.getText(), "changed prefix Hello suffix"); checks++;
    const commands = new Set(await vscode.commands.getCommands(true));
    for (const command of (extension.packageJSON as { contributes: { commands: { command: string }[] } }).contributes.commands) assert.ok(commands.has(command.command), command.command);
    checks++;
    await send({ type: "inputChanged", text: "SGVsbG8=" });
    await send({ type: "applyOperation", opName: "FromBase64", args: {}, requestId: 101, mode: "manual" });
    assert.equal(result()?.binary, true);
    await send({ type: "setOutputFormat", format: "hex" });
    await send({ type: "copyResult" });
    assert.equal(await vscode.env.clipboard.readText(), "48656c6c6f");
    await send({ type: "setOutputFormat", format: "utf8" }); checks++;
    await send({ type: "addToFavorites", opName: "FromBase64" });
    for (let i = 0; i < 10; i++) {
      panel.dispose(); await vscode.commands.executeCommand("tschef.openQuickWorkbench");
      assert.ok(panel["state"].favorites.includes("FromBase64"));
    }
    checks++;
    const run = async (name: string, input: string | Uint8Array | Buffer | ArrayBuffer, args: Record<string, unknown> = {}) =>
      (await panel["deps"].runOperation(name, input, resolveArguments(panel["deps"].argDefsFor(name), args))).result;
    const text = "external runtime 🌍";
    for (const [compress, decompress] of [["Bzip2Compress", "Bzip2Decompress"], ["LZMACompress", "LZMADecompress"]]) {
      const compressed = await run(compress, text);
      const restored = await run(decompress, compressed);
      const restoredText = typeof restored === "string" ? restored : Buffer.from(restored instanceof ArrayBuffer ? new Uint8Array(restored) : restored).toString("utf8");
      assert.equal(restoredText, text); checks++;
    }
    assert.equal(await run("Jq", '{"a":42}', { Query: ".a" }), "42"); checks++;
    assert.match(String(await run("MD6", "abc")), /^[a-f0-9]{64}$/i); checks++;
    assert.match(String(await run("DisassembleX86", "90")), /nop/i); checks++;
    for (const mode of ["CBC", "CFB", "OFB", "CTR", "ECB"]) {
      const key = { string: "0123456789abcdeffedcba98765432100011223344556677", option: "Hex" };
      const iv = { string: "0011223344556677", option: "Hex" };
      const args = { Key: key, IV: iv, Mode: mode, Input: "Raw", Output: "Raw" };
      const encrypted = await run("TripleDESEncrypt", text, args);
      const decrypted = await run("TripleDESDecrypt", encrypted, args);
      assert.equal(typeof decrypted === "string" ? decrypted : Buffer.from(decrypted instanceof ArrayBuffer ? new Uint8Array(decrypted) : decrypted).toString("utf8"), text); checks++;
    }
    if (process.env.TSCHEF_UPGRADE_STORAGE) {
      const files = JSON.parse(readFileSync(process.env.TSCHEF_UPGRADE_STORAGE, "utf8")) as Record<string, string>;
      for (const [file, content] of Object.entries(files)) assert.equal(readFileSync(file, "utf8"), content);
      assert.equal(vscode.workspace.getConfiguration("tschef").get("pipelineResultAction"), "copy");
      const upgraded = await vscode.workspace.openTextDocument({ content: "{{upgrade-input}}" });
      const upgradedEditor = await vscode.window.showTextDocument(upgraded, vscode.ViewColumn.One);
      upgradedEditor.selection = new vscode.Selection(0, 0, 0, upgraded.getText().length);
      await vscode.commands.executeCommand("tschef.runSavedPipeline", "upgrade-probe");
      assert.equal(await vscode.env.clipboard.readText(), "Hello"); checks++;
    }
    timings.heapUsed = process.memoryUsage().heapUsed;
    writeFileSync(process.env.TSCHEF_INTEGRATION_REPORT || "/tmp/ts-chef-integration.json", JSON.stringify({ checks, timings, vscode: vscode.version, node: process.version, mode: process.env.TSCHEF_TEST_VSIX ? "installed-vsix" : "development", version: extension.packageJSON.version }, null, 2));
  } finally {
    await vscode.env.clipboard.writeText(originalClipboard);
    panel.dispose();
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");
  }
}
