# Changelog

All notable changes to the **ts-chef** VS Code extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-06-19

### Added
- Created type-safe pipeline framework using `TypedOperation` and `Pipeline_new`.
- Implemented O(1) registry map lookup for high-performance operation resolve.
- Integrated WebAssembly-based `hash-wasm` to replace native `argon2` module dependency for secure and platform-agnostic execution.
- Added comprehensive coverage check for continuous integration.
- Configured Jest mock objects for ES modules (`d3`, `geodesy`, `flat`, and `@li0ard/streebog`) in CommonJS-based test runtime.

### Fixed
- Fixed critical async pipeline bugs: changed synchronous `runPipeline()` to `async/await` execution model.
- Restructured `Pipeline_new` to break circular dependency with `runner.ts` using `opsCore.ts` helper module.
- Resolved argument parser bug in `parsePipeline()` that caused issues when splitting strings containing pipeline delimiters inside parentheses.
- Added debounce to decoration updates on editor text changes for smoother typing performance.

### Security
- Replaced native cryptographic packages with secure pure-JS/WASM equivalents.
