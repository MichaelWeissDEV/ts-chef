# Architecture

ts-chef separates VS Code integration, workflow orchestration, storage, presentation, and the ported transformation engine.

## Runtime layers

| Area | Main paths | Responsibility |
| --- | --- | --- |
| Extension entry | `src/extension.ts` | Activation, registrations, command/provider wiring. |
| Operation registry | `src/opsRegistry.ts` | Lightweight metadata, display-name lookup, lazy factories. |
| Transformation engine | `src/chef/` | Recipe execution, Dish/Ingredient types, operations, shared libraries. |
| Commands | `src/commands/` | Quick execution, argument defaults, result presentation, history, range safety. |
| Providers | `src/providers/` | Sidebar views, hover analysis, scanning, decorations, formatting, entropy. |
| Pipeline panels | `src/panels/` | Protocol, model, list/graph webview, DAG execution, live-preview policy. |
| Analysis | `src/analysis/` | Bounded static malware triage. |
| Storage | `src/storage/` | Pipelines, variables, scope handling, safe variable resolution. |

## Operation execution

1. UI/search uses registry metadata and does not load operation implementations.
2. A command resolves a display name and arguments into an operation factory.
3. The factory loads its assigned CommonJS operation chunk on first use.
4. The chunk remains cached for the extension-host session.
5. Recipe execution passes a `Dish` through operations in order, or the graph runner executes nodes in topological order.
6. Result presentation applies the configured target only after source-range validation.

See {doc}`performance` for chunk generation and regression gates.

## Pipeline model

The editor protocol keeps webview messages separate from extension-side execution. Ordered pipelines map to a primary path. Graph definitions preserve nodes, edges, layout, named outputs, and selected output. Validation rejects cycles and enforces graph bounds before execution.

## Storage boundaries

Global data uses VS Code-managed extension storage. Workspace data lives under `.vscode/ts-chef/` and is intentionally gated by Workspace Trust. Validation and atomic writes prevent malformed or partial files from silently becoming runtime state.

## Testing

Jest suites cover individual operations, round trips, registry contracts, lazy chunks, recipe safety, scanning/hover behavior, storage and variable resolution, shortcut history, pipeline protocol/model/webview, graph execution, live-preview policy, and result presentation.

Production verification additionally checks the emitted entry bundle, operation chunks, manifest coverage, constructor resolution, and cache behavior.
