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
 * @deprecated - Use normaliseInput instead.
 */
export function normalizeInput(
  data: PipelineData,
  expectedType: InputType,
): PipelineData {
  return normaliseInput(data, expectedType as string) as PipelineData;
}

/**
 * Converts any intermediate pipeline value to the type a concrete operation
 * declares in its {@link Operation.inputType} field.
 *
 * This mirrors the logic in `runner.ts` and is the single source of truth for
 * inter-step normalisation in both the opName-based and instance-based pipeline
 * execution paths.
 *
 * @param input - The raw output of the previous pipeline step.
 * @param inputType - The `inputType` string declared by the next operation
 *   (e.g. `"string"`, `"byteArray"`, `"ArrayBuffer"`, `"number"`).
 * @returns The input coerced to the expected type.
 */
export function normaliseInput(input: unknown, inputType: string): unknown {
  const type = inputType.toLowerCase().replace(/[^a-z0-9]/g, "");
  const textValue = (): string => {
    if (input === null || input === undefined) return "";
    if (typeof input === "string") return input;
    if (input instanceof ArrayBuffer)
      return Buffer.from(new Uint8Array(input)).toString("utf-8");
    if (Buffer.isBuffer(input) || input instanceof Uint8Array)
      return Buffer.from(input).toString("utf-8");
    if (Array.isArray(input) && input.every((item) => typeof item === "number"))
      return Buffer.from(input as number[]).toString("utf-8");
    if (typeof input === "object") return JSON.stringify(input);
    return String(input);
  };
  const byteValue = (): Buffer => {
    if (input instanceof ArrayBuffer) return Buffer.from(new Uint8Array(input));
    if (Buffer.isBuffer(input) || input instanceof Uint8Array)
      return Buffer.from(input);
    if (Array.isArray(input) && input.every((item) => typeof item === "number"))
      return Buffer.from(input as number[]);
    return Buffer.from(textValue(), "utf-8");
  };

  switch (type) {
    case "string":
    case "html":
      return textValue();
    case "json":
    case "object": {
      if (input !== null && typeof input === "object" && !Buffer.isBuffer(input))
        return input;
      const text = textValue().trim();
      if (!text) return null;
      try {
        return JSON.parse(text) as unknown;
      } catch (error) {
        throw new TypeError(`Invalid JSON input: ${String(error)}`, {
          cause: error,
        });
      }
    }
    case "bytearray":
      return Array.from(byteValue());
    case "arraybuffer": {
      const buf = byteValue();
      const ab = new ArrayBuffer(buf.length);
      new Uint8Array(ab).set(buf);
      return ab;
    }
    case "number":
    {
      if (typeof input === "number") return input;
      const value = Number(textValue().trim());
      if (!Number.isFinite(value)) throw new TypeError("Invalid numeric input");
      return value;
    }
    case "bignumber":
    case "bigint":
      return typeof input === "bigint" ? input : BigInt(textValue().trim());
    default:
      // File-like and future operation-specific values must remain lossless.
      return input;
  }
}
