/*
 * -----------------------------------------------------------------------------
 * Project:     ts-chef
 * Model:       Qwen 3.5 Coder Next (Local)
 * Version:     1.0.0
 * Author:      Michael Weiss
 * Source:      Ported from GCHQ's CyberChef (JavaScript)
 * License:     Apache License 2.0
 * Description: TypeScript implementation of CyberChef modules.
 * Note:        First Port done by Local Model, Cleanup and fixes by Author
 * -----------------------------------------------------------------------------
 */

import { Operation } from "../Operation";
import Recipe from "../Recipe";
import Dish from "../Dish";

/**
 * Fork operation
 */
export class Fork extends Operation {
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
   * @param {Object} state - The current state of the recipe.
   * @param {number} state.progress - The current position in the recipe.
   * @param {Dish} state.dish - The Dish being operated on.
   * @param {Operation[]} state.opList - The list of operations in the recipe.
   * @returns {Object} The updated state of the recipe.
   */
  async run(input: any, args: any[]): Promise<any> {
    const state = input;
    const opList = state.opList,
      inputType = opList[state.progress].inputType,
      outputType = opList[state.progress].outputType,
      currentInput = await state.dish.get(inputType),
      ings = opList[state.progress].ingValues,
      [splitDelim, mergeDelim, ignoreErrors] = ings,
      subOpList = [];
    let inputs = [],
      i;

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
    const outputs = [];
    let progress = 0;

    state.forkOffset += state.progress + 1;

    recipe.addOperations(subOpList);

    // Take a deep(ish) copy of the ingredient values
    const ingValues = subOpList.map((op) =>
      JSON.parse(JSON.stringify(op.ingValues)),
    );

    // Run recipe over each tranche
    for (i = 0; i < inputs.length; i++) {
      // Baseline ing values for each tranche so that registers are reset
      recipe.opList.forEach((op, i) => {
        op.ingValues = JSON.parse(JSON.stringify(ingValues[i]));
      });

      const dish = new Dish();
      dish.set(inputs[i], inputType);

      try {
        progress = await recipe.execute(dish, 0, state);
      } catch (err: any) {
        if (!ignoreErrors) {
          throw err;
        }
        progress = err.progress + 1;
      }
      outputs.push(await dish.get(outputType));
    }

    state.dish.set(outputs.join(mergeDelim), outputType);
    state.progress += progress;
    return state;
  }
}

export default Fork;
