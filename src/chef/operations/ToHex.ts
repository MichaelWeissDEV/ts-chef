/**
 * @fileoverview ToHex operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, OperationResult, INPUT_TYPES } from "../Operation";
import { PipelineData, toUint8Array } from "../types";

const DELIM_OPTIONS = [
  "Space",
  "Percent",
  "Comma",
  "Semi-colon",
  "Colon",
  "Line feed",
  "CRLF",
  "0x",
  "0x with comma",
  "\\x",
  "None",
];

/**
 * Strongly typed argument configuration for ToHex operation
 */
export interface ToHexArgs {
  /** The delimiter to use between hex bytes */
  delimiter: string;
  /** Number of bytes per line (0 for no line breaks) */
  bytesPerLine: number;
}

/**
 * ToHex operation with strong typing
 *
 * Converts input data to hexadecimal representation with configurable formatting.
 *
 * @example
 * // Basic usage
 * const op = new ToHex();
 * const result = await op.run(input, ["Space", 0]);
 *
 * @example
 * // Pipeline usage
 * const pipeline = new ToHex().withArgs("Space", 0);
 * const result = await pipeline.run(input);
 *
 * @example
 * // Chaining operations
 * const pipeline = new FromBase64()
 *   .withArgs()
 *   .pipe(new ToHex())
 *   .withArgs("Colon", 16);
 */
export class ToHex extends TypedOperation<PipelineData, string, [delimiter: string, bytesPerLine: number]> {
  constructor() {
    super();
    this.name = "To hex";
    this.module = "Default";
    this.description =
      "Converts the input string to hexadecimal bytes separated by the specified delimiter.";
    this.inputType = INPUT_TYPES.ARRAY_BUFFER;
    this.outputType = INPUT_TYPES.STRING;
    this.args = [
      { name: "Delimiter", type: "option", value: DELIM_OPTIONS },
      { name: "Bytes per line", type: "number", value: 0 },
    ];
  }

  /**
   * Main execution method with strong typing
   *
   * @param input - The input data (can be string, ArrayBuffer, or byte array)
   * @param args - Tuple of arguments: [delimiter, bytesPerLine]
   * @returns Hexadecimal string representation
   */
  run(input: PipelineData, args: [string, number]): string {
    const [delimOpt, bytesPerLine] = args;
    
    // Normalize input to Uint8Array
    const bytes = toUint8Array(input);

    const delimMap: Record<string, string> = {
      Space: " ",
      Percent: "%",
      Comma: ",",
      "Semi-colon": ";",
      Colon: ":",
      "Line feed": "\n",
      CRLF: "\r\n",
      "0x": "",
      "0x with comma": ",",
      "\\x": "",
      None: "",
    };

    const prefixMap: Record<string, string> = {
      "0x": "0x",
      "0x with comma": "0x",
      "\\x": "\\x",
    };

    const delim = delimMap[delimOpt] ?? " ";
    const prefix = prefixMap[delimOpt] ?? "";

    const hexBytes = Array.from(bytes).map(
      (b) => prefix + b.toString(16).padStart(2, "0"),
    );

    if (bytesPerLine > 0) {
      const lines: string[] = [];
      for (let i = 0; i < hexBytes.length; i += bytesPerLine) {
        lines.push(hexBytes.slice(i, i + bytesPerLine).join(delim));
      }
      return lines.join("\n");
    }

    return hexBytes.join(delim);
  }

  /**
   * Execute with detailed result information
   */
  async runWithResult(
    input: PipelineData,
    args: [string, number]
  ): Promise<OperationResult<string, Error>> {
    return super.runWithResult(input, args);
  }
}

/**
 * Convenience method for creating a ToHex operation with pre-configured arguments
 *
 * @param delimiter - The delimiter to use
 * @param bytesPerLine - Bytes per line (default: 0)
 * @returns OperationWithArgs instance ready for piping
 */
export function toHex(delimiter: string = "Space", bytesPerLine: number = 0) {
  const op = new ToHex();
  return op.withArgs(delimiter, bytesPerLine);
}

export default ToHex;
