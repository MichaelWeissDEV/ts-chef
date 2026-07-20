# Performance Architecture

ts-chef keeps all 479 operations. Performance work separates searchable metadata from executable code instead of removing functionality.

## Lazy operation loading

The production build has two layers:

1. `dist/extension.js` contains extension activation, views, commands, and the complete lightweight operation metadata registry.
2. `dist/operation-chunks/*.js` contains operation implementations. A factory synchronously loads its assigned CommonJS chunk on first use and caches the module for the rest of the extension-host session.

Activation, operation search, hover matching, and the Operations view therefore do not import operation implementations. Opening arguments or executing a recipe loads only the required chunks. Repeated use has no module-loading cost. Bundled standard-pipeline definitions are also materialized only when their UI or commands need them.

Chunks use a stable generated mapping. Broad families are hash-sharded to keep chunk sizes bounded. Frequent paths such as Base64, hex, AES, and JSON have explicit cohesive chunks. Dependency-heavy Code operations—including DOM selectors, Markdown, Jsonata, JPath, XPath, SQL, and JavaScript tooling—are isolated so a simple JSON format does not pull those dependencies into memory.

The build writes `dist/operation-chunks/manifest.json`. Production verification checks that:

- importing the entry bundle loads zero operation chunks;
- every manifest operation occurs in exactly one emitted chunk;
- all emitted JavaScript chunks are represented in the manifest;
- every one of the 479 production constructors can be resolved, instantiated, and matched to its registry metadata;
- loading the same operation again reuses the cached chunk.

## Current safeguards

- Internal names, display names, and case-insensitive operation lookup are O(1).
- Operation instances are created only when their arguments or implementation are needed.
- Quick Convert metadata and pipeline-editor argument descriptors are cached.
- Live preview permits only a conservative set of deterministic operations and bounds intermediate output.
- Hover analysis, scanning, graph size, decompression, parser depth, and store sizes have explicit limits.
- Editor transformations use asynchronous execution and immutable range snapshots so late results cannot overwrite newer text.

## Measured result

On the same development machine and Node version, the metadata/chunk split changed the cold production import from approximately 28.0 MiB, 425 ms, and 293 MiB additional RSS to approximately 1.6 MiB, 18 ms, and 17 MiB additional RSS. Results vary by hardware and runtime, so these figures describe the observed migration rather than a universal promise.

Representative first loads in that run were about 0.7 ms for Base64, 6.8 ms for AES, 0.9 ms for JSON Beautify, and 26 ms for QR generation. Those chunks remain cached afterward. The main bundle has a 3 MiB build-time regression budget.

Run the repeatable local measurement with:

```bash
npm run bench:bundle
```

The command performs a production build, verifies lazy loading, then reports cold import time, memory deltas, eager chunk count, and representative first-load costs. Compare measurements only on the same machine and Node version.

## Build and maintenance

- `npm run compile:extension` builds the metadata-only entry bundle.
- `npm run compile:operations` generates the operation chunks and manifest.
- `npm run build` builds and verifies both layers.
- `npm run verify:bundle` enforces entry-size and production-factory contracts.

When adding an operation, register it through `lazyFactory` and let the generator assign its family shard. Add an explicit entry to `src/operationChunkOverrides.json` only when profiling shows that a common path is coupled to a disproportionately heavy dependency. Shard counts live in `src/operationChunkPlan.json` and must remain positive bounded integers.

## Further work

Modules remain resident after their first import; an LRU cannot reliably reclaim Node module code. The next useful optimization is therefore profiling-driven, not automatic eviction. CPU-heavy synchronous operations can move to a bounded worker pool when event-loop measurements show real extension-host stalls. Small transformations should stay local because worker startup and data transfer can cost more than the operation itself.
