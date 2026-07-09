/**
 * @fileoverview recipeViewProvider provider for VS Code extension functionality
 * @package providers
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as vscode from "vscode";
import type { ArgConfig } from "../chef/Operation";
import { resolveDefaultArg } from "../commands/argDefaults";

/** A single step of the working recipe: an operation plus its argument values. */
export interface RecipeStep {
  opName: string;
  args: unknown[];
}

export interface RecipeViewDeps {
  /** Argument definitions for an operation, or undefined if unknown. */
  argDefsFor: (opName: string) => ArgConfig[] | undefined;
  /** Human-readable name for an operation. */
  displayNameFor: (opName: string) => string;
  /** Apply the recipe to the current selection. */
  apply: (steps: RecipeStep[]) => void;
  /** Persist the recipe as a named pipeline. */
  save: (name: string, steps: RecipeStep[]) => void;
}

type IncomingMessage =
  | { type: "ready" }
  | { type: "recipeChanged"; steps: RecipeStep[] }
  | { type: "setName"; name: string }
  | { type: "apply" }
  | { type: "save" };

/**
 * The Recipe sidebar: one persistent working recipe built from operations
 * added via the Operations pane's ＋ button. Steps are reorderable and each
 * exposes an inline per-argument editor; the whole recipe can be applied to the
 * selection or saved as a named pipeline.
 *
 * The canonical state (steps + name) lives in the provider, so {@link loadRecipe}
 * and {@link addOperation} work even before the view has ever been opened — the
 * first `ready` from the webview pulls the current state. Message handling is
 * injected via {@link RecipeViewDeps} so it is unit-testable.
 */
export class RecipeViewProvider implements vscode.WebviewViewProvider {
  static readonly viewType = "tschef.recipeView";
  private view: vscode.WebviewView | undefined;
  private steps: RecipeStep[] = [];
  private name = "";

