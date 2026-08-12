# Troubleshooting

## The ts-chef icon or views are missing

1. Confirm ts-chef is installed and enabled for the current VS Code profile.
2. Run **View: Open View...** and search for `ts-chef`.
3. Right-click the Activity Bar and ensure the ts-chef container is checked.
4. Run **Developer: Reload Window** after installing or upgrading.
5. Check **Help: Toggle Developer Tools** and the Extension Host log for activation errors.

## No operation appears for my selection

- Select only the intended value, without surrounding quotes or punctuation when possible.
- Lower `tschef.confidenceThreshold` if hover suggestions are too conservative.
- Use **Quick Convert Selection** and search the complete catalog manually.
- Use **Deep Analysis of Selection** for layered encodings.
- Confirm that the operation's display name exists in {doc}`operation-catalog`.

## Hover analysis does not appear

Check:

- `tschef.hover.enabled` is `true`;
- `tschef.hover.onDemand` is `true` if the document was not scanned;
- the value is below `tschef.hover.maxInputCharacters`;
- the confidence threshold is not too high;
- another extension is not monopolizing or obscuring the hover UI.

For integer literals, also enable `tschef.hover.integerCalculator` and use a supported source-code language mode.

## A pipeline operation cannot be found

Pipeline text uses operation **display names**, not TypeScript class names. Copy the spelling from the Operations view or generated catalog. Ensure separators and parentheses are balanced, and quote argument values that contain a pipe.

Start with a minimal expression and add steps back one at a time:

```text
From Base64
```

```text
From Base64 | JSON Beautify
```

## Live preview is disabled

This is expected if any of the following is true:

- input comes from the editor, document, or clipboard instead of manual text;
- output would modify or leave the preview;
- an operation is expensive, random, networked, file-oriented, or analysis-oriented;
- data or intermediate output exceeds a safety bound.

Select **Run** explicitly. Live preview restrictions are safety policy, not evidence that the pipeline is invalid.

## A replacement was refused

ts-chef snapshots selected/editor text before asynchronous execution. If that range changes while an operation is running, the extension refuses to overwrite newer content. Select the intended text again and rerun the action.

## Workspace pipelines or variables are unavailable

VS Code Restricted Mode disables workspace-scoped storage. Trust the workspace only if you understand and accept its contents, or use global storage. The status bar and **Workspace Trust** commands show the current state.

## Pattern results change when switching editors

The Found Patterns view follows the active editor by default. Use the eye button or **tschef: Pin Patterns (Stop Following)** to keep the current result set. Set `tschef.patterns.followActiveEditor` to `false` for pinned-by-default behavior.

## Scanning is slow

- Prefer a document scan over a workspace scan.
- Disable `tschef.autoScanOnSave` and `tschef.patterns.autoScanOnFocus` when working with many large files.
- Clear results that are no longer required.
- Avoid enabling the entropy heatmap permanently for very large documents.
- Record reproducible timing, file sizes, VS Code version, OS, and ts-chef version when reporting a regression.

## A graph will not connect or run

- Graphs must be acyclic; remove any connection that feeds a downstream result back into an ancestor.
- Ensure every operation node is reachable from an input.
- Connect at least one named output and select a primary output.
- Inspect the status shown on the first failing node.
- Temporarily reduce the graph to one branch to isolate malformed arguments or incompatible data.

## Static triage or YARA found something unexpected

Heuristics and YARA rules can produce false positives and false negatives. Validate the exact matching evidence, compare with known-good content, and use an isolated analysis environment if behavioral confirmation is required.

## Reporting a bug

Search [existing issues](https://github.com/MichaelWeissDEV/ts-chef/issues), then open a new report with:

- ts-chef and VS Code versions;
- operating system;
- minimal input that is safe to share;
- exact operation/pipeline and arguments;
- expected and actual result;
- relevant Extension Host logs;
- whether the workspace is trusted.

Never attach live credentials, private keys, customer data, or an active malicious payload to a public issue.
