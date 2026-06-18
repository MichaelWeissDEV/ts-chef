/**
 * @fileoverview types module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

/**
 * Core type definitions for the ts-chef engine.
 * These types ensure type safety throughout the data transformation pipeline.
 */

// Re-export DishType from Dish module for convenience
export { DISH_TYPES, type DishType } from "./Dish";

/**
 * Supported input data types for operations.
 * This union represents all possible data types that can flow through the pipeline.
 */
export type PipelineData =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | ArrayBufferLike
  | ArrayBufferView
  | PipelineDataArray
  | PipelineDataObject
  | object;

/**
 * Array of {@link PipelineData}. The recursion is deferred through the array
 * structure, so the {@link PipelineData} union alias is not "circular".
 */
export type PipelineDataArray = PipelineData[];

/**
 * Plain object whose values are {@link PipelineData}.
 */
export interface PipelineDataObject {
  [key: string]: PipelineData;
}

/**
 * Input types that operations can declare they accept.
 * Used for inputType/outputType validation.
 */
export const INPUT_TYPES = {
  /** Raw binary data as ArrayBuffer */
  ARRAY_BUFFER: "ArrayBuffer",
  /** Raw binary data as Uint8Array */
  UINT8_ARRAY: "Uint8Array",
  /** Text string */
  STRING: "string",
  /** Numeric value */
  NUMBER: "number",
  /** BigInt value */
  BIGINT: "bigint",
  /** Boolean value */
  BOOLEAN: "boolean",
  /** Hex encoded string */
  HEX: "hex",
  /** Base64 encoded string */
  BASE64: "base64",
  /** Byte array (hex or raw bytes) */
  BYTE_ARRAY: "byteArray",
  /** JSON object/array */
  JSON: "json",
  /** HTML content */
  HTML: "html",
  /** File object */
  FILE: "file",
  /** List of files */
  LIST_FILE: "list_file",
} as const;

/**
 * Type for input/output type strings.
 */
export type InputType = (typeof INPUT_TYPES)[keyof typeof INPUT_TYPES];

/**
 * Type guard to check if a value is an ArrayBuffer
 */
export function isArrayBuffer(value: PipelineData): value is ArrayBuffer {
  return value instanceof ArrayBuffer;
}

/**
 * Type guard to check if a value is a Uint8Array
 */
export function isUint8Array(value: PipelineData): value is Uint8Array {
  return value instanceof Uint8Array;
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: PipelineData): value is string {
  return typeof value === "string";
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: PipelineData): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Type guard to check if a value is a bigint
 */
export function isBigInt(value: PipelineData): value is bigint {
  return typeof value === "bigint";
}

/**
 * Type guard to check if a value is a boolean
 */
export function isBoolean(value: PipelineData): value is boolean {
  return typeof value === "boolean";
}

/**
 * Type guard to check if a value is null or undefined
 */
export function isNullOrUndefined(
  value: PipelineData,
): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Type guard to check if a value is an object (not null, not array)
 */
export function isPlainObject(
  value: PipelineData,
): value is Record<string, PipelineData> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Type guard to check if a value is an array
 */
export function isArray(value: PipelineData): value is Array<PipelineData> {
  return Array.isArray(value);
}

/**
 * Converts PipelineData to a string representation.
 * Handles ArrayBuffer and typed arrays by decoding to UTF-8.
 */
export function toString(data: PipelineData): string {
  if (data === null || data === undefined) return "";
  if (typeof data === "string") return data;
  if (data instanceof ArrayBuffer) {
    return new TextDecoder().decode(data);
  }
  if (ArrayBuffer.isView(data) && data instanceof Uint8Array) {
    return new TextDecoder().decode(data);
  }
  return String(data);
}

/**
 * Converts PipelineData to Uint8Array.
 * Handles strings, ArrayBuffers, and various typed arrays.
 */
export function toUint8Array(data: PipelineData): Uint8Array {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (typeof data === "string") {
    return new TextEncoder().encode(data);
  }
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
  // For other types, try to convert to string first
  return new TextEncoder().encode(String(data));
}

/**
 * Converts PipelineData to ArrayBuffer.
 * Handles strings, Uint8Arrays, and other typed arrays.
 */
export function toArrayBuffer(data: PipelineData): ArrayBuffer {
  if (data instanceof ArrayBuffer) return data;
  // Funnel everything else through toUint8Array and copy into a freshly
  // allocated (non-shared) ArrayBuffer so the return type is guaranteed to be
  // a plain ArrayBuffer rather than ArrayBufferLike (e.g. SharedArrayBuffer).
  const bytes = toUint8Array(data);
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

/**
 * Normalizes input data to the expected type.
 * This is used for type-safe conversions between pipeline steps.
 */
export function normalizeInput(
  data: PipelineData,
  expectedType: InputType,
): PipelineData {
  switch (expectedType) {
    case INPUT_TYPES.ARRAY_BUFFER:
      return toArrayBuffer(data);
    case INPUT_TYPES.UINT8_ARRAY:
      return toUint8Array(data);
    case INPUT_TYPES.STRING:
      return toString(data);
    case INPUT_TYPES.NUMBER:
      return isNumber(data) ? data : parseFloat(toString(data)) || 0;
    case INPUT_TYPES.BIGINT:
      return isBigInt(data)
        ? data
        : BigInt(toString(data).replace(/[^0-9]/g, ""));
    case INPUT_TYPES.BOOLEAN:
      return isBoolean(data) ? data : Boolean(toString(data));
    case INPUT_TYPES.HEX:
    case INPUT_TYPES.BYTE_ARRAY:
      return toUint8Array(data);
    case INPUT_TYPES.BASE64:
      // For base64, we keep as string but ensure it's valid base64
      return toString(data);
    case INPUT_TYPES.JSON:
      try {
        if (isString(data)) {
          return JSON.parse(data);
        }
        return data;
      } catch {
        return data;
      }
    default:
      return data;
  }
}
