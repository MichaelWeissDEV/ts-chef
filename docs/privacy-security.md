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

## Quick Workbench exports

Workbench messages are validated against registered operations, argument metadata and bounded sizes. Input revisions and independent host generations discard stale clipboard reads and transformations. Errors invalidate the prior result. Binary source bytes remain intact; UTF-8 decoding is strict, and Hex/Base64 exports are explicit. Favorites store operation identifiers only; input, outputs and secret argument values are not stored with favorites.

RSA Verify uses strict comparison of the complete expected DigestInfo after native PKCS#1 padding validation, mitigating GHSA-86w9-cpqp-85rv in the retained node-forge dependency. Canonical and omitted-NULL SHA identifiers are tested; extra algorithm elements are rejected. See the local release security audit in `reports/v0.9.0-dependency-audit.md` for dependency findings and remaining development-only risks.

Input and returned-output limits do not provide an operation sandbox: allocations and CPU work inside an explicitly run operation occur before its final output is checked. Avoid unbounded decompression or generation on hostile inputs.

## Release 0.9.0 dependency assessment

The 2026-10-15 audit reports 43 affected package records (35 high, 8 moderate, no critical), including one production high in node-forge 1.4.0. The [upstream advisory](https://github.com/advisories/GHSA-86w9-cpqp-85rv) still lists no patched version. The vulnerable library and its permissive verification implementation remain bundled; this is application-level mitigation, not a repaired dependency. RSA Verify delegates padding validation to native crypto and compares the entire expected DigestInfo. Regression tests reject extra elements, wrong OIDs, wrong digest lengths, changed parameters, trailing bytes and changed signatures, while preserving canonical and omitted-NULL SHA signatures. Direct application verification calls were reviewed; no additional Forge RSA verifier caller was found. This bounded review is not a guarantee about every transitive dependency path. See the release readiness report for residual risk and approval status.

The Linux `--no-sandbox` exception is opt-in and restricted to the isolated test launchers. It does not alter the extension, user settings or operating-system permissions.
