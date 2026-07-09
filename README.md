<p align="center">
  <img src="assets/logo.jpg" alt="ts-chef logo" width="120" />
</p>

<h1 align="center">ts-chef</h1>

<p align="center">
  <strong>CyberChef-style data transformations, decoding, and analysis — directly inside Visual Studio Code.</strong>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=michaelweiss.vscode-ts-chef">
    <img src="https://img.shields.io/visual-studio-marketplace/v/michaelweiss.vscode-ts-chef?style=flat-square&color=2563eb&label=marketplace" alt="Visual Studio Marketplace version" />
  </a>
  <a href="https://github.com/MichaelWeissDEV/ts-chef/actions/workflows/ci.yml">
    <img src="https://github.com/MichaelWeissDEV/ts-chef/actions/workflows/ci.yml/badge.svg?branch=master" alt="CI status" />
  </a>
  <a href="https://github.com/MichaelWeissDEV/ts-chef/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/MichaelWeissDEV/ts-chef?style=flat-square&color=16a34a" alt="License" />
  </a>
</p>

## Overview

`ts-chef` brings a CyberChef-inspired workflow into Visual Studio Code. Transform, decode, encode, inspect, and analyze data without leaving the editor — powered by a TypeScript operation engine with 480+ operations.

Use it to inspect encoded strings, build repeatable transformation pipelines, decode suspicious payloads, format structured data, calculate hashes, test ciphers, and turn unreadable blobs into something you can actually read.

## Features

- **480+ operations** for encoding, decoding, hashing, compression, cryptography, parsing, formatting, images, and text.
- **Operations & Recipe panes** — a searchable, grouped operation list; add steps with `＋`, edit their arguments inline, then apply the recipe or save it as a reusable pipeline.
- **Quick Convert** — apply a single operation to the current selection from a searchable picker.
- **Deep Analysis (Magic)** — recursively identify encodings and follow multi-step decode chains (e.g. `Base64 → Gunzip`), with a decoded preview and string statistics (length, entropy, charset) before you commit.
- **Pattern scanning** — detect Base64, hex, hashes, JWTs, UUIDs, URLs, and more in a document or across the whole workspace, with inline highlighting, hovers, and per-file grouping.
- **YARA scanning** — run YARA rules from a `.yar` file or inline against the selection or document.
- **Entropy heatmap** — optionally colour lines by Shannon entropy to spot packed, encrypted, or encoded blocks.
- **Smart Format & Make Readable** — auto-detect and pretty-print JSON/XML/SQL/CSS/JS, or reflow extremely long lines and blobs into a readable form.
- **Export** — save scan results to JSON or CSV.
- **Variables & saved pipelines** — store values (referenced as `$name` or `{{name}}`) and reusable recipes, scoped globally or per workspace.

## Installation

Install `ts-chef` from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=michaelweiss.vscode-ts-chef), or search for **ts-chef** in the VS Code Extensions view.

**Requirements:** Visual Studio Code `1.85.0` or newer.

## Usage

Open the **ts-chef** container in the Activity Bar to reach the Operations, Recipe, Found Patterns, Variables, and Pipelines panes. All commands are also available from the Command Palette under the `tschef:` prefix.

### Transform a selection

- **Quick Convert** (`Ctrl+Alt+C` / `Ctrl+Cmd+C`) — select text, then pick an operation to apply it in place.
- **Recipe pane** — click an operation's `＋` to add it, tweak arguments, then **Apply to selection** or **Save as pipeline**.
- **Run Saved Pipeline** (`Ctrl+Alt+R` / `Ctrl+Cmd+R`) — pick and run a stored pipeline.

### Analyze data

- **Deep Analysis of Selection** — recursively detect encodings and decode chains; each candidate shows a preview before you apply it.
- **Scan Document / Scan Workspace for Patterns** — find recognizable encoded or structured values; results appear in the Found Patterns pane and can be highlighted, hovered, and exported. The pane follows the active editor by default; use the eye button in its title bar to pin the current results instead.
- **YARA Scan Selection/Document** — match the input against YARA rules.
- **Toggle Entropy Heatmap** — shade lines by entropy (also `tschef.entropyMap.enabled`).

### Make code readable

- **Smart Format** (`Ctrl+Alt+F` / `Ctrl+Cmd+F`) — auto-detects JSON, XML/HTML, SQL, CSS, or JavaScript and opens a pretty-printed copy in a new editor.
- **Make Readable** — reflows extremely long lines or one-line blobs (hex, Base64, delimiter-heavy strings) into a readable multi-line form without changing the data.

### Pipeline syntax

Run pipelines using a pipe-syntax string:

```
OperationName | OperationName(arg1=value1, arg2=value2)
```

- Steps are separated by `|`.
- Arguments go inside parentheses as `key=value` pairs (or positional indices).
- Pipe characters inside parentheses are preserved (e.g. for regex patterns).

Example:

```
From Base64 | To Hex(Uppercase=true) | URL Encode
```

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `tschef.highlightingEnabled` | `true` | Highlight detected patterns in the editor. |
| `tschef.confidenceThreshold` | `0.9` | Minimum confidence for hover conversion options. |
| `tschef.autoScanOnSave` | `false` | Scan documents automatically on save. |
| `tschef.patterns.followActiveEditor` | `true` | Found Patterns view follows the active editor; turn off to pin the current results. |
| `tschef.patterns.autoScanOnFocus` | `false` | Scan a document the first time it becomes active (when following). |
| `tschef.entropyMap.enabled` | `false` | Colour lines by Shannon entropy (heatmap). |
| `tschef.readableLineWidth` | `100` | Target width for **Make Readable** reflow. |
| `tschef.pipelineResultAction` | `popup` | How to present a pipeline/operation result (popup, replace, copy, inline, panel). |
| `tschef.defaultPipelineScope` | `global` | Default scope when saving a pipeline. |
| `tschef.defaultVariableScope` | `global` | Default scope when saving a variable. |

## Documentation

- [Repository](https://github.com/MichaelWeissDEV/ts-chef)
- [Usage Guide](docs/usage.md)
- [Contributing Guide](docs/contributing.md)
- [Operations Reference](docs/operations.md)

## Development

```bash
git clone https://github.com/MichaelWeissDEV/ts-chef.git
cd ts-chef
npm install
```

Common commands:

```bash
npm run build     # bundle the extension with esbuild
npm test          # run the Jest test suite
npm run lint      # run ESLint
npm run package   # build a .vsix
```

Project layout:

- `src/extension.ts` — VS Code extension entry point (commands, providers, wiring).
- `src/chef/` — the TypeScript operation engine.
- `src/chef/operations/` — individual transformation operations.
- `src/providers/` — sidebar, hover, scan, decoration, magic, entropy, and format providers.
- `src/commands/` — pipeline runner and result presentation.
- `src/panels/` — the pipeline editor webview.
- `test/` — the test suite.

## License

Licensed under the [Apache License 2.0](https://github.com/MichaelWeissDEV/ts-chef/blob/master/LICENSE).

Many operations are ported from [GCHQ CyberChef](https://github.com/gchq/CyberChef), which is also licensed under Apache 2.0.
