import { MAX_LIVE_INPUT_CHARACTERS } from "../pipelineLivePolicy";
import type { OpInfo } from "../../web/common/types";
import type { QuickWorkbenchIncomingMessage } from "./protocol";
interface Definition { name: string; type: string; value: Array<string | {name: string; value: Value; on?: number[]; off?: number[]}>; min?: number; max?: number; step?: number; maxLength?: number; toggleValues?: string[]; disabled?: boolean; target?: number | number[]; }
type Value = string | number | boolean | null | string[] | { string: string; option: string };
declare function acquireVsCodeApi(): { postMessage(message: QuickWorkbenchIncomingMessage): void };
function element<T extends HTMLElement>(id: string): T { return document.getElementById(id) as T; }
    (() => {
      
      const vscode = acquireVsCodeApi();
      const inputText = element<HTMLTextAreaElement>('inputText');
      const resultText = element<HTMLTextAreaElement>('resultText');
      const searchOps = element<HTMLInputElement>('searchOps');
      const opList = element('opList');
      const copyBtn = element<HTMLButtonElement>('copyBtn');
      const replaceBtn = element<HTMLButtonElement>('replaceBtn');
      const newDocBtn = element<HTMLButtonElement>('newDocBtn');
      const loadSelection = element('loadSelection');
      const loadDocument = element('loadDocument');
      const loadClipboard = element('loadClipboard');
      const clearInput = element('clearInput');
      const closeBtn = element('closeBtn');
      const inputSize = element('inputSize');
      const inputSource = element('inputSource');
      const resultInfo = element('resultInfo');
      const statusMessage = element('statusMessage');

      let operations: OpInfo[] = [];
      let favorites = new Set<string>();
      let recents = new Set<string>();
      let currentRequestId = 0;
      let inputRevision = 0;
      let canReplace = false;
      let canCopy = false;
      let canNewDoc = false;
      let currentOpName: string | null = null;
      let currentArgs: Record<string, Value> = {};
      element<HTMLButtonElement>('runBtn').addEventListener('click', () => { if (currentOpName) applyOperation(currentOpName, 'manual'); });

      function renderArgs(defs: Definition[], defaults: Value[]) {
        const container = element('argsEditor');
        container.replaceChildren();
        currentArgs = {};
        defs.forEach((def, index) => { currentArgs[def.name] = defaults[index]; });
        const rows: HTMLElement[] = [];
        const refreshDisabled = () => {
          const disabled = defs.map(def => !!def.disabled);
          defs.forEach(def => {
            if (def.type !== 'argSelector') return;
            const selected = def.value.find(option => typeof option === 'object' && option.name === currentArgs[def.name]);
            if (selected && typeof selected === 'object') {
              selected.off?.forEach(i => { disabled[i] = true; });
              selected.on?.forEach(i => { disabled[i] = false; });
            }
          });
          rows.forEach((row, i) => row.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input,select,textarea').forEach(control => { control.disabled = disabled[i]; }));
        };
        defs.forEach((def, index) => {
          const value = defaults[index];
          currentArgs[def.name] = value;
          const row = document.createElement('label');
          row.textContent = def.name + ' ';
          rows.push(row);
          const update = (next: Value) => {
            currentArgs[def.name] = next;
            refreshDisabled();
            invalidate();
            vscode.postMessage({ type: 'invalidate' });
          };
          const select = (options: Array<string | {name: string; value?: unknown}>, selected: number, change: (index: number) => void) => {
            const control = document.createElement('select');
            control.setAttribute('aria-label', def.name);
            options.forEach((option, i) => {
              const item = document.createElement('option');
              item.textContent = String(typeof option === 'object' ? option.name : option);
              item.value = String(i);
              item.selected = i === selected;
              control.appendChild(item);
            });
            control.addEventListener('change', () => change(Number(control.value)));
            row.appendChild(control);
          };
          const input = (initial: unknown, change: (value: Value) => void, type = 'text') => {
            const control = document.createElement('input');
            control.type = type;
            control.setAttribute('aria-label', def.name);
            control.value = String(initial ?? '');
            control.checked = Boolean(initial);
            if (def.min !== undefined) control.min = String(def.min);
            if (def.max !== undefined) control.max = String(def.max);
            if (def.step !== undefined) control.step = String(def.step);
            if (def.maxLength !== undefined) control.maxLength = def.maxLength;
            control.addEventListener('input', () => change(type === 'checkbox' ? control.checked : type === 'number' ? (control.value === '' ? null : Number(control.value)) : control.value));
            row.appendChild(control);
            return control;
          };
          if (def.type === 'label') { row.className = 'arg-section'; }
          else if (def.type === 'populateOption' || def.type === 'populateMultiOption') {
            select(def.value, def.value.findIndex(x => typeof x === 'object' && JSON.stringify(x.value) === JSON.stringify(value)), i => {
              const option = def.value[i];
              if (typeof option !== 'object') return;
              update(option.value);
              const targets = Array.isArray(def.target) ? def.target : [def.target];
              targets.forEach((target, offset) => {
                if (target === undefined || !defs[target]) return;
                const next = def.type === 'populateMultiOption' && Array.isArray(option.value) ? option.value[offset] : option.value;
                currentArgs[defs[target].name] = next;
                const control = rows[target]?.querySelector<HTMLInputElement>('input,textarea');
                if (control) control.value = String(next ?? '');
              });
            });
          }
          else if (def.type === 'boolean') input(value, update, 'checkbox');
          else if (def.type === 'number') input(value, update, 'number');
          else if (def.type === 'option') select(def.value, def.value.findIndex(option => option === value), i => update(def.value[i] as Value));
          else if (def.type === 'argSelector') select(def.value, def.value.findIndex(x => typeof x === 'object' && x.name === value), i => update((def.value[i] as {name: string}).name));
          else if (def.type === 'editableOption' || def.type === 'editableOptionShort') {
            const editor = input(typeof value === 'string' ? value : JSON.stringify(value), update);
            select(def.value, def.value.findIndex(x => JSON.stringify(typeof x === 'object' ? x.value : x) === JSON.stringify(value)), i => { update((def.value[i] as {value: Value}).value); editor.value = String((def.value[i] as {value: Value}).value); });
          } else if (def.type === 'toggleString') {
            let toggle = value as {string: string; option: string};
            input(toggle.string, text => { toggle = { ...toggle, string: String(text) }; update(toggle); });
            select(def.toggleValues || ['Hex'], (def.toggleValues || ['Hex']).indexOf(toggle.option), i => { toggle = { ...toggle, option: (def.toggleValues || ['Hex'])[i] }; update(toggle); });
          } else if (['string','text','binaryString','binaryShortString','shortString'].includes(def.type)) input(value, update);
          else { throw new Error('Unsupported argument type: ' + def.type); }
          container.appendChild(row);
        });
        refreshDisabled();
      }

      function escHtml(s: unknown) {
        return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
      }

      function updateInputInfo() {
        const text = inputText.value;
        const bytes = new Blob([text]).size;
        inputSize.textContent = text ? text.length + ' chars, ' + bytes + ' bytes' : '';
      }

      function updateResultInfo() {
        const text = resultText.value;
        const bytes = new Blob([text]).size;
        resultInfo.textContent = text ? text.length + ' chars, ' + bytes + ' bytes' : '';
      }

      function updateButtonStates() {
        copyBtn.disabled = !canCopy;
        replaceBtn.disabled = !canReplace;
        newDocBtn.disabled = !canNewDoc;
      }

      function showMessage(message: string, isError = false, isWarning = false) {
        statusMessage.textContent = message;
        statusMessage.className = isError ? 'error-message' : isWarning ? 'warning-message' : 'info-message';
      }

      function clearMessage() { 
        statusMessage.textContent = ''; 
        statusMessage.className = ''; 
      }

      function renderOperations(filter = '') {
        const query = filter.toLowerCase();
        const filtered = operations.filter(op =>
          op.displayName.toLowerCase().includes(query) ||
          op.opName.toLowerCase().includes(query) ||
          op.module.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
          opList.innerHTML = '<div class="empty-state">No operations found. Try a different search.</div>';
          return;
        }

        filtered.sort((a, b) => {
          const aFav = favorites.has(a.opName);
          const bFav = favorites.has(b.opName);
          if (aFav !== bFav) return aFav ? -1 : 1;
          const aRecent = recents.has(a.opName);
          const bRecent = recents.has(b.opName);
          if (aRecent !== bRecent) return aRecent ? -1 : 1;
          return a.displayName.localeCompare(b.displayName);
        });

        const items = filtered.map(op => {
          const isFav = favorites.has(op.opName);
          const favClass = isFav ? 'active' : '';
          const favTitle = isFav ? 'Remove from favorites' : 'Add to favorites';
          const favStar = isFav ? '\u2605' : '\u2606';
          const selectedClass = currentOpName === op.opName ? 'selected' : '';
          return '<div class="op-item ' + selectedClass + '" role="button" tabindex="0" data-op="' + escHtml(op.opName) + '" title="' + escHtml(op.displayName) + ' - ' + escHtml(op.module) + '">' +
            '<span class="op-name">' + escHtml(op.displayName) + '</span>' +
            '<span class="op-module">' + escHtml(op.module) + '</span>' +
            '<button type="button" class="op-favorite ' + favClass + '" title="' + favTitle + '">' + favStar + '</button>' +
          '</div>';
        });

        opList.innerHTML = items.join('');
      }

      function invalidate() {
        ++currentRequestId;
        canCopy = canReplace = canNewDoc = false;
        resultText.value = '';
        updateButtonStates();
      }
      function applyOperation(opName: string, mode: 'manual' | 'preview' = 'preview') {
        const text = inputText.value;
        if (mode === 'preview' && text.length > MAX_LIVE_INPUT_CHARACTERS) {
          showMessage('Input too large for automatic execution', true);
          return;
        }
        invalidate();
        const reqId = currentRequestId;
        vscode.postMessage({ type: 'applyOperation', opName, args: currentArgs, requestId: reqId, mode });
        showMessage('Applying...', false);
      }

      // Event listeners
      inputText.addEventListener('input', () => { invalidate(); updateInputInfo(); clearMessage(); inputSource.textContent = 'Source: manual'; vscode.postMessage({ type: 'inputChanged', revision: ++inputRevision, text: inputText.value }); });
      resultText.addEventListener('input', () => { updateResultInfo(); });
      searchOps.addEventListener('input', () => { renderOperations(searchOps.value); });


      loadSelection.addEventListener('click', () => { invalidate(); vscode.postMessage({ type: 'loadSelection', revision: ++inputRevision }); });
      loadDocument.addEventListener('click', () => { invalidate(); vscode.postMessage({ type: 'loadDocument', revision: ++inputRevision }); });
      loadClipboard.addEventListener('click', () => { invalidate(); vscode.postMessage({ type: 'loadClipboard', revision: ++inputRevision }); });
      clearInput.addEventListener('click', () => { invalidate(); inputText.value = ''; updateInputInfo(); clearMessage(); vscode.postMessage({ type: 'clearInput', revision: ++inputRevision }); });
      closeBtn.addEventListener('click', () => vscode.postMessage({ type: 'close' }));

      element<HTMLSelectElement>('outputFormat').addEventListener('change', () => {
        const format = element<HTMLSelectElement>('outputFormat').value;
        if (format === 'utf8' || format === 'hex' || format === 'base64') vscode.postMessage({ type: 'setOutputFormat', format });
      });

      copyBtn.addEventListener('click', () => vscode.postMessage({ type: 'copyResult' }));
      replaceBtn.addEventListener('click', () => vscode.postMessage({ type: 'replaceSelection' }));
      newDocBtn.addEventListener('click', () => vscode.postMessage({ type: 'newDocument' }));

      opList.addEventListener('keydown', (event) => {
        if ((event.key === 'Enter' || event.key === ' ') && (event.target as Element).classList.contains('op-item')) { event.preventDefault(); (event.target as HTMLElement).click(); }
      });
      opList.addEventListener('click', (e) => {
        const opItem = (e.target as Element).closest<HTMLElement>('.op-item');
        if (!opItem) return;
        const opName = opItem.dataset.op;
        const favBtn = (e.target as Element).closest<HTMLElement>('.op-favorite');
        if (favBtn && opName) {
          vscode.postMessage({ type: favorites.has(opName) ? 'removeFromFavorites' : 'addToFavorites', opName });
          return;
        }
        if (opName) {
          currentOpName = opName;
          renderOperations(searchOps.value);
          invalidate();
          currentArgs = {};
          element<HTMLButtonElement>('runBtn').disabled = true;
          vscode.postMessage({ type: 'getArgDefs', opName });
        }
      });

      window.addEventListener('message', (e) => {
        const msg = e.data;
        switch (msg.type) {
          case 'setOperations':
            operations = msg.operations || [];
            renderOperations(searchOps.value);
            break;
          case 'setInput':
            if (msg.revision !== undefined && msg.revision !== inputRevision) break;
            invalidate();
            inputText.value = msg.text || '';
            inputSource.textContent = 'Source: ' + msg.source;
            updateInputInfo();
            clearMessage();
            break;
          case 'setState':
            favorites = new Set(msg.state.favorites || []);
            recents = new Set(msg.state.recents || []);
            renderOperations(searchOps.value);
            break;
          case 'setArgs':
            if (msg.opName !== currentOpName) break;
            try { renderArgs(msg.args, msg.defaults); }
            catch (error) { showMessage(String(error), true); element<HTMLButtonElement>('runBtn').disabled = true; break; }
            element<HTMLButtonElement>('runBtn').disabled = false;
            if (currentOpName && msg.safe && inputText.value.length <= MAX_LIVE_INPUT_CHARACTERS) applyOperation(currentOpName);
            else showMessage('Choose parameters, then Run Operation.');
            break;
          case 'setResult':
            if (msg.requestId !== currentRequestId) {
              // Stale response, ignore
              break;
            }
            resultText.value = msg.result || '';
            updateResultInfo();
            clearMessage();
            if (msg.error) showMessage(msg.error, true);
            if (msg.format) element<HTMLSelectElement>('outputFormat').value = msg.format;
            if (!msg.error) showMessage((msg.binary ? 'Binary source; ' : '') + 'Copy and New Document export complete ' + (msg.format || 'utf8') + ' text.');
            if (msg.size !== undefined) resultInfo.textContent = msg.size + ' source bytes' + (msg.isPreviewTruncated ? ' (preview truncated)' : '');
            if (msg.isPreviewTruncated) {
              showMessage('Preview truncated. Copy and New Document export complete ' + msg.format + ' text.', false, true);
            }
            canCopy = msg.canCopy !== undefined ? msg.canCopy : (false);
            canReplace = msg.canReplace !== undefined ? msg.canReplace : false;
            canNewDoc = msg.canNewDoc !== undefined ? msg.canNewDoc : (false);
            updateButtonStates();
            break;
          case 'clearResult':
            resultText.value = '';
            updateResultInfo();
            updateButtonStates();
            clearMessage();
            canCopy = false;
            canReplace = false;
            canNewDoc = false;
            updateButtonStates();
            break;
          case 'showInfo':
            showMessage(msg.message, false);
            break;
          case 'showError':
            showMessage(msg.message, true);
            break;
          case 'updateActionStates':
            if (msg.requestId !== undefined && msg.requestId !== currentRequestId) break;
            canCopy = msg.canCopy;
            canReplace = msg.canReplace;
            canNewDoc = msg.canNewDoc;
            updateButtonStates();
            break;
        }
      });

      // Initial render
      renderOperations();
      updateInputInfo();
      updateButtonStates();
      vscode.postMessage({ type: 'getOps' });
    })();
