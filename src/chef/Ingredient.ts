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

import { Utils } from "./Utils";
import { fromHex } from "./lib/Hex";
import { OperationError } from "./errors/OperationError";
import { ArgConfig } from "./Operation";

/**
 * An Ingredient represents a single argument value for an operation.
 *
 * It handles value parsing, validation, and conversion based on the argument type.
 */
export class Ingredient {
  /** The display name of the argument. */
  name: string = "";

  /** The data type of the argument. */
  type: string = "";

  /** Internal storage for the argument value. */
  private _value: any = null;

  /** Whether the argument is disabled. */
  disabled: boolean = false;

  /** A hint or tooltip describing the purpose of the argument. */
  hint: string | boolean = "";

  /** Number of rows for textarea-like arguments. */
  rows: number | boolean = 0;

  /** Optional values for 'option' or 'editableOption' type arguments. */
  toggleValues: string[] = [];

  /** Target indices for dynamic arguments. */
  target: number | number[] | null = null;

  /** Default index for selection-based arguments. */
  defaultIndex: number = 0;

  /** Maximum length for string-based arguments. */
  maxLength: number | null = null;

  /** Minimum value for numeric arguments. */
  min: number | null = null;

  /** Maximum value for numeric arguments. */
  max: number | null = null;

  /** Step value for numeric arguments. */
  step: number = 1;

  /** The initial default value of the argument. */
  defaultValue: any;

  /**
   * Ingredient constructor.
   *
   * @param ingredientConfig - Configuration object for the ingredient.
   */
  constructor(ingredientConfig?: ArgConfig) {
    if (ingredientConfig) {
      this._parseConfig(ingredientConfig);
    }
  }

  /**
   * Reads and parses the given config.
   *
   * @param ingredientConfig - The configuration to parse.
   */
  private _parseConfig(ingredientConfig: ArgConfig): void {
    this.name = ingredientConfig.name;
    this.type = ingredientConfig.type;
    this.defaultValue = ingredientConfig.value;
    this.disabled = !!ingredientConfig.disabled;
    this.hint = ingredientConfig.hint || false;
    this.rows = ingredientConfig.rows || false;
    this.toggleValues = ingredientConfig.toggleValues || [];
    this.target =
      typeof ingredientConfig.target !== "undefined"
        ? ingredientConfig.target
        : null;
    this.defaultIndex =
      typeof ingredientConfig.defaultIndex !== "undefined"
        ? ingredientConfig.defaultIndex
        : 0;
    this.maxLength = ingredientConfig.maxLength || null;
    this.min =
      typeof ingredientConfig.min !== "undefined" ? ingredientConfig.min : null;
    this.max =
      typeof ingredientConfig.max !== "undefined" ? ingredientConfig.max : null;
    this.step =
      typeof ingredientConfig.step !== "undefined" ? ingredientConfig.step : 1;
  }

  /**
   * Returns the value of the Ingredient as it should be stored in a recipe configuration.
   */
  get config(): any {
    return this._value;
  }

  /**
   * Sets the value of the Ingredient.
   * Automatically prepares and validates the value based on the ingredient's type.
   *
   * @param value - The new value.
   */
  set value(value: any) {
    this._value = Ingredient.prepare(value, this.type);
  }

  /**
   * Gets the current value of the Ingredient.
   */
  get value(): any {
    return this._value;
  }

  /**
   * Prepares and validates a value based on the specified argument type.
   *
   * Converts strings to numbers, parses escaped characters, or transforms
   * hex strings into byte arrays as needed.
   *
   * @param data - The raw data value.
   * @param type - The name of the data type.
   * @returns The prepared and validated value.
   * @throws {OperationError} If the value is invalid for the specified type.
   */
  static prepare(data: any, type: string): any {
    let number: number;

    switch (type) {
      case "binaryString":
      case "binaryShortString":
      case "editableOption":
      case "editableOptionShort":
        return typeof data === "string" ? Utils.parseEscapedChars(data) : data;
      case "byteArray":
        if (typeof data === "string") {
          data = data.replace(/\s+/g, "");
          return fromHex(data);
        } else {
          return data;
        }
      case "number":
        if (data === null) return data;
        number = parseFloat(data);
        if (isNaN(number)) {
          const sample = Utils.truncate(data.toString(), 10);
          throw new OperationError(
            "Invalid ingredient value. Not a number: " + sample,
          );
        }
        return number;
      default:
        return data;
    }
  }
}

export default Ingredient;
