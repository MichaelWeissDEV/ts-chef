# Changelog

All notable changes to the **ts-chef** VS Code extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.8.0] - 2026-07-17

### Added

- Instant, on-demand analysis hovers with bounded decoded previews, exact-range one-click replacement, safe multi-step decode suggestions, and complete long-token targeting.
- Language-aware integer-literal hover calculator for decimal, hex, binary, octal, bit widths, and signed/unsigned two's-complement values.
- Additive DAG graph mode for the Pipeline Editor with freely movable operation nodes, explicit connectors, fan-out branches within bounded graphs, multiple named output nodes, live node/data-flow status, output tabs, and graph persistence. Inputs support manual text, editor selection/document, and clipboard data; outputs support preview, clipboard, editor replacement, and new documents.
- Separate collapsible Standard Pipelines and My Pipelines groups, plus a direct Open Pipeline Graph command and Pipelines-view button.
- Searchable library of 28 built-in decoding, encoding, structured-data, IOC, and malware-analysis pipelines.
- Bounded offline Static Malware Triage command with file signatures, byte statistics, IOCs, suspicious behavior indicators, embedded encoding previews, extracted strings, risk scoring, and defanged Markdown output.

### Fixed

- Preserve structured JSON between pipeline steps and present non-text binary output losslessly as hexadecimal instead of replacement characters.
- Reject malformed binary, decimal, hexadecimal, and arbitrary-radix input instead of partially parsing or silently wrapping invalid bytes.
- Prevent stale/ambiguous hover edits, cropped long-token replacements, URL-detector quadratic scans, and hover-triggered decompression bombs.
- Await asynchronous operations consistently, make YARA initialization failures/timeouts visible, and scan file bytes rather than decoded editor text when appropriate.
- Decode escaped CSV row delimiters correctly, preserve recipe arguments, initialize option defaults correctly, and fail unavailable operations explicitly rather than silently skipping them.
- Make the Magic operation usable from recipes and both pipeline views, with bounded recursive decoding and literal-only cribs.

### Security

- Webview messages, sizes, operation names, arguments, run generations, and editor targets are validated in the extension host; the graph view uses a strict nonce CSP and no inline handlers.
- Live pipeline preview uses a conservative deterministic-operation allowlist and cannot perform output side effects.
- Editor replacements use immutable document/range snapshots and are refused when the source changes during asynchronous analysis.
- YARA samples/rules/reports, malware triage, gzip/zlib output, deep analysis, and YAML parsing/alias expansion have explicit size, depth, and node limits.
- Pipeline/variable stores validate their schema, reject symlinked workspace paths/files, write atomically, and do not load or write workspace-scoped data in Restricted Mode.

## [0.7.0] - 2026-07-09

### Added

- **YARA scan** (`tschef: YARA Scan Selection/Document`): run YARA rules — loaded from a `.yar` file or typed inline — against the selection or whole document; matches (with counts and metadata) open in a new editor.
- **Export scan results** (`tschef: Export Scan Results`, button in the Found Patterns view): write all detected patterns to JSON or CSV via a save dialog, with file/line/column/label/confidence/operation/value columns.
- **Follow Active Editor** for the Found Patterns view (eye toggle in the view title, setting `tschef.patterns.followActiveEditor`, on by default): the view now mirrors the active editor and shows that file's matches; switching editors switches the view. Turn it off (pin) to keep the current results while you move around. A workspace scan temporarily shows every file until you focus one again. Optional `tschef.patterns.autoScanOnFocus` scans a document the first time it becomes active.
- **Entropy heatmap** (`tschef: Toggle Entropy Heatmap`, setting `tschef.entropyMap.enabled`): optionally colour editor lines by Shannon entropy — calm green through hot magenta, mirrored on the overview ruler — to spot packed, encrypted or encoded blocks at a glance. Off by default.
- **Smart Format** (`tschef: Smart Format`, `Ctrl+Alt+F` / `Ctrl+Cmd+F`): auto-detects JSON, XML/HTML, SQL, CSS or JavaScript and pretty-prints it into a new editor with the matching language mode; falls back to Make Readable when no structured format is recognised.
- **Make Readable** (`tschef: Make Readable`): reflow extremely long lines or single-line blobs into a readable multi-line form — fixed-width rows for hex/Base64, one entry per line for delimiter-heavy strings, soft word-wrap otherwise — without changing the data (setting `tschef.readableLineWidth`).
- `runOpAsync` runner helper so Promise-returning operations (e.g. YARA) produce their real output instead of `[object Promise]`.

