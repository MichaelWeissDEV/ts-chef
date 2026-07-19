/**
 * @fileoverview Tests for the Capstone-backed x86 disassembler operation.
 * @package test/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import { DisassembleX86 } from "../../src/chef/operations/DisassembleX86";

describe("DisassembleX86", () => {
  test("decodes known x86-64 instructions instead of returning empty output", async () => {
    const operation = new DisassembleX86();
    const output = await operation.run("90c3", [
        "64",
        "Full x86 architecture",
        16,
        0,
        true,
        true,
      ]);

    expect(output).toContain("nop");
    expect(output).toContain("ret");
  });
});
