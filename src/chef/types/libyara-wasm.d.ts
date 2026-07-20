/**
 * @fileoverview Type definitions for libyara-wasm.
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

declare module "libyara-wasm" {
  interface YaraVector<T> {
    size(): number;
    get(index: number): T;
  }

  interface YaraCompileError {
    warning: boolean;
    lineNumber: number;
    message: string;
  }

  interface YaraResolvedMatch {
    location: number;
    matchLength: number;
    stringIdentifier: string;
    data: string;
  }

  interface YaraMetadata {
    identifier: string;
    data: string;
  }

  interface YaraMatchedRule {
    ruleName: string;
    resolvedMatches: YaraVector<YaraResolvedMatch>;
    metadata: YaraVector<YaraMetadata>;
  }

  interface YaraResponse {
    compileErrors: YaraVector<YaraCompileError>;
    consoleLogs: YaraVector<string>;
    matchedRules: YaraVector<YaraMatchedRule>;
  }

  interface YaraEngine {
    run(input: Uint8Array, rules: string): YaraResponse;
  }

  const Yara: () => Promise<YaraEngine>;
  export default Yara;
}
