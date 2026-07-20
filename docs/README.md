# ts-chef Documentation

Welcome to the internal documentation for `ts-chef`.

## Table of Contents

-   [Usage Guide](usage.md) - How to use the extension in VS Code.
-   [Keyboard Shortcuts and History](shortcuts.md) - Register operations/pipelines and bind history navigation without default keys.
-   [Performance Architecture](performance.md) - Lazy operation chunks, safeguards, measurements, and regression gates.
-   [Operations & Formatters](operations.md) - Detailed list of available data transformations.
-   [Contributing Guide](contributing.md) - How to set up the environment and contribute to the project.
-   [API Reference](https://github.com/michaelweiss/ts-chef/releases) - Technical API documentation (download the offline HTML ZIP from releases).

---

## Technical Overview

`ts-chef` is built as a pure TypeScript port of the CyberChef core, optimized for execution within the VS Code Extension Host. It avoids browser-specific APIs and heavy worker overhead where possible to ensure maximum performance and stability.
