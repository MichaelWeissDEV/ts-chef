/**
 * @fileoverview Base class and types for all CyberChef-style operations.
 * Ported from GCHQ's CyberChef.
 *
 * @license Apache-2.0
 * @author Michael Weiss
 */

import { PipelineData, InputType, INPUT_TYPES, normaliseInput } from "./types";

/**
 * Configuration for an operation argument.
 *
 * Defines how an argument should be rendered and validated in the UI.
 */
export interface ArgConfig {
  /** The display name of the argument. */
  name: string;
  /** The type of the argument (e.g., 'string', 'number', 'option', 'boolean'). */
  type: string;
  /** The default or current value of the argument. */
  value: PipelineData | null;
  /** Optional values for 'option' or 'editableOption' type arguments. */
  toggleValues?: string[];
  /** A hint or tooltip describing the purpose of the argument. */
  hint?: string;
  /** Number of rows for textarea-like arguments (type 'string'). */
  rows?: number;
  /** Whether the argument is disabled by default. */
  disabled?: boolean;
  /**
   * Target indices for dynamic arguments.
   * Used when one argument's value affects others.
   */
  target?: number | number[];
  /** Default index for selection-based arguments (type 'option'). */
  defaultIndex?: number;
  /** Maximum length for string-based arguments. */
  maxLength?: number;
  /** Minimum value for numeric arguments. */
  min?: number;
  /** Maximum value for numeric arguments. */
  max?: number;
  /** Step value for numeric arguments. */
  step?: number;
}

/**
 * Represents a position range for highlighting.
 * Usually an array of start/end offset pairs.
 */
export type HighlightPos = Array<{ start: number; end: number }>;

/**
 * Result of a highlighting operation.
 * Returns the new highlight positions or `false` if highlighting is not supported.
 */
export type HighlightResult = HighlightPos | false;

/**
 * Type alias for any input data processed by an operation.
 * Operations can handle strings, number arrays (byte arrays), ArrayBuffers, etc.
 */
export type AnyInput = PipelineData;

/**
 * Input data type for operations.
 * Operations can handle strings, number arrays (byte arrays), ArrayBuffers, etc.
 * This type represents the union of all possible data types that can flow through the pipeline.
 */
export type OperationInput = PipelineData;

/**
 * Output data type for operations.
 * Same as input type - operations can output any PipelineData type.
 */
export type OperationOutput = PipelineData;

/**
 * Abstract base class for all operations in ts-chef.
 *
 * Each operation defines its metadata (name, description, arguments)
 * and implements the `run` method to perform data transformation.
 */
export abstract class Operation {
  /**
   * Internal name of the operation.
   * Used for identification and display.
   */
  name: string = "";

  /**
   * Category or module the operation belongs to (e.g., 'Encryption', 'Hashing').
   */
  module: string = "";

  /**
   * Human-readable description of what the operation does.
   */
  description: string = "";

  /**
   * Optional URL for more information about the operation or algorithm (e.g., Wikipedia).
   */
  infoURL: string | null = null;

  /**
   * Expected input data type (e.g., 'string', 'byteArray', 'ArrayBuffer').
   */
  inputType: string = "string";

  /**
   * Expected output data type (e.g., 'string', 'byteArray', 'ArrayBuffer').
   */
  outputType: string = "string";

  /**
   * Type for presentation purposes. Defaults to `outputType`.
   */
  presentType: string = "string";

  /**
   * Whether the operation supports flow control (e.g., 'Fork', 'Jump').
   */
  flowControl: boolean = false;

  /**
   * Whether the operation requires manual triggering rather than automatic baking.
   */
  manualBake: boolean = false;

  /**
   * List of arguments the operation accepts, defined via [[ArgConfig]].
   */
  args: ArgConfig[] = [];

  /**
   * Patterns and flags for automatic detection of when this operation might be applicable.
   */
  checks?: Array<{ pattern: string; flags: string; args: unknown[] }>;

  /**
   * Executes the operation logic.
   *
   * @param input - The data to process. Can be string, byteArray, etc.
   * @param args - The arguments configured for this instance of the operation.
   * @returns The processed data.
   * @throws {OperationError} If processing fails.
   */
  abstract run(input: unknown, args: unknown[]): unknown | Promise<unknown>;

  /**
   * Formats the output data for presentation in the UI.
   *
   * By default, it returns the data as-is. Override this to provide
   * custom formatting (e.g., HTML rendering, image display).
   *
   * @param data - The output data from the [[run]] method.
   * @param _args - The arguments used during execution.
   * @returns The formatted presentation data.
   */
  present(data: AnyInput, _args: unknown[]): AnyInput {
    return data;
  }

  /**
   * Calculates how selection in the input translates to selection in the output.
   *
   * Used for synchronized highlighting between input and output panes.
   *
   * @param _pos - The current highlight positions in the input.
   * @param _args - The arguments used.
   * @returns The corresponding highlight positions in the output, or `false`.
   */
  highlight(_pos: HighlightPos, _args: unknown[]): HighlightResult {
    return false;
  }

  /**
   * Calculates how selection in the output translates back to selection in the input.
   *
   * @param _pos - The current highlight positions in the output.
   * @param _args - The arguments used.
   * @returns The corresponding highlight positions in the input, or `false`.
   */
  highlightReverse(_pos: HighlightPos, _args: unknown[]): HighlightResult {
    return false;
  }
}

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
 */
export abstract class TypedOperation<TInput = any, TOutput = any, TArgs extends unknown[] = any[]> extends Operation {
  abstract run(input: TInput, args: TArgs): TOutput | Promise<TOutput>;

  // @ts-expect-error TS2416 – intentional narrowing: TOutput ⊂ AnyInput
  present(data: Awaited<TOutput>, args: TArgs): PipelineData {
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

export { INPUT_TYPES, PipelineData, InputType };
export default Operation;
