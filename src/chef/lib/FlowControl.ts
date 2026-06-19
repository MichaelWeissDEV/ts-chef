/**
 * @fileoverview FlowControl module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

interface OperationState {
  opList: Array<{ name: string; ingValues: unknown[] }>;
  [key: string]: unknown;
}

/**
 * Returns the index of the first Label operation with the given name in the recipe's operation list.
 *
 * @param name - The label name to search for
 * @param state - The current operation state containing the operation list
 * @returns The zero-based index of the matching Label operation, or -1 if not found
 */
export function getLabelIndex(name: string, state: OperationState): number {
  return state.opList.findIndex((operation) => {
    return operation.name === "Label" && name === operation.ingValues[0];
  });
}
