/**
 * @fileoverview Core Dish class for ts-chef processing pipeline
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

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
  /** Byte array representation. */
  BYTE_ARRAY: 8,
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
  static readonly BYTE_ARRAY = DISH_TYPES.BYTE_ARRAY;

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
    } else {
      let key = type.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (key === "BYTEARRAY") key = "BYTE_ARRAY";
      if (key === "ARRAYBUFFER") key = "ARRAY_BUFFER";
      if (key === "BIGNUMBER") key = "BIG_NUMBER";
      if (key === "LISTFILE") key = "LIST_FILE";
      if (key === "OBJECT") key = "JSON";
      
      if (key in DISH_TYPES) {
        this.type = DISH_TYPES[key as keyof typeof DISH_TYPES];
      }
    }
  }

  /**
   * Gets the value of the dish, optionally converted to a specific type.
   *
   * @param _type - The requested type. Coerces the stored value when possible.
   * @returns The value stored in the dish, coerced to the requested type.
   */
  async get(_type?: DishType | string): Promise<unknown> {
    // No conversion requested — return raw value
    if (_type === undefined) return this.value;

    // Resolve string type to numeric
    let targetType: DishType;
    if (typeof _type === "string") {
      let key = _type.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (key === "BYTEARRAY") key = "BYTE_ARRAY";
      if (key === "ARRAYBUFFER") key = "ARRAY_BUFFER";
      if (key === "BIGNUMBER") key = "BIG_NUMBER";
      if (key === "LISTFILE") key = "LIST_FILE";
      if (key === "OBJECT") key = "JSON";
      targetType = key in DISH_TYPES ? DISH_TYPES[key as keyof typeof DISH_TYPES] : this.type;
    } else {
      targetType = _type;
    }

    // No coercion needed if already the right type
    if (this.type === targetType) return this.value;

    // Coerce textual or byte data to structured JSON. Whether a numeric array
    // represents JSON or bytes is determined by the Dish's source type.
    if (targetType === DISH_TYPES.JSON) {
      let text: string;
      if (typeof this.value === "string") text = this.value;
      else if (this.value instanceof ArrayBuffer)
        text = new TextDecoder().decode(this.value);
      else if (Array.isArray(this.value))
        text = Buffer.from(this.value as number[]).toString("utf-8");
      else if (this.value instanceof Uint8Array)
        text = Buffer.from(this.value).toString("utf-8");
      else return this.value;
      try {
        return JSON.parse(text) as unknown;
      } catch (error) {
        throw new TypeError(`Invalid JSON input: ${String(error)}`, {
          cause: error,
        });
      }
    }

    // Coerce to string
    if (targetType === DISH_TYPES.STRING) {
      if (typeof this.value === "string") return this.value;
      if (this.type === DISH_TYPES.JSON)
        return JSON.stringify(this.value, null, 2);
      if (this.value instanceof ArrayBuffer)
        return new TextDecoder().decode(this.value);
      if (Array.isArray(this.value))
        return Buffer.from(this.value as number[]).toString("utf-8");
      return String(this.value);
    }

    // Coerce to ArrayBuffer
    if (targetType === DISH_TYPES.ARRAY_BUFFER) {
      if (this.value instanceof ArrayBuffer) return this.value;
      if (typeof this.value === "string")
        return new TextEncoder().encode(this.value).buffer;
      if (Array.isArray(this.value)) {
        const buf = Buffer.from(this.value as number[]);
        const ab = new ArrayBuffer(buf.length);
        new Uint8Array(ab).set(buf);
        return ab;
      }
    }

    // Coerce to byte array (number[])
    if (targetType === DISH_TYPES.BYTE_ARRAY) {
      if (Array.isArray(this.value)) return this.value;
      if (this.value instanceof ArrayBuffer)
        return Array.from(new Uint8Array(this.value));
      if (typeof this.value === "string")
        return Array.from(new TextEncoder().encode(this.value));
    }

    // For all other types: return raw value (caller is responsible for further conversion)
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
    if (this.type === DISH_TYPES.JSON)
      return JSON.stringify(this.value, null, 2);
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
