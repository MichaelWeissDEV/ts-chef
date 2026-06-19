/**
 * @fileoverview Core Recipe class for ts-chef processing pipeline
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import Dish from "./Dish";
import { Operation, AnyInput } from "./Operation";
import { PipelineData, normalizeInput, InputType } from "./types";
import registry from "../opsRegistry";

/**
 * Represents a single operation entry in a recipe's internal list.
 */
interface OpListItem {
  /** The name of the operation. */
  name: string;
  /** The module/category name. */
  module?: string;
  /** The argument values configured for this instance of the operation. */
  ingValues: (PipelineData | null)[];
  /** Whether execution should pause before this operation (breakpoint). */
  breakpoint?: boolean;
  /** Whether this operation is disabled and should be skipped. */
  disabled?: boolean;
  /** The expected input type for this operation. */
  inputType?: string;
  /** The expected output type for this operation. */
  outputType?: string;
  /** Whether this is a flow control operation (e.g., Fork, Jump). */
  flowControl?: boolean;
  /** The actual Operation instance. */
  op?: Operation;
}

/**
 * Captures the current execution state of a recipe.
 */
interface RecipeState {
  /** The current operation index being executed. */
  progress: number;
  /** The dish containing the data. */
  dish: Dish;
  /** The complete list of operations in the recipe. */
  opList: OpListItem[];
  /** Optional offset for fork operations. */
  forkOffset?: number;
}

/**
 * A Recipe manages a sequence of operations to be performed on a Dish.
 *
 * It handles the execution of operations, including flow control and
 * data type conversions between steps.
 */
class Recipe {
  /** The list of operations that make up this recipe. */
  opList: OpListItem[] = [];

  /**
   * Creates a new Recipe.
   *
   * @param recipeConfig - Optional configuration array of operations and their arguments.
   */
  constructor(
    recipeConfig?: Array<{
      op: string;
      args: (PipelineData | null)[];
      breakpoint?: boolean;
      disabled?: boolean;
    }>,
  ) {
    if (recipeConfig) {
      recipeConfig.forEach((c) => {
        const entry = registry.find(
          (e) => e.opName === c.op || e.displayName.toLowerCase() === c.op.toLowerCase()
        );
        const op = entry ? entry.factory() : undefined;
        this.opList.push({
          name: c.op,
          ingValues: c.args,
          breakpoint: c.breakpoint,
          disabled: c.disabled || c.op === "Comment",
          op: op,
          inputType: op?.inputType,
          outputType: op?.outputType,
          flowControl: op?.flowControl,
        });
      });
    }
  }

  /**
   * Adds a list of operations to the recipe.
   *
   * @param ops - The operation items to add.
   */
  addOperations(ops: OpListItem[]): void {
    ops.forEach(op => {
      if (!op.op) {
        const entry = registry.find(
          (e) => e.opName === op.name || e.displayName.toLowerCase() === op.name.toLowerCase()
        );
        op.op = entry ? entry.factory() : undefined;
      }
      if (op.op) {
        op.inputType = op.inputType ?? op.op.inputType;
        op.outputType = op.outputType ?? op.op.outputType;
        op.flowControl = op.flowControl ?? op.op.flowControl;
      }
    });
    this.opList = this.opList.concat(ops);
  }

  /**
   * Executes the recipe on the provided Dish.
   *
   * @param dish - The data container to process.
   * @param startProgress - The index of the operation to start from.
   * @param state - Optional partial state to resume execution.
   * @returns A promise resolving to the final operation index reached.
   * @throws {Error} If an operation fails, with the error object containing the progress index.
   */
  async execute(
    dish: Dish,
    startProgress = 0,
    state?: Partial<RecipeState>,
  ): Promise<number> {
    let progress = startProgress;
    const opList = this.opList;

    for (let i = progress; i < opList.length; i++) {
      const item = opList[i];
      if (item.disabled) continue;
      
      if (!item.op) {
        const entry = registry.find(
          (e) => e.opName === item.name || e.displayName.toLowerCase() === item.name.toLowerCase()
        );
        item.op = entry ? entry.factory() : undefined;
      }
      
      if (!item.op) continue;

      const op = item.op;
      const isFlowControl = item.flowControl ?? op.flowControl;
      const inputType = item.inputType ?? op.inputType ?? "string";
      const outputType = item.outputType ?? op.outputType ?? "string";

      try {
        if (isFlowControl) {
          const currentState: RecipeState = {
            progress: i,
            dish,
            opList,
            forkOffset: state?.forkOffset ?? 0,
            ...state,
          };
          const result = await op.run(
            currentState,
            item.ingValues as unknown[],
          );
          if (result && typeof result === "object" && "progress" in result) {
            i = (result as unknown as RecipeState).progress;
          }
        } else {
          // Type-safe input normalization
          const rawInput = await dish.get(inputType);
          const input = inputType
            ? normalizeInput(
                rawInput as PipelineData,
                inputType as InputType,
              )
            : rawInput;
          const output = await op.run(
            input as AnyInput,
            item.ingValues as unknown[],
          );
          dish.set(output, outputType);
        }
        progress = i;
      } catch (err) {
        // Ensure the error includes the progress index so the caller knows where it failed
        throw Object.assign(
          err instanceof Error ? err : new Error(String(err)),
          { progress: i },
        );
      }
    }
    return progress;
  }
}

export default Recipe;
