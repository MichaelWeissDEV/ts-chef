import * as vscode from "vscode";

/** Minimal metadata the operations pane needs per operation. */
export interface OpInfo {
  opName: string;
  displayName: string;
  module: string;
}

export interface OperationsViewDeps {
  /** All operations to list, grouped by module in the pane. */
  listOps: () => OpInfo[];
  /** Apply an operation to the current selection (click on an op). */
  apply: (opName: string) => void;
  /** Add an operation to the working recipe (＋ button). */
  addToRecipe: (opName: string) => void;
}

type IncomingMessage =
  | { type: "getOps" }
  | { type: "apply"; opName: string }
  | { type: "addToRecipe"; opName: string };

/**
 * The Operations sidebar: a grouped, filter-as-you-type list of every
 * operation. Clicking an op applies it to the editor selection; the ＋ button
 * adds it to the working recipe.
 *
 * Built as a WebviewView (not a TreeView) because a tree cannot host an inline
 * live-filter `<input>`. Message handling is injected via {@link OperationsViewDeps}
 * so it is unit-testable without a real webview.
 */
export class OperationsViewProvider implements vscode.WebviewViewProvider {
  static readonly viewType = "tschef.operationsView";
  private view: vscode.WebviewView | undefined;

  constructor(private readonly deps: OperationsViewDeps) {}

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    view.webview.options = { enableScripts: true };
    view.webview.html = this.buildHtml();
    view.webview.onDidReceiveMessage((msg: IncomingMessage) =>
      this.handleMessage(msg),
    );
  }

  /** Handle a message from the webview. Exposed for unit testing. */
  handleMessage(msg: IncomingMessage): void {
    switch (msg.type) {
      case "getOps":
        this.view?.webview.postMessage({
          type: "opsList",
          ops: this.deps.listOps(),
        });
        break;
      case "apply":
        this.deps.apply(msg.opName);
        break;
      case "addToRecipe":
        this.deps.addToRecipe(msg.opName);
        break;
    }
  }

  private buildHtml(): string {
    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); color: var(--vscode-foreground); display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  #search { margin: 5px; padding: 3px 6px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border,#555); }
  .list { flex: 1; overflow-y: auto; }
  .group-hdr { padding: 3px 8px; font-size: 10px; opacity: 0.55; text-transform: uppercase; letter-spacing: 0.5px; }
  .op-row { display: flex; align-items: center; gap: 4px; padding: 2px 8px; }
  .op-row:hover { background: var(--vscode-list-hoverBackground); }
  .op-name { flex: 1; cursor: pointer; font-size: 12px; }
  .op-add { cursor: pointer; border: none; background: none; color: var(--vscode-foreground); opacity: 0.55; font-size: 13px; padding: 0 4px; }
  .op-add:hover { opacity: 1; }
  .empty { padding: 8px; opacity: 0.5; font-size: 11px; }
</style>
</head>
<body>
<input id="search" placeholder="Filter operations…" oninput="filter(this.value)">
<div class="list" id="list"></div>
<script>
const vscode = acquireVsCodeApi();
let allOps = [];

window.addEventListener('message', e => {
  if (e.data.type === 'opsList') { allOps = e.data.ops; render(allOps, ''); }
});
vscode.postMessage({ type: 'getOps' });

function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function render(ops, query) {
  const grouped = {};
  for (const op of ops) (grouped[op.module] = grouped[op.module] || []).push(op);
  let html = '';
  for (const [mod, list] of Object.entries(grouped).sort()) {
    const open = query ? ' open' : '';
    html += '<div class="group-hdr">' + escHtml(mod) + '</div>';
    for (const op of list) {
      html += '<div class="op-row">'
        + '<span class="op-name" title="Apply to selection" onclick="apply(\\'' + op.opName + '\\')">' + escHtml(op.displayName) + '</span>'
        + '<button class="op-add" title="Add to recipe" onclick="addToRecipe(\\'' + op.opName + '\\')">＋</button>'
        + '</div>';
    }
  }
  document.getElementById('list').innerHTML = html || '<div class="empty">No matching operations.</div>';
}

function filter(q) {
  const ql = q.toLowerCase();
  const filtered = q
    ? allOps.filter(o => o.displayName.toLowerCase().includes(ql) || o.module.toLowerCase().includes(ql))
    : allOps;
  render(filtered, q);
}

function apply(opName) { vscode.postMessage({ type: 'apply', opName }); }
function addToRecipe(opName) { vscode.postMessage({ type: 'addToRecipe', opName }); }
</script>
</body>
</html>`;
  }
}
