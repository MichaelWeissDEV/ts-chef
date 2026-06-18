/**
 * @fileoverview Type definitions for global.d
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

declare global {
  interface Window {
    sendStatusMessage(message: string): void;
  }
  interface WorkerGlobalScope {
    sendStatusMessage(message: string): void;
  }
  var sendStatusMessage: (message: string) => void;
}

export {};
