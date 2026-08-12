# Configuration reference

Open **Preferences: Open Settings (UI)** and search for `tschef`, or edit `settings.json`. Settings can be defined at user or workspace scope unless VS Code indicates otherwise.

## Hover and detection

| Setting | Type / default | Description |
| --- | --- | --- |
| `tschef.highlightingEnabled` | boolean / `true` | Highlight detected patterns in the editor. |
| `tschef.confidenceThreshold` | number / `0.65` | Minimum confidence from 0 to 1 for hover conversion options. |
| `tschef.hover.enabled` | boolean / `true` | Enable encoded-string and integer-literal hovers. |
| `tschef.hover.onDemand` | boolean / `true` | Analyze the line under the cursor without a prior scan. |
| `tschef.hover.integerCalculator` | boolean / `true` | Show radix and two's-complement information for integer literals. |
| `tschef.hover.decodeChains` | boolean / `true` | Offer bounded multi-step decode previews and actions. |
| `tschef.hover.maxInputCharacters` | number / `65536` | Maximum characters analyzed by one instant hover; allowed range 256–1,048,576. |
| `tschef.hover.maxPreviewCharacters` | number / `320` | Maximum decoded preview characters; allowed range 80–4,096. |

Example for lower-cost hovers:

```json
{
  "tschef.hover.decodeChains": false,
  "tschef.hover.maxInputCharacters": 16384,
  "tschef.hover.maxPreviewCharacters": 200
}
```

## Pattern scanning and entropy

| Setting | Type / default | Description |
| --- | --- | --- |
| `tschef.autoScanOnSave` | boolean / `false` | Scan a document whenever it is saved. |
| `tschef.patterns.followActiveEditor` | boolean / `true` | Show results for the active editor; disable to pin the current results. |
| `tschef.patterns.autoScanOnFocus` | boolean / `false` | Scan a document the first time it becomes active while following. Files over 512 KB are skipped. |
| `tschef.entropyMap.enabled` | boolean / `false` | Color editor lines and minimap by Shannon entropy. |

## Results and storage

| Setting | Type / default | Description |
| --- | --- | --- |
| `tschef.readableLineWidth` | number / `100` | Target width for **Make Readable**. |
| `tschef.pipelineResultAction` | enum / `popup` | One of `popup`, `replace`, `copy`, `inline`, or `panel`. |
| `tschef.defaultPipelineScope` | enum / `global` | Preselected storage scope: `global` or `workspace`. |
| `tschef.defaultVariableScope` | enum / `global` | Preselected variable scope: `global` or `workspace`. |

Example:

```json
{
  "tschef.pipelineResultAction": "panel",
  "tschef.defaultPipelineScope": "workspace",
  "tschef.defaultVariableScope": "global",
  "tschef.readableLineWidth": 120
}
```

## Shortcut registry and history

| Setting | Type / default | Description |
| --- | --- | --- |
| `tschef.shortcuts` | object / `{}` | Registers named operation, pipeline, saved-pipeline, or history commands. Up to 1,000 entries. |
| `tschef.shortcutHistorySize` | number / `100` | Maximum in-memory history entries; allowed range 1–10,000. |

```json
{
  "tschef.shortcuts": {
    "decode-json": "From Base64 | JSON Beautify",
    "daily": "pipeline:Daily decode",
    "again": "history:last"
  },
  "tschef.shortcutHistorySize": 250
}
```

See {doc}`shortcuts` for command IDs and keybinding examples.

## Recommended profiles

### Quiet editing

```json
{
  "tschef.hover.enabled": false,
  "tschef.highlightingEnabled": false,
  "tschef.autoScanOnSave": false,
  "tschef.entropyMap.enabled": false
}
```

### Interactive analysis

```json
{
  "tschef.hover.enabled": true,
  "tschef.hover.decodeChains": true,
  "tschef.patterns.followActiveEditor": true,
  "tschef.patterns.autoScanOnFocus": true,
  "tschef.pipelineResultAction": "panel"
}
```
