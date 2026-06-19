/**
 * @fileoverview Fork operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation_new";
import Recipe from "../Recipe";
import Dish from "../Dish";

/**
 * Fork operation
 */
export class Fork extends TypedOperation<AnyInput, Promise<AnyInput>, unknown[]> {
  /**
   * Fork constructor
   */
  constructor() {
    super();

    this.name = "Fork";
    this.flowControl = true;
    this.module = "Default";
    this.description =
      "Split the input data up based on the specified delimiter and run all subsequent operations on each branch separately.<br><br>For example, to decode multiple Base64 strings, enter them all on separate lines then add the 'Fork' and 'From Base64' operations to the recipe. Each string will be decoded separately.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Split delimiter",
        type: "binaryShortString",
        value: "\\n",
      },
      {
        name: "Merge delimiter",
        type: "binaryShortString",
        value: "\\n",
      },
      {
        name: "Ignore errors",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * @param input - The current state of the recipe (passed as AnyInput for flow-control ops).
   * @param _args - Unused – the operation reads its config from the recipe state directly.
   * @returns The updated state of the recipe.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async run(input: AnyInput, _args: unknown[]): Promise<AnyInput> {
    // Flow-control operations receive the full recipe state as their input
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state = input as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opList: any[] = state.opList;
    const inputType: string = opList[state.progress].inputType;
    const outputType: string = opList[state.progress].outputType;
    const currentInput: string = await state.dish.get(inputType);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ings: any[] = opList[state.progress].ingValues;
    const [splitDelim, mergeDelim, ignoreErrors] = ings;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subOpList: any[] = [];
    let inputs: string[] = [];
    let i: number;

    if (currentInput) inputs = currentInput.split(splitDelim);

    // Set to 1 as if we are here, then there is one, the current one.
    let numOp = 1;
    // Create subOpList for each tranche to operate on
    // all remaining operations unless we encounter a Merge
    for (i = state.progress + 1; i < opList.length; i++) {
      if (opList[i].name === "Merge" && !opList[i].disabled) {
        numOp--;
        if (numOp === 0 || opList[i].ingValues[0]) break;
        else
          // Not this Fork's Merge.
          subOpList.push(opList[i]);
      } else {
        if (opList[i].name === "Fork" || opList[i].name === "Subsection")
          numOp++;
        subOpList.push(opList[i]);
      }
    }

    const recipe = new Recipe();
    const outputs: string[] = [];
    let progress = 0;

    state.forkOffset += state.progress + 1;

    recipe.addOperations(subOpList);

    // Take a deep(ish) copy of the ingredient values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ingValues = subOpList.map((op: any) =>
      JSON.parse(JSON.stringify(op.ingValues)),
    );

    // Run recipe over each tranche
    for (i = 0; i < inputs.length; i++) {
      // Baseline ing values for each tranche so that registers are reset
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recipe.opList.forEach((op: any, idx: number) => {
        op.ingValues = JSON.parse(JSON.stringify(ingValues[idx]));
      });

      const dish = new Dish();
      dish.set(inputs[i], inputType);

      try {
        progress = await recipe.execute(dish, 0, state);
      } catch (err: unknown) {
        if (!ignoreErrors) {
          throw err;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        progress = (err as any).progress + 1;
      }
      outputs.push(await dish.get(outputType) as string);
    }

    state.dish.set(outputs.join(mergeDelim), outputType);
    state.progress += progress;
    return state;
  }
}

export default Fork;
