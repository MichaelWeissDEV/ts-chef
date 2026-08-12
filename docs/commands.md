# Command reference

Open the Command Palette and type `tschef:` to discover the extension's commands. ts-chef assigns no default keyboard shortcuts; bind any command in **Preferences: Open Keyboard Shortcuts**.

## Conversion and pipelines

| Command title | Command ID | Purpose |
| --- | --- | --- |
| tschef: Quick Convert Selection | `tschef.quickConvert` | Choose and run one operation on selected text. |
| tschef: Run Pipeline on Selection | `tschef.runPipeline` | Enter or choose an ordered pipeline for the selection. |
| tschef: Open Pipeline Editor | `tschef.openPipelineEditor` | Open the full editor in list mode. |
| tschef: Open Pipeline Graph | `tschef.openPipelineGraph` | Open the full editor directly in graph mode. |
| tschef: Open Saved/Standard Pipeline in Editor | `tschef.openPipelineInEditor` | Select a pipeline and inspect it in the full editor. |
| tschef: Run Saved Pipeline | `tschef.runSavedPipelinePicker` | Run a saved or bundled pipeline on editor input. |
| tschef: Load into Recipe | `tschef.loadRecipe` | Load a saved/bundled definition into Recipe. |
| tschef: Browse Standard Recipe Library | `tschef.browseRecipeLibrary` | Search the bundled recipe catalog. |

## Analysis and formatting

| Command title | Command ID | Purpose |
| --- | --- | --- |
| tschef: Scan Document for Patterns | `tschef.scanDocument` | Scan the active document. |
| tschef: Scan Workspace for Patterns | `tschef.scanWorkspace` | Scan supported workspace files. |
| tschef: Deep Analysis of Selection | `tschef.deepAnalysis` | Follow bounded recursive decoding candidates. |
| tschef: Static Malware Triage | `tschef.malwareTriage` | Produce a bounded offline static report. |
| tschef: YARA Scan Selection/Document | `tschef.yaraScan` | Evaluate YARA rules against selected scope. |
| tschef: Toggle Entropy Heatmap | `tschef.toggleEntropyMap` | Toggle line/minimap entropy coloring. |
| tschef: Smart Format (Auto-Detect & Beautify) | `tschef.smartFormat` | Detect and format structured or source text in a new editor. |
| tschef: Make Readable (Reflow Long Lines) | `tschef.makeReadable` | Reflow long encoded/delimited lines. |
| tschef: Toggle Pattern Highlighting | `tschef.toggleHighlight` | Toggle decorations for detected matches. |

## Found Patterns view

| Command title | Command ID | Purpose |
| --- | --- | --- |
| tschef: Patterns Follow Active Editor | `tschef.followActiveEditorOn` | Resume following the active editor. |
| tschef: Pin Patterns (Stop Following) | `tschef.followActiveEditorOff` | Keep the current result set visible. |
| tschef: Refresh Scan | `tschef.refreshScan` | Repeat the relevant scan. |
| tschef: Export Scan Results | `tschef.exportScanResults` | Export current results as JSON or CSV. |
| tschef: Clear Scan Results | `tschef.clearScanResults` | Remove current scan results and decorations. |

## Variables

| Command title | Command ID | Purpose |
| --- | --- | --- |
| tschef: Set Variable | `tschef.setVariable` | Create or update a variable. |
| tschef: Add Variable | `tschef.addVariable` | Add a variable from the Variables view. |
| tschef: Show Variables | `tschef.showVariables` | Inspect stored variable names/scopes. |

## Shortcuts and session history

| Command title | Command ID | Purpose |
| --- | --- | --- |
| tschef: Run Registered Shortcut | `tschef.runShortcut` | Pick or invoke a `tschef.shortcuts` entry. |
| tschef: Configure Keyboard Shortcuts | `tschef.configureShortcuts` | Open settings/keybinding JSON. |
| tschef: Repeat Last Operation | `tschef.repeatLastOperation` | Repeat the newest original action. |
| tschef: Apply Previous Operation in History | `tschef.cycleOperationHistoryBack` | Move older through the session history. |
| tschef: Apply Next Operation in History | `tschef.cycleOperationHistoryForward` | Move newer through the session history. |
| tschef: Repeat Operation from History... | `tschef.repeatOperationFromHistory` | Search and run a history entry. |
| tschef: Clear Operation History | `tschef.clearOperationHistory` | Clear memory-only history. |

## Binding a command

```json
[
  {
    "key": "ctrl+alt+d",
    "command": "tschef.quickConvert",
    "when": "editorTextFocus && editorHasSelection"
  },
  {
    "key": "ctrl+alt+g",
    "command": "tschef.openPipelineGraph"
  }
]
```

Use platform-appropriate keys and `when` clauses to avoid conflicts with existing VS Code or extension bindings.
