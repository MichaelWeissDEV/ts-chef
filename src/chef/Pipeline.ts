/**
 * @fileoverview Core Pipeline class for ts-chef processing pipeline
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import {
  Operation,
  TypedOperation,
  PipelinedOperation,
  AnyInput,
  OperationWithArgs,
} from "./Operation";
import { PipelineData, normaliseInput } from "./types";
import type { PipelineStep } from "../storage/store";
import { runOpCore, parsePipelineCore } from "./opsCore";

/**
 * Extended pipeline step that can contain either operation names or operation instances
 */
export type ExtendedPipelineStep =
  | PipelineStep
  | {
      op: Operation;
      args: unknown[];
    };

/**
 * Result of executing a pipeline step
 */
export interface PipelineStepResult<T = PipelineData> {
  step: number;
  operation: string;
  success: boolean;
  input: PipelineData;
  output: T;
  error?: Error;
  duration?: number;
}

/**
 * Fluent builder for composing operations into a pipeline.
 * Operations are normalized between steps so any output type
 * can feed any input type — chain them in any order.
 *
 * This class provides a modern, type-safe way to build and execute pipelines.
 *
 * @example
 * // Basic pipeline construction
 * const pipeline = Pipeline.of("From Base64")
 *   .pipe("To Hex")
 *   .pipe("Reverse");
 *
 * const result = await pipeline.run("SGVsbG8gV29ybGQ=");
 *
 * @example
 * // Pipeline with arguments
 * const pipeline = Pipeline.empty()
 *   .pipe("XOR", ["key"])
 *   .pipe("To Hex");
 *
 * @example
 * // Type-safe pipeline with operation instances
 * const pipeline = Pipeline.fromOperation(new FromBase64())
 *   .pipe(new ToHex());
 */
export class Pipeline<TInput = PipelineData, TOutput = PipelineData> {
  private readonly steps: Array<{
    opName?: string;
    op?: Operation;
    args: unknown[];
  }>;

  // Constructor is public to allow PipelineBuilder to create instances
  constructor(
    steps: Array<{ opName?: string; op?: Operation; args: unknown[] }> = [],
  ) {
    this.steps = steps;
  }

  /**
   * Creates an empty pipeline
   */
  static empty(): Pipeline {
    return new Pipeline();
  }

  /**
   * Creates a pipeline starting with a single operation by name
   *
   * @param opName - The name of the first operation
   * @param args - Optional arguments for the first operation
   */
  static of(opName: string, args: unknown[] = []): Pipeline {
    return new Pipeline([{ opName, args }]);
  }

  /**
   * Creates a pipeline starting with a single operation instance
   *
   * @param op - The first operation instance
   * @param args - Optional arguments for the first operation
   */
  static fromOperation<T, U, A extends unknown[]>(
    op: TypedOperation<T, U, A>,
    args?: A,
  ): Pipeline<T, U> {
    return new Pipeline([
      { op: op as unknown as Operation, args: args || [] },
    ]) as Pipeline<T, U>;
  }

  /**
   * Parse a pipe-language string and return a Pipeline.
   * This maintains backwards compatibility with the original parsePipeline function.
   */
  static parse(raw: string): Pipeline {
    const steps = parsePipelineCore(raw);
    return new Pipeline(
      steps.map((step) => ({ opName: step.opName, args: step.args })),
    );
  }

  /**
   * Append an operation by name to the pipeline. Returns a new Pipeline.
   *
   * @param opName - The name of the operation to append
   * @param args - Optional arguments for the operation
   * @returns A new Pipeline instance with the operation appended
   */
  pipe(opName: string, args: unknown[] = []): Pipeline<TInput, TOutput> {
    return new Pipeline([...this.steps, { opName, args }]) as Pipeline<
      TInput,
      TOutput
    >;
  }

  /**
   * Append an operation instance to the pipeline. Returns a new Pipeline.
   *
   * @param op - The operation instance to append
   * @param args - Optional arguments for the operation
   * @returns A new Pipeline instance with the operation appended
   */
  pipeOperation<T, U, A extends unknown[]>(
    op: TypedOperation<T, U, A>,
    args?: A,
  ): Pipeline<TInput, U> {
    return new Pipeline([
      ...this.steps,
      { op: op as unknown as Operation, args: args || [] },
    ]) as Pipeline<TInput, U>;
  }

