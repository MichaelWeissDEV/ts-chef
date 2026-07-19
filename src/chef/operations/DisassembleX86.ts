/**
 * @fileoverview DisassembleX86 operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import OperationError from "../errors/OperationError";
import { loadCapstone } from "../lib/Capstone";

/**
 * Disassemble x86 operation
 */
export class DisassembleX86 extends TypedOperation<string, Promise<string>, unknown[]> {
  /**
   * DisassembleX86 constructor
   */
  constructor() {
    super();

    this.name = "Disassemble x86";
    this.module = "Shellcode";
    this.description =
      "Disassembly is the process of translating machine language into assembly language.<br><br>This operation supports 64-bit, 32-bit and 16-bit code written for Intel or AMD x86 processors. It is particularly useful for reverse engineering shellcode.<br><br>Input should be in hexadecimal.";
    this.infoURL = "https://wikipedia.org/wiki/X86";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Bit mode",
        type: "option",
        value: ["64", "32", "16"],
      },
      {
        name: "Compatibility",
        type: "option",
        value: [
          "Full x86 architecture",
          "Knights Corner",
          "Larrabee",
          "Cyrix",
          "Geode",
          "Centaur",
          "X86/486",
        ],
      },
      {
        name: "Code Segment (CS)",
        type: "number",
        value: 16,
      },
      {
        name: "Offset (IP)",
        type: "number",
        value: 0,
      },
      {
        name: "Show instruction hex",
        type: "boolean",
        value: true,
      },
      {
        name: "Show instruction position",
        type: "boolean",
        value: true,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   *
   * @throws {OperationError} if invalid mode value
   */
  async run(input: string, args: unknown[]): Promise<string> {
    const [
      mode,
      compatibility,
      codeSegment,
      offset,
      showInstructionHex,
      showInstructionPos,
    ] = args as [string, string, number, number, boolean, boolean];

    const code = input.replace(/\s/g, "");
    if (!/^[0-9a-fA-F]*$/.test(code)) {
      throw new OperationError(
        "Invalid hexadecimal input. Please provide valid hex characters only.",
      );
    }
    if (code.length % 2 !== 0) {
      throw new OperationError("Invalid hexadecimal input. Length must be even.");
    }
    if (!code) return "";
    if (compatibility !== "Full x86 architecture") {
      throw new OperationError(
        `Compatibility profile '${compatibility}' is not supported by the Capstone backend.`,
      );
    }

    const cs = await loadCapstone();
    const modes: Record<string, number> = {
      "16": cs.MODE_16,
      "32": cs.MODE_32,
      "64": cs.MODE_64,
    };
    const capstoneMode = modes[mode];
    if (capstoneMode === undefined) {
      throw new OperationError("Invalid mode value");
    }

    const bytes = code.match(/.{2}/g)?.map((byte) => parseInt(byte, 16)) ?? [];
    const startAddress = mode === "16" ? codeSegment * 16 + offset : offset;
    let disassembler;
    try {
      disassembler = new cs.Capstone(cs.ARCH_X86, capstoneMode);
      const instructions = disassembler.disasm(bytes, startAddress);
      return instructions
        .map((instruction) => {
          const columns: string[] = [];
          if (showInstructionPos) {
            columns.push(`0x${instruction.address.toString(16).padStart(8, "0")}`);
          }
          if (showInstructionHex) {
            columns.push(
              instruction.bytes
                .map((byte) => byte.toString(16).padStart(2, "0"))
                .join("")
                .padEnd(16, " "),
            );
          }
          columns.push(
            instruction.op_str
              ? `${instruction.mnemonic} ${instruction.op_str}`
              : instruction.mnemonic,
          );
          return columns.join("  ");
        })
        .join("\n");
    } catch (error) {
      throw new OperationError(
        `x86 disassembly failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      disassembler?.close();
    }
  }
}

export default DisassembleX86;
