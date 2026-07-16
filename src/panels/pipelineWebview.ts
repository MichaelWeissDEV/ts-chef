/** Build the self-contained, CSP-safe pipeline editor webview. */
export function buildPipelineWebviewHtml(
  cspSource: string,
  nonce: string,
): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource} data:; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}';">
<title>ts-chef Pipeline Editor</title>
<style nonce="${nonce}">
  * { box-sizing: border-box; }
  html, body { width: 100%; height: 100%; margin: 0; }
  body { font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); color: var(--vscode-foreground); background: var(--vscode-editor-background); display: flex; flex-direction: column; overflow: hidden; }
  button, input, select, textarea { font: inherit; }
  button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: 1px; }
  .hidden { display: none !important; }

  .header { padding: 6px 10px; background: var(--vscode-sideBar-background); border-bottom: 1px solid var(--vscode-panel-border); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; flex-shrink: 0; }
  .brand { white-space: nowrap; }
  .header-input { flex: 1; min-width: 120px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border, #555); padding: 3px 6px; }
  .button { border: 0; padding: 4px 10px; cursor: pointer; white-space: nowrap; background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
  .button:hover:not(:disabled) { background: var(--vscode-button-hoverBackground); }
  .button:disabled { opacity: .45; cursor: not-allowed; }
  .button.secondary { background: var(--vscode-inputOption-activeBackground, #3c3c3c); color: var(--vscode-foreground); border: 1px solid var(--vscode-input-border, #555); }
  .button.live { background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); }
  .button.live.active { background: var(--vscode-terminal-ansiGreen, #4caf50); color: #fff; }
  .mode-group { display: flex; border: 1px solid var(--vscode-input-border, #555); }
  .mode-button { border: 0; padding: 3px 8px; cursor: pointer; background: transparent; color: var(--vscode-foreground); }
  .mode-button.active { background: var(--vscode-list-activeSelectionBackground); color: var(--vscode-list-activeSelectionForeground); }

  .main { display: flex; flex: 1; min-height: 0; overflow: hidden; }
  .palette { width: 220px; min-width: 170px; border-right: 1px solid var(--vscode-panel-border); display: flex; flex-direction: column; overflow: hidden; }
  .palette-search { margin: 6px; padding: 4px 6px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border, #555); }
  .ops-list { flex: 1; overflow-y: auto; padding-bottom: 8px; }
  .op-group { padding: 5px 8px 2px; font-size: 10px; opacity: .58; text-transform: uppercase; letter-spacing: .5px; position: sticky; top: 0; background: var(--vscode-sideBar-background); }
  .op-item { padding: 4px 10px; cursor: grab; user-select: none; font-size: 12px; display: flex; gap: 6px; align-items: center; }
  .op-item:hover { background: var(--vscode-list-hoverBackground); }
  .op-item .op-type { margin-left: auto; opacity: .45; font-size: 9px; }

  .workspace { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
  .view { flex: 1; min-height: 0; overflow: hidden; }
  .list-view { height: 100%; display: flex; flex-direction: column; }
  .pipeline-zone { flex: 1; min-height: 80px; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 4px; }
  .pipeline-zone.dragover, .graph-scroll.dragover { outline: 2px dashed var(--vscode-focusBorder); outline-offset: -3px; }
  .empty { opacity: .48; font-size: 11px; padding: 14px; text-align: center; }
  .step-card { border: 1px solid var(--vscode-panel-border); border-radius: 4px; background: var(--vscode-sideBar-background); }
  .step-card.dragging, .graph-node.dragging { opacity: .42; }
  .step-head { display: flex; gap: 6px; align-items: center; padding: 5px 7px; cursor: grab; user-select: none; }
  .step-index { min-width: 18px; opacity: .5; font-size: 10px; }
  .step-title { flex: 1; font-weight: 600; font-size: 12px; }
  .type-badge { border: 1px solid var(--vscode-panel-border); border-radius: 10px; padding: 1px 5px; font-size: 9px; opacity: .65; }
  .warning-badge { color: var(--vscode-editorWarning-foreground, #cca700); font-size: 10px; }
  .icon-button { border: 0; background: transparent; color: var(--vscode-foreground); opacity: .62; padding: 1px 5px; cursor: pointer; }
  .icon-button:hover { opacity: 1; }
  .step-args { border-top: 1px solid var(--vscode-panel-border); padding: 7px 10px 9px; display: flex; flex-direction: column; gap: 6px; }
  .arg-row { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
  .arg-label { min-width: 92px; opacity: .75; font-size: 11px; }
  .arg-section { padding: 5px 2px 2px; border-bottom: 1px solid var(--vscode-panel-border); font-weight: 650; font-size: 11px; opacity: .78; }
  .arg-control { min-width: 80px; flex: 1; padding: 3px 5px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border, #555); }
  textarea.arg-control { min-height: 50px; resize: vertical; }
  .flow-arrow { text-align: center; opacity: .35; line-height: 10px; font-size: 10px; }

  .graph-view { height: 100%; position: relative; }
  .graph-scroll { width: 100%; height: 100%; overflow: auto; background-color: var(--vscode-editor-background); background-image: radial-gradient(var(--vscode-panel-border) 1px, transparent 1px); background-size: 18px 18px; }
  .graph-canvas { position: relative; min-height: 300px; height: 100%; }
  .edge-layer, .node-layer { position: absolute; inset: 0; }
  .edge-layer { overflow: visible; pointer-events: none; }
  .graph-edge { fill: none; stroke: var(--vscode-editorInfo-foreground, #3794ff); stroke-width: 2; opacity: .72; }
  .graph-node { position: absolute; width: 200px; min-height: 92px; border: 1px solid var(--vscode-panel-border); border-radius: 6px; background: var(--vscode-sideBar-background); box-shadow: 0 3px 12px rgba(0, 0, 0, .22); padding: 9px 11px; }
  .graph-node.operation { cursor: grab; }
  .graph-node.endpoint { width: 174px; border-color: var(--vscode-focusBorder); }
  .graph-node.failed { border-color: var(--vscode-errorForeground); box-shadow: 0 0 0 1px var(--vscode-errorForeground); }
  .graph-title { font-weight: 650; font-size: 12px; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .graph-meta { display: flex; align-items: center; gap: 5px; font-size: 9px; opacity: .68; }
  .graph-meta .arrow { opacity: .55; }
  .graph-actions { display: flex; justify-content: flex-end; margin-top: 6px; gap: 3px; }
  .endpoint-label { font-size: 10px; opacity: .62; margin-bottom: 5px; }
  .endpoint-select { width: 100%; padding: 3px; background: var(--vscode-dropdown-background); color: var(--vscode-dropdown-foreground); border: 1px solid var(--vscode-dropdown-border, #555); }
  .port { position: absolute; width: 13px; height: 13px; top: 42px; border: 2px solid var(--vscode-editorInfo-foreground, #3794ff); border-radius: 50%; background: var(--vscode-editor-background); }
  .port.input { left: -7px; }
  .port.output { right: -7px; }
  .graph-help { position: sticky; left: 10px; top: 8px; z-index: 3; display: inline-block; margin: 8px; padding: 3px 7px; background: var(--vscode-editorWidget-background); border: 1px solid var(--vscode-widget-border); opacity: .75; font-size: 10px; pointer-events: none; }

  .pipe-row { border-top: 1px solid var(--vscode-panel-border); padding: 5px 7px; flex-shrink: 0; display: grid; grid-template-columns: 1fr auto; gap: 5px; align-items: stretch; }
  .pipe-text { height: 48px; resize: none; padding: 4px 6px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border, #555); font-family: var(--vscode-editor-font-family); font-size: 11px; }
  .parse-state { width: 22px; display: flex; justify-content: center; align-items: center; opacity: .62; }

  .io-zone { height: 190px; flex-shrink: 0; display: flex; border-top: 1px solid var(--vscode-panel-border); }
  .io-pane { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .io-pane + .io-pane { border-left: 1px solid var(--vscode-panel-border); }
  .io-header { min-height: 30px; padding: 3px 8px; display: flex; gap: 7px; align-items: center; background: var(--vscode-sideBar-background); border-bottom: 1px solid var(--vscode-panel-border); font-size: 11px; }
  .io-header label { white-space: nowrap; }
  .io-header select { min-width: 130px; max-width: 210px; padding: 2px 4px; background: var(--vscode-dropdown-background); color: var(--vscode-dropdown-foreground); border: 1px solid var(--vscode-dropdown-border, #555); }
  .io-stats { margin-left: auto; opacity: .6; font-size: 10px; }
  .io-text { flex: 1; min-height: 0; resize: none; border: 0; padding: 7px; background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); font-family: var(--vscode-editor-font-family); font-size: 11px; }
  .io-text[readonly] { opacity: .82; }
  .error { min-height: 0; color: var(--vscode-errorForeground); padding: 0 8px; font-size: 11px; flex-shrink: 0; }
  .error:not(:empty) { padding-top: 4px; padding-bottom: 4px; border-top: 1px solid var(--vscode-panel-border); }
  .status { min-height: 21px; padding: 3px 8px; font-size: 10px; background: var(--vscode-statusBar-background, #007acc); color: var(--vscode-statusBar-foreground, #fff); display: flex; gap: 12px; align-items: center; flex-shrink: 0; }

  @media (max-width: 720px) {
    .palette { width: 180px; }
    .io-zone { height: 230px; flex-direction: column; }
    .io-pane + .io-pane { border-left: 0; border-top: 1px solid var(--vscode-panel-border); }
  }
</style>
</head>
<body>
  <header class="header">
    <strong class="brand">ts-chef</strong>
    <input id="pipeName" class="header-input" aria-label="Pipeline name" placeholder="Pipeline name…">
    <input id="pipeDescription" class="header-input" aria-label="Pipeline description" placeholder="Description (optional)">
    <button id="saveButton" class="button" type="button">Save</button>
    <button id="runButton" class="button" type="button">▶ Run</button>
    <button id="liveButton" class="button live" type="button">⚡ Live</button>
    <div class="mode-group" role="group" aria-label="Pipeline editor view">
      <button id="listModeButton" class="mode-button active" type="button" aria-pressed="true">List</button>
      <button id="graphModeButton" class="mode-button" type="button" aria-pressed="false">Graph</button>
    </div>
  </header>

  <main class="main">
    <aside class="palette">
      <input id="operationSearch" class="palette-search" aria-label="Filter operations" placeholder="Filter operations…">
      <div id="operationList" class="ops-list" aria-label="Operations"></div>
    </aside>
    <section class="workspace">
      <div id="listView" class="view list-view">
        <div id="pipelineZone" class="pipeline-zone" aria-label="Pipeline steps"></div>
      </div>
      <div id="graphView" class="view graph-view hidden">
        <div id="graphScroll" class="graph-scroll" aria-label="Pipeline graph">
          <span class="graph-help">Drop operations here; drag operation nodes to reorder.</span>
          <div id="graphCanvas" class="graph-canvas">
            <svg id="edgeLayer" class="edge-layer" aria-hidden="true"></svg>
            <div id="nodeLayer" class="node-layer"></div>
          </div>
        </div>
      </div>
      <div class="pipe-row">
        <textarea id="pipeText" class="pipe-text" aria-label="Pipeline text syntax" placeholder="From Base64 | To Hex | …"></textarea>
        <span id="parseState" class="parse-state" title="Pipeline text status">✓</span>
      </div>
    </section>
  </main>

  <section class="io-zone">
    <div class="io-pane">
      <div class="io-header">
        <label for="inputSource">Input</label>
        <select id="inputSource">
          <option value="manual">Manual text</option>
          <option value="selection">Editor selection (or document)</option>
          <option value="document">Active document</option>
          <option value="clipboard">Clipboard</option>
        </select>
        <span id="inputStats" class="io-stats"></span>
      </div>
      <textarea id="inputArea" class="io-text" spellcheck="false" placeholder="Input data…"></textarea>
    </div>
    <div class="io-pane">
      <div class="io-header">
        <label for="outputTarget">Output</label>
        <select id="outputTarget">
          <option value="preview">Preview only</option>
          <option value="clipboard">Copy to clipboard</option>
          <option value="replaceSelection">Replace selection/document</option>
          <option value="newDocument">Open in new editor</option>
        </select>
        <span id="outputStats" class="io-stats"></span>
      </div>
      <textarea id="outputArea" class="io-text" readonly spellcheck="false" placeholder="Output preview…"></textarea>
    </div>
  </section>
  <div id="errorMessage" class="error" role="alert"></div>
  <footer class="status"><span id="statusText">Starting…</span><span id="statusDetail"></span></footer>

<script nonce="${nonce}">
(function () {
  'use strict';
  const vscode = acquireVsCodeApi();
  const restored = vscode.getState() || {};
  const OP_TRANSFER = 'application/x-tschef-operation';
  const STEP_TRANSFER = 'application/x-tschef-step';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const ENDPOINT_WIDTH = 174;
  const OPERATION_WIDTH = 200;
  const NODE_GAP = 76;
  const NODE_TOP = 70;
  let allOps = [];
  let opMap = new Map();
  let steps = [];
  let mode = restored.mode === 'graph' ? 'graph' : 'list';
  let inputSource = ['manual', 'selection', 'document', 'clipboard'].includes(restored.inputSource) ? restored.inputSource : 'manual';
  let outputTarget = ['preview', 'clipboard', 'replaceSelection', 'newDocument'].includes(restored.outputTarget) ? restored.outputTarget : 'preview';
  let liveMode = true;
  let runSequence = 0;
  let latestRunRequest = -1;
  let parseSequence = 0;
  let latestParseRequest = -1;
  let parseTimer = null;
  let liveTimer = null;
  let failedStepId = null;
  let idSequence = 0;
  let liveInputLimit = 256 * 1024;
  let pipelineTextReady = true;

  const pipeName = document.getElementById('pipeName');
  const pipeDescription = document.getElementById('pipeDescription');
  const saveButton = document.getElementById('saveButton');
  const runButton = document.getElementById('runButton');
  const liveButton = document.getElementById('liveButton');
  const listModeButton = document.getElementById('listModeButton');
  const graphModeButton = document.getElementById('graphModeButton');
  const operationSearch = document.getElementById('operationSearch');
  const operationList = document.getElementById('operationList');
  const listView = document.getElementById('listView');
  const graphView = document.getElementById('graphView');
  const pipelineZone = document.getElementById('pipelineZone');
  const graphScroll = document.getElementById('graphScroll');
  const graphCanvas = document.getElementById('graphCanvas');
  const edgeLayer = document.getElementById('edgeLayer');
  const nodeLayer = document.getElementById('nodeLayer');
  const pipeText = document.getElementById('pipeText');
  const parseState = document.getElementById('parseState');
  const inputSourceSelect = document.getElementById('inputSource');
  const outputTargetSelect = document.getElementById('outputTarget');
  const inputArea = document.getElementById('inputArea');
  const outputArea = document.getElementById('outputArea');
  const inputStats = document.getElementById('inputStats');
  const outputStats = document.getElementById('outputStats');
  const errorMessage = document.getElementById('errorMessage');
  const statusText = document.getElementById('statusText');
  const statusDetail = document.getElementById('statusDetail');

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);
    return element;
  }

  function makeButton(text, action, stepId, title) {
    const button = makeElement('button', 'icon-button', text);
    button.type = 'button';
    button.dataset.action = action;
    if (stepId) button.dataset.stepId = stepId;
    if (title) button.title = title;
    return button;
  }

  function newStepId() {
    idSequence += 1;
    return 'web-' + Date.now().toString(36) + '-' + idSequence.toString(36);
  }

  function descriptorFor(opName) {
    return opMap.get(opName);
  }

  function displayNameFor(opName) {
    const descriptor = descriptorFor(opName);
    return descriptor ? descriptor.displayName : opName;
  }

  function wireSteps() {
    return steps.map(function (step) {
      return { id: step.id, opName: step.opName, args: step.args };
    });
  }

  function invalidStep() {
    return steps.find(function (step) { return !descriptorFor(step.opName); });
  }

  function setStatus(text, detail) {
    statusText.textContent = text;
    statusDetail.textContent = detail || '';
  }

  function setError(text) {
    errorMessage.textContent = text || '';
  }

  function persistViewState() {
    vscode.setState({ mode: mode, inputSource: inputSource, outputTarget: outputTarget });
  }

  function invalidateRuns(notifyHost) {
    clearTimeout(liveTimer);
    runSequence += 1;
    latestRunRequest = runSequence;
    if (notifyHost !== false) vscode.postMessage({ type: 'invalidateRuns' });
  }

  function updateStats() {
    inputStats.textContent = inputArea.value.length ? inputArea.value.length + ' chars' : '';
    outputStats.textContent = outputArea.value.length ? outputArea.value.length + ' chars' : '';
  }

  function pipelineHasUnsafeLiveOperation() {
    return steps.some(function (step) {
      const descriptor = descriptorFor(step.opName);
      return !descriptor || !descriptor.liveSafe;
    });
  }

  function liveBlockReason() {
    if (inputSource !== 'manual') return 'Live preview requires manual input.';
    if (outputTarget !== 'preview') return 'Live preview never performs output side effects.';
    if (inputArea.value.length > liveInputLimit) return 'Manual input is too large for live preview; use Run.';
    if (pipelineHasUnsafeLiveOperation()) return 'This pipeline contains an operation that requires explicit Run.';
    if (invalidStep()) return 'This pipeline contains an unavailable operation.';
    return '';
  }

  function updateLiveButton() {
    const reason = liveBlockReason();
    liveButton.disabled = Boolean(reason);
    liveButton.classList.toggle('active', liveMode && !reason);
    liveButton.title = reason || (liveMode ? 'Live preview is on' : 'Live preview is off');
    runButton.disabled = Boolean(invalidStep()) || !pipelineTextReady;
    saveButton.disabled = Boolean(invalidStep()) || !pipelineTextReady;
  }

  function setMode(nextMode) {
    mode = nextMode === 'graph' ? 'graph' : 'list';
    const graph = mode === 'graph';
    listView.classList.toggle('hidden', graph);
    graphView.classList.toggle('hidden', !graph);
    listModeButton.classList.toggle('active', !graph);
    graphModeButton.classList.toggle('active', graph);
    listModeButton.setAttribute('aria-pressed', graph ? 'false' : 'true');
    graphModeButton.setAttribute('aria-pressed', graph ? 'true' : 'false');
    if (graph) renderGraph();
    persistViewState();
  }

  function encodePanelArgs(args) {
    const bytes = new TextEncoder().encode(JSON.stringify(args));
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 32768) {
      binary += String.fromCharCode.apply(null, bytes.subarray(offset, offset + 32768));
    }
    return btoa(binary).split('+').join('-').split('/').join('_').replace(/=+$/g, '');
  }

  function invalidateParseRequests() {
    clearTimeout(parseTimer);
    parseSequence += 1;
    latestParseRequest = parseSequence;
  }

  function updateRawSummary() {
    invalidateParseRequests();
    pipeText.value = steps.map(function (step) {
      const name = displayNameFor(step.opName);
      return step.args.length ? name + '(__tschef_args=' + encodePanelArgs(step.args) + ')' : name;
    }).join(' | ');
    parseState.textContent = '✓';
    parseState.title = 'Visual steps and pipeline text are synchronized';
    pipelineTextReady = true;
    updateLiveButton();
  }

  function loadPipeline(pipeline) {
    invalidateParseRequests();
    invalidateRuns(false);
    const source = pipeline || {};
    pipeName.value = typeof source.name === 'string' ? source.name : '';
    pipeDescription.value = typeof source.description === 'string' ? source.description : '';
    steps = Array.isArray(source.steps) ? source.steps.map(function (step) {
      return {
        id: typeof step.id === 'string' && step.id ? step.id : newStepId(),
        opName: String(step.opName || ''),
        args: Array.isArray(step.args) ? step.args : [],
        expanded: false
      };
    }) : [];
    pipeText.value = typeof source.raw === 'string' && source.raw ? source.raw : steps.map(function (step) { return displayNameFor(step.opName); }).join(' | ');
    pipelineTextReady = true;
    outputArea.value = '';
    failedStepId = null;
    const missing = invalidStep();
    setError(missing ? 'Unavailable operation in pipeline: ' + missing.opName : '');
    setStatus('Ready', steps.length + ' step' + (steps.length === 1 ? '' : 's'));
    renderAll();
  }

  function renderAll() {
    renderSteps();
    if (mode === 'graph') renderGraph();
    updateLiveButton();
    updateStats();
  }

  function renderOperationList() {
    const query = operationSearch.value.trim().toLowerCase();
    operationList.textContent = '';
    const groups = new Map();
    allOps.forEach(function (operation) {
      if (query && !operation.displayName.toLowerCase().includes(query) && !operation.opName.toLowerCase().includes(query) && !operation.module.toLowerCase().includes(query)) return;
      if (!groups.has(operation.module)) groups.set(operation.module, []);
      groups.get(operation.module).push(operation);
    });
    Array.from(groups.keys()).sort().forEach(function (moduleName) {
      operationList.appendChild(makeElement('div', 'op-group', moduleName));
      groups.get(moduleName).sort(function (a, b) { return a.displayName.localeCompare(b.displayName); }).forEach(function (operation) {
        const item = makeElement('div', 'op-item');
        item.draggable = true;
        item.dataset.opName = operation.opName;
        item.title = 'Drag into the pipeline or double-click to append';
        item.appendChild(makeElement('span', '', operation.displayName));
        item.appendChild(makeElement('span', 'op-type', operation.inputType + ' → ' + operation.outputType));
        item.addEventListener('dragstart', function (event) {
          event.dataTransfer.setData(OP_TRANSFER, operation.opName);
          event.dataTransfer.effectAllowed = 'copy';
        });
        item.addEventListener('dblclick', function () { addOperation(operation.opName, steps.length); });
        operationList.appendChild(item);
      });
    });
    if (!operationList.childNodes.length) operationList.appendChild(makeElement('div', 'empty', 'No matching operations.'));
  }

  function renderSteps() {
    pipelineZone.textContent = '';
    if (!steps.length) {
      pipelineZone.appendChild(makeElement('div', 'empty', 'Drag operations here or edit the pipeline syntax below.'));
      return;
    }
    steps.forEach(function (step, index) {
      if (index > 0) pipelineZone.appendChild(makeElement('div', 'flow-arrow', '▼'));
      const descriptor = descriptorFor(step.opName);
      const card = makeElement('article', 'step-card');
      card.draggable = true;
      card.dataset.stepId = step.id;
      const head = makeElement('div', 'step-head');
      head.appendChild(makeElement('span', 'step-index', String(index + 1)));
      head.appendChild(makeElement('span', 'step-title', descriptor ? descriptor.displayName : step.opName));
      if (descriptor) {
        head.appendChild(makeElement('span', 'type-badge', descriptor.inputType + ' → ' + descriptor.outputType));
        if (!descriptor.liveSafe) {
          const warning = makeElement('span', 'warning-badge', 'explicit');
          warning.title = 'This operation only runs after an explicit click on Run';
          head.appendChild(warning);
        }
      } else {
        head.appendChild(makeElement('span', 'warning-badge', 'unavailable'));
      }
      if (descriptor && descriptor.args.length) head.appendChild(makeButton(step.expanded ? '▴' : '▾', 'toggle', step.id, 'Edit arguments'));
      head.appendChild(makeButton('✕', 'remove', step.id, 'Remove operation'));
      card.appendChild(head);
      if (step.expanded && descriptor && descriptor.args.length) card.appendChild(renderArgumentEditors(step, descriptor.args));
      card.addEventListener('dragstart', function (event) {
        card.classList.add('dragging');
        event.dataTransfer.setData(STEP_TRANSFER, step.id);
        event.dataTransfer.effectAllowed = 'move';
      });
      card.addEventListener('dragend', function () { card.classList.remove('dragging'); });
      card.addEventListener('dragover', function (event) { event.preventDefault(); });
      card.addEventListener('drop', function (event) {
        event.preventDefault();
        event.stopPropagation();
        handleDrop(event, index);
      });
      pipelineZone.appendChild(card);
    });
  }

  function renderArgumentEditors(step, definitions) {
    const container = makeElement('div', 'step-args');
    container.dataset.stepId = step.id;
    definitions.forEach(function (definition, argumentIndex) {
      const row = makeElement('label', 'arg-row');
      const label = makeElement('span', 'arg-label', definition.name || ('Argument ' + (argumentIndex + 1)));
      if (definition.hint) label.title = definition.hint;
      row.appendChild(label);
      const value = step.args[argumentIndex];
      if (definition.type === 'label') {
        row.className = 'arg-section';
        row.textContent = definition.name || '';
        container.appendChild(row);
        return;
      } else if (definition.type === 'populateOption' || definition.type === 'populateMultiOption') {
        const select = makeElement('select', 'arg-control');
        const targets = Array.isArray(definition.target) ? definition.target : [definition.target];
        const targetValue = definition.type === 'populateMultiOption'
          ? targets.map(function (targetIndex) { return step.args[targetIndex]; })
          : step.args[targets[0]];
        (Array.isArray(definition.value) ? definition.value : []).forEach(function (optionValue, optionIndex) {
          const option = makeElement('option', '', String(optionValue.name));
          option.value = String(optionIndex);
          try {
            option.selected = JSON.stringify(optionValue.value) === JSON.stringify(targetValue) || JSON.stringify(optionValue.value) === JSON.stringify(value);
          } catch (_) { option.selected = false; }
          select.appendChild(option);
        });
        configureArgControl(select, step.id, argumentIndex, definition.type);
        row.appendChild(select);
      } else if (definition.type === 'boolean') {
        const input = makeElement('input', '');
        input.type = 'checkbox';
        input.checked = Boolean(value);
        configureArgControl(input, step.id, argumentIndex, 'boolean');
        row.appendChild(input);
      } else if (definition.type === 'number') {
        const input = makeElement('input', 'arg-control');
        input.type = 'number';
        input.value = value === undefined || value === null ? '' : String(value);
        if (definition.min !== undefined) input.min = String(definition.min);
        if (definition.max !== undefined) input.max = String(definition.max);
        if (definition.step !== undefined) input.step = String(definition.step);
        configureArgControl(input, step.id, argumentIndex, 'number');
        row.appendChild(input);
      } else if (definition.type === 'option') {
        const select = makeElement('select', 'arg-control');
        (Array.isArray(definition.value) ? definition.value : []).forEach(function (optionValue) {
          const option = makeElement('option', '', String(optionValue));
          option.value = String(optionValue);
          option.selected = String(value) === String(optionValue);
          select.appendChild(option);
        });
        configureArgControl(select, step.id, argumentIndex, 'option');
        row.appendChild(select);
      } else if (definition.type === 'editableOption' || definition.type === 'editableOptionShort') {
        const select = makeElement('select', 'arg-control');
        (Array.isArray(definition.value) ? definition.value : []).forEach(function (optionValue, optionIndex) {
          const option = makeElement('option', '', String(optionValue.name));
          option.value = String(optionIndex);
          try { option.selected = JSON.stringify(value) === JSON.stringify(optionValue.value); } catch (_) { option.selected = false; }
          select.appendChild(option);
        });
        configureArgControl(select, step.id, argumentIndex, 'editableOption');
        row.appendChild(select);
      } else if (definition.type === 'argSelector') {
        const select = makeElement('select', 'arg-control');
        (Array.isArray(definition.value) ? definition.value : []).forEach(function (optionValue) {
          const option = makeElement('option', '', String(optionValue.name));
          option.value = String(optionValue.name);
          option.selected = String(value) === String(optionValue.name);
          select.appendChild(option);
        });
        configureArgControl(select, step.id, argumentIndex, 'argSelector');
        row.appendChild(select);
      } else if (definition.type === 'toggleString') {
        const objectValue = value && typeof value === 'object' ? value : { string: typeof value === 'string' ? value : '', option: '' };
        const input = makeElement('input', 'arg-control');
        input.type = 'text';
        input.value = String(objectValue.string || '');
        configureArgControl(input, step.id, argumentIndex, 'toggleString');
        input.dataset.subfield = 'string';
        row.appendChild(input);
        const select = makeElement('select', 'arg-control');
        (Array.isArray(definition.toggleValues) ? definition.toggleValues : ['Hex']).forEach(function (toggleValue) {
          const option = makeElement('option', '', String(toggleValue));
          option.value = String(toggleValue);
          option.selected = String(objectValue.option || '') === String(toggleValue);
          select.appendChild(option);
        });
        configureArgControl(select, step.id, argumentIndex, 'toggleString');
        select.dataset.subfield = 'option';
        row.appendChild(select);
      } else {
        const input = makeElement(definition.rows && definition.rows > 1 ? 'textarea' : 'input', 'arg-control');
        if (input.tagName === 'INPUT') input.type = 'text';
        input.value = value === undefined || value === null ? '' : String(value);
        configureArgControl(input, step.id, argumentIndex, 'string');
        row.appendChild(input);
      }
      container.appendChild(row);
    });
    return container;
  }

  function configureArgControl(control, stepId, argumentIndex, argumentType) {
    control.dataset.stepId = stepId;
    control.dataset.argumentIndex = String(argumentIndex);
    control.dataset.argumentType = argumentType;
  }

  function updateArgument(target) {
    const stepId = target.dataset.stepId;
    const argumentIndex = Number(target.dataset.argumentIndex);
    const step = steps.find(function (candidate) { return candidate.id === stepId; });
    const descriptor = step && descriptorFor(step.opName);
    const definition = descriptor && descriptor.args[argumentIndex];
    if (!step || !definition || !Number.isInteger(argumentIndex)) return;
    const type = target.dataset.argumentType;
    let rerender = false;
    if (type === 'boolean') step.args[argumentIndex] = target.checked;
    else if (type === 'number') step.args[argumentIndex] = Number(target.value);
    else if (type === 'populateOption' || type === 'populateMultiOption') {
      const options = Array.isArray(definition.value) ? definition.value : [];
      const option = options[Number(target.value)];
      if (!option) return;
      step.args[argumentIndex] = option.value;
      const targets = Array.isArray(definition.target) ? definition.target : [definition.target];
      if (type === 'populateMultiOption' && Array.isArray(option.value)) {
        targets.forEach(function (targetIndex, targetOffset) { step.args[targetIndex] = option.value[targetOffset]; });
      } else if (targets[0] !== undefined) step.args[targets[0]] = option.value;
      rerender = true;
    }
    else if (type === 'editableOption') {
      const options = Array.isArray(definition.value) ? definition.value : [];
      const option = options[Number(target.value)];
      step.args[argumentIndex] = option ? option.value : target.value;
    } else if (type === 'toggleString') {
      const old = step.args[argumentIndex];
      const next = old && typeof old === 'object' ? Object.assign({}, old) : { string: '', option: (definition.toggleValues || ['Hex'])[0] };
      next[target.dataset.subfield] = target.value;
      step.args[argumentIndex] = next;
    } else step.args[argumentIndex] = target.value;
    invalidateRuns();
    updateRawSummary();
    if (rerender) renderSteps();
    scheduleLiveRun();
  }

  function graphEndpoint(kind, x) {
    const isInput = kind === 'input';
    const node = makeElement('section', 'graph-node endpoint');
    node.style.transform = 'translate(' + x + 'px,' + NODE_TOP + 'px)';
    node.appendChild(makeElement('div', 'graph-title', isInput ? 'Input' : 'Output'));
    node.appendChild(makeElement('div', 'endpoint-label', isInput ? 'Data source' : 'Result target'));
    const select = makeElement('select', 'endpoint-select');
    select.dataset.endpoint = kind;
    const definitions = isInput ? [
      ['manual', 'Manual text'], ['selection', 'Editor selection / document'], ['document', 'Active document'], ['clipboard', 'Clipboard']
    ] : [
      ['preview', 'Preview only'], ['clipboard', 'Clipboard'], ['replaceSelection', 'Replace selection / document'], ['newDocument', 'New editor']
    ];
    definitions.forEach(function (definition) {
      const option = makeElement('option', '', definition[1]);
      option.value = definition[0];
      option.selected = definition[0] === (isInput ? inputSource : outputTarget);
      select.appendChild(option);
    });
    node.appendChild(select);
    const port = makeElement('span', 'port ' + (isInput ? 'output' : 'input'));
    port.title = isInput ? 'Pipeline data output' : 'Pipeline result input';
    node.appendChild(port);
    return node;
  }

  function graphOperation(step, index, x) {
    const descriptor = descriptorFor(step.opName);
    const node = makeElement('article', 'graph-node operation' + (step.id === failedStepId ? ' failed' : ''));
    node.draggable = true;
    node.dataset.stepId = step.id;
    node.style.transform = 'translate(' + x + 'px,' + NODE_TOP + 'px)';
    node.appendChild(makeElement('span', 'port input'));
    node.appendChild(makeElement('span', 'port output'));
    node.appendChild(makeElement('div', 'graph-title', (index + 1) + '. ' + (descriptor ? descriptor.displayName : step.opName)));
    const meta = makeElement('div', 'graph-meta');
    meta.appendChild(makeElement('span', '', descriptor ? descriptor.inputType : '?'));
    meta.appendChild(makeElement('span', 'arrow', '→'));
    meta.appendChild(makeElement('span', '', descriptor ? descriptor.outputType : '?'));
    if (descriptor && !descriptor.liveSafe) meta.appendChild(makeElement('span', 'warning-badge', 'explicit'));
    node.appendChild(meta);
    const actions = makeElement('div', 'graph-actions');
    actions.appendChild(makeButton('Edit', 'edit', step.id, 'Edit arguments in list view'));
    actions.appendChild(makeButton('✕', 'remove', step.id, 'Remove operation'));
    node.appendChild(actions);
    node.addEventListener('dragstart', function (event) {
      node.classList.add('dragging');
      event.dataTransfer.setData(STEP_TRANSFER, step.id);
      event.dataTransfer.effectAllowed = 'move';
    });
    node.addEventListener('dragend', function () { node.classList.remove('dragging'); });
    return node;
  }

  function renderGraph() {
    nodeLayer.textContent = '';
    edgeLayer.textContent = '';
    const inputX = 30;
    const firstOperationX = inputX + ENDPOINT_WIDTH + NODE_GAP;
    const operationStride = OPERATION_WIDTH + NODE_GAP;
    const outputX = firstOperationX + steps.length * operationStride;
    const canvasWidth = Math.max(graphScroll.clientWidth || 700, outputX + ENDPOINT_WIDTH + 70);
    const canvasHeight = Math.max(graphScroll.clientHeight || 300, 300);
    graphCanvas.style.width = canvasWidth + 'px';
    graphCanvas.style.height = canvasHeight + 'px';
    edgeLayer.setAttribute('width', String(canvasWidth));
    edgeLayer.setAttribute('height', String(canvasHeight));
    nodeLayer.appendChild(graphEndpoint('input', inputX));
    steps.forEach(function (step, index) {
      nodeLayer.appendChild(graphOperation(step, index, firstOperationX + index * operationStride));
    });
    nodeLayer.appendChild(graphEndpoint('output', outputX));
    const centers = [{ x1: inputX + ENDPOINT_WIDTH, x2: steps.length ? firstOperationX : outputX }];
    for (let index = 0; index < steps.length; index++) {
      const fromX = firstOperationX + index * operationStride + OPERATION_WIDTH;
      const toX = index + 1 < steps.length ? firstOperationX + (index + 1) * operationStride : outputX;
      centers.push({ x1: fromX, x2: toX });
    }
    centers.forEach(function (edge) {
      const path = document.createElementNS(SVG_NS, 'path');
      const y = NODE_TOP + 48;
      const curve = Math.max(28, (edge.x2 - edge.x1) * .46);
      path.setAttribute('class', 'graph-edge');
      path.setAttribute('d', 'M ' + edge.x1 + ' ' + y + ' C ' + (edge.x1 + curve) + ' ' + y + ', ' + (edge.x2 - curve) + ' ' + y + ', ' + edge.x2 + ' ' + y);
      edgeLayer.appendChild(path);
    });
  }

  function addOperation(opName, index) {
    const descriptor = descriptorFor(opName);
    if (!descriptor) return;
    const insertAt = Math.max(0, Math.min(steps.length, index));
    steps.splice(insertAt, 0, { id: newStepId(), opName: opName, args: descriptor.defaults.slice(), expanded: false });
    changedVisually();
  }

  function moveStep(stepId, index) {
    const oldIndex = steps.findIndex(function (step) { return step.id === stepId; });
    if (oldIndex < 0) return;
    const moved = steps.splice(oldIndex, 1)[0];
    let insertAt = index;
    if (oldIndex < insertAt) insertAt -= 1;
    insertAt = Math.max(0, Math.min(steps.length, insertAt));
    steps.splice(insertAt, 0, moved);
    changedVisually();
  }

  function removeStep(stepId) {
    const index = steps.findIndex(function (step) { return step.id === stepId; });
    if (index < 0) return;
    steps.splice(index, 1);
    changedVisually();
  }

  function handleDrop(event, index) {
    const operation = event.dataTransfer.getData(OP_TRANSFER);
    const stepId = event.dataTransfer.getData(STEP_TRANSFER);
    if (operation) addOperation(operation, index);
    else if (stepId) moveStep(stepId, index);
  }

  function changedVisually() {
    invalidateRuns();
    failedStepId = null;
    updateRawSummary();
    renderAll();
    scheduleLiveRun();
  }

  function scheduleLiveRun() {
    clearTimeout(liveTimer);
    if (!liveMode || liveBlockReason()) return;
    liveTimer = setTimeout(function () { requestRun(false); }, 380);
  }

  function requestRun(explicit) {
    clearTimeout(liveTimer);
    if (!pipelineTextReady) {
      setError('Wait for valid pipeline text before running.');
      return;
    }
    const missing = invalidStep();
    if (missing) {
      setError('Unavailable operation in pipeline: ' + missing.opName);
      return;
    }
    if (!explicit && liveBlockReason()) return;
    runSequence += 1;
    latestRunRequest = runSequence;
    failedStepId = null;
    setError('');
    setStatus('Running…', explicit ? 'explicit run' : 'live preview');
    vscode.postMessage({
      type: 'run',
      requestId: latestRunRequest,
      explicit: Boolean(explicit),
      steps: wireSteps(),
      inputSource: inputSource,
      outputTarget: explicit ? outputTarget : 'preview',
      manualInput: inputArea.value
    });
  }

  function requestParse(requestId, raw, previousSteps) {
    if (requestId !== latestParseRequest) return;
    parseState.textContent = '…';
    parseState.title = 'Parsing pipeline text in extension host';
    vscode.postMessage({ type: 'parseRaw', requestId: requestId, raw: raw, previousSteps: previousSteps });
  }

  function onMessage(message) {
    if (!message || typeof message.type !== 'string') return;
    if (message.type === 'init') {
      allOps = Array.isArray(message.ops) ? message.ops : [];
      if (message.mode === 'graph' || message.mode === 'list') mode = message.mode;
      if (message.limits && Number.isSafeInteger(message.limits.liveInput) && message.limits.liveInput > 0) liveInputLimit = message.limits.liveInput;
      opMap = new Map(allOps.map(function (operation) { return [operation.opName, operation]; }));
      renderOperationList();
      loadPipeline(message.pipeline);
      inputSourceSelect.value = inputSource;
      outputTargetSelect.value = outputTarget;
      updateInputMode();
      setMode(mode);
      return;
    }
    if (message.type === 'setMode') {
      if (message.mode === 'graph' || message.mode === 'list') setMode(message.mode);
      return;
    }
    if (message.type === 'setPipeline') {
      loadPipeline(message.pipeline);
      return;
    }
    if (message.type === 'parsed') {
      if (message.requestId !== latestParseRequest) return;
      pipelineTextReady = true;
      steps = Array.isArray(message.steps) ? message.steps.map(function (step) {
        return { id: step.id, opName: step.opName, args: step.args, expanded: false };
      }) : steps;
      updateRawSummary();
      parseState.textContent = '✓';
      parseState.title = 'Pipeline text parsed successfully';
      setError('');
      renderAll();
      scheduleLiveRun();
      return;
    }
    if (message.type === 'parseError') {
      if (message.requestId !== latestParseRequest) return;
      pipelineTextReady = false;
      parseState.textContent = '!';
      parseState.title = String(message.value || 'Pipeline parse error');
      setError(String(message.value || 'Pipeline parse error'));
      updateLiveButton();
      return;
    }
    if (message.type === 'result') {
      if (message.requestId !== latestRunRequest) return;
      if (inputSource !== 'manual' && typeof message.inputValue === 'string') inputArea.value = message.inputValue;
      outputArea.value = typeof message.preview === 'string' ? message.preview : '';
      failedStepId = null;
      setError('');
      setStatus('Done', message.outputApplied ? 'output delivered' : 'preview ready');
      updateStats();
      if (Number.isSafeInteger(message.inputLength) && message.inputLength >= 0) inputStats.textContent = message.inputLength.toLocaleString() + ' chars' + (message.inputTruncated ? ' · preview' : '');
      if (Number.isSafeInteger(message.totalLength) && message.totalLength >= 0) outputStats.textContent = message.totalLength.toLocaleString() + ' chars' + (message.truncated ? ' · preview' : '');
      if (mode === 'graph') renderGraph();
      return;
    }
    if (message.type === 'outputApplied') {
      if (message.requestId !== latestRunRequest) return;
      setStatus('Done', String(message.detail || 'output delivered'));
      return;
    }
    if (message.type === 'outputError') {
      if (message.requestId !== latestRunRequest) return;
      setError(String(message.value || 'The output could not be delivered.'));
      setStatus('Preview ready', 'output action failed');
      return;
    }
    if (message.type === 'error') {
      if (message.requestId !== latestRunRequest) return;
      failedStepId = message.stepId || null;
      setError(String(message.value || 'Pipeline failed.'));
      setStatus('Error', 'pipeline run failed');
      if (mode === 'graph') renderGraph();
      return;
    }
    if (message.type === 'liveBlocked') {
      if (message.requestId !== latestRunRequest) return;
      setStatus('Live preview paused', String(message.value || 'Run explicitly.'));
      updateLiveButton();
      return;
    }
    if (message.type === 'protocolError') {
      if (message.requestId !== undefined && message.requestId !== latestRunRequest && message.requestId !== latestParseRequest) return;
      setError(String(message.value || 'Invalid pipeline editor request.'));
      return;
    }
    if (message.type === 'saved') setStatus('Saved', String(message.value || ''));
    if (message.type === 'saveFailed') {
      setError(String(message.value || 'Pipeline was not saved.'));
      setStatus('Not saved', 'choose an available storage scope');
    }
  }

  function updateInputMode() {
    inputArea.readOnly = inputSource !== 'manual';
    inputArea.placeholder = inputSource === 'manual' ? 'Input data…' : 'Press Run to load ' + inputSource + ' input…';
    updateLiveButton();
  }

  window.addEventListener('message', function (event) { onMessage(event.data); });
  window.addEventListener('resize', function () { if (mode === 'graph') renderGraph(); });
  operationSearch.addEventListener('input', renderOperationList);
  listModeButton.addEventListener('click', function () { setMode('list'); });
  graphModeButton.addEventListener('click', function () { setMode('graph'); });
  liveButton.addEventListener('click', function () {
    if (liveBlockReason()) return;
    liveMode = !liveMode;
    updateLiveButton();
    if (liveMode) scheduleLiveRun();
  });
  runButton.addEventListener('click', function () { requestRun(true); });
  saveButton.addEventListener('click', function () {
    if (!pipelineTextReady) {
      setError('Wait for valid pipeline text before saving.');
      return;
    }
    vscode.postMessage({ type: 'save', name: pipeName.value, description: pipeDescription.value, raw: pipeText.value, steps: wireSteps() });
  });
  inputSourceSelect.addEventListener('change', function () {
    invalidateRuns();
    inputSource = inputSourceSelect.value;
    updateInputMode();
    persistViewState();
    if (mode === 'graph') renderGraph();
    scheduleLiveRun();
  });
  outputTargetSelect.addEventListener('change', function () {
    invalidateRuns();
    outputTarget = outputTargetSelect.value;
    updateLiveButton();
    persistViewState();
    if (mode === 'graph') renderGraph();
    scheduleLiveRun();
  });
  inputArea.addEventListener('input', function () { invalidateRuns(); updateStats(); updateLiveButton(); scheduleLiveRun(); });
  pipeText.addEventListener('input', function () {
    invalidateRuns();
    invalidateParseRequests();
    pipelineTextReady = false;
    parseState.textContent = '…';
    updateLiveButton();
    const requestId = latestParseRequest;
    const raw = pipeText.value;
    const previousSteps = wireSteps();
    parseTimer = setTimeout(function () { requestParse(requestId, raw, previousSteps); }, 420);
  });
  pipelineZone.addEventListener('dragover', function (event) { event.preventDefault(); pipelineZone.classList.add('dragover'); });
  pipelineZone.addEventListener('dragleave', function (event) { if (!pipelineZone.contains(event.relatedTarget)) pipelineZone.classList.remove('dragover'); });
  pipelineZone.addEventListener('drop', function (event) { event.preventDefault(); pipelineZone.classList.remove('dragover'); handleDrop(event, steps.length); });
  pipelineZone.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const stepId = button.dataset.stepId;
    if (button.dataset.action === 'remove') removeStep(stepId);
    if (button.dataset.action === 'toggle') {
      const step = steps.find(function (candidate) { return candidate.id === stepId; });
      if (step) { step.expanded = !step.expanded; renderSteps(); }
    }
  });
  pipelineZone.addEventListener('input', function (event) {
    const target = event.target;
    if (target.dataset && target.dataset.argumentType && (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && target.type !== 'checkbox'))) updateArgument(target);
  });
  pipelineZone.addEventListener('change', function (event) {
    const target = event.target;
    if (target.dataset && target.dataset.argumentType) updateArgument(target);
  });
  graphScroll.addEventListener('dragover', function (event) { event.preventDefault(); graphScroll.classList.add('dragover'); });
  graphScroll.addEventListener('dragleave', function (event) { if (!graphScroll.contains(event.relatedTarget)) graphScroll.classList.remove('dragover'); });
  graphScroll.addEventListener('drop', function (event) {
    event.preventDefault();
    graphScroll.classList.remove('dragover');
    const rect = graphCanvas.getBoundingClientRect();
    const logicalX = event.clientX - rect.left;
    const firstOperationX = 30 + ENDPOINT_WIDTH + NODE_GAP;
    const stride = OPERATION_WIDTH + NODE_GAP;
    const index = Math.max(0, Math.min(steps.length, Math.round((logicalX - firstOperationX) / stride)));
    handleDrop(event, index);
  });
  nodeLayer.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const stepId = button.dataset.stepId;
    if (button.dataset.action === 'remove') removeStep(stepId);
    if (button.dataset.action === 'edit') {
      const step = steps.find(function (candidate) { return candidate.id === stepId; });
      if (step) step.expanded = true;
      setMode('list');
      renderSteps();
      const card = pipelineZone.querySelector('[data-step-id="' + CSS.escape(stepId) + '"]');
      if (card) card.scrollIntoView({ block: 'center' });
    }
  });
  nodeLayer.addEventListener('change', function (event) {
    const select = event.target.closest('select[data-endpoint]');
    if (!select) return;
    invalidateRuns();
    if (select.dataset.endpoint === 'input') {
      inputSource = select.value;
      inputSourceSelect.value = inputSource;
      updateInputMode();
    } else {
      outputTarget = select.value;
      outputTargetSelect.value = outputTarget;
      updateLiveButton();
    }
    persistViewState();
    renderGraph();
    scheduleLiveRun();
  });

  inputSourceSelect.value = inputSource;
  outputTargetSelect.value = outputTarget;
  updateInputMode();
  setMode(mode);
  vscode.postMessage({ type: 'ready' });
})();
</script>
</body>
</html>`;
}
