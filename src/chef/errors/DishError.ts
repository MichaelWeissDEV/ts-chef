/**
 * @fileoverview DishError module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

export class DishError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DishError";
    Object.setPrototypeOf(this, DishError.prototype);
  }
}

export default DishError;
