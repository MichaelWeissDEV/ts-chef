/**
 * @fileoverview Index of strongly typed operations for ts-chef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

// Local imports needed for this module's own code (type aliases and createTypedOperation factory)
import type { ArgConfig, HighlightPos, HighlightResult, AnyInput, OperationResult } from "../Operation";
import { TypedOperation } from "../Operation";
import type { PipelineData, InputType } from "../types";

// Re-export all the new strongly typed operations
export { ToHex, toHex } from "./ToHex";
export { FromHex, fromHexOp } from "./FromHex";

// Re-export types from the base operation module
export type {
  OperationResult,
  AnyInput,
  ArgConfig,
  HighlightPos,
  HighlightResult,
} from "../Operation";

// Re-export OperationInput/OperationOutput from canonical location
export type { OperationInput, OperationOutput } from "../Operation";

export {
  Operation,
  TypedOperation,
  OperationWithArgs,
  PipelinedOperation,
} from "../Operation";

/**
 * Type-safe pipeline building functions
 */
export { Pipeline, PipelineBuilder, PipelineStepResult, pipe } from "../Pipeline";

/**
 * Helper types for common operation signatures
 */

/** String to String operation */
export type StringOperation = TypedOperation<string, string, unknown[]>;

/** String to number array operation */
export type StringToBytesOperation = TypedOperation<string, number[], unknown[]>;

/** Bytes to String operation */
export type BytesToStringOperation = TypedOperation<number[] | Uint8Array, string, unknown[]>;

/** Generic transformation operation */
export type TransformOperation<T extends PipelineData = PipelineData> = TypedOperation<T, T, unknown[]>;

/**
 * Helper to create a typed operation class
 *
 * @example
 * const MyOp = createTypedOperation<string, number>({
 *   name: "My Operation",
 *   module: "Test",
 *   description: "Converts string to its length",
 *   inputType: INPUT_TYPES.STRING,
 *   outputType: INPUT_TYPES.NUMBER,
 *   run: (input: string) => input.length,
 * });
 */
export function createTypedOperation<TInput, TOutput, TArgs extends unknown[]>(config: {
  name: string;
  module?: string;
  description?: string;
  infoURL?: string | null;
  inputType?: InputType;
  outputType?: InputType;
  presentType?: InputType;
  flowControl?: boolean;
  manualBake?: boolean;
  args?: ArgConfig[];
  checks?: Array<{ pattern: string; flags: string; args: unknown[] }>;
  run: (input: TInput, args: TArgs) => TOutput | Promise<TOutput>;
  present?: (data: TOutput, args: TArgs) => PipelineData;
  highlight?: (pos: HighlightPos, args: TArgs) => HighlightResult;
  highlightReverse?: (pos: HighlightPos, args: TArgs) => HighlightResult;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}): new (...args: any[]) => TypedOperation<TInput, TOutput, TArgs> {
  return class TypedOperationImpl extends TypedOperation<TInput, TOutput, TArgs> {
    constructor() {
      super();
      this.name = config.name;
      if (config.module) this.module = config.module;
      if (config.description) this.description = config.description;
      if (config.infoURL) this.infoURL = config.infoURL;
      if (config.inputType) this.inputType = config.inputType;
      if (config.outputType) this.outputType = config.outputType;
      if (config.presentType) this.presentType = config.presentType;
      if (config.flowControl) this.flowControl = config.flowControl;
      if (config.manualBake) this.manualBake = config.manualBake;
      if (config.args) this.args = config.args;
      if (config.checks) this.checks = config.checks;
    }

    run(input: TInput, args: TArgs): TOutput | Promise<TOutput> {
      return config.run(input, args);
    }

    present(data: Awaited<TOutput>, args: TArgs): PipelineData {
      if (config.present) {
        return config.present(data as any, args);
      }
      return super.present(data, args);
    }

    highlight(pos: HighlightPos, args: TArgs): HighlightResult {
      if (config.highlight) {
        return config.highlight(pos, args);
      }
      return super.highlight(pos, args);
    }

    highlightReverse(pos: HighlightPos, args: TArgs): HighlightResult {
      if (config.highlightReverse) {
        return config.highlightReverse(pos, args);
      }
      return super.highlightReverse(pos, args);
    }
  };
}

// Re-export InputType from types
export { InputType, INPUT_TYPES, PipelineData } from "../types";

