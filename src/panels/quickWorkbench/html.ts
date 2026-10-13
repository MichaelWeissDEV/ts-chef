export function buildHtml(csp: string, nonce: string, script: string, style: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <style nonce="${nonce}">${style}  </style>
</head>
<body>
  <div class="header">
    <h1>ts-chef Quick Convert</h1>
    <div class="header-actions">
      <button id="closeBtn" type="button">Close</button>
    </div>
  </div>
  <div class="section">
    <div class="section-header">
      <span>Input</span>
      <div class="input-controls">
        <button id="loadSelection" type="button" title="Load from current selection">From Selection</button>
        <button id="loadDocument" type="button" title="Load entire document">From Document</button>
        <button id="loadClipboard" type="button" title="Load from clipboard">From Clipboard</button>
        <button id="clearInput" type="button" title="Clear input">Clear</button>
      </div>
    </div>
    <textarea aria-label="Input" id="inputText" placeholder="Enter text or load from selection/document/clipboard..."></textarea>
    <div class="input-info">
      <span id="inputSize"></span>
      <span id="inputSource" class="source-indicator"></span>
    </div>
  </div>
  <div class="section operations-section">
    <div class="section-header">
      <span>Operation</span>
      <label id="resultInfo" class="size-info"></label>
    </div>
    <input type="text" aria-label="Search operations" id="searchOps" placeholder="Search operations... (e.g., From Base64, To Hex)">
    <div id="opList" class="op-list"></div>
    <div id="argsEditor"></div>
    <button id="runBtn" type="button" disabled>Run Operation</button>
  </div>
  <div class="section result-section">
    <div class="section-header">
      <span>Output</span>
      <div class="result-actions">
        <button id="copyBtn" type="button" title="Copy result to clipboard" disabled>Copy</button>
        <button id="replaceBtn" type="button" title="Replace original selection" disabled>Replace</button>
        <button id="newDocBtn" type="button" title="Open in new document" disabled>New Document</button>
      </div>
    </div>
    <textarea aria-label="Output" id="resultText" placeholder="Result will appear here..." readonly></textarea>
    <div id="statusMessage" role="status" aria-live="polite"></div>
  </div>
  <script nonce="${nonce}">
${script}
  </script>
</body>
</html>`;
  }

