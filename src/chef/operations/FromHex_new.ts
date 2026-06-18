/**
 * @fileoverview FromHex operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, OperationResult, HighlightResult, HighlightPos, INPUT_TYPES } from "../Operation_new";
import { fromHex, FROM_HEX_DELIM_OPTIONS } from "../lib/Hex";
import { Utils } from "../Utils";

/**
 * Strongly typed argument configuration for FromHex operation
 */
export interface FromHexArgs {
  /** The delimiter used in the hex string */
  delimiter: string;
}

/**
 * FromHex operation with strong typing
 *
 * Converts a hexadecimal string back to raw bytes.
 *
 * @example
 * // Basic usage
 * const op = new FromHex();
 * const result = await op.run("48 65 6c 6c 6f", ["Space"]);
 * // Result: Uint8Array [72, 101, 108, 108, 111]
 *
 * @example
 * // Pipeline usage
 * const pipeline = new FromHex()
 *   .withArgs("Space")
 *   .pipe(new ToString());
 */
export class FromHex extends TypedOperation<string, number[], [delimiter: string]> {
  constructor() {
    super();
    this.name = "From Hex";
    this.module = "Default";
    this.description =
      "Converts a hexadecimal byte string back into its raw value.<br><br>e.g. <code>ce 93 ce b5 ce b9 ce ac 20 cf 83 ce bf cf 85 0a</code> becomes the UTF-8 encoded string <code>Geia sou</code>";
    this.infoURL = "https://wikipedia.org/wiki/Hexadecimal";
    this.inputType = INPUT_TYPES.STRING;
    this.outputType = INPUT_TYPES.BYTE_ARRAY;
    this.args = [
      {
        name: "Delimiter",
        type: "option",
        value: FROM_HEX_DELIM_OPTIONS,
      },
    ];
    this.checks = [
      { pattern: "^(?:[\\dA-F]{2})+$", flags: "i", args: ["None"] },
      {
        pattern: "^[\\dA-F]{2}(?: [\\dA-F]{2})*$",
        flags: "i",
        args: ["Space"],
      },
      {
        pattern: "^[\\dA-F]{2}(?:,[\\dA-F]{2})*$",
        flags: "i",
        args: ["Comma"],
      },
      {
        pattern: "^[\\dA-F]{2}(?:;[\\dA-F]{2})*$",
        flags: "i",
        args: ["Semi-colon"],
      },
      {
        pattern: "^[\\dA-F]{2}(?::[\\dA-F]{2})*$",
        flags: "i",
        args: ["Colon"],
      },
      {
        pattern: "^[\\dA-F]{2}(?:\\n[\\dA-F]{2})*$",
        flags: "i",
        args: ["Line feed"],
      },
      {
        pattern: "^[\\dA-F]{2}(?:\\r\\n[\\dA-F]{2})*$",
        flags: "i",
        args: ["CRLF"],
      },
      { pattern: "^(?:0x[\\dA-F]{2})+$", flags: "i", args: ["0x"] },
      {
        pattern: "^0x[\\dA-F]{2}(?:,0x[\\dA-F]{2})*$",
        flags: "i",
        args: ["0x with comma"],
      },
      { pattern: "^(?:\\\\x[\\dA-F]{2})+$", flags: "i", args: ["\\x"] },
    ];
  }

  /**
   * Main execution method with strong typing
   *
   * @param input - The hexadecimal string to convert
   * @param args - Tuple of arguments: [delimiter]
   * @returns Byte array (Uint8Array values as number[])
   */
  run(input: string, args: [string]): number[] {
    const [delim] = args;
    return fromHex(input, delim || "Auto", 2);
  }

  /**
   * Calculate highlight positions for input-output mapping
   */
  highlight(pos: HighlightPos, args: [string]): HighlightResult {
    const [delimStr] = args;
    if (delimStr === "Auto") return false;
    const delim = Utils.charRep(delimStr);
    const len = delim === "\r\n" ? 1 : delim.length;
    const width = len + 2;

    if (delim === "0x" || delim === "\\x") {
      if (pos[0].start > 1) pos[0].start -= 2;
      else pos[0].start = 0;
      if (pos[0].end > 1) pos[0].end -= 2;
      else pos[0].end = 0;
    }

    pos[0].start = pos[0].start === 0 ? 0 : Math.round(pos[0].start / width);
    pos[0].end = pos[0].end === 0 ? 0 : Math.ceil(pos[0].end / width);
    return pos;
  }

  /**
   * Calculate reverse highlight positions
   */
  highlightReverse(pos: HighlightPos, args: [string]): HighlightResult {
    const [delimStr] = args;
    const delim = Utils.charRep(delimStr);
    const len = delim === "\r\n" ? 1 : delim.length;

    pos[0].start = pos[0].start * (2 + len);
    pos[0].end = pos[0].end * (2 + len) - len;

    if (delim === "0x" || delim === "\\x") {
      pos[0].start += 2;
      pos[0].end += 2;
    }
    return pos;
  }

  /**
   * Execute with detailed result information
   */
  async runWithResult(
    input: string,
    args: [string]
  ): Promise<OperationResult<number[], Error>> {
    return super.runWithResult(input, args);
  }
}

/**
 * Convenience method for creating a FromHex operation with pre-configured arguments
 *
 * @param delimiter - The delimiter used in the hex string
 * @returns OperationWithArgs instance ready for piping
 */
export function fromHexOp(delimiter: string = "Auto") {
  const op = new FromHex();
  return op.withArgs(delimiter);
}

export default FromHex;
