import { AnyInput } from "./Operation";
import { runOp, parsePipeline } from "../commands/runner";
import type { PipelineStep } from "../storage/store";

/**
 * Fluent builder for composing operations into a pipeline.
 * Operations are normalised between steps so any output type
 * can feed any input type — chain them in any order.
 */
export class Pipeline {
  private readonly steps: PipelineStep[];

  constructor(steps: PipelineStep[] = []) {
    this.steps = steps;
  }

  /** Append an operation by name (with optional args). Returns a new Pipeline. */
  pipe(opName: string, args: unknown[] = []): Pipeline {
    return new Pipeline([...this.steps, { opName, args }]);
  }

  /** Execute the pipeline, returning the raw result value. */
  async execute(input: AnyInput): Promise<AnyInput> {
    let current: AnyInput = input;
    for (const step of this.steps) {
      const result = runOp(step.opName, current, step.args);
      current = result instanceof Promise ? await result : result;
    }
    return current;
  }

  /** Execute the pipeline and return a displayable string. */
  async run(input: AnyInput): Promise<string> {
    const result = await this.execute(input);
    if (typeof result === "string") return result;
    if (result instanceof ArrayBuffer)
      return Buffer.from(new Uint8Array(result)).toString("utf-8");
    if (Array.isArray(result))
      return Buffer.from(result as number[]).toString("utf-8");
    return JSON.stringify(result, null, 2);
  }

  /** Parse a pipe-language string and return a Pipeline. */
  static parse(raw: string): Pipeline {
    return new Pipeline(parsePipeline(raw));
  }

  /** Start a pipeline with one operation. */
  static of(opName: string, args: unknown[] = []): Pipeline {
    return new Pipeline([{ opName, args }]);
  }

  get length(): number {
    return this.steps.length;
  }
}

export default Pipeline;
