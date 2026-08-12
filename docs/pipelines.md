# Pipelines and recipes

Pipelines combine operations into repeatable workflows. Use the Recipe sidebar for a compact ordered workflow, the Pipeline Editor for richer input/output controls, or Graph mode when one input must feed multiple branches.

## Ordered pipeline syntax

Separate operation display names with a pipe (`|`):

```text
From Base64 | JSON Beautify
```

Operation names are matched against the registered catalog. The spelling shown in the Operations view and {doc}`operation-catalog` is authoritative.

### Arguments

Put arguments in parentheses after an operation. Named arguments use `key=value`; positional arguments use their numeric index.

```text
From Base64 | To hex(Delimiter=Space) | SHA2
```

Use quotes when a string contains punctuation or whitespace that the parser could interpret. Pipe characters inside a quoted or parenthesized argument are preserved instead of splitting the pipeline.

```text
Find / Replace(Find="left|right", Replace="middle") | To Base64
```

The visual editor is the safest way to discover argument names and valid choices. Select an operation and fill in the generated controls; the synchronized text representation updates automatically.

## List editor

List mode represents one ordered chain:

1. Search the operation catalog.
2. Add operations in execution order.
3. Reorder or remove steps.
4. Expand a step to edit its arguments.
5. Choose an input and output destination.
6. Preview when allowed, or select **Run**.

Each operation receives the preceding operation's output. If any step fails, execution stops and the editor reports the failing step.

## Graph editor

Graph mode represents a directed acyclic graph (DAG). It supports:

- freely positioned operation nodes;
- explicit input and output ports;
- fan-out, where one result feeds several downstream operations;
- multiple named output nodes and result tabs;
- a selected primary output that remains compatible with ordered/list execution;
- persisted node positions, connections, topology, and output names.

An ordered pipeline initially appears as a linear graph. Add branches by connecting an output port to more than one downstream node. Cycles are rejected: a graph must always have a valid topological execution order.

```{admonition} Multiple branches do not mutate each other
:class: note
Each downstream branch receives the upstream node's result. A branch cannot change the value observed by its siblings.
```

## Inputs

The Pipeline Editor accepts:

| Input | Behavior |
| --- | --- |
| **Manual text** | Uses text entered directly in the panel. This is the only input eligible for automatic live preview. |
| **Editor selection** | Uses the selected range in the active editor. |
| **Active document** | Uses the complete active document. |
| **Clipboard** | Reads the current clipboard when the pipeline runs. |

For an editor selection/document, ts-chef snapshots the source range before asynchronous work. If that text changes before the result returns, ts-chef refuses a stale replacement.

## Outputs and result actions

The full editor can keep output in its preview, copy it to the clipboard, replace source text, or open a new editor. Commands outside the panel follow `tschef.pipelineResultAction`:

| Value | Result behavior |
| --- | --- |
| `popup` | Shows a message with Replace and Copy actions. |
| `replace` | Replaces the selection, or the whole document if the selection is empty. |
| `copy` | Copies the result to the clipboard. |
| `inline` | Pins a CodeLens result row with Replace, Copy, and Close. |
| `panel` | Reuses a result panel beside the editor. |

## Live preview policy

Live preview is intentionally conservative. It is enabled only for manual input, preview-only output, bounded intermediate data, and deterministic operations considered safe for repeated background execution.

Networked, expensive, random, file-oriented, and malware-analysis operations always require an explicit **Run**. This protects editor responsiveness and avoids triggering side effects merely because an argument changed.

## Saving and storage scopes

### Global pipelines

Global pipelines are stored in VS Code extension storage and are available across workspaces in the current VS Code profile.

### Workspace pipelines

Workspace pipelines are stored under `.vscode/ts-chef/` in the current workspace. They can be reviewed and shared with the repository when appropriate. They are unavailable in Restricted Mode.

The default choice is controlled by `tschef.defaultPipelineScope`; you can select the other scope while saving.

## Standard pipeline library

ts-chef bundles 28 recipes for common encoding, decoding, structured-data, PowerShell, IOC, payload, entropy, string extraction, and deobfuscation tasks.

- Run **tschef: Browse Standard Recipe Library** to load one into Recipe.
- Run **tschef: Open Saved/Standard Pipeline in Editor** to inspect or adapt it.
- Use the separate **Standard Pipelines** and **My Pipelines** groups in the Pipelines view.
- Save a modified standard pipeline under a new personal name.

## Running a pipeline

Pipelines can be launched from:

- the Recipe view;
- the Pipeline Editor;
- **tschef: Run Pipeline on Selection**;
- **tschef: Run Saved Pipeline**;
- an item in the Pipelines view;
- `pipeline:<name>` in the shortcut registry;
- a generated `tschef.shortcut.<id>` command.

## Variables in pipelines

Reference stored values explicitly with `{{name}}` in input or arguments:

```text
AES Decrypt(Key={{aes-key}}) | From UTF8
```

Literal shell expressions such as `$HOME` or PowerShell variables such as `$env:TEMP` are not expanded. See {doc}`variables` for scopes and safe usage.

## Design guidelines

- Give saved pipelines outcome-oriented names such as `Decode vendor token`.
- Prefer named arguments so the definition remains readable if argument order changes.
- Keep secrets in variables instead of committing them inside workspace pipeline files.
- Use named graph outputs such as `decoded-json`, `sha256`, or `indicators`.
- Treat network and security-analysis steps as explicit-run workflows.
- Test a shared pipeline with representative and malformed inputs before committing it.
