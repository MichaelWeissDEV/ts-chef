import * as vscode from "vscode";
import assert from "node:assert/strict";

export async function run(): Promise<void> {
  const extension = vscode.extensions.getExtension("michaelweiss.vscode-ts-chef");
  assert.ok(extension);
  assert.equal(extension.packageJSON.version, "0.8.1");
  await extension.activate();
  const doc = await vscode.workspace.openTextDocument({ content: "{{upgrade-input}}" });
  const editor = await vscode.window.showTextDocument(doc);
  editor.selection = new vscode.Selection(0, 0, 0, doc.getText().length);
  const original = await vscode.env.clipboard.readText();
  try {
    await vscode.commands.executeCommand("tschef.runSavedPipeline", "upgrade-probe");
    assert.equal(await vscode.env.clipboard.readText(), "Hello");
  } finally {
    await vscode.env.clipboard.writeText(original);
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");
  }
}
