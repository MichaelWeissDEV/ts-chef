/**
 * Supported data types for a Dish.
 */
export const DISH_TYPES = {
  /** Raw binary data. */
  ARRAY_BUFFER: 0,
  /** Text string. */
  STRING: 1,
  /** Numeric value. */
  NUMBER: 2,
  /** HTML formatted text. */
  HTML: 3,
  /** JSON object or array. */
  JSON: 4,
  /** File representation. */
  FILE: 5,
  /** List of files. */
  LIST_FILE: 6,
  /** BigInt representation. */
  BIG_NUMBER: 7,
} as const;

/**
 * Type alias for supported dish types.
 */
export type DishType = (typeof DISH_TYPES)[keyof typeof DISH_TYPES];

/**
 * A Dish represents the container for data as it flows through a Recipe.
 *
 * It stores the current value and its type, and provides methods for
 * setting, getting, and presenting the data.
 */
class Dish {
  /** The current value stored in the dish. */
  value: unknown = new ArrayBuffer(0);

  /** The type of the current value. */
  type: DishType = DISH_TYPES.ARRAY_BUFFER;

  /** Static access to Dish types for convenience. */
  static readonly ARRAY_BUFFER = DISH_TYPES.ARRAY_BUFFER;
  static readonly STRING = DISH_TYPES.STRING;
  static readonly NUMBER = DISH_TYPES.NUMBER;
  static readonly HTML = DISH_TYPES.HTML;
  static readonly JSON = DISH_TYPES.JSON;
  static readonly FILE = DISH_TYPES.FILE;
  static readonly LIST_FILE = DISH_TYPES.LIST_FILE;
  static readonly BIG_NUMBER = DISH_TYPES.BIG_NUMBER;

  /**
   * Creates a new Dish.
   *
   * @param value - Initial value.
   * @param type - Initial type.
   */
  constructor(value?: unknown, type?: DishType) {
    if (value !== undefined && type !== undefined) {
      this.set(value, type);
    } else if (value !== undefined) {
      this.set(value, DISH_TYPES.STRING);
    }
  }

  /**
   * Sets the value and type of the dish.
   *
   * @param value - The new value.
   * @param type - The new type.
   */
  set(value: unknown, type: DishType | string): void {
    this.value = value;
    if (typeof type === "number") {
      this.type = type;
    }
  }

  /**
   * Gets the value of the dish, optionally converted to a specific type.
   *
   * @param _type - The requested type. Currently returns the raw value.
   * @returns The value stored in the dish.
   */
  async get(_type: DishType | string): Promise<unknown> {
    return this.value;
  }

  /**
   * Returns a string representation of the dish's value for presentation.
   *
   * @returns A promise resolving to the string representation.
   */
  async present(): Promise<string> {
    if (this.value === null || this.value === undefined) return "";
    if (typeof this.value === "string") return this.value;
    if (this.value instanceof ArrayBuffer) {
      return new TextDecoder().decode(this.value);
    }
    return String(this.value);
  }

  /**
   * Creates a shallow clone of the dish.
   *
   * @returns A new Dish instance with the same value and type.
   */
  clone(): Dish {
    const d = new Dish();
    d.value = this.value;
    d.type = this.type;
    return d;
  }
}

export default Dish;
