/*
 * -----------------------------------------------------------------------------
 * Project:     ts-chef
 * Model:       Qwen 3.5 Coder Next (Local)
 * Version:     1.0.0
 * Author:      Michael Weiss
 * Source:      Ported from GCHQ's CyberChef (JavaScript)
 * License:     Apache License 2.0
 * Description: TypeScript implementation of CyberChef modules.
 * Note:        First Port done by Local Model, Cleanup and fixes by Author
 * -----------------------------------------------------------------------------
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