  /**
   * Append a pre-configured PipelinedOperation to this pipeline
   */
  pipePipelined<T, U>(
    pipelined: PipelinedOperation<T, U>,
  ): Pipeline<TInput, U> {
    const newSteps: Array<{
      opName?: string;
      op?: Operation;
      args: unknown[];
    }> = [...this.steps];

    for (const part of pipelined.parts) {
      if ("operation" in part) {
        newSteps.push({
          op: part.operation as Operation,
          args: part.args,
        });
      } else {
        newSteps.push({ op: part as Operation, args: [] });
      }
    }

    return new Pipeline(newSteps) as Pipeline<TInput, U>;
  }

  /**
   * Execute the pipeline, returning the raw result value.
   * This method handles the execution with proper type safety.
   *
   * @param input - The input data to process
   * @returns A Promise resolving to the final output
   */
  async execute(input: TInput): Promise<TOutput> {
    let current: PipelineData = input as unknown as PipelineData;

    for (const step of this.steps) {
      if (step.op) {
        // Direct operation instance — normalise to the declared inputType first
        const normalised = normaliseInput(
          current,
          step.op.inputType ?? "string",
        );
        current = (await Promise.resolve(
          step.op.run(
            normalised as unknown as PipelineData,
            step.args as unknown as unknown[],
          ),
        )) as PipelineData;
      } else if (step.opName) {
        // Operation by name — runOpCore normalises internally
        const result = runOpCore(step.opName, current as AnyInput, step.args);
        current = await Promise.resolve(result);
      }
    }

    return current as TOutput;
  }

  /**
   * Execute the pipeline and return a displayable string.
   * This maintains backwards compatibility with the original API.
   *
   * @param input - The input data to process
   * @returns A Promise resolving to a string representation of the result
   */
  async run(input: AnyInput): Promise<string> {
    const result = await this.execute(input as TInput);
    const output = result as unknown as PipelineData;

    if (typeof output === "string") return output;
    if (output instanceof ArrayBuffer)
      return Buffer.from(new Uint8Array(output)).toString("utf-8");
    if (Array.isArray(output))
      return Buffer.from(output as number[]).toString("utf-8");
    return JSON.stringify(output, null, 2);
  }

  /**
   * Execute the pipeline and return detailed results for each step.
   * This is useful for debugging and understanding the pipeline execution.
   *
   * @param input - The input data to process
   * @returns A Promise resolving to an array of step results
   */
  async executeWithResults(
    input: TInput,
  ): Promise<PipelineStepResult<TOutput>[]> {
    const results: PipelineStepResult<TOutput>[] = [];
    let current: PipelineData = input as unknown as PipelineData;
    let stepIndex = 0;

    for (const step of this.steps) {
      const startTime = Date.now();
      const operationName = step.op?.name || step.opName || `step-${stepIndex}`;

      try {
        let output: PipelineData;

        if (step.op) {
          // Normalise to the declared inputType before running
          const normalised = normaliseInput(
            current,
            step.op.inputType ?? "string",
          );
          // runWithResult is available on TypedOperation; fall back to plain run for base Operation
          const typedOp = step.op as unknown as TypedOperation;
          let result:
            | {
                success: boolean;
                data: unknown;
                error: Error | null;
                duration?: number;
              }
            | undefined;
          if (typeof typedOp.runWithResult === "function") {
            result = await typedOp.runWithResult(
              normalised as unknown as PipelineData,
              step.args as unknown as unknown[],
            );
            output = result.data as unknown as PipelineData;
          } else {
            output = (await Promise.resolve(
              step.op.run(normalised as unknown as PipelineData, step.args),
            )) as PipelineData;
            result = { success: true, data: output, error: null };
          }

          results.push({
            step: stepIndex,
            operation: operationName,
            success: result.success,
            input: current,
            output: output as TOutput,
            error: result.error ?? undefined,
            duration: result.duration,
          });
        } else if (step.opName) {
          const result = runOpCore(step.opName, current as AnyInput, step.args);
          output = await Promise.resolve(result);

          results.push({
            step: stepIndex,
            operation: operationName,
            success: true,
            input: current,
            output: output as unknown as TOutput,
            duration: Date.now() - startTime,
          });
        } else {
          throw new Error(
            "Invalid pipeline step: neither opName nor op provided",
          );
        }

        current = output;
        stepIndex++;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        results.push({
          step: stepIndex,
          operation: operationName,
          success: false,
          input: current,
          output: current as unknown as TOutput,
          error: err,
          duration: Date.now() - startTime,
        });
        // Stop execution on error by default
        break;
      }
    }

    return results;
  }

