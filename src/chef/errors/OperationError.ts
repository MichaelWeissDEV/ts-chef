/**
 * @fileoverview OperationError module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

/**
 * Standard error class for failures within CyberChef operations.
 *
 * This error should be thrown when an operation cannot proceed due to
 * invalid input, configuration errors, or execution failures.
 */
export class OperationError extends Error {
  /**
   * Creates a new OperationError.
   *
   * @param message - The error message or another Error object to wrap.
   */
  constructor(message: string | unknown) {
    super(message instanceof Error ? message.message : String(message));
    this.name = "OperationError";
    // Explicitly set the prototype for proper inheritance in some environments
    Object.setPrototypeOf(this, OperationError.prototype);
  }
}

export default OperationError;