  constructor(private readonly deps: RecipeViewDeps) {}

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    view.webview.options = { enableScripts: true };
    view.webview.html = this.buildHtml();
    view.webview.onDidReceiveMessage((msg: IncomingMessage) =>
      this.handleMessage(msg),
    );
  }

  /** Append an operation with its default arguments to the working recipe. */
  addOperation(opName: string): void {
    const argDefs = this.deps.argDefsFor(opName);
    if (!argDefs) return;
    this.steps.push({ opName, args: argDefs.map(resolveDefaultArg) });
    // Reveal (without stealing focus) so the user sees the step land.
    this.view?.show?.(false);
    this.postState();
  }

  /** Replace the working recipe with the given steps and name. */
  loadRecipe(steps: RecipeStep[], name: string): void {
    this.steps = steps.map((s) => ({ opName: s.opName, args: [...s.args] }));
    this.name = name;
    this.postState();
  }

  /** Handle a message from the webview. Exposed for unit testing. */
  handleMessage(msg: IncomingMessage): void {
    switch (msg.type) {
      case "ready":
        this.postState();
        break;
      case "recipeChanged":
        this.steps = msg.steps;
        break;
      case "setName":
        this.name = msg.name;
        break;
      case "apply":
        this.deps.apply(this.steps);
        break;
      case "save":
        this.deps.save(this.name.trim(), this.steps);
        break;
    }
  }

  private postState(): void {
    const steps = this.steps.map((s) => ({
      opName: s.opName,
      displayName: this.deps.displayNameFor(s.opName),
      argDefs: this.deps.argDefsFor(s.opName) ?? [],
      args: s.args,
    }));
    this.view?.webview.postMessage({
      type: "setState",
      name: this.name,
      steps,
    });
  }

  private buildHtml(): string {
    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); color: var(--vscode-foreground); display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  .hdr { padding: 5px; display: flex; flex-direction: column; gap: 4px; border-bottom: 1px solid var(--vscode-panel-border); flex-shrink: 0; }
  .hdr input { background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border,#555); padding: 3px 6px; }
  .hdr-btns { display: flex; gap: 4px; }
  .btn { flex: 1; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 3px 8px; cursor: pointer; font-size: 12px; }
  .btn:hover { background: var(--vscode-button-hoverBackground); }
  .steps { flex: 1; overflow-y: auto; padding: 5px; display: flex; flex-direction: column; gap: 3px; }
  .empty { opacity: 0.4; font-size: 11px; padding: 8px; text-align: center; }
  .step-card { border: 1px solid var(--vscode-panel-border); border-radius: 3px; background: var(--vscode-sideBar-background); }
  .step-card.dragging { opacity: 0.4; }
  .step-head { display: flex; align-items: center; gap: 5px; padding: 4px 6px; cursor: move; user-select: none; }
  .step-num { font-size: 10px; opacity: 0.5; min-width: 14px; }
  .step-name { flex: 1; font-size: 12px; font-weight: 500; }
  .step-btn { background: none; border: none; cursor: pointer; opacity: 0.55; font-size: 12px; padding: 0 3px; color: var(--vscode-foreground); }
  .step-btn:hover { opacity: 1; }
  .step-args { padding: 6px 10px 8px; border-top: 1px solid var(--vscode-panel-border); display: flex; flex-direction: column; gap: 5px; }
  .arg-row { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
  .arg-label { font-size: 11px; opacity: 0.7; min-width: 60px; }
  .arg-row input[type=text], .arg-row input[type=number] { flex: 1; min-width: 50px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border,#555); padding: 2px 5px; font-size: 11px; }
  .arg-row select { flex: 1; min-width: 50px; background: var(--vscode-dropdown-background); color: var(--vscode-dropdown-foreground); border: 1px solid var(--vscode-dropdown-border,#555); padding: 2px 4px; font-size: 11px; }
</style>
</head>
<body>
<div class="hdr">
  <input id="name" placeholder="Recipe name…" oninput="onName(this.value)">
  <div class="hdr-btns">
    <button class="btn" onclick="apply()" title="Run the recipe on the current selection">Apply to selection</button>
    <button class="btn" onclick="save()" title="Save the recipe as a named pipeline">Save as pipeline</button>
  </div>
</div>
<div class="steps" id="steps"></div>
<script>
const vscode = acquireVsCodeApi();
let steps = [];          // { opName, displayName, argDefs, argValues, expanded }
let dragIdx = null;

window.addEventListener('message', e => {
  if (e.data.type === 'setState') {
    document.getElementById('name').value = e.data.name || '';
    steps = e.data.steps.map(s => ({
      opName: s.opName, displayName: s.displayName,
      argDefs: s.argDefs || [], argValues: s.args || [], expanded: false,
    }));
    render();
  }
});
vscode.postMessage({ type: 'ready' });

function escHtml(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escAttr(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }

function pushChange() {
  vscode.postMessage({ type: 'recipeChanged', steps: steps.map(s => ({ opName: s.opName, args: s.argValues })) });
}

function onName(v) { vscode.postMessage({ type: 'setName', name: v }); }
function apply() { vscode.postMessage({ type: 'apply' }); }
function save() { vscode.postMessage({ type: 'save' }); }

function removeStep(i) { steps.splice(i, 1); render(); pushChange(); }
function toggleExpand(i) { steps[i].expanded = !steps[i].expanded; render(); }

function startDrag(e, i) { dragIdx = i; e.target.closest('.step-card').classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; }
function onDragOver(e, i) {
  e.preventDefault();
  if (dragIdx === null || dragIdx === i) return;
  const moved = steps.splice(dragIdx, 1)[0];
  steps.splice(i, 0, moved);
  dragIdx = i;
  render();
}
function onDragEnd() { dragIdx = null; pushChange(); }

function render() {
  const zone = document.getElementById('steps');
  if (!steps.length) { zone.innerHTML = '<div class="empty">Add operations with ＋ from the Operations pane.</div>'; return; }
  zone.innerHTML = steps.map((s, i) => card(s, i)).join('');
}

function card(s, i) {
  const arrow = s.expanded ? '▲' : '▼';
  const hasArgs = s.argDefs && s.argDefs.length > 0;
  return '<div class="step-card" draggable="true"'
    + ' ondragstart="startDrag(event,' + i + ')" ondragover="onDragOver(event,' + i + ')" ondragend="onDragEnd()">'
    + '<div class="step-head"><span class="step-num">' + (i + 1) + '</span>'
    + '<span class="step-name">' + escHtml(s.displayName) + '</span>'
    + (hasArgs ? '<button class="step-btn" onclick="toggleExpand(' + i + ')" title="Edit parameters">' + arrow + '</button>' : '')
    + '<button class="step-btn" onclick="removeStep(' + i + ')" title="Remove">✕</button></div>'
    + (s.expanded && hasArgs ? argEditors(s, i) : '')
    + '</div>';
}

function argEditors(s, i) {
  const rows = s.argDefs.map((a, ai) => argRow(a, s.argValues[ai], ai)).join('');
  return '<div class="step-args" data-step="' + i + '" onchange="onArg(event)" oninput="onArgInput(event)">' + rows + '</div>';
}

function argRow(argDef, val, ai) {
  const hint = argDef.hint ? ' title="' + escAttr(argDef.hint) + '"' : '';
  const label = '<span class="arg-label"' + hint + '>' + escHtml(argDef.name) + '</span>';
  let input = '';
  switch (argDef.type) {
    case 'boolean':
      input = '<input type="checkbox" ' + (val ? 'checked' : '') + ' data-arg="' + ai + '" data-type="boolean">';
      break;
    case 'number': {
      const bounds = (argDef.min != null ? ' min="' + argDef.min + '"' : '')
        + (argDef.max != null ? ' max="' + argDef.max + '"' : '')
        + (argDef.step != null ? ' step="' + argDef.step + '"' : '');
      input = '<input type="number" value="' + escAttr(val) + '"' + bounds + ' data-arg="' + ai + '" data-type="number">';
      break;
    }
    case 'option': {
      const opts = Array.isArray(argDef.value) ? argDef.value : [];
      input = '<select data-arg="' + ai + '" data-type="option">'
        + opts.map(o => '<option ' + (String(val) === String(o) ? 'selected' : '') + '>' + escHtml(String(o)) + '</option>').join('')
        + '</select>';
      break;
    }
    case 'editableOption': case 'editableOptionShort': {
      const opts = Array.isArray(argDef.value) ? argDef.value : [];
      input = '<select data-arg="' + ai + '" data-type="editableOption">'
        + opts.map(o => '<option ' + (JSON.stringify(o.value) === JSON.stringify(val) ? 'selected' : '') + '>' + escHtml(String(o.name)) + '</option>').join('')
        + '</select>';
      break;
    }
    case 'argSelector': {
      const opts = Array.isArray(argDef.value) ? argDef.value : [];
      input = '<select data-arg="' + ai + '" data-type="argSelector">'
        + opts.map(o => '<option ' + (String(val) === String(o.name) ? 'selected' : '') + '>' + escHtml(String(o.name)) + '</option>').join('')
        + '</select>';
      break;
    }
    case 'toggleString': {
      const strVal = (val && typeof val === 'object') ? (val.string ?? '') : (typeof val === 'string' ? val : '');
      const encVal = (val && typeof val === 'object') ? (val.option ?? '') : '';
      const encOpts = (argDef.toggleValues || ['Hex']).map(v => '<option ' + (encVal === v ? 'selected' : '') + '>' + escHtml(v) + '</option>').join('');
      input = '<input type="text" value="' + escAttr(strVal) + '" data-arg="' + ai + '" data-type="toggleString" data-subfield="string">'
        + '<select data-arg="' + ai + '" data-type="toggleString" data-subfield="option">' + encOpts + '</select>';
      break;
    }
    default:
      input = '<input type="text" value="' + escAttr(typeof val === 'string' ? val : (val != null ? String(val) : '')) + '" data-arg="' + ai + '" data-type="string">';
  }
  return '<div class="arg-row">' + label + input + '</div>';
}

function onArg(e) { handleArg(e); }
function onArgInput(e) { const t = e.target; if (t.tagName === 'INPUT' && t.type !== 'checkbox') handleArg(e); }

function handleArg(e) {
  const si = parseInt(e.currentTarget.dataset.step);
  const t = e.target;
  const ai = parseInt(t.dataset.arg);
  if (isNaN(si) || isNaN(ai)) return;
  const step = steps[si];
  if (!step) return;
  const argDef = step.argDefs[ai];
  switch (t.dataset.type) {
    case 'boolean': step.argValues[ai] = t.checked; break;
    case 'number': step.argValues[ai] = Number(t.value); break;
    case 'toggleString': {
      const cur = step.argValues[ai];
      const obj = (cur && typeof cur === 'object') ? { ...cur } : { string: '', option: (argDef.toggleValues && argDef.toggleValues[0]) || 'Hex' };
      obj[t.dataset.subfield] = t.value;
      step.argValues[ai] = obj;
      break;
    }
    case 'editableOption': {
      const opts = argDef.value;
      step.argValues[ai] = Array.isArray(opts) ? (opts[t.selectedIndex]?.value ?? t.value) : t.value;
      break;
    }
    default: step.argValues[ai] = t.value;
  }
  pushChange();
}
</script>
</body>
</html>`;
  }
}
