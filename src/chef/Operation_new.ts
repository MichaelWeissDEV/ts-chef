/**
 * @fileoverview New typed operation base classes for ts-chef
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import { PipelineData, InputType, INPUT_TYPES, normaliseInput } from "./types";
import { Operation, ArgConfig, HighlightPos, HighlightResult, AnyInput } from "./Operation";

// Re-export Operation and related types from their canonical locations
export { Operation, ArgConfig, HighlightPos, HighlightResult, AnyInput } from "./Operation";
export { INPUT_TYPES, PipelineData, InputType } from "./types";

/**
 * Result of an operation execution with type safety
 */
export interface OperationResult<T = PipelineData, E = Error> {
  success: boolean;
  data: T | null;
  error: E | null;
  operation: string;
  duration?: number;
}

/**
 * Abstract typed operation base class.
 * This provides strong typing for input, output, and arguments.
 *
 * Note: The `run` and `present` overrides intentionally narrow the parameter types
 * compared to the base `Operation` class. This is by design – `TypedOperation` trades
 * full Liskov-substitutability for stronger type safety at the call site. The cast via
 * `as any` in internal pipeline code bridges the gap at runtime.
 */
export abstract class TypedOperation<TInput = any, TOutput = any, TArgs extends unknown[] = any[]> extends Operation {
  // @ts-expect-error TS2416 – intentional narrowing: TInput ⊂ AnyInput
  abstract run(input: TInput, args: TArgs): TOutput | Promise<TOutput>;

  // @ts-expect-error TS2416 – intentional narrowing: TOutput ⊂ AnyInput
  present(data: TOutput, args: TArgs): PipelineData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data as any;
  }

  async runWithResult(input: TInput, args: TArgs): Promise<OperationResult<TOutput, Error>> {
    const startTime = Date.now();
    try {
      const result = await Promise.resolve(this.run(input, args));
      return {
        success: true,
        data: result,
        error: null,
        operation: this.name,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        data: null,
        error: err,
        operation: this.name,
        duration: Date.now() - startTime,
      };
    }
  }

  highlight(pos: HighlightPos, args: TArgs): HighlightResult {
    return false;
  }

  highlightReverse(pos: HighlightPos, args: TArgs): HighlightResult {
    return false;
  }

  withArgs(...args: TArgs): OperationWithArgs<TInput, TOutput, TArgs> {
    return new OperationWithArgs(this as any, args);
  }
}

/**
 * Operation with pre-configured arguments.
 */
export class OperationWithArgs<TInput = any, TOutput = any, TArgs extends unknown[] = any[]> {
  readonly operation: TypedOperation<TInput, TOutput, TArgs>;
  readonly args: TArgs;

  constructor(operation: TypedOperation<TInput, TOutput, TArgs>, args: TArgs) {
    this.operation = operation;
    this.args = args;
  }

  async run(input: TInput): Promise<TOutput> {
    return await Promise.resolve(this.operation.run(input, this.args));
  }

  async runWithResult(input: TInput): Promise<OperationResult<TOutput, Error>> {
    return this.operation.runWithResult(input, this.args);
  }

  pipe<U = any, NextArgs extends unknown[] = any[]>(nextOp: any): PipelinedOperation<TInput, U> {
    return new PipelinedOperation([this, nextOp]);
  }

  pipeWithArgs<U = any, NextArgs extends unknown[] = any[]>(nextOp: TypedOperation<TOutput, U, NextArgs>, ...nextArgs: NextArgs): PipelinedOperation<TInput, U> {
    return new PipelinedOperation([this, nextOp.withArgs(...nextArgs)]);
  }
}

/**
 * A pipelined operation that chains multiple operations together.
 */
export class PipelinedOperation<TInput = any, TOutput = any> {
  readonly parts: Array<OperationWithArgs | TypedOperation>;
  readonly operations: TypedOperation[];

  constructor(parts: Array<OperationWithArgs | TypedOperation>, readonly _inputType?: TInput) {
    this.parts = parts;
    this.operations = parts.filter((p: any): p is TypedOperation => p instanceof TypedOperation);
  }

  get length(): number {
    return this.parts.length;
  }

  get operationNames(): string[] {
    return this.parts.map(p => 
      p instanceof OperationWithArgs ? p.operation.name : (p as any).name
    );
  }

  async run(input: TInput): Promise<TOutput> {
    let current: any = input;

    for (const part of this.parts) {
      if (part instanceof OperationWithArgs) {
        const opInputType = (part.operation as any).inputType ?? "string";
        const normalised = normaliseInput(current, opInputType);
        current = await Promise.resolve(part.operation.run(normalised as any, part.args));
      } else {
        const typedPart = part as any;
        const opInputType = typedPart.inputType ?? "string";
        const normalised = normaliseInput(current, opInputType);
        current = await typedPart.run(normalised, []);
      }
    }

    return current as TOutput;
  }

  pipe<U = any>(nextOp: TypedOperation<TOutput, U, any[]> | OperationWithArgs<TOutput, U, any[]>): PipelinedOperation<TInput, U> {
    return new PipelinedOperation([...this.parts, nextOp], this._inputType);
  }

  pipeWithArgs<U = any, NextArgs extends unknown[] = any[]>(nextOp: TypedOperation<TOutput, U, NextArgs>, ...nextArgs: NextArgs): PipelinedOperation<TInput, U> {
    return new PipelinedOperation([...this.parts, nextOp.withArgs(...nextArgs)], this._inputType);
  }
}

export default TypedOperation;
