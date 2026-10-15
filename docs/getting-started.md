# Getting started

## Requirements

Install [Visual Studio Code](https://code.visualstudio.com/) 1.85 or newer. No ts-chef account, server, Python runtime, or separate CyberChef installation is required for normal use.

## Install

1. Open the **Extensions** view in VS Code.
2. Search for `ts-chef` by publisher `michaelweiss`.
3. Select **Install**.
4. Open the chef icon in the Activity Bar.

You can also install it directly from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=MichaelWeiss.vscode-ts-chef). To install a locally downloaded release, run **Extensions: Install from VSIX...** and select the `.vsix` file.

## Quick Workbench

For a single operation with visible parameters, start with the [Quick Workbench walkthrough](quick-workbench.md). Local candidates can be installed with `code --install-extension vscode-ts-chef-0.9.0.vsix`; publishing is a separate maintainer action.

## First transformation: decode Base64 JSON

Paste this example into a text editor:

```text
eyJuYW1lIjoidHMtY2hlZiIsInJlYWR5Ijp0cnVlfQ==
```

1. Select the complete value.
2. Open the Command Palette with {kbd}`Ctrl+Shift+P` on Windows/Linux or {kbd}`Cmd+Shift+P` on macOS.
3. Run **tschef: Quick Convert Selection**.
4. Choose **From Base64**.
5. Use the configured result action to replace, copy, or inspect the result.

The decoded result is:

```json
{"name":"ts-chef","ready":true}
```

## First two-step pipeline

To decode and format the same value:

1. Run **tschef: Open Pipeline Editor**.
2. Keep **List** mode selected.
3. Add **From Base64** and then **JSON Beautify**.
4. Choose **Editor selection** as input, or paste the value into **Manual input**.
5. Choose a result destination and select **Run**.

The equivalent pipeline expression is:

```text
From Base64 | JSON Beautify
```

## Save and run it again

Save the pipeline with a descriptive name. Choose:

- **Global** to make it available in all workspaces; or
- **Workspace** to store it with the current project.

Later, run **tschef: Run Saved Pipeline**, select the pipeline, and apply it to the current selection. See {doc}`pipelines` for syntax, graph mode, arguments, result destinations, and storage behavior.

## Verify the extension is active

If the sidebar is not visible:

1. Check that the extension is enabled for the current VS Code profile and workspace.
2. Run **View: Open View...** and search for `ts-chef`.
3. Run any `tschef:` command from the Command Palette; the extension activates after VS Code startup.
4. In a Restricted Mode workspace, remember that global functionality remains available but workspace storage is intentionally disabled.

Continue with {doc}`usage` for day-to-day workflows or jump to the {doc}`operation-catalog`.


## Upgrade from v0.8.1 to v0.9.0

Keep the same VS Code profile and install `vscode-ts-chef-0.9.0.vsix` with **Extensions: Install from VSIX...**. Reload the window, then check version 0.9.0 in the Extensions view. The extension identifier, settings, variable files and pipeline formats are unchanged. Existing recipes should run without conversion; back up private recipes and variables before upgrading. Open **tschef: Open Quick Workbench** to use the new parameter editor and result formats. Favorites persist; inputs, parameter values and results do not survive a full restart.
