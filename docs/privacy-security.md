# Privacy and security model

## Execution model

Core transformations execute locally inside the VS Code extension environment. They require no ts-chef account and are not submitted to a ts-chef service. An operation that inherently requires network access can use the network only when you explicitly run that operation.

## Side-effect controls

The Pipeline Editor does not live-preview operations classified as networked, expensive, random, file-oriented, or analysis-oriented. Such steps require an explicit run. Preview and analysis paths also bound input, output, parser depth, graph size, scanning work, and decompression where applicable.

## Static malware triage

Static triage reads the selected text or active file and creates a report. It does not execute the payload, follow embedded commands, fetch URLs, or resolve domains. Heuristic output is fallible and must be validated.

## Workspace Trust

In VS Code Restricted Mode:

- global operations and storage remain usable;
- workspace-scoped variables and pipelines are not loaded or written;
- users avoid unintentionally trusting repository-controlled configuration as local workflow state.

Storage data is schema-validated, bounded, atomically written, and protected from symbolic-link based redirection controlled by a repository.

## Secrets

- Prefer global variables for private material.
- Do not place credentials directly into committed pipeline definitions.
- Shortcut history is memory-only and is cleared when the extension host stops.
- Replaying a history item does not duplicate it.
- Result destinations can persist data: editor files, clipboard managers, backups, and screenshots are outside ts-chef's control.

## Source text integrity

Editor transformations snapshot the target range. An asynchronous result is rejected when the original text has changed, preventing a late operation from overwriting newer edits.

## Responsible analysis

Keep unknown files isolated, preserve originals, hash evidence, defang indicators before sharing, and never infer safety or maliciousness from one signature, entropy score, or heuristic. Use dedicated sandboxing and incident-response procedures when risk warrants it.

## Vulnerability reports

Do not publish exploit details or sensitive evidence in a public issue. Use the repository's available private security-reporting channel when configured, or contact the maintainer privately through the information in the [GitHub repository](https://github.com/MichaelWeissDEV/ts-chef).
