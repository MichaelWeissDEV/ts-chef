/**
 * @fileoverview Shared lazy loader for the Capstone disassembly WebAssembly module.
 * @package chef/lib
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import createCapstone from "@alexaltea/capstone-js";

export type CapstoneModule = Awaited<ReturnType<typeof createCapstone>>;

let capstonePromise: Promise<CapstoneModule> | undefined;

/** Loads and caches the Capstone module for all disassembler operations. */
export function loadCapstone(): Promise<CapstoneModule> {
  capstonePromise ??= createCapstone();
  return capstonePromise;
}
