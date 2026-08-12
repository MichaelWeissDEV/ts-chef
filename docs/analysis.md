# Analysis and security tools

ts-chef includes inspection tools that help characterize data before transforming it. Their output is evidence for an analyst—not a malware verdict, content guarantee, or replacement for a sandbox.

## Instant encoded-value hovers

Hover a recognized Base64, Base64URL, hexadecimal, URL-encoded, escaped, token, hash, or similar value. The hover can show:

- likely type and confidence;
- length, entropy, and character statistics;
- a bounded decoded preview;
- a one-click **Decode here** action;
- safe, bounded multi-step decode candidates when enabled.

The preview is capped by `tschef.hover.maxInputCharacters` and `tschef.hover.maxPreviewCharacters`. For long Base64 and hex tokens, the action remains attached to the complete detected token even though only a bounded preview is calculated.

Disable all instant hovers with `tschef.hover.enabled`, on-demand detection with `tschef.hover.onDemand`, or decode chains with `tschef.hover.decodeChains`.

## Integer literal calculator

In source code, hover literals such as `0xffu8`, `0b1111_0000`, `0755`, or `1_000_000`. Language-aware analysis provides:

- decimal, hexadecimal, binary, and octal representations;
- inferred or declared bit width;
- signed and unsigned interpretations;
- two's-complement bit patterns;
- replacements in another radix using syntax suitable for the document language.

Supported language families include C/C++, Rust, Python, JavaScript/TypeScript, Go, and related syntaxes. Toggle this independently with `tschef.hover.integerCalculator`.

## Deep Analysis

Run **tschef: Deep Analysis of Selection** for recursive identification and bounded decoding. It follows plausible chains—for example Base64 followed by Gunzip—and presents candidates with decoded previews and statistics before you apply anything.

Use Deep Analysis when:

- a value appears layered or nested;
- the correct first decoding step is unclear;
- you want to compare candidates without modifying the source;
- a hover preview is insufficient for the selection.

## Pattern scanning

### Document scan

**tschef: Scan Document for Patterns** searches the active document for recognizable encoded and structured values. Matches can include Base64, hexadecimal strings, hashes, JWTs, UUIDs, URLs, and related forms.

### Workspace scan

**tschef: Scan Workspace for Patterns** searches supported files across the workspace and groups results by file. Use this deliberately on large projects: bounds protect the extension host, but more files still require more work.

### Found Patterns view

The view can:

- group and navigate matches by file;
- highlight matches in the active editor;
- follow the active editor automatically;
- pin the current result set with the eye button;
- refresh or clear results;
- export results as JSON or CSV.

`tschef.patterns.followActiveEditor` controls follow/pin behavior. With `tschef.patterns.autoScanOnFocus`, an unscanned document is analyzed the first time it becomes active, except files over the built-in 512 KB focus-scan bound.

## Entropy heatmap

**tschef: Toggle Entropy Heatmap** colors editor lines and the minimap by Shannon entropy. High entropy can point to compressed, encrypted, packed, or encoded regions; ordinary binary data and some legitimate text can also have high entropy.

The feature is off by default (`tschef.entropyMap.enabled`). Turn it on for targeted inspection and turn it off when the coloring is no longer useful.

## YARA scanning

**tschef: YARA Scan Selection/Document** evaluates a `.yar` rule file or inline rules against the current selection or document. Review the selected rules and input scope before running. A match means that rule conditions were satisfied; it does not independently establish that content is malicious.

## Static malware triage

Run **tschef: Static Malware Triage** on selected text or the active file. The bounded offline analyzer can report:

- byte statistics and entropy;
- validated file signatures;
- suspicious script, LOLBin, persistence, and injection patterns;
- defanged indicators of compromise;
- embedded encoding candidates;
- extracted ASCII and UTF-16 strings;
- a heuristic risk summary in a Markdown report.

The analyzer does **not** execute the payload, resolve domains, fetch URLs, or submit content to a remote service. It is suitable for initial static inspection, not behavioral analysis.

```{warning}
Treat unknown files as potentially hostile. Keep them out of trusted execution paths, do not enable macros or run extracted commands, and use an appropriate isolated analysis environment when behavior must be observed.
```

## Smart Format

**tschef: Smart Format (Auto-Detect & Beautify)** detects JSON, XML/HTML, SQL, CSS, or JavaScript and opens a formatted copy in a new editor. The original remains unchanged.

## Make Readable

**tschef: Make Readable (Reflow Long Lines)** wraps extremely long hex, Base64, or delimiter-heavy one-line content to `tschef.readableLineWidth`. It changes presentation, not the underlying sequence of data characters.

## Interpreting findings

- Verify a decoded preview before replacing the source.
- Correlate entropy, signatures, strings, and IOCs instead of relying on one signal.
- Preserve an original copy and record hashes when analyzing evidence.
- Defang exported IOCs before sharing them in chat, tickets, or documentation.
- Use a sandbox or endpoint tooling for behavioral conclusions.
