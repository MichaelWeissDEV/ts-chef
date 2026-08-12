# Contributing to ts-chef

Thank you for your interest in contributing! This project follows a structured development workflow to ensure stability and code quality.

## Prerequisites

-   **Node.js:** version 20 or higher.
-   **npm:** version 10 or higher.

## Setup

1.  **Clone and Install:**
    ```bash
    git clone https://github.com/MichaelWeissDEV/ts-chef.git
    cd ts-chef
    npm install
    ```

## Development Commands

-   **Build Core & Extension:**
    ```bash
    npm run build
    ```
-   **Run Tests:**
    ```bash
    npm test
    ```
-   **Lint & Format:**
    ```bash
    npm run lint:fix
    npm run format
    ```
-   **Regenerate the operation catalog:**
    ```bash
    npm run docs:catalog
    ```
-   **Build the Read the Docs site:**
    ```bash
    python -m pip install -r docs/requirements.txt
    python -m sphinx -W --keep-going -b html docs docs/_build/html
    ```

## Project Structure

-   `src/chef/`: The core transformation library (logic ported from CyberChef).
-   `src/chef/operations/`: Individual operation implementations.
-   `src/extension.ts`: VS Code extension entry point and UI logic.
-   `test/`: Comprehensive unit tests for the core library.
-   `docs/`: Sphinx/MyST documentation published on Read the Docs.

## Submission Process

1.  **Branch:** Create a feature branch (`feat/your-feature` or `fix/your-fix`).
2.  **Verify:** Ensure `npm run build`, `npm test`, and `npm run lint` pass. For documentation changes, regenerate the catalog and build Sphinx with warnings treated as errors.
3.  **PR:** Open a Pull Request with a clear description of your changes.