  /**
   * Convert the pipeline to a PipelinedOperation for more advanced chaining
   * This bridges between the traditional Pipeline and the new PipelinedOperation
   */
  toPipelinedOperation(): PipelinedOperation<TInput, TOutput> {
    const parts: Array<
      | OperationWithArgs<unknown, unknown, unknown[]>
      | TypedOperation<unknown, unknown, unknown[]>
    > = [];

    for (const step of this.steps) {
      if (step.op) {
        // Direct operation instance: cast to TypedOperation and wrap with args if present
        const typedOp = step.op as unknown as TypedOperation<
          unknown,
          unknown,
          unknown[]
        >;
        if (step.args.length > 0) {
          parts.push(new OperationWithArgs(typedOp, step.args as unknown[]));
        } else {
          parts.push(typedOp);
        }
      } else if (step.opName) {
        // For opName-based steps, create a wrapper that delegates to the runner
        const opName = step.opName;
        const stepArgs = step.args;
        class NamedWrapper extends TypedOperation<unknown, unknown, unknown[]> {
          name = opName;
          run(input: unknown, _args: unknown[]): unknown {
            return runOpCore(opName, input as AnyInput, stepArgs);
          }
        }
        parts.push(new NamedWrapper());
      }
    }

    return new PipelinedOperation(
      parts,
      undefined,
    ) as unknown as PipelinedOperation<TInput, TOutput>;
  }

  /**
   * Get the number of operations in the pipeline
   */
  get length(): number {
    return this.steps.length;
  }

  /**
   * Get the names of all operations in the pipeline
   */
  get operationNames(): string[] {
    return this.steps.map((step) => step.op?.name || step.opName || "unknown");
  }

  /**
   * Check if the pipeline is empty
   */
  get isEmpty(): boolean {
    return this.steps.length === 0;
  }

  /**
   * Builder pattern: Create a new pipeline and add operations using a callback
   *
   * @example
   * const pipeline = Pipeline.build(builder => {
   *   builder.add("From Base64");
   *   builder.add("To Hex");
   * });
   */
  static build(builderFn: (builder: PipelineBuilder) => void): Pipeline {
    const builder = new PipelineBuilder();
    builderFn(builder);
    return builder.build();
  }
}

/**
 * Builder class for constructing pipelines using a fluent API
 */
export class PipelineBuilder {
  private steps: Array<{ opName?: string; op?: Operation; args: unknown[] }> =
    [];

  /**
   * Add an operation by name
   */
  add(opName: string, args: unknown[] = []): PipelineBuilder {
    this.steps.push({ opName, args });
    return this;
  }

  /**
   * Add an operation instance
   */
  addOperation<T, U, A extends unknown[]>(
    op: TypedOperation<T, U, A>,
    args?: A,
  ): PipelineBuilder {
    this.steps.push({ op: op as unknown as Operation, args: args || [] });
    return this;
  }

  /**
   * Build the final pipeline
   */
  build(): Pipeline {
    // Pipeline constructor is now public
    return new Pipeline(this.steps);
  }

  /**
   * Get the current number of steps
   */
  get length(): number {
    return this.steps.length;
  }
}

/**
 * Create a pipeline from operation instances with full type safety
 *
 * @example
 * const result = await pipe(
 *   new FromBase64(),
 *   new ToHex(),
 *   new Reverse()
 * ).run("SGVsbG8=");
 */
export function pipe(
  ...operations: Array<
    TypedOperation | Operation | { op: Operation; args: unknown[] }
  >
): PipelinedOperation {
  if (operations.length === 0) {
    return new PipelinedOperation([], undefined);
  }

  const parts: Array<Operation | { operation: Operation; args: unknown[] }> =
    [];

  for (const op of operations) {
    if (op instanceof Operation) {
      parts.push(op);
    } else if ("op" in op && "args" in op) {
      parts.push({ operation: op.op, args: op.args });
    }
  }

  if (parts.length === 0) {
    return new PipelinedOperation([], undefined);
  }

  return new PipelinedOperation(parts, undefined);
}

// Re-export from Operation for convenience
export { Operation, PipelinedOperation } from "./Operation";
export type { OperationResult, AnyInput } from "./Operation";

export default Pipeline;