### Fixed

- Corrected the repository/bugs/homepage URLs in `package.json` and the Marketplace badge/install id in the README (the version badge pointed at a non-existent extension id).

## [0.6.0] - 2026-07-08

### Added

- **Magic (recursive auto-decode)**: Deep Analysis now follows multi-step decode chains (e.g. `Base64 → Gunzip`, `Base64 → Base64`) up to 3 levels deep, sniffing gzip/zlib/LZ4 magic bytes after each step, and shows a decoded preview for every path before you apply it.
- Deep Analysis shows string statistics (length, Shannon entropy, charset guess) and reports them even when nothing is detected.
- **Workspace scan** (`tschef: Scan Workspace for Patterns`, button in the Found Patterns view): scans up to 300 text files (≤ 512 KB) with progress and cancellation; the Patterns view groups results per file.
- New detectors: bcrypt hashes, Base64 payloads of `data:` URIs, `\x`-escaped hex bytes.
- Unit tests for the detector and the magic decoder (21 new tests).
- Operations pane: collapsible module groups with operation counts — collapsed by default, auto-expanded while filtering, click a header to toggle (ported from the erfur fork).
- Operations filter now also matches internal operation names in addition to display names and modules.
- Recipe pane reveals itself (without stealing focus) when an operation is added via ＋.
- Recipe argument editors: number inputs respect `min`/`max`/`step` from the operation's arg config; argument labels show the arg hint as tooltip.
- Default keybindings: `Ctrl+Alt+C` (`Ctrl+Cmd+C` on macOS) for Quick Convert Selection, `Ctrl+Alt+R` (`Ctrl+Cmd+R` on macOS) for Run Saved Pipeline.
- Welcome content for empty Pipelines, Variables and Found Patterns views with quick-action links.
- CI workflow: lint, tests with coverage and an installable VSIX artifact on every push/PR (ported from the erfur fork).
- Marketplace keywords for better discoverability.

### Fixed

- Found Patterns view: group nodes never returned their children — matches were invisible below the group headers.
- "Clear Scan Results" now clears all scanned documents, not just the active editor's.

### Changed

- Recipe pane buttons renamed to "Apply to selection" and "Save as pipeline".
- Pipelines/Variables trees show the scope as "Global · …" / "Workspace · …" instead of a trailing "[global]" tag (ported from the erfur fork).
- Operations pane click handling moved from inline `onclick` attributes to event delegation with data attributes (hardening).
- VSIX trimmed further: `*.vsix` and unused asset files are excluded; only the extension icon ships.

## [0.4.0] - 2026-06-19

### Added

- Created type-safe pipeline framework using `TypedOperation` and `Pipeline_new`.
- Implemented O(1) registry map lookup for high-performance operation resolve.
- Integrated WebAssembly-based `hash-wasm` to replace native `argon2` module dependency for secure and platform-agnostic execution.
- Added comprehensive coverage check for continuous integration.
- Configured Jest mock objects for ES modules (`d3`, `geodesy`, `flat`, and `@li0ard/streebog`) in CommonJS-based test runtime.

### Fixed

- Fixed critical async pipeline bugs: changed synchronous `runPipeline()` to `async/await` execution model.
- Restructured `Pipeline_new` to break circular dependency with `runner.ts` using `opsCore.ts` helper module.
- Resolved argument parser bug in `parsePipeline()` that caused issues when splitting strings containing pipeline delimiters inside parentheses.
- Added debounce to decoration updates on editor text changes for smoother typing performance.

### Security

- Replaced native cryptographic packages with secure pure-JS/WASM equivalents.
