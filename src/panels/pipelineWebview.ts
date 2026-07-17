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
  .graph-canvas { position: relative; min-width: 100%; min-height: 100%; width: 1200px; height: 720px; }
  .edge-layer, .node-layer { position: absolute; inset: 0; }
  .edge-layer { overflow: visible; pointer-events: none; }
  .graph-edge { fill: none; stroke: var(--vscode-editorInfo-foreground, #3794ff); stroke-width: 2; opacity: .72; pointer-events: stroke; cursor: pointer; }
  .graph-edge-hit { fill: none; stroke: transparent; stroke-width: 14; pointer-events: stroke; cursor: pointer; }
  .graph-edge.selected { stroke: var(--vscode-editorWarning-foreground, #cca700); stroke-width: 3; }
  .graph-edge-preview { fill: none; stroke: var(--vscode-focusBorder); stroke-width: 2; stroke-dasharray: 5 4; pointer-events: none; }
  .graph-arrow { fill: var(--vscode-editorInfo-foreground, #3794ff); }
  .graph-canvas.running .graph-edge { stroke-dasharray: 9 6; animation: graph-flow .7s linear infinite; }
  @keyframes graph-flow { to { stroke-dashoffset: -15; } }
  .graph-node { position: absolute; width: 200px; min-height: 92px; border: 1px solid var(--vscode-panel-border); border-radius: 6px; background: var(--vscode-sideBar-background); box-shadow: 0 3px 12px rgba(0, 0, 0, .22); padding: 9px 11px; }
  .graph-node.connect-target { box-shadow: 0 0 0 2px var(--vscode-focusBorder), 0 3px 12px rgba(0, 0, 0, .22); }
  .graph-node.endpoint { width: 174px; border-color: var(--vscode-focusBorder); }
  .graph-node.active-output { box-shadow: 0 0 0 1px var(--vscode-focusBorder), 0 3px 12px rgba(0, 0, 0, .22); }
  .graph-node.failed { border-color: var(--vscode-errorForeground); box-shadow: 0 0 0 1px var(--vscode-errorForeground); }
  .graph-node.running-node { border-color: var(--vscode-editorInfo-foreground, #3794ff); }
  .graph-node.complete-node { border-color: var(--vscode-terminal-ansiGreen, #4caf50); }
  .graph-title { font-weight: 650; font-size: 12px; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .graph-drag-handle { cursor: grab; user-select: none; touch-action: none; }
  .graph-drag-handle:active { cursor: grabbing; }
  .graph-meta { display: flex; align-items: center; gap: 5px; font-size: 9px; opacity: .68; }
  .graph-meta .arrow { opacity: .55; }
  .graph-actions { display: flex; justify-content: flex-end; margin-top: 6px; gap: 3px; }
  .endpoint-label { font-size: 10px; opacity: .62; margin-bottom: 5px; }
  .endpoint-select { width: 100%; padding: 3px; background: var(--vscode-dropdown-background); color: var(--vscode-dropdown-foreground); border: 1px solid var(--vscode-dropdown-border, #555); }
  .port { position: absolute; width: 15px; height: 15px; top: 41px; border: 2px solid var(--vscode-editorInfo-foreground, #3794ff); border-radius: 50%; background: var(--vscode-editor-background); cursor: crosshair; z-index: 2; touch-action: none; }
  .port:hover, .port.pending { transform: scale(1.3); background: var(--vscode-editorInfo-foreground, #3794ff); }
  .port.input { left: -7px; }
  .port.output { right: -7px; }
  .graph-toolbar { position: sticky; left: 8px; top: 8px; z-index: 4; display: inline-flex; gap: 6px; align-items: center; margin: 8px; padding: 4px 6px; background: var(--vscode-editorWidget-background); border: 1px solid var(--vscode-widget-border); font-size: 10px; }
  .graph-help { opacity: .75; pointer-events: none; }
  .output-name { width: 100%; margin: 2px 0 5px; padding: 3px 4px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border, #555); }
  .node-result { margin-top: 6px; font-size: 9px; opacity: .7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

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
  .output-tabs { min-height: 27px; padding: 2px 5px; display: flex; gap: 3px; overflow-x: auto; border-bottom: 1px solid var(--vscode-panel-border); background: var(--vscode-sideBar-background); }
  .output-tabs:empty { display: none; }
  .output-tab { border: 1px solid transparent; padding: 2px 8px; background: transparent; color: var(--vscode-foreground); cursor: pointer; white-space: nowrap; }
  .output-tab.active { border-color: var(--vscode-focusBorder); background: var(--vscode-list-activeSelectionBackground); color: var(--vscode-list-activeSelectionForeground); }
  .output-tab.error-tab { color: var(--vscode-errorForeground); }
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
          <div class="graph-toolbar">
            <span class="graph-help">Drop operations, move nodes, connect ports; select an edge and press Delete.</span>
            <button id="addOutputButton" class="button secondary" type="button">＋ Output</button>
          </div>
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
      <div id="outputTabs" class="output-tabs" role="tablist" aria-label="Graph outputs"></div>
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
  const NODE_HEIGHT = 108;
  const GRAPH_MARGIN = 40;
  const MAX_GRAPH_NODES = 514;
  const MAX_GRAPH_EDGES = 1024;
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
  let graph = { version: 1, nodes: [], edges: [] };
  let graphOutputs = [];
  let activeOutputId = typeof restored.activeOutputId === 'string' ? restored.activeOutputId : '';
  let selectedEdgeId = null;
  let pendingConnection = null;
  let nodeDrag = null;
  let deliveryPending = false;
  let graphNodeStates = new Map();
  let initialized = false;

  /*
   * Graph protocol (all graph objects use nodes {id,type,x,y,...} and edges
   * {id,source,target}):
   *   webview -> graphChanged { graph }
   *   webview -> runGraph { requestId, explicit, graph, activeOutputId,
   *                         inputSource, outputTarget, manualInput }
   *   host -> graphResult { requestId, outputs:
   *                         [{id,name,preview,totalLength,truncated,error?}] }
   *   host -> graphNodeResult { requestId, nodeId, status, preview?,
   *                             totalLength?, truncated?, error? }
   */

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
  const addOutputButton = document.getElementById('addOutputButton');
  const pipeText = document.getElementById('pipeText');
  const parseState = document.getElementById('parseState');
  const inputSourceSelect = document.getElementById('inputSource');
  const outputTargetSelect = document.getElementById('outputTarget');
  const inputArea = document.getElementById('inputArea');
  const outputArea = document.getElementById('outputArea');
  const inputStats = document.getElementById('inputStats');
  const outputStats = document.getElementById('outputStats');
  const outputTabs = document.getElementById('outputTabs');
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

  function finiteCoordinate(value, fallback) {
    return Number.isFinite(value) ? Math.max(0, Math.min(100000, Math.round(value))) : fallback;
  }

  function validGraphId(value) {
    return typeof value === 'string' && value.length > 0 && value.length <= 128 && /^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(value);
  }

  function graphNode(nodeId) {
    return graph.nodes.find(function (node) { return node.id === nodeId; });
  }

  function outputNodeIds() {
    return graph.nodes.filter(function (node) { return node.kind === 'output'; }).map(function (node) { return node.id; });
  }

  function nextGraphId(prefix) {
    let id;
    do { id = prefix + '-' + newStepId(); } while (graphNode(id));
    return id;
  }

  function wireGraph() {
    return {
      version: 1,
      nodes: graph.nodes.map(function (node) {
        const result = { id: node.id, type: node.kind, x: node.x, y: node.y };
        if (node.kind === 'operation') {
          const step = steps.find(function (candidate) { return candidate.id === node.id; });
          result.opName = step ? step.opName : node.opName;
          result.args = step ? step.args : (Array.isArray(node.args) ? node.args : []);
        }
        if (node.kind === 'output') result.name = node.name;
        return result;
      }),
      edges: graph.edges.map(function (edge) {
        return { id: edge.id, source: edge.from, target: edge.to };
      })
    };
  }

  function edgeWouldCycle(fromId, toId, edges) {
    if (fromId === toId) return true;
    const outgoing = new Map();
    edges.forEach(function (edge) {
      if (!outgoing.has(edge.from)) outgoing.set(edge.from, []);
      outgoing.get(edge.from).push(edge.to);
    });
    const pending = [toId];
    const seen = new Set();
    while (pending.length) {
      const current = pending.pop();
      if (current === fromId) return true;
      if (seen.has(current)) continue;
      seen.add(current);
      (outgoing.get(current) || []).forEach(function (next) { pending.push(next); });
    }
    return false;
  }

  function reachableGraphNodeIds() {
    const input = graph.nodes.find(function (node) { return node.kind === 'input'; });
    const reachable = new Set(input ? [input.id] : []);
    let changed = true;
    while (changed) {
      changed = false;
      graph.edges.forEach(function (edge) {
        if (reachable.has(edge.from) && !reachable.has(edge.to)) {
          reachable.add(edge.to);
          changed = true;
        }
      });
    }
    return reachable;
  }

  function graphArgumentsEqual(left, right) {
    try {
      return JSON.stringify(left) === JSON.stringify(right);
    } catch (_) {
      return false;
    }
  }

  function normalizeGraph(candidate) {
    const source = candidate && typeof candidate === 'object' ? candidate : {};
    const nodes = [];
    const seenIds = new Set();
    const claimedSteps = new Set();
    const suppliedNodes = Array.isArray(source.nodes) ? source.nodes.slice(0, MAX_GRAPH_NODES) : [];
    suppliedNodes.forEach(function (node, index) {
      if (!node || typeof node !== 'object' || !validGraphId(node.id) || seenIds.has(node.id)) return;
      const nodeKind = node.type || node.kind;
      if (nodeKind !== 'input' && nodeKind !== 'operation' && nodeKind !== 'output') return;
      if (nodeKind === 'input' && nodes.some(function (item) { return item.kind === 'input'; })) return;
      if (nodeKind === 'operation') {
        let step = steps.find(function (candidateStep) { return candidateStep.id === node.id; });
        let opName = String(node.opName || '');
        if (!descriptorFor(opName) && step) opName = step.opName;
        if (!step) {
          step = steps.find(function (candidateStep) {
            return !claimedSteps.has(candidateStep) &&
              candidateStep.opName === opName &&
              graphArgumentsEqual(candidateStep.args, Array.isArray(node.args) ? node.args : []);
          });
          if (step) step.id = node.id;
        }
        const descriptor = descriptorFor(opName);
        if (!step && descriptor) {
          step = { id: node.id, opName: opName, args: Array.isArray(node.args) ? node.args : descriptor.defaults.slice(), expanded: false };
          steps.push(step);
        }
        if (!step) return;
        if (descriptor) step.opName = opName;
        if (Array.isArray(node.args)) step.args = node.args;
        claimedSteps.add(step);
      }
      seenIds.add(node.id);
      nodes.push({
        id: node.id,
        kind: nodeKind,
        opName: nodeKind === 'operation' ? String(node.opName || '') : undefined,
        args: nodeKind === 'operation' && Array.isArray(node.args) ? node.args : undefined,
        name: nodeKind === 'output' ? String(node.name || ('Output ' + (index + 1))).slice(0, 128) : undefined,
        x: finiteCoordinate(node.x, GRAPH_MARGIN + index * 240),
        y: finiteCoordinate(node.y, 100 + (index % 3) * 150)
      });
    });
    steps.forEach(function (step, index) {
      if (seenIds.has(step.id) || nodes.length >= MAX_GRAPH_NODES) return;
      seenIds.add(step.id);
      nodes.push({ id: step.id, kind: 'operation', opName: step.opName, args: step.args, x: 270 + index * 250, y: 150 });
    });
    if (!nodes.some(function (node) { return node.kind === 'input'; })) {
      nodes.unshift({ id: 'graph-input', kind: 'input', x: 40, y: 150 });
      seenIds.add('graph-input');
    }
    if (!nodes.some(function (node) { return node.kind === 'output'; })) {
      let outputId = 'graph-output';
      let suffix = 1;
      while (seenIds.has(outputId)) { suffix += 1; outputId = 'graph-output-' + suffix; }
      nodes.push({ id: outputId, kind: 'output', name: 'Output', x: Math.max(520, 270 + steps.length * 250), y: 150 });
      seenIds.add(outputId);
    }
    const nodeMap = new Map(nodes.map(function (node) { return [node.id, node]; }));
    const incoming = new Set();
    const edgeIds = new Set();
    const edges = [];
    const hasSuppliedEdges = Array.isArray(source.edges);
    const suppliedEdges = hasSuppliedEdges ? source.edges.slice(0, MAX_GRAPH_EDGES) : [];
    suppliedEdges.forEach(function (edge) {
      if (!edge || typeof edge !== 'object') return;
      const from = typeof edge.source === 'string' ? edge.source : (typeof edge.from === 'string' ? edge.from : edge.from && edge.from.nodeId);
      const to = typeof edge.target === 'string' ? edge.target : (typeof edge.to === 'string' ? edge.to : edge.to && edge.to.nodeId);
      const fromNode = nodeMap.get(from);
      const toNode = nodeMap.get(to);
      if (!fromNode || !toNode || fromNode.kind === 'output' || toNode.kind === 'input' || incoming.has(to)) return;
      if (edgeWouldCycle(from, to, edges)) return;
      incoming.add(to);
      let edgeId = validGraphId(edge.id) && !edgeIds.has(edge.id) ? edge.id : nextGraphId('edge');
      while (edgeIds.has(edgeId)) edgeId = nextGraphId('edge');
      edgeIds.add(edgeId);
      edges.push({ id: edgeId, from: from, to: to });
    });
    graph = { version: 1, nodes: nodes, edges: edges };
    if (!hasSuppliedEdges) rebuildLinearEdges();
    if (!graph.nodes.some(function (node) { return node.kind === 'output' && node.id === activeOutputId; })) {
      const firstOutput = graph.nodes.find(function (node) { return node.kind === 'output'; });
      activeOutputId = firstOutput ? firstOutput.id : '';
    }
  }

  function rebuildLinearEdges() {
    const input = graph.nodes.find(function (node) { return node.kind === 'input'; });
    const output = graph.nodes.find(function (node) { return node.kind === 'output'; });
    if (!input || !output) return;
    const chain = [input.id].concat(steps.map(function (step) { return step.id; })).concat([output.id]);
    graph.edges = [];
    for (let index = 0; index + 1 < chain.length; index++) {
      graph.edges.push({ id: nextGraphId('edge'), from: chain[index], to: chain[index + 1] });
    }
  }

  function graphIsSimpleLinear() {
    if (graph.nodes.filter(function (node) { return node.kind === 'output'; }).length !== 1) return false;
    if (graph.edges.length !== steps.length + 1) return false;
    const inbound = new Map();
    const outbound = new Map();
    graph.edges.forEach(function (edge) {
      inbound.set(edge.to, (inbound.get(edge.to) || 0) + 1);
      outbound.set(edge.from, (outbound.get(edge.from) || 0) + 1);
    });
    return graph.nodes.every(function (node) {
      return (inbound.get(node.id) || 0) <= 1 && (outbound.get(node.id) || 0) <= 1;
    });
  }

  function graphValidationError() {
    const reachable = reachableGraphNodeIds();
    const unsupported = unsupportedGraphStep(reachable);
    if (unsupported) return displayNameFor(unsupported.opName) + ' is list-only and cannot run as a graph node.';
    if (!outputNodeIds().length) return 'Add at least one output node.';
    const connectedOutput = graph.nodes.some(function (node) {
      return node.kind === 'output' && reachable.has(node.id);
    });
    if (!connectedOutput) return 'Connect at least one output node before running the graph.';
    return '';
  }

  function invalidStep() {
    return steps.find(function (step) { return !descriptorFor(step.opName); });
  }

  function unsupportedGraphStep(reachable) {
    const connected = reachable || reachableGraphNodeIds();
    return steps.find(function (step) {
      const descriptor = descriptorFor(step.opName);
      return connected.has(step.id) && descriptor && descriptor.graphSupported === false;
    });
  }

  function setStatus(text, detail) {
    statusText.textContent = text;
    statusDetail.textContent = detail || '';
  }

  function setError(text) {
    errorMessage.textContent = text || '';
  }

  function displayError(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value.message === 'string') return value.message;
    return 'Graph node failed.';
  }

  function graphNodeSummary(state, fallback) {
    if (!state) return fallback;
    if (state.error) return 'Error: ' + state.error;
    if (state.status === 'running') return 'Processing…';
    const length = Number.isSafeInteger(state.totalLength) ? state.totalLength.toLocaleString() + ' chars' : '';
    const preview = String(state.preview || '').replace(/\\s+/g, ' ').trim().slice(0, 72);
    return [length, preview].filter(Boolean).join(' · ') || fallback;
  }

  function persistViewState() {
    if (!initialized) return;
    vscode.setState({ mode: mode, inputSource: inputSource, outputTarget: outputTarget, graph: wireGraph(), steps: wireSteps(), activeOutputId: activeOutputId });
  }

  function selectActiveOutput(outputId) {
    if (!outputId || outputId === activeOutputId) return;
    // The output target is snapshotted with an explicit run. Changing it while
    // data is still flowing cancels that run so the UI can never show B while
    // a clipboard/editor side effect silently receives A.
    if (graphCanvas.classList.contains('running') || deliveryPending) invalidateRuns();
    activeOutputId = outputId;
    persistViewState();
  }

  function notifyGraphChanged() {
    persistViewState();
    vscode.postMessage({ type: 'graphChanged', graph: wireGraph() });
  }

  function invalidateRuns(notifyHost) {
    clearTimeout(liveTimer);
    graphCanvas.classList.remove('running');
    deliveryPending = false;
    runSequence += 1;
    latestRunRequest = runSequence;
    if (notifyHost !== false) vscode.postMessage({ type: 'invalidateRuns' });
  }

  function updateStats() {
    inputStats.textContent = inputArea.value.length ? inputArea.value.length + ' chars' : '';
    outputStats.textContent = outputArea.value.length ? outputArea.value.length + ' chars' : '';
  }

  function pipelineHasUnsafeLiveOperation() {
    const reachable = mode === 'graph' ? reachableGraphNodeIds() : null;
    return steps.some(function (step) {
      if (reachable && !reachable.has(step.id)) return false;
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
    if (mode === 'graph' && graphValidationError()) return graphValidationError();
    return '';
  }

  function updateLiveButton() {
    const reason = liveBlockReason();
    liveButton.disabled = Boolean(reason);
    liveButton.classList.toggle('active', liveMode && !reason);
    liveButton.title = reason || (liveMode ? 'Live preview is on' : 'Live preview is off');
    runButton.disabled = Boolean(invalidStep()) || !pipelineTextReady || (mode === 'graph' && Boolean(graphValidationError()));
    saveButton.disabled = Boolean(invalidStep()) || !pipelineTextReady || (mode === 'graph' && Boolean(unsupportedGraphStep()));
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
    updateLiveButton();
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

  function loadPipeline(pipeline, suppliedGraph, suppliedActiveOutputId) {
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
    if (typeof suppliedActiveOutputId === 'string') activeOutputId = suppliedActiveOutputId;
    else if (typeof source.activeOutputId === 'string') activeOutputId = source.activeOutputId;
    else if (suppliedGraph === restored.graph && typeof restored.activeOutputId === 'string') activeOutputId = restored.activeOutputId;
    else activeOutputId = '';
    normalizeGraph(suppliedGraph || source.graph);
    pipeText.value = typeof source.raw === 'string' && source.raw ? source.raw : steps.map(function (step) { return displayNameFor(step.opName); }).join(' | ');
    pipelineTextReady = true;
    outputArea.value = '';
    graphOutputs = [];
    graphNodeStates.clear();
    failedStepId = null;
    const missing = invalidStep();
    setError(missing ? 'Unavailable operation in pipeline: ' + missing.opName : '');
    setStatus('Ready', steps.length + ' step' + (steps.length === 1 ? '' : 's'));
    renderAll();
    persistViewState();
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
    notifyGraphChanged();
    if (mode === 'graph') renderGraph();
    scheduleLiveRun();
  }

  function makePort(nodeId, direction, title) {
    const port = makeElement('button', 'port ' + direction);
    port.type = 'button';
    port.dataset.nodeId = nodeId;
    port.dataset.direction = direction;
    port.title = title;
    port.setAttribute('aria-label', title);
    if (pendingConnection && pendingConnection.from === nodeId && direction === 'output') port.classList.add('pending');
    return port;
  }

  function positionGraphElement(element, node) {
    element.dataset.nodeId = node.id;
    element.style.transform = 'translate(' + node.x + 'px,' + node.y + 'px)';
  }

  function graphEndpoint(node) {
    const isInput = node.kind === 'input';
    const nodeState = graphNodeStates.get(node.id);
    const stateClass = nodeState && nodeState.status === 'running' ? ' running-node' : (nodeState && nodeState.error ? ' failed' : (nodeState ? ' complete-node' : ''));
    const element = makeElement('section', 'graph-node endpoint' + (!isInput && node.id === activeOutputId ? ' active-output' : '') + stateClass);
    positionGraphElement(element, node);
    const title = makeElement('div', 'graph-title graph-drag-handle', isInput ? 'Input' : (node.name || 'Output'));
    title.dataset.dragNodeId = node.id;
    element.appendChild(title);
    element.appendChild(makeElement('div', 'endpoint-label', isInput ? 'Data source' : 'Named graph result'));
    if (isInput) {
      const select = makeElement('select', 'endpoint-select');
      select.dataset.endpoint = 'input';
      [['manual', 'Manual text'], ['selection', 'Editor selection / document'], ['document', 'Active document'], ['clipboard', 'Clipboard']].forEach(function (definition) {
        const option = makeElement('option', '', definition[1]);
        option.value = definition[0];
        option.selected = definition[0] === inputSource;
        select.appendChild(option);
      });
      element.appendChild(select);
      if (nodeState) element.appendChild(makeElement('div', 'node-result', graphNodeSummary(nodeState, 'Input ready')));
      element.appendChild(makePort(node.id, 'output', 'Start a connection from the graph input'));
    } else {
      const nameInput = makeElement('input', 'output-name');
      nameInput.type = 'text';
      nameInput.value = node.name || 'Output';
      nameInput.maxLength = 100;
      nameInput.dataset.outputName = node.id;
      nameInput.setAttribute('aria-label', 'Output name');
      element.appendChild(nameInput);
      const actions = makeElement('div', 'graph-actions');
      actions.appendChild(makeButton('View', 'view-output', node.id, 'Show this output below'));
      actions.appendChild(makeButton('✕', 'remove-output', node.id, 'Remove output node'));
      element.appendChild(actions);
      const result = graphOutputs.find(function (output) { return output.id === node.id; });
      const summary = result
        ? (result.error ? 'Error: ' + result.error : String(result.totalLength || 0) + ' chars')
        : graphNodeSummary(nodeState, nodeState ? 'Output ready' : 'Waiting for data');
      element.appendChild(makeElement('div', 'node-result', summary));
      element.appendChild(makePort(node.id, 'input', 'Connect data to this output'));
    }
    return element;
  }

  function graphOperation(node) {
    const step = steps.find(function (candidate) { return candidate.id === node.id; });
    if (!step) return null;
    const descriptor = descriptorFor(step.opName);
    const nodeState = graphNodeStates.get(node.id);
    const stateClass = nodeState && nodeState.status === 'running' ? ' running-node' : (nodeState && nodeState.error ? ' failed' : (nodeState ? ' complete-node' : ''));
    const element = makeElement('article', 'graph-node operation' + (step.id === failedStepId ? ' failed' : '') + stateClass);
    element.dataset.stepId = step.id;
    positionGraphElement(element, node);
    element.appendChild(makePort(node.id, 'input', 'Connect input to ' + displayNameFor(step.opName)));
    element.appendChild(makePort(node.id, 'output', 'Connect ' + displayNameFor(step.opName) + ' to one or more nodes'));
    const title = makeElement('div', 'graph-title graph-drag-handle', displayNameFor(step.opName));
    title.dataset.dragNodeId = node.id;
    element.appendChild(title);
    const meta = makeElement('div', 'graph-meta');
    meta.appendChild(makeElement('span', '', descriptor ? descriptor.inputType : '?'));
    meta.appendChild(makeElement('span', 'arrow', '→'));
    meta.appendChild(makeElement('span', '', descriptor ? descriptor.outputType : '?'));
    if (descriptor && !descriptor.liveSafe) meta.appendChild(makeElement('span', 'warning-badge', 'explicit'));
    element.appendChild(meta);
    const actions = makeElement('div', 'graph-actions');
    actions.appendChild(makeButton('Edit', 'edit', step.id, 'Edit arguments in list view'));
    actions.appendChild(makeButton('✕', 'remove', step.id, 'Remove operation'));
    element.appendChild(actions);
    if (nodeState) {
      element.appendChild(makeElement('div', 'node-result', graphNodeSummary(nodeState, 'Ready')));
    }
    return element;
  }

  function nodeWidth(node) {
    return node && node.kind === 'operation' ? OPERATION_WIDTH : ENDPOINT_WIDTH;
  }

  function edgePath(fromNode, toNode, pointer) {
    const x1 = fromNode.x + nodeWidth(fromNode);
    const y1 = fromNode.y + 48;
    const x2 = toNode ? toNode.x : pointer.x;
    const y2 = toNode ? toNode.y + 48 : pointer.y;
    const distance = Math.abs(x2 - x1);
    const curve = Math.max(45, distance * .45);
    return 'M ' + x1 + ' ' + y1 + ' C ' + (x1 + curve) + ' ' + y1 + ', ' + (x2 - curve) + ' ' + y2 + ', ' + x2 + ' ' + y2;
  }

  function renderEdges(pointer) {
    edgeLayer.textContent = '';
    const definitions = document.createElementNS(SVG_NS, 'defs');
    const marker = document.createElementNS(SVG_NS, 'marker');
    marker.setAttribute('id', 'graph-arrow');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto-start-reverse');
    const arrow = document.createElementNS(SVG_NS, 'path');
    arrow.setAttribute('class', 'graph-arrow');
    arrow.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    marker.appendChild(arrow);
    definitions.appendChild(marker);
    edgeLayer.appendChild(definitions);
    graph.edges.forEach(function (edge) {
      const fromNode = graphNode(edge.from);
      const toNode = graphNode(edge.to);
      if (!fromNode || !toNode) return;
      const pathData = edgePath(fromNode, toNode, null);
      const hit = document.createElementNS(SVG_NS, 'path');
      hit.setAttribute('class', 'graph-edge-hit');
      hit.setAttribute('d', pathData);
      hit.dataset.edgeId = edge.id;
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('class', 'graph-edge' + (selectedEdgeId === edge.id ? ' selected' : ''));
      path.setAttribute('d', pathData);
      path.setAttribute('marker-end', 'url(#graph-arrow)');
      path.dataset.edgeId = edge.id;
      edgeLayer.appendChild(hit);
      edgeLayer.appendChild(path);
    });
    if (pendingConnection && pointer) {
      const fromNode = graphNode(pendingConnection.from);
      if (fromNode) {
        const preview = document.createElementNS(SVG_NS, 'path');
        preview.setAttribute('class', 'graph-edge-preview');
        preview.setAttribute('d', edgePath(fromNode, null, pointer));
        edgeLayer.appendChild(preview);
      }
    }
  }

  function renderOutputTabs() {
    outputTabs.textContent = '';
    if (!graphOutputs.length) return;
    if (!graphOutputs.some(function (output) { return output.id === activeOutputId; })) activeOutputId = graphOutputs[0].id;
    graphOutputs.forEach(function (output) {
      const tab = makeElement('button', 'output-tab' + (output.id === activeOutputId ? ' active' : '') + (output.error ? ' error-tab' : ''), output.name || output.id);
      tab.type = 'button';
      tab.dataset.outputId = output.id;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', output.id === activeOutputId ? 'true' : 'false');
      outputTabs.appendChild(tab);
    });
    const active = graphOutputs.find(function (output) { return output.id === activeOutputId; }) || graphOutputs[0];
    outputArea.value = active.error ? '' : String(active.preview || '');
    setError(active.error ? String(active.error) : '');
    outputStats.textContent = Number.isSafeInteger(active.totalLength) ? active.totalLength.toLocaleString() + ' chars' + (active.truncated ? ' · preview' : '') : '';
    persistViewState();
  }

  function renderGraph() {
    nodeLayer.textContent = '';
    const maxX = graph.nodes.reduce(function (value, node) { return Math.max(value, node.x + nodeWidth(node)); }, 0);
    const maxY = graph.nodes.reduce(function (value, node) { return Math.max(value, node.y + NODE_HEIGHT); }, 0);
    const canvasWidth = Math.max(graphScroll.clientWidth || 700, maxX + GRAPH_MARGIN);
    const canvasHeight = Math.max(graphScroll.clientHeight || 420, maxY + GRAPH_MARGIN);
    graphCanvas.style.width = canvasWidth + 'px';
    graphCanvas.style.height = canvasHeight + 'px';
    edgeLayer.setAttribute('width', String(canvasWidth));
    edgeLayer.setAttribute('height', String(canvasHeight));
    graph.nodes.forEach(function (node) {
      const element = node.kind === 'operation' ? graphOperation(node) : graphEndpoint(node);
      if (element) nodeLayer.appendChild(element);
    });
    renderEdges(null);
    renderOutputTabs();
  }

  function defaultOperationPosition(index) {
    return { x: 270 + (index % 4) * 250, y: 110 + Math.floor(index / 4) * 160 };
  }

  function addOperation(opName, index, position) {
    const descriptor = descriptorFor(opName);
    if (!descriptor || graph.nodes.length >= MAX_GRAPH_NODES) return;
    if (mode === 'graph' && descriptor.graphSupported === false) {
      setError(descriptor.displayName + ' is a recipe flow-control operation and is only supported in List mode.');
      return;
    }
    const wasLinear = graphIsSimpleLinear();
    const insertAt = Math.max(0, Math.min(steps.length, index));
    const step = { id: newStepId(), opName: opName, args: descriptor.defaults.slice(), expanded: false };
    steps.splice(insertAt, 0, step);
    const fallback = defaultOperationPosition(insertAt);
    graph.nodes.push({
      id: step.id,
      kind: 'operation',
      opName: step.opName,
      args: step.args,
      x: finiteCoordinate(position && position.x, fallback.x),
      y: finiteCoordinate(position && position.y, fallback.y)
    });
    if (!position && wasLinear) rebuildLinearEdges();
    changedVisually();
  }

  function moveStep(stepId, index) {
    const wasLinear = graphIsSimpleLinear();
    const oldIndex = steps.findIndex(function (step) { return step.id === stepId; });
    if (oldIndex < 0) return;
    const moved = steps.splice(oldIndex, 1)[0];
    let insertAt = index;
    if (oldIndex < insertAt) insertAt -= 1;
    insertAt = Math.max(0, Math.min(steps.length, insertAt));
    steps.splice(insertAt, 0, moved);
    if (wasLinear) rebuildLinearEdges();
    changedVisually();
  }

  function removeStep(stepId) {
    const wasLinear = graphIsSimpleLinear();
    const index = steps.findIndex(function (step) { return step.id === stepId; });
    if (index < 0) return;
    steps.splice(index, 1);
    graph.nodes = graph.nodes.filter(function (node) { return node.id !== stepId; });
    graph.edges = graph.edges.filter(function (edge) { return edge.from !== stepId && edge.to !== stepId; });
    if (wasLinear) rebuildLinearEdges();
    changedVisually();
  }

  function addOutputNode() {
    if (graph.nodes.length >= MAX_GRAPH_NODES) return;
    const number = outputNodeIds().length + 1;
    const id = nextGraphId('output');
    const x = Math.max(GRAPH_MARGIN, graphScroll.scrollLeft + Math.round((graphScroll.clientWidth || 700) * .7));
    const y = Math.max(GRAPH_MARGIN, graphScroll.scrollTop + 80 + number * 35);
    graph.nodes.push({ id: id, kind: 'output', name: 'Output ' + number, x: x, y: y });
    graphStructureChanged();
  }

  function removeOutputNode(nodeId) {
    const outputs = outputNodeIds();
    if (outputs.length <= 1) {
      setError('A graph needs at least one output node.');
      return;
    }
    graph.nodes = graph.nodes.filter(function (node) { return node.id !== nodeId; });
    graph.edges = graph.edges.filter(function (edge) { return edge.from !== nodeId && edge.to !== nodeId; });
    graphOutputs = graphOutputs.filter(function (output) { return output.id !== nodeId; });
    if (activeOutputId === nodeId) {
      const nextOutput = graph.nodes.find(function (node) { return node.kind === 'output'; });
      activeOutputId = nextOutput ? nextOutput.id : '';
    }
    graphStructureChanged();
  }

  function connectNodes(fromId, toId) {
    const from = graphNode(fromId);
    const to = graphNode(toId);
    if (!from || !to || from.kind === 'output' || to.kind === 'input') return false;
    const retained = graph.edges.filter(function (edge) { return edge.to !== toId; });
    if (edgeWouldCycle(fromId, toId, retained)) {
      setError('That connection would create a cycle. Graph pipelines must be acyclic.');
      return false;
    }
    retained.push({ id: nextGraphId('edge'), from: fromId, to: toId });
    graph.edges = retained;
    pendingConnection = null;
    selectedEdgeId = null;
    setError('');
    graphStructureChanged();
    return true;
  }

  function removeEdge(edgeId) {
    const oldLength = graph.edges.length;
    graph.edges = graph.edges.filter(function (edge) { return edge.id !== edgeId; });
    if (graph.edges.length === oldLength) return;
    selectedEdgeId = null;
    graphStructureChanged();
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
    graphNodeStates.clear();
    updateRawSummary();
    renderAll();
    notifyGraphChanged();
    scheduleLiveRun();
  }

  function graphStructureChanged() {
    invalidateRuns();
    failedStepId = null;
    renderGraph();
    updateLiveButton();
    notifyGraphChanged();
    scheduleLiveRun();
  }

  function syncGraphWithSteps(forceLinear) {
    const stepIds = new Set(steps.map(function (step) { return step.id; }));
    graph.nodes = graph.nodes.filter(function (node) { return node.kind !== 'operation' || stepIds.has(node.id); });
    const nodeIds = new Set(graph.nodes.map(function (node) { return node.id; }));
    steps.forEach(function (step, index) {
      if (nodeIds.has(step.id)) return;
      const position = defaultOperationPosition(index);
      graph.nodes.push({ id: step.id, kind: 'operation', opName: step.opName, args: step.args, x: position.x, y: position.y });
      nodeIds.add(step.id);
    });
    graph.edges = graph.edges.filter(function (edge) { return nodeIds.has(edge.from) && nodeIds.has(edge.to); });
    if (forceLinear) rebuildLinearEdges();
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
    if (mode === 'graph' && graphValidationError()) {
      setError(graphValidationError());
      return;
    }
    if (!explicit && liveBlockReason()) return;
    runSequence += 1;
    latestRunRequest = runSequence;
    failedStepId = null;
    graphNodeStates.clear();
    setError('');
    setStatus('Running…', explicit ? 'explicit run' : 'live preview');
    deliveryPending = Boolean(explicit && outputTarget !== 'preview');
    graphCanvas.classList.toggle('running', mode === 'graph');
    if (mode === 'graph') {
      vscode.postMessage({
        type: 'runGraph',
        requestId: latestRunRequest,
        explicit: Boolean(explicit),
        graph: wireGraph(),
        activeOutputId: activeOutputId || undefined,
        inputSource: inputSource,
        outputTarget: explicit ? outputTarget : 'preview',
        manualInput: inputArea.value
      });
    } else {
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
      const restoredPipeline = restored.graph && Array.isArray(restored.steps)
        ? Object.assign({}, message.pipeline || {}, { steps: restored.steps })
        : message.pipeline;
      const restoredOutput = restored.graph && typeof restored.activeOutputId === 'string'
        ? restored.activeOutputId
        : message.activeOutputId;
      loadPipeline(restoredPipeline, restored.graph || message.graph || (message.pipeline && message.pipeline.graph), restoredOutput);
      initialized = true;
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
      loadPipeline(message.pipeline, message.graph || (message.pipeline && message.pipeline.graph), message.activeOutputId);
      return;
    }
    if (message.type === 'parsed') {
      if (message.requestId !== latestParseRequest) return;
      pipelineTextReady = true;
      const wasLinear = graphIsSimpleLinear();
      steps = Array.isArray(message.steps) ? message.steps.map(function (step) {
        return { id: step.id, opName: step.opName, args: step.args, expanded: false };
      }) : steps;
      syncGraphWithSteps(wasLinear);
      updateRawSummary();
      parseState.textContent = '✓';
      parseState.title = 'Pipeline text parsed successfully';
      setError('');
      renderAll();
      notifyGraphChanged();
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
      graphCanvas.classList.remove('running');
      deliveryPending = !message.outputApplied;
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
    if (message.type === 'graphResult') {
      if (message.requestId !== latestRunRequest) return;
      graphCanvas.classList.remove('running');
      deliveryPending = !message.outputApplied;
      if (inputSource !== 'manual' && typeof message.inputValue === 'string') inputArea.value = message.inputValue;
      graphOutputs = Array.isArray(message.outputs) ? message.outputs.slice(0, MAX_GRAPH_NODES).map(function (output) {
        return {
          id: String(output.id || ''),
          name: String(output.name || output.id || 'Output').slice(0, 128),
          preview: typeof output.preview === 'string' ? output.preview : '',
          totalLength: Number.isSafeInteger(output.totalLength) && output.totalLength >= 0 ? output.totalLength : 0,
          truncated: Boolean(output.truncated),
          error: displayError(output.error)
        };
      }).filter(function (output) { return output.id && outputNodeIds().includes(output.id); }) : [];
      failedStepId = message.failedNodeId || null;
      if (!graphOutputs.some(function (output) { return output.id === activeOutputId; })) activeOutputId = graphOutputs.length ? graphOutputs[0].id : '';
      setStatus(graphOutputs.some(function (output) { return output.error; }) ? 'Completed with errors' : 'Done', graphOutputs.length + ' graph output' + (graphOutputs.length === 1 ? '' : 's'));
      updateStats();
      if (Number.isSafeInteger(message.inputLength) && message.inputLength >= 0) inputStats.textContent = message.inputLength.toLocaleString() + ' chars' + (message.inputTruncated ? ' · preview' : '');
      renderGraph();
      return;
    }
    if (message.type === 'graphNodeResult') {
      if (message.requestId !== latestRunRequest || typeof message.nodeId !== 'string' || !graphNode(message.nodeId)) return;
      graphNodeStates.set(message.nodeId, {
        status: message.status === 'running' ? 'running' : 'complete',
        preview: typeof message.preview === 'string' ? message.preview : '',
        totalLength: Number.isSafeInteger(message.totalLength) && message.totalLength >= 0 ? message.totalLength : undefined,
        truncated: Boolean(message.truncated),
        error: displayError(message.error)
      });
      if (mode === 'graph') renderGraph();
      return;
    }
    if (message.type === 'outputApplied') {
      if (message.requestId !== latestRunRequest) return;
      deliveryPending = false;
      setStatus('Done', String(message.detail || 'output delivered'));
      return;
    }
    if (message.type === 'outputError') {
      if (message.requestId !== latestRunRequest) return;
      deliveryPending = false;
      setError(String(message.value || 'The output could not be delivered.'));
      setStatus('Preview ready', 'output action failed');
      return;
    }
    if (message.type === 'error') {
      if (message.requestId !== latestRunRequest) return;
      deliveryPending = false;
      graphCanvas.classList.remove('running');
      failedStepId = message.stepId || null;
      setError(String(message.value || 'Pipeline failed.'));
      setStatus('Error', 'pipeline run failed');
      if (mode === 'graph') renderGraph();
      return;
    }
    if (message.type === 'liveBlocked') {
      if (message.requestId !== latestRunRequest) return;
      deliveryPending = false;
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

  function logicalPointer(event) {
    const rect = graphCanvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function graphElementById(nodeId) {
    return Array.from(nodeLayer.querySelectorAll('[data-node-id]')).find(function (element) { return element.dataset.nodeId === nodeId; }) || null;
  }

  function beginNodeDrag(event, handle) {
    const node = graphNode(handle.dataset.dragNodeId);
    if (!node || event.button !== undefined && event.button !== 0) return;
    nodeDrag = { id: node.id, startX: event.clientX, startY: event.clientY, nodeX: node.x, nodeY: node.y, moved: false };
    const element = graphElementById(node.id);
    if (element) element.classList.add('dragging');
    event.preventDefault();
  }

  function beginConnection(event, port) {
    if (port.dataset.direction !== 'output') return;
    pendingConnection = { from: port.dataset.nodeId, pointerId: event.pointerId };
    selectedEdgeId = null;
    renderGraph();
    renderEdges(logicalPointer(event));
    event.preventDefault();
  }

  function handleGraphPointerMove(event) {
    if (nodeDrag) {
      const node = graphNode(nodeDrag.id);
      if (!node) return;
      node.x = finiteCoordinate(nodeDrag.nodeX + event.clientX - nodeDrag.startX, node.x);
      node.y = finiteCoordinate(nodeDrag.nodeY + event.clientY - nodeDrag.startY, node.y);
      nodeDrag.moved = nodeDrag.moved || Math.abs(event.clientX - nodeDrag.startX) > 1 || Math.abs(event.clientY - nodeDrag.startY) > 1;
      const element = graphElementById(node.id);
      if (element) element.style.transform = 'translate(' + node.x + 'px,' + node.y + 'px)';
      renderEdges(null);
      event.preventDefault();
      return;
    }
    if (pendingConnection) {
      renderEdges(logicalPointer(event));
      const target = event.target.closest && event.target.closest('.port.input');
      nodeLayer.querySelectorAll('.graph-node.connect-target').forEach(function (element) { element.classList.remove('connect-target'); });
      if (target) {
        const targetNode = target.closest('.graph-node');
        if (targetNode) targetNode.classList.add('connect-target');
      }
      event.preventDefault();
    }
  }

  function handleGraphPointerUp(event) {
    if (nodeDrag) {
      const moved = nodeDrag.moved;
      nodeDrag = null;
      if (moved) graphStructureChanged();
      else renderGraph();
      return;
    }
    if (!pendingConnection) return;
    let target = event.target.closest && event.target.closest('.port.input');
    if (!target && document.elementFromPoint) {
      const element = document.elementFromPoint(event.clientX, event.clientY);
      target = element && element.closest ? element.closest('.port.input') : null;
    }
    if (target) connectNodes(pendingConnection.from, target.dataset.nodeId);
    else renderGraph();
  }

  window.addEventListener('message', function (event) { onMessage(event.data); });
  window.addEventListener('resize', function () { if (mode === 'graph') renderGraph(); });
  window.addEventListener('pointermove', handleGraphPointerMove);
  window.addEventListener('pointerup', handleGraphPointerUp);
  window.addEventListener('keydown', function (event) {
    if (mode !== 'graph') return;
    if (event.key === 'Escape') {
      pendingConnection = null;
      selectedEdgeId = null;
      renderGraph();
    }
    const editing = event.target && typeof event.target.matches === 'function' && event.target.matches('input, textarea, select');
    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedEdgeId && !editing) {
      event.preventDefault();
      removeEdge(selectedEdgeId);
    }
  });
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
    vscode.postMessage({ type: 'save', name: pipeName.value, description: pipeDescription.value, raw: pipeText.value, steps: wireSteps(), graph: wireGraph(), activeOutputId: activeOutputId || undefined });
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
    const point = logicalPointer(event);
    const operation = event.dataTransfer.getData(OP_TRANSFER);
    const stepId = event.dataTransfer.getData(STEP_TRANSFER);
    if (operation) addOperation(operation, steps.length, { x: point.x - OPERATION_WIDTH / 2, y: point.y - 35 });
    else if (stepId) {
      const node = graphNode(stepId);
      if (node) {
        node.x = finiteCoordinate(point.x - OPERATION_WIDTH / 2, node.x);
        node.y = finiteCoordinate(point.y - 35, node.y);
        graphStructureChanged();
      }
    }
  });
  graphScroll.addEventListener('click', function (event) {
    if (event.target.closest('.graph-node') || event.target.closest('[data-edge-id]') || event.target.closest('.graph-toolbar')) return;
    if (pendingConnection || selectedEdgeId) {
      pendingConnection = null;
      selectedEdgeId = null;
      renderGraph();
    }
  });
  addOutputButton.addEventListener('click', addOutputNode);
  nodeLayer.addEventListener('pointerdown', function (event) {
    const port = event.target.closest('.port');
    if (port) { beginConnection(event, port); return; }
    const handle = event.target.closest('[data-drag-node-id]');
    if (handle) beginNodeDrag(event, handle);
  });
  nodeLayer.addEventListener('click', function (event) {
    const port = event.target.closest('.port');
    if (port) {
      if (port.dataset.direction === 'output') {
        pendingConnection = { from: port.dataset.nodeId };
        selectedEdgeId = null;
        renderGraph();
      } else if (pendingConnection) connectNodes(pendingConnection.from, port.dataset.nodeId);
      return;
    }
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const stepId = button.dataset.stepId;
    if (button.dataset.action === 'remove') removeStep(stepId);
    if (button.dataset.action === 'remove-output') removeOutputNode(stepId);
    if (button.dataset.action === 'view-output') {
      selectActiveOutput(stepId);
      renderGraph();
    }
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
    const nameInput = event.target.closest('input[data-output-name]');
    if (nameInput) {
      const node = graphNode(nameInput.dataset.outputName);
      if (node && node.kind === 'output') {
        node.name = (nameInput.value.trim() || 'Output').replace(/[\\u0000-\\u001f\\u007f]/g, '�').slice(0, 128);
        graphStructureChanged();
      }
      return;
    }
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
  edgeLayer.addEventListener('click', function (event) {
    const edge = event.target.closest('[data-edge-id]');
    if (!edge) return;
    selectedEdgeId = edge.dataset.edgeId;
    pendingConnection = null;
    renderEdges(null);
  });
  edgeLayer.addEventListener('dblclick', function (event) {
    const edge = event.target.closest('[data-edge-id]');
    if (edge) removeEdge(edge.dataset.edgeId);
  });
  outputTabs.addEventListener('click', function (event) {
    const tab = event.target.closest('button[data-output-id]');
    if (!tab) return;
    selectActiveOutput(tab.dataset.outputId);
    renderOutputTabs();
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
