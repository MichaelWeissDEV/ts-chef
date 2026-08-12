# Variables and storage

Variables make reusable pipelines configurable without embedding the same value repeatedly.

## Reference syntax

Use an explicit double-brace placeholder:

```text
{{name}}
```

For example:

```text
AES Decrypt(Key={{case-key}}, IV={{case-iv}}) | From UTF8
```

Only `{{name}}` is treated as a ts-chef variable. `$name`, `${name}`, and `$env:NAME` remain literal, which is important for shell, PowerShell, templates, and malware samples.

## Create and manage variables

- Run **tschef: Set Variable** to create or update a named value.
- Use **tschef: Add Variable** from the Variables view title.
- Run **tschef: Show Variables** or open the Variables view to inspect available names and scopes.

## Scopes

| Scope | Availability | Typical use |
| --- | --- | --- |
| **Global** | Every workspace in the current VS Code profile | Personal reusable defaults and local secrets. |
| **Workspace** | Current trusted workspace | Project-specific, reviewable pipeline inputs that are safe to share. |

The default is selected by `tschef.defaultVariableScope`. Workspace variables are not read or written in Restricted Mode.

## Security guidance

- Do not commit secrets in workspace variable files.
- Prefer user/global variables for credentials, private keys, and case-specific sensitive values.
- Remember that a pipeline result can contain the resolved value even if the pipeline definition does not.
- Operation history is memory-only, but copied output, editor files, logs from other tools, and screenshots may persist.
- Review repository changes before committing `.vscode/ts-chef/`.

Storage files are schema-validated, size-bounded, written atomically, and protected against repository-controlled symbolic-link redirection.

## Operation-local registers

The **Register** operation can preserve intermediate results in operation registers such as `$R0` and `$R1` for later operations in the same execution. These are different from stored `{{name}}` variables: registers are pipeline-execution state, while stored variables are named configuration resolved before or during the workflow.
