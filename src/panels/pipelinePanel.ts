import * as vscode from "vscode";
import { PipelineStore, Pipeline, PipelineStep } from "../storage/store";
import { parsePipeline, runPipeline } from "../commands/runner";
import { log } from "../logger";
import registry from "../generated/opsRegistry";

export class PipelinePanel {
  private static current: PipelinePanel | undefined;
  private readonly panel: vscode.WebviewPanel;

  static open(
    context: vscode.ExtensionContext,
    store: PipelineStore,
    initial?: Pipeline,
  ): void {
    if (PipelinePanel.current) {
      PipelinePanel.current.panel.reveal();
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      "tschef.pipelineEditor",
      "ts-chef Pipeline Editor",
      vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true },
    );
    PipelinePanel.current = new PipelinePanel(panel, store, context, initial);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    private store: PipelineStore,
    private context: vscode.ExtensionContext,
    initial?: Pipeline,
  ) {
    this.panel = panel;
    panel.webview.html = this.buildHtml(initial);
    panel.onDidDispose(() => {
      PipelinePanel.current = undefined;
    });
    panel.webview.onDidReceiveMessage((msg) => this.handleMessage(msg));
  }

  private handleMessage(msg: { type: string; [k: string]: unknown }): void {
    switch (msg.type) {
      case "run": {
        const input = msg.input as string;
        try {
          let result: string;
          if (msg.steps) {
            result = runPipeline(input, msg.steps as PipelineStep[]);
            log(
              `Pipeline ran: ${(msg.steps as PipelineStep[]).length} step(s), input ${input.length} chars → ${result.length} chars`,
            );
          } else {
            const steps = parsePipeline(msg.raw as string);
            result = runPipeline(input, steps);
            log(
              `Pipeline ran (text): "${msg.raw}", input ${input.length} chars → ${result.length} chars`,
            );
          }
          this.panel.webview.postMessage({ type: "result", value: result });
        } catch (e) {
          log(`Pipeline error: ${e}`);
          this.panel.webview.postMessage({ type: "error", value: String(e) });
        }
        break;
      }
      case "save": {
        const name = (msg.name as string).trim();
        if (!name) {
          vscode.window.showWarningMessage("Pipeline name required.");
          return;
        }
        try {
          const steps = msg.steps
            ? (msg.steps as PipelineStep[])
            : parsePipeline(msg.raw as string);
          const raw =
            (msg.raw as string) || steps.map((s) => s.opName).join(" | ");
          this.store.upsert({
            name,
            raw,
            steps,
            description: msg.description as string | undefined,
          });
          vscode.commands.executeCommand("tschef.refreshPipelines");
          log(`Pipeline "${name}" saved (${steps.length} step(s))`);
          vscode.window.showInformationMessage(
            `ts-chef: Pipeline "${name}" saved.`,
          );
        } catch (e) {
          vscode.window.showErrorMessage(`ts-chef parse error: ${e}`);
        }
        break;
      }
      case "getOps": {
        const ops = registry.map((e) => {
          const inst = e.factory();
          return {
            opName: e.opName,
            displayName: e.displayName,
            module: e.module,
            args: inst.args,
          };
        });
        this.panel.webview.postMessage({ type: "opsList", ops });
        break;
      }
      case "runSelection": {
        const editor = vscode.window.activeTextEditor;
        const text =
          editor?.document.getText(editor.selection) ??
          editor?.document.getText() ??
          "";
        this.panel.webview.postMessage({ type: "inputLoaded", value: text });
        break;
      }
    }
  }

  private buildHtml(initial?: Pipeline): string {
    const initialName = initial?.name ?? "";
    const initialDesc = initial?.description ?? "";
    const initialRaw = initial?.raw ?? "";

    // Build initial steps data: op names + stored args
    const initialSteps = (initial?.steps ?? [])
      .map((step) => {
        const entry = registry.find((e) => e.opName === step.opName);
        if (!entry) return null;
        const inst = entry.factory();
        return {
          opName: step.opName,
          displayName: entry.displayName,
          args: step.args,
          argDefs: inst.args,
        };
      })
      .filter(Boolean);

    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ts-chef Pipeline Editor</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); color: var(--vscode-foreground); background: var(--vscode-editor-background); display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

  /* ── Header ── */
  .hdr { padding: 6px 10px; background: var(--vscode-sideBar-background); border-bottom: 1px solid var(--vscode-panel-border); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; flex-shrink: 0; }
  .hdr input { flex: 1; min-width: 100px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border,#555); padding: 2px 6px; }
  .btn { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 3px 9px; cursor: pointer; font-size: 12px; white-space: nowrap; }
  .btn:hover { background: var(--vscode-button-hoverBackground); }
  .btn-live { background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); }
  .btn-live.active { background: var(--vscode-terminal-ansiGreen,#4caf50); color: #fff; }
  .btn-sec { background: var(--vscode-inputOption-activeBackground,#3c3c3c); color: var(--vscode-foreground); border: 1px solid var(--vscode-input-border,#555); }

  /* ── Main ── */
  .main { display: flex; flex: 1; overflow: hidden; min-height: 0; }

  /* Left panel */
  .panel-left { width: 200px; min-width: 160px; border-right: 1px solid var(--vscode-panel-border); display: flex; flex-direction: column; overflow: hidden; flex-shrink: 0; }
  .panel-left input { margin: 5px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border,#555); padding: 2px 6px; }
  .ops-list { flex: 1; overflow-y: auto; }
  .op-group-hdr { padding: 2px 8px; font-size: 10px; opacity: 0.55; text-transform: uppercase; letter-spacing: 0.5px; }
  .op-item { padding: 3px 10px; cursor: grab; user-select: none; font-size: 12px; }
  .op-item:hover { background: var(--vscode-list-hoverBackground); }

  /* Center panel */
  .panel-center { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .pipeline-zone { flex: 1; padding: 6px; overflow-y: auto; display: flex; flex-direction: column; gap: 3px; min-height: 80px; }
  .pipeline-zone.dragover { outline: 2px dashed var(--vscode-focusBorder); outline-offset: -2px; }
  .empty-hint { opacity: 0.4; font-size: 11px; padding: 6px; text-align: center; }

  /* Step cards */
  .step-card { border: 1px solid var(--vscode-panel-border); border-radius: 3px; background: var(--vscode-sideBar-background); }
  .step-card.dragging { opacity: 0.4; }
  .step-head { display: flex; align-items: center; gap: 5px; padding: 4px 6px; cursor: move; user-select: none; }
  .step-num { font-size: 10px; opacity: 0.5; min-width: 14px; }
  .step-drag { cursor: grab; opacity: 0.4; font-size: 13px; }
  .step-name { flex: 1; font-size: 12px; font-weight: 500; }
  .step-btn { background: none; border: none; cursor: pointer; opacity: 0.55; font-size: 12px; padding: 0 3px; color: var(--vscode-foreground); }
  .step-btn:hover { opacity: 1; }
  .step-arrow { font-size: 9px; }
  .step-args { padding: 6px 10px 8px; border-top: 1px solid var(--vscode-panel-border); display: flex; flex-direction: column; gap: 5px; }
  .arg-row { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
  .arg-label { font-size: 11px; opacity: 0.7; min-width: 70px; }
  .arg-row input[type=text], .arg-row input[type=number] { flex: 1; min-width: 60px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border,#555); padding: 2px 5px; font-size: 11px; }
  .arg-row select { flex: 1; min-width: 60px; background: var(--vscode-dropdown-background); color: var(--vscode-dropdown-foreground); border: 1px solid var(--vscode-dropdown-border,#555); padding: 2px 4px; font-size: 11px; }
  .arg-row input[type=checkbox] { cursor: pointer; }
  .arrow-sep { text-align: center; font-size: 11px; opacity: 0.35; padding: 0 4px; flex-shrink: 0; }

  /* Pipe text */
  .pipe-text-row { border-top: 1px solid var(--vscode-panel-border); padding: 4px 6px; flex-shrink: 0; }
  .pipe-text-row textarea { width: 100%; height: 44px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border,#555); padding: 3px; font-family: monospace; font-size: 11px; resize: none; }

  /* IO */
  .io-zone { display: flex; border-top: 1px solid var(--vscode-panel-border); height: 180px; flex-shrink: 0; }
  .io-pane { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .io-pane + .io-pane { border-left: 1px solid var(--vscode-panel-border); }
  .io-hdr { padding: 2px 8px; font-size: 11px; background: var(--vscode-sideBar-background); border-bottom: 1px solid var(--vscode-panel-border); display: flex; justify-content: space-between; align-items: center; }
  .io-pane textarea { flex: 1; background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); border: none; padding: 5px; font-family: monospace; font-size: 11px; resize: none; }

  .status-bar { padding: 2px 8px; font-size: 10px; opacity: 0.6; background: var(--vscode-statusBar-background,#007acc); color: var(--vscode-statusBar-foreground,#fff); flex-shrink: 0; display: flex; gap: 10px; }
  .err { color: var(--vscode-errorForeground,#f48771); padding: 2px 8px; font-size: 11px; flex-shrink: 0; }
</style>
</head>
<body>

<div class="hdr">
  <strong style="white-space:nowrap">ts-chef</strong>
  <input id="pipeName" placeholder="Pipeline name…" value="${escHtmlAttr(initialName)}">
  <input id="pipeDesc" placeholder="Description (optional)" value="${escHtmlAttr(initialDesc)}">
  <button class="btn" onclick="savePipeline()">Save</button>
  <button class="btn" onclick="runManual()">▶ Run</button>
  <button class="btn btn-live" id="liveBtn" onclick="toggleLive()" title="Toggle live preview">⚡ Live</button>
  <button class="btn btn-sec" onclick="loadSelection()">From Editor</button>
</div>

<div class="main">
  <div class="panel-left">
    <input id="opSearch" placeholder="Search operations…" oninput="filterOps(this.value)">
    <div class="ops-list" id="opsList"></div>
  </div>
  <div class="panel-center">
    <div class="pipeline-zone" id="pipelineZone"
         ondragover="onZoneDragOver(event)"
         ondragleave="onZoneDragLeave(event)"
         ondrop="onZoneDrop(event)">
      <div class="empty-hint" id="emptyHint">Drag operations here or type in the field below</div>
    </div>
    <div class="pipe-text-row">
      <textarea id="pipeText" placeholder="From Base64 | To Hex | …" oninput="syncFromText()">${escHtml(initialRaw)}</textarea>
    </div>
  </div>
</div>

<div class="io-zone">
  <div class="io-pane">
    <div class="io-hdr">Input <button class="btn btn-sec" style="font-size:10px;padding:1px 5px" onclick="loadSelection()">From Editor</button></div>
    <textarea id="inputArea" placeholder="Input here…" oninput="scheduleRun()"></textarea>
  </div>
  <div class="io-pane">
    <div class="io-hdr">Output <span id="outputStats" style="font-size:10px;opacity:0.6"></span></div>
    <textarea id="outputArea" readonly placeholder="Output will appear here…"></textarea>
  </div>
</div>

<div class="err" id="errMsg"></div>
<div class="status-bar"><span id="statusText">Ready</span></div>

<script>
const vscode = acquireVsCodeApi();

// ── State ──────────────────────────────────────────────────────────────────
let allOps = [];             // { opName, displayName, module, args }
let steps = [];              // { opName, displayName, argDefs, argValues, expanded }
let liveMode = true;
let debounceTimer = null;
let dragFromOps = null;      // op being dragged from the ops list
let dragStepIdx = null;      // step index being reordered

// ── Init ───────────────────────────────────────────────────────────────────
window.addEventListener('message', e => {
  const msg = e.data;
  if (msg.type === 'opsList') {
    allOps = msg.ops;
    renderOpsList(allOps);
    // restore initial steps after ops are loaded
    if (INITIAL_STEPS.length > 0) {
      const opMap = {};
      for (const op of allOps) opMap[op.opName] = op;
      steps = INITIAL_STEPS.map(s => {
        const op = opMap[s.opName];
        if (!op) return null;
        return { opName: s.opName, displayName: op.displayName, argDefs: op.args, argValues: s.args, expanded: false };
      }).filter(Boolean);
      renderSteps();
      syncToText();
    } else if (INITIAL_RAW) {
      syncFromText();
    }
  }
  if (msg.type === 'result') {
    const out = msg.value;
    document.getElementById('outputArea').value = out;
    document.getElementById('outputStats').textContent = \`\${out.length} chars\`;
    document.getElementById('errMsg').textContent = '';
    setStatus('Done');
  }
  if (msg.type === 'error') {
    document.getElementById('errMsg').textContent = msg.value;
    setStatus('Error');
  }
  if (msg.type === 'inputLoaded') {
    document.getElementById('inputArea').value = msg.value;
    scheduleRun();
  }
});

vscode.postMessage({ type: 'getOps' });
updateLiveBtn();

// ── Op list rendering ──────────────────────────────────────────────────────
function renderOpsList(ops) {
  const grouped = {};
  for (const op of ops) {
    if (!grouped[op.module]) grouped[op.module] = [];
    grouped[op.module].push(op);
  }
  let html = '';
  for (const [mod, list] of Object.entries(grouped).sort()) {
    html += \`<div class="op-group-hdr">\${escHtml(mod)}</div>\`;
    for (const op of list) {
      html += \`<div class="op-item" draggable="true" data-op="\${op.opName}"
        ondragstart="startOpDrag(event,'\${op.opName}')">\${escHtml(op.displayName)}</div>\`;
    }
  }
  document.getElementById('opsList').innerHTML = html;
}

function filterOps(q) {
  const filtered = q ? allOps.filter(o => o.displayName.toLowerCase().includes(q.toLowerCase()) || o.module.toLowerCase().includes(q.toLowerCase())) : allOps;
  renderOpsList(filtered);
}

// ── Drag from ops list ─────────────────────────────────────────────────────
function startOpDrag(e, opName) {
  dragFromOps = opName;
  dragStepIdx = null;
  e.dataTransfer.effectAllowed = 'copy';
}

// ── Pipeline zone drag/drop ────────────────────────────────────────────────
function onZoneDragOver(e) {
  e.preventDefault();
  document.getElementById('pipelineZone').classList.add('dragover');
}
function onZoneDragLeave(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    document.getElementById('pipelineZone').classList.remove('dragover');
  }
}
function onZoneDrop(e) {
  e.preventDefault();
  document.getElementById('pipelineZone').classList.remove('dragover');
  if (dragFromOps !== null) {
    const op = allOps.find(o => o.opName === dragFromOps);
    if (op) addStep(op);
    dragFromOps = null;
  }
}

// ── Step reorder drag ──────────────────────────────────────────────────────
function startStepDrag(e, idx) {
  dragStepIdx = idx;
  dragFromOps = null;
  e.dataTransfer.effectAllowed = 'move';
  e.target.closest('.step-card').classList.add('dragging');
}
function onStepDragOver(e, idx) {
  e.preventDefault();
  if (dragStepIdx === null || dragStepIdx === idx) return;
  const moved = steps.splice(dragStepIdx, 1)[0];
  steps.splice(idx, 0, moved);
  dragStepIdx = idx;
  renderSteps();
  syncToText();
}
function onStepDragEnd() {
  dragStepIdx = null;
  scheduleRun();
}

// ── Steps management ───────────────────────────────────────────────────────
function addStep(op) {
  steps.push({ opName: op.opName, displayName: op.displayName, argDefs: op.args, argValues: resolveDefaults(op.args), expanded: false });
  renderSteps();
  syncToText();
  scheduleRun();
}

function removeStep(i) {
  steps.splice(i, 1);
  renderSteps();
  syncToText();
  scheduleRun();
}

function toggleExpand(i) {
  steps[i].expanded = !steps[i].expanded;
  renderSteps();
}

function resolveDefaults(argDefs) {
  return argDefs.map(a => {
    switch (a.type) {
      case 'editableOption': case 'editableOptionShort': {
        const opts = a.value;
        if (!Array.isArray(opts)) return a.value;
        const idx = typeof a.defaultIndex === 'number' ? a.defaultIndex : 0;
        return opts[idx]?.value ?? opts[0]?.value ?? '';
      }
      case 'option': {
        const opts = a.value;
        return Array.isArray(opts) ? (opts[0] ?? '') : a.value;
      }
      case 'argSelector': {
        const opts = a.value;
        return Array.isArray(opts) ? (opts[0]?.name ?? '') : a.value;
      }
      case 'toggleString':
        return { string: typeof a.value === 'string' ? a.value : '', option: (a.toggleValues && a.toggleValues[0]) || 'Hex' };
      default:
        return a.value;
    }
  });
}

// ── Render ─────────────────────────────────────────────────────────────────
function renderSteps() {
  const zone = document.getElementById('pipelineZone');
  document.getElementById('emptyHint').style.display = steps.length ? 'none' : '';
  const cards = steps.map((s, i) => renderCard(s, i)).join(
    '<div class="arrow-sep">▼</div>'
  );
  // keep the emptyHint div, replace the rest
  zone.innerHTML = '<div class="empty-hint" id="emptyHint" style="' + (steps.length ? 'display:none' : '') + '">Drag operations here or type in the field below</div>' + cards;
}

function renderCard(s, i) {
  const arrow = s.expanded ? '▲' : '▼';
  const hasArgs = s.argDefs && s.argDefs.length > 0;
  return \`<div class="step-card" draggable="true"
    ondragstart="startStepDrag(event,\${i})"
    ondragover="onStepDragOver(event,\${i})"
    ondragend="onStepDragEnd()">
    <div class="step-head">
      <span class="step-num">\${i+1}</span>
      <span class="step-name">\${escHtml(s.displayName)}</span>
      \${hasArgs ? \`<button class="step-btn step-arrow" onclick="toggleExpand(\${i})" title="Edit parameters">\${arrow}</button>\` : ''}
      <button class="step-btn" onclick="removeStep(\${i})" title="Remove">✕</button>
    </div>
    \${s.expanded && hasArgs ? renderArgEditors(s, i) : ''}
  </div>\`;
}

function renderArgEditors(s, i) {
  const rows = s.argDefs.map((a, ai) => renderArgRow(a, s.argValues[ai], i, ai)).join('');
  return \`<div class="step-args" data-step="\${i}" onchange="onArgChange(event)" oninput="onArgInput(event)">\${rows}</div>\`;
}

function renderArgRow(argDef, val, si, ai) {
  const label = \`<span class="arg-label">\${escHtml(argDef.name)}</span>\`;
  let input = '';

  switch (argDef.type) {
    case 'boolean': {
      const ck = val ? 'checked' : '';
      input = \`<input type="checkbox" \${ck} data-arg="\${ai}" data-type="boolean">\`;
      break;
    }
    case 'number': {
      const min = argDef.min != null ? \`min="\${argDef.min}"\` : '';
      const max = argDef.max != null ? \`max="\${argDef.max}"\` : '';
      const step = argDef.step != null ? \`step="\${argDef.step}"\` : '';
      input = \`<input type="number" value="\${escAttr(val)}" \${min} \${max} \${step} data-arg="\${ai}" data-type="number">\`;
      break;
    }
    case 'option': {
      const opts = argDef.value;
      const selects = Array.isArray(opts)
        ? opts.map(o => \`<option \${String(val) === String(o) ? 'selected' : ''}>\${escHtml(String(o))}</option>\`).join('')
        : '';
      input = \`<select data-arg="\${ai}" data-type="option">\${selects}</select>\`;
      break;
    }
    case 'editableOption': case 'editableOptionShort': {
      const opts = argDef.value;
      const selects = Array.isArray(opts)
        ? opts.map((o, oi) => {
            const selected = JSON.stringify(o.value) === JSON.stringify(val);
            return \`<option data-optidx="\${oi}" \${selected ? 'selected' : ''}>\${escHtml(String(o.name))}</option>\`;
          }).join('')
        : '';
      input = \`<select data-arg="\${ai}" data-type="editableOption" data-argdef="\${si}_\${ai}">\${selects}</select>\`;
      break;
    }
    case 'argSelector': {
      const opts = argDef.value;
      const selects = Array.isArray(opts)
        ? opts.map(o => \`<option \${String(val) === String(o.name) ? 'selected' : ''}>\${escHtml(String(o.name))}</option>\`).join('')
        : '';
      input = \`<select data-arg="\${ai}" data-type="argSelector">\${selects}</select>\`;
      break;
    }
    case 'toggleString': {
      const strVal = (val && typeof val === 'object') ? (val.string ?? '') : (typeof val === 'string' ? val : '');
      const encVal = (val && typeof val === 'object') ? (val.option ?? '') : '';
      const encOpts = (argDef.toggleValues || ['Hex'])
        .map(v => \`<option \${encVal === v ? 'selected' : ''}>\${escHtml(v)}</option>\`).join('');
      input = \`<input type="text" value="\${escAttr(strVal)}" data-arg="\${ai}" data-type="toggleString" data-subfield="string" placeholder="\${escAttr(argDef.name)}">
               <select data-arg="\${ai}" data-type="toggleString" data-subfield="option">\${encOpts}</select>\`;
      break;
    }
    default: {
      const strVal = typeof val === 'string' ? val : (val != null ? String(val) : '');
      input = \`<input type="text" value="\${escAttr(strVal)}" data-arg="\${ai}" data-type="string">\`;
    }
  }

  return \`<div class="arg-row">\${label}\${input}</div>\`;
}

// ── Arg change handling ────────────────────────────────────────────────────
function onArgChange(e) { handleArgUpdate(e); }
function onArgInput(e) {
  const t = e.target;
  if (t.tagName === 'INPUT' && t.type !== 'checkbox') handleArgUpdate(e);
}

function handleArgUpdate(e) {
  const argsDiv = e.currentTarget;
  const si = parseInt(argsDiv.dataset.step);
  const target = e.target;
  const ai = parseInt(target.dataset.arg);
  if (isNaN(si) || isNaN(ai)) return;

  const step = steps[si];
  if (!step) return;
  const argDef = step.argDefs[ai];
  const type = target.dataset.type;

  switch (type) {
    case 'boolean':
      step.argValues[ai] = target.checked;
      break;
    case 'number':
      step.argValues[ai] = Number(target.value);
      break;
    case 'toggleString': {
      const subfield = target.dataset.subfield;
      const cur = step.argValues[ai];
      const obj = (cur && typeof cur === 'object') ? { ...cur } : { string: '', option: (argDef.toggleValues && argDef.toggleValues[0]) || 'Hex' };
      obj[subfield] = target.value;
      step.argValues[ai] = obj;
      break;
    }
    case 'editableOption': {
      const selectedIdx = target.selectedIndex;
      const opts = argDef.value;
      step.argValues[ai] = Array.isArray(opts) ? (opts[selectedIdx]?.value ?? target.value) : target.value;
      break;
    }
    default:
      step.argValues[ai] = target.value;
  }

  scheduleRun();
}

// ── Sync between blocks and textarea ──────────────────────────────────────
function syncToText() {
  document.getElementById('pipeText').value = steps.map(s => s.displayName || s.opName).join(' | ');
}

function syncFromText() {
  const raw = document.getElementById('pipeText').value;
  const parts = raw.split('|').map(s => s.trim()).filter(Boolean);
  steps = parts.map(part => {
    const opName = part.split('(')[0].trim();
    const op = allOps.find(o => o.displayName.toLowerCase() === opName.toLowerCase() || o.opName.toLowerCase() === opName.toLowerCase());
    if (!op) return null;
    return { opName: op.opName, displayName: op.displayName, argDefs: op.args, argValues: resolveDefaults(op.args), expanded: false };
  }).filter(Boolean);
  renderSteps();
  scheduleRun();
}

// ── Live preview ───────────────────────────────────────────────────────────
function toggleLive() {
  liveMode = !liveMode;
  updateLiveBtn();
  if (liveMode) scheduleRun();
}

function updateLiveBtn() {
  const btn = document.getElementById('liveBtn');
  if (liveMode) { btn.classList.add('active'); btn.title = 'Live preview ON — click to disable'; }
  else { btn.classList.remove('active'); btn.title = 'Live preview OFF — click to enable'; }
}

function scheduleRun() {
  if (!liveMode) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runPipeline, 380);
}

function runManual() {
  clearTimeout(debounceTimer);
  runPipeline();
}

function runPipeline() {
  const input = document.getElementById('inputArea').value;
  document.getElementById('errMsg').textContent = '';
  if (steps.length === 0) {
    document.getElementById('outputArea').value = input;
    document.getElementById('outputStats').textContent = \`\${input.length} chars\`;
    return;
  }
  setStatus('Running…');
  vscode.postMessage({
    type: 'run',
    input,
    steps: steps.map(s => ({ opName: s.opName, args: s.argValues })),
    raw: document.getElementById('pipeText').value,
  });
}

// ── Save / Load ────────────────────────────────────────────────────────────
function savePipeline() {
  const raw = document.getElementById('pipeText').value.trim();
  const name = document.getElementById('pipeName').value.trim();
  const description = document.getElementById('pipeDesc').value.trim();
  vscode.postMessage({
    type: 'save',
    raw,
    name,
    description,
    steps: steps.map(s => ({ opName: s.opName, args: s.argValues })),
  });
}

function loadSelection() {
  vscode.postMessage({ type: 'runSelection' });
}

// ── Helpers ────────────────────────────────────────────────────────────────
function setStatus(msg) {
  document.getElementById('statusText').textContent = msg;
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escAttr(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
}

// ── Bootstrap ──────────────────────────────────────────────────────────────
const INITIAL_STEPS = ${JSON.stringify(initialSteps)};
const INITIAL_RAW   = ${JSON.stringify(initialRaw)};
</script>
</body>
</html>`;
  }
}

function escHtmlAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
