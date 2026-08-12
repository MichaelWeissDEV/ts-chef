# Overview

ts-chef is a TypeScript-powered Visual Studio Code extension for CyberChef-style transformations and static data analysis. It places an operation catalog, recipe builder, saved pipelines, encoded-value inspection, and security-oriented tools beside the content you are working on.

## What you can do

- Run one of **479 registered operations** on a selection or document.
- Combine operations into an ordered recipe such as `From Base64 | JSON Beautify`.
- Build directed acyclic graphs with fan-out branches and multiple named outputs.
- Save personal pipelines globally or share workspace pipelines through `.vscode/ts-chef/`.
- Inspect Base64, hexadecimal, URL-encoded data, hashes, tokens, and integer literals through editor hovers.
- Scan a document or workspace for recognizable patterns and export the results as JSON or CSV.
- Perform bounded static malware triage, YARA scanning, entropy visualization, and recursive decode analysis.
- Register any operation or pipeline as a VS Code command and assign your own keybinding.

## The five sidebar views

Open the chef icon in the Activity Bar to access:

| View | Purpose |
| --- | --- |
| **Operations** | Search the full catalog by display name or module and add or run operations. |
| **Recipe** | Assemble and configure an ordered sequence of operations. |
| **Found Patterns** | Browse document/workspace scan matches, follow the active editor, highlight results, and export them. |
| **Variables** | Manage explicit `{{name}}` values at global or workspace scope. |
| **Pipelines** | Run, load, edit, or graph bundled and saved pipelines. |

## Choosing a workflow

| Need | Best starting point |
| --- | --- |
| Convert a selected value once | **Quick Convert Selection** |
| Explore a likely encoded value | Hover it or run **Deep Analysis of Selection** |
| Repeat several ordered steps | Build a **Recipe** or list pipeline |
| Produce several outputs from one input | Use the graph Pipeline Editor |
| Reuse a workflow in every workspace | Save a global pipeline |
| Share a workflow with a project | Save a workspace pipeline |
| Run a transformation from the keyboard | Configure `tschef.shortcuts` and a keybinding |
| Locate encoded or suspicious values | Scan the document/workspace or enable the entropy map |

## Compatibility

- Visual Studio Code 1.85.0 or newer.
- Windows, macOS, and Linux environments supported by VS Code.
- Restricted Mode is supported with limitations: workspace-scoped pipelines and variables are unavailable.

## Terminology

**Operation**
: One transformation with zero or more configured arguments.

**Recipe**
: An ordered list of operations edited in the sidebar.

**Pipeline**
: A reusable transformation definition. It may be an ordered list or a graph.

**Standard pipeline**
: One of 28 bundled recipes supplied by ts-chef.

**Named output**
: A terminal graph node whose value appears in its own result tab.
