# Visual tour

## Branched graph pipelines

Graph mode turns one input into a directed acyclic workflow. Connect explicit ports, fan a result into independent branches, position nodes freely, and publish several named outputs.

![Pipeline Graph with Base64 decoding, JSON formatting, and named output branches](_static/screenshots/pipeline-graph.png)

Use {doc}`pipelines` for graph validation, inputs, result destinations, saved topology, and live-run policy.

## Ordered pipelines with live preview

List mode is optimized for a traditional sequence. Search all registered operations, add and reorder steps, edit argument controls, and inspect a bounded live preview when the workflow is eligible.

![Ordered Pipeline Editor running From Base64 followed by JSON Beautify](_static/screenshots/pipeline-editor.png)

## Encoded-value hover

Hover analysis identifies likely encodings, reports confidence and statistics, and shows a bounded decoded preview before modifying the source.

![VS Code hover detecting a Base64 value and previewing decoded JSON](_static/screenshots/hover-analysis.png)

## Source-code integer calculator

Language-aware integer hovers show radix conversions, width, signed/unsigned values, and two's-complement interpretations.

![Integer literal hover showing decimal, hexadecimal, binary, and octal values](_static/screenshots/integer-calculator.png)

## Pattern scanning

Document and workspace scans group recognizable values in Found Patterns. Results can be navigated, highlighted, pinned, refreshed, and exported.

![Pattern scanning results highlighting hexadecimal strings in a PowerShell document](_static/screenshots/pattern-scanning.png)

## Static malware triage

The Command Palette exposes bounded, offline static triage for selected text or the active file.

![VS Code Command Palette showing the tschef Static Malware Triage command](_static/screenshots/malware-command.png)

The resulting Markdown report combines byte statistics, signatures, suspicious behaviors, defanged IOCs, encodings, and extracted strings without executing the content.

![Static malware triage report beside a suspicious PowerShell file](_static/screenshots/malware-triage.png)

## Entropy heatmap

Optional line and minimap coloring helps locate regions with unusually high Shannon entropy. Entropy is a clue, not a classification.

![Entropy heatmap coloring suspicious PowerShell lines and the editor minimap](_static/screenshots/entropy-heatmap.png)

Read {doc}`analysis` for bounds, settings, interpretation guidance, YARA scanning, and Deep Analysis.
