# Usage Guide

`ts-chef` is designed to be intuitive and non-intrusive. The quickest entry points are instant hovers, one-operation conversion, reusable recipes, and the list/graph pipeline editor.

## Instant Hover Analysis

Hover a recognized encoded value to see its likely format, confidence, statistics, and a bounded decoded preview. No document scan is required. **Decode here** replaces the exact hovered occurrence; multi-step candidates can be applied as a pipeline. Long tokens are tracked as complete values while preview work stays bounded.

In source code, hovering an integer literal such as `0xffu8`, `0b1010`, `0755`, or `1_000_000` displays decimal, hexadecimal, binary, octal, inferred/declared width, and signed and unsigned two's-complement interpretations. The hover can rewrite the literal into another radix using syntax appropriate for the document language.

## 1. Quick Convert Selection

1.  Select any text or data blob in your editor.
2.  Right-click and select **ts-chef: Quick Convert Selection**.
3.  Choose from a list of automatically suggested transformations based on the data format.

## 2. Pipeline Editor (List and Graph)

For complex multi-step transformations:

1.  Open the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2.  Type **ts-chef: Open Pipeline Editor**.
3.  Search for and add operations to your pipeline.
4.  Use **List** for a classic ordered pipeline, or switch to **Graph** for a directed acyclic graph with explicit connections.
5.  In Graph mode, freely position nodes, connect ports, fan one value into multiple branches, add named output nodes, and select which output to inspect. Saved pipelines retain the complete topology and layout; the selected connected output supplies the list-compatible primary path.
6.  Configure arguments, select manual text, editor selection/document, or clipboard as input, then select preview, clipboard, editor replacement, or a new editor as output and click **Run**.

Live preview is available only for bounded deterministic operations with manual input and preview-only output. Potentially expensive, random, networked, file-oriented, or analysis operations always require an explicit run.

Use **tschef: Open Pipeline Graph** to open this editor directly in graph mode. The Pipelines sidebar separates bundled **Standard Pipelines** from workspace/global **My Pipelines** in two collapsible groups; both can be opened in the same editor.

Use **tschef: Browse Standard Recipe Library** to load one of the bundled pipelines into the Recipe pane, or **tschef: Open Saved/Standard Pipeline in Editor** to open any bundled/saved pipeline directly in the list/graph editor. The same action is available from each item in the Pipelines tree.

## 3. Pattern Highlighting & Scanning

-   **Manual Scan:** Run **ts-chef: Scan Document for Patterns** to find all potentially encoded blobs (Base64, Hex, etc.).
-   **Auto-Scan:** Enable `ts-chef.autoScanOnSave` in settings to automatically scan files when they are saved.
-   **Highlighting:** All identified blobs will be highlighted in the editor. Hover over them to see quick decoding previews.

## Static Malware Triage

Run **tschef: Static Malware Triage** on a selection or the active file. The bounded offline analyzer reports entropy and byte statistics, validated file signatures, defanged IOCs, suspicious commands/LOLBins/persistence/injection behavior, embedded encodings, extracted ASCII/UTF-16 strings, and a heuristic risk summary. It does not execute the payload, resolve domains, or make network requests.

## Variables

Stored global/workspace variables use the explicit `{{name}}` syntax in operation, saved-pipeline, and list/graph-editor input. `$name` is never expanded automatically, so shell, PowerShell, and malware-analysis samples remain byte-for-byte intact unless an explicit template is present.

Workspace-scoped variables and pipelines are not loaded or written while VS Code is in Restricted Mode. Store files are schema-validated, bounded, written atomically, and are not loaded or overwritten through repository-controlled symbolic links.

## Keyboard Shortcuts and History

No keys are occupied by default. Configure named operations, inline pipelines, saved pipelines, or history navigation under `tschef.shortcuts`, then bind the generated `tschef.shortcut.<id>` command. The session-only history can repeat the last action, cycle backward/forward, or apply an exact 1-based offset without recording repetitions again. See [Keyboard Shortcuts and Operation History](shortcuts.md).

You can use the **Register** operation to save intermediate results into variables (e.g., `$R0`, `$R1`). These can then be passed as arguments into subsequent operations in the same pipeline.
