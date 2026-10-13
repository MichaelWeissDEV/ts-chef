/**
 * @fileoverview Common types for webview modules
 * @package web
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import type { ArgConfig } from "../../chef/Operation";

/**
 * Minimal metadata for an operation as used in the operations view.
 */
export interface OpInfo {
  opName: string;
  displayName: string;
  module: string;
}

/**
 * A single step in a recipe: an operation plus its argument values.
 */
export interface RecipeStep {
  opName: string;
  args: unknown[];
}

/**
 * Extended recipe step with display information for rendering.
 */
export interface RecipeStepDisplay extends RecipeStep {
  displayName: string;
  argDefs: ArgConfig[];
}

/**
 * Full recipe state sent to the webview.
 */
export interface RecipeState {
  name: string;
  steps: RecipeStepDisplay[];
}

/**
 * Base interface for all incoming webview messages.
 */
export interface BaseWebviewMessage {
  type: string;
}

/**
 * Validation result type.
 */
export type ValidationResult<T> =
  | { success: true; message: T }
  | { success: false; error: string; message?: never };

/**
 * Message types for the Operations View.
 */
export const OperationsMessageTypes = ["getOps", "apply", "addToRecipe"] as const;
export type OperationsMessageType = (typeof OperationsMessageTypes)[number];

/**
 * Incoming message types for Operations View.
 */
export type OperationsIncomingMessage =
  | { type: "getOps" }
  | { type: "apply"; opName: string }
  | { type: "addToRecipe"; opName: string };

/**
 * Outgoing message types for Operations View.
 */
export type OperationsOutgoingMessage = {
  type: "opsList";
  ops: OpInfo[];
};

/**
 * Message types for the Recipe View.
 */
export const RecipeMessageTypes = ["ready", "recipeChanged", "setName", "apply", "save"] as const;
export type RecipeMessageType = (typeof RecipeMessageTypes)[number];

/**
 * Incoming message types for Recipe View.
 */
export type RecipeIncomingMessage =
  | { type: "ready" }
  | { type: "recipeChanged"; steps: RecipeStep[] }
  | { type: "setName"; name: string }
  | { type: "apply" }
  | { type: "save" };

/**
 * Outgoing message types for Recipe View.
 */
export type RecipeOutgoingMessage = {
  type: "setState";
  name: string;
  steps: RecipeStepDisplay[];
};

/**
 * Message types for Result Panel.
 */
export const ResultMessageTypes = ["replace", "copy", "close"] as const;
export type ResultMessageType = (typeof ResultMessageTypes)[number];

/**
 * Incoming message types for Result Panel.
 */
export type ResultIncomingMessage =
  | { type: "replace" }
  | { type: "copy" }
  | { type: "close" };
