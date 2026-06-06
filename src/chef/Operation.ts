/**
 * @fileoverview Base class and types for all CyberChef-style operations.
 * Ported from GCHQ's CyberChef.
 *
 * @license Apache-2.0
 * @author Michael Weiss
 */

/**
 * Configuration for an operation argument.
 *
 * Defines how an argument should be rendered and validated in the UI.
 */
export interface ArgConfig {
  /** The display name of the argument. */
  name: string;
  /** The type of the argument (e.g., 'string', 'number', 'option', 'boolean'). */
  type: string;
  /** The default or current value of the argument. */
  value: unknown;
  /** Optional values for 'option' or 'editableOption' type arguments. */
  toggleValues?: string[];
  /** A hint or tooltip describing the purpose of the argument. */
  hint?: string;
  /** Number of rows for textarea-like arguments (type 'string'). */
  rows?: number;
  /** Whether the argument is disabled by default. */
  disabled?: boolean;
  /**
   * Target indices for dynamic arguments.
   * Used when one argument's value affects others.
   */
  target?: number | number[];
  /** Default index for selection-based arguments (type 'option'). */
  defaultIndex?: number;
  /** Maximum length for string-based arguments. */
  maxLength?: number;
  /** Minimum value for numeric arguments. */
  min?: number;
  /** Maximum value for numeric arguments. */
  max?: number;
  /** Step value for numeric arguments. */
  step?: number;
}

/**
 * Represents a position range for highlighting.
 * Usually an array of start/end offset pairs.
 */
export type HighlightPos = Array<{ start: number; end: number }>;

/**
 * Result of a highlighting operation.
 * Returns the new highlight positions or `false` if highlighting is not supported.
 */
export type HighlightResult = HighlightPos | false;

/**
 * Type alias for any input data processed by an operation.
 * Operations can handle strings, number arrays (byte arrays), ArrayBuffers, etc.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyInput = any;

/**
 * Abstract base class for all operations in ts-chef.
 *
 * Each operation defines its metadata (name, description, arguments)
 * and implements the `run` method to perform data transformation.
 */
export abstract class Operation {
  /**
   * Internal name of the operation.
   * Used for identification and display.
   */
  name: string = "";

  /**
   * Category or module the operation belongs to (e.g., 'Encryption', 'Hashing').
   */
  module: string = "";

  /**
   * Human-readable description of what the operation does.
   */
  description: string = "";

  /**
   * Optional URL for more information about the operation or algorithm (e.g., Wikipedia).
   */
  infoURL: string | null = null;

  /**
   * Expected input data type (e.g., 'string', 'byteArray', 'ArrayBuffer').
   */
  inputType: string = "string";

  /**
   * Expected output data type (e.g., 'string', 'byteArray', 'ArrayBuffer').
   */
  outputType: string = "string";

  /**
   * Type for presentation purposes. Defaults to `outputType`.
   */
  presentType: string = "string";

  /**
   * Whether the operation supports flow control (e.g., 'Fork', 'Jump').
   */
  flowControl: boolean = false;

  /**
   * Whether the operation requires manual triggering rather than automatic baking.
   */
  manualBake: boolean = false;

  /**
   * List of arguments the operation accepts, defined via [[ArgConfig]].
   */
  args: ArgConfig[] = [];

  /**
   * Patterns and flags for automatic detection of when this operation might be applicable.
   */
  checks?: Array<{ pattern: string; flags: string; args: unknown[] }>;

  /**
   * Executes the operation logic.
   *
   * @param input - The data to process. Can be string, byteArray, etc.
   * @param args - The arguments configured for this instance of the operation.
   * @returns The processed data.
   * @throws {OperationError} If processing fails.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract run(input: AnyInput, args: any[]): AnyInput;

  /**
   * Formats the output data for presentation in the UI.
   *
   * By default, it returns the data as-is. Override this to provide
   * custom formatting (e.g., HTML rendering, image display).
   *
   * @param data - The output data from the [[run]] method.
   * @param _args - The arguments used during execution.
   * @returns The formatted presentation data.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  present(data: AnyInput, _args: any[]): AnyInput {
    return data;
  }

  /**
   * Calculates how selection in the input translates to selection in the output.
   *
   * Used for synchronized highlighting between input and output panes.
   *
   * @param _pos - The current highlight positions in the input.
   * @param _args - The arguments used.
   * @returns The corresponding highlight positions in the output, or `false`.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  highlight(_pos: HighlightPos, _args: any[]): HighlightResult {
    return false;
  }

  /**
   * Calculates how selection in the output translates back to selection in the input.
   *
   * @param _pos - The current highlight positions in the output.
   * @param _args - The arguments used.
   * @returns The corresponding highlight positions in the input, or `false`.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  highlightReverse(_pos: HighlightPos, _args: any[]): HighlightResult {
    return false;
  }
}

export default Operation;
