/**
 * @fileoverview Central message validation for all ts-chef webviews
 * @package webview
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 *
 * This module provides centralized message validation that should be used
 * by all webview providers to ensure consistent security checking.
 */

import type { OpInfo } from "../providers/operationsViewProvider";
import type { RecipeStep } from "../providers/recipeViewProvider";
import { WebviewLimits, isKnownOperation, isValidMessageType } from "./security";

/**
 * Known operation names from the registry.
 * This should be populated from the opsRegistry at extension activation.
 */
let knownOperationNames: ReadonlySet<string> | null = null;

/**
 * Initialize the known operations set.
 * Must be called once during extension activation.
 */
export function initializeKnownOperations(ops: readonly OpInfo[]): void {
  knownOperationNames = new Set(ops.map((op) => op.opName));
}

/**
 * Get the known operations set.
 * Throws if not initialized.
 */
export function getKnownOperations(): ReadonlySet<string> {
  if (!knownOperationNames) {
    throw new Error("Known operations not initialized. Call initializeKnownOperations first.");
  }
  return knownOperationNames;
}

/**
 * Base interface for all incoming webview messages.
 * All message types must have a type field.
 */
export interface BaseWebviewMessage {
  type: string;
}

/**
 * Validation result type.
 * Either succeeds with the validated message, or fails with an error.
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
 * Validates an incoming message for the Operations View.
 */
export function validateOperationsMessage(
  msg: unknown,
): ValidationResult<OperationsIncomingMessage> {
  if (msg === null || typeof msg !== "object") {
    return { success: false, error: "Message must be an object" };
  }

  const message = msg as Record<string, unknown>;
  const messageType = message.type;

  if (!isValidMessageType(messageType, OperationsMessageTypes)) {
    return { success: false, error: `Unknown message type: ${String(messageType)}` };
  }

  try {
    switch (messageType) {
      case "getOps":
        return { success: true, message: { type: "getOps" } };

      case "apply":
        return validateApplyMessage(message);

      case "addToRecipe":
        return validateAddToRecipeMessage(message);

      default:
        // This shouldn't happen if isValidMessageType is working
        return { success: false, error: `Unhandled message type: ${String(messageType)}` };
    }
  } catch (e) {
    return { success: false, error: `Invalid message structure: ${e instanceof Error ? e.message : String(e)}` };
  }
}

function validateApplyMessage(message: Record<string, unknown>): ValidationResult<{ type: "apply"; opName: string }> {
  const opName = message.opName;
  
  if (typeof opName !== "string") {
    return { success: false, error: "opName must be a string" };
  }

  if (opName.length > WebviewLimits.maxOperationNameLength) {
    return { success: false, error: `opName too long: ${opName.length} characters` };
  }

  if (knownOperationNames && !isKnownOperation(opName, knownOperationNames)) {
    return { success: false, error: `Unknown operation: ${opName}` };
  }

  return { success: true, message: { type: "apply", opName } };
}

function validateAddToRecipeMessage(message: Record<string, unknown>): ValidationResult<{ type: "addToRecipe"; opName: string }> {
  const opName = message.opName;
  
  if (typeof opName !== "string") {
    return { success: false, error: "opName must be a string" };
  }

  if (opName.length > WebviewLimits.maxOperationNameLength) {
    return { success: false, error: `opName too long: ${opName.length} characters` };
  }

  if (knownOperationNames && !isKnownOperation(opName, knownOperationNames)) {
    return { success: false, error: `Unknown operation: ${opName}` };
  }

  return { success: true, message: { type: "addToRecipe", opName } };
}

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
 * Validates an incoming message for the Recipe View.
 */
export function validateRecipeMessage(
  msg: unknown,
): ValidationResult<RecipeIncomingMessage> {
  if (msg === null || typeof msg !== "object") {
    return { success: false, error: "Message must be an object" };
  }

  const message = msg as Record<string, unknown>;
  const messageType = message.type;

  if (!isValidMessageType(messageType, RecipeMessageTypes)) {
    return { success: false, error: `Unknown message type: ${String(messageType)}` };
  }

  try {
    switch (messageType) {
      case "ready":
        return { success: true, message: { type: "ready" } };

      case "recipeChanged":
        return validateRecipeChangedMessage(message);

      case "setName":
        return validateSetNameMessage(message);

      case "apply":
        return { success: true, message: { type: "apply" } };

      case "save":
        return { success: true, message: { type: "save" } };

      default:
        return { success: false, error: `Unhandled message type: ${String(messageType)}` };
    }
  } catch (e) {
    return { success: false, error: `Invalid message structure: ${e instanceof Error ? e.message : String(e)}` };
  }
}

function validateRecipeChangedMessage(message: Record<string, unknown>): ValidationResult<{ type: "recipeChanged"; steps: RecipeStep[] }> {
  const steps = message.steps;
  
  if (!Array.isArray(steps)) {
    return { success: false, error: "steps must be an array" };
  }

  if (steps.length > WebviewLimits.maxSteps) {
    return { success: false, error: `Too many steps: ${steps.length}, maximum is ${WebviewLimits.maxSteps}` };
  }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    
    if (step === null || typeof step !== "object") {
      return { success: false, error: `Step ${i + 1} must be an object` };
    }

    const stepObj = step as Record<string, unknown>;
    
    // Validate opName
    const opName = stepObj.opName;
    if (typeof opName !== "string" || opName.length === 0) {
      return { success: false, error: `Step ${i + 1} has invalid opName` };
    }

    if (opName.length > WebviewLimits.maxOperationNameLength) {
      return { success: false, error: `Step ${i + 1} opName too long` };
    }

    if (knownOperationNames && !isKnownOperation(opName, knownOperationNames)) {
      return { success: false, error: `Step ${i + 1} references unknown operation: ${opName}` };
    }

    // Validate args
    const args = stepObj.args;
    if (!Array.isArray(args)) {
      return { success: false, error: `Step ${i + 1} args must be an array` };
    }

    if (args.length > WebviewLimits.maxArgsPerStep) {
      return { success: false, error: `Step ${i + 1} has too many arguments` };
    }
  }

  // All steps validated
  return { success: true, message: { type: "recipeChanged", steps: steps as RecipeStep[] } };
}

function validateSetNameMessage(message: Record<string, unknown>): ValidationResult<{ type: "setName"; name: string }> {
  const name = message.name;
  
  if (typeof name !== "string") {
    return { success: false, error: "name must be a string" };
  }

  if (name.length > WebviewLimits.maxNameLength) {
    return { success: false, error: `name too long: ${name.length} characters` };
  }

  return { success: true, message: { type: "setName", name } };
}

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

/**
 * Validates an incoming message for the Result Panel.
 */
export function validateResultMessage(
  msg: unknown,
): ValidationResult<ResultIncomingMessage> {
  if (msg === null || typeof msg !== "object") {
    return { success: false, error: "Message must be an object" };
  }

  const message = msg as Record<string, unknown>;
  const messageType = message.type;

  if (!isValidMessageType(messageType, ResultMessageTypes)) {
    return { success: false, error: `Unknown message type: ${String(messageType)}` };
  }

  // All result messages are simple with no additional fields
  return { success: true, message: { type: messageType as ResultMessageType } };
}

/**
 * Generic message validator that can be used for any webview.
 * Takes a list of valid message types and an optional custom validator.
 */
export function createMessageValidator<T extends BaseWebviewMessage>(
  validTypes: readonly string[],
  customValidator?: (message: Record<string, unknown>, type: string) => ValidationResult<T> | null,
): (msg: unknown) => ValidationResult<T> {
  return (msg: unknown): ValidationResult<T> => {
    if (msg === null || typeof msg !== "object") {
      return { success: false, error: "Message must be an object" } as ValidationResult<T>;
    }

    const message = msg as Record<string, unknown>;
    const messageType = message.type;

    if (!isValidMessageType(messageType, validTypes)) {
      return { success: false, error: `Unknown message type: ${String(messageType)}` } as ValidationResult<T>;
    }

    // If there's a custom validator, use it
    if (customValidator) {
      const customResult = customValidator(message, String(messageType));
      if (customResult) {
        return customResult;
      }
    }

    // Default: accept the message as valid
    return { success: true, message: { type: String(messageType) } as T };
  };
}

/**
 * Creates a strict message handler that validates and types messages.
 * Can be used to wrap webview.onDidReceiveMessage handlers.
 */
export function createValidatedMessageHandler<T extends BaseWebviewMessage>(
  validator: (msg: unknown) => ValidationResult<T>,
  handler: (message: T) => void,
): (msg: unknown) => void {
  return (msg: unknown): void => {
    const result = validator(msg);
    if (!result.success) {
      // Log security warnings for invalid messages
      // Note: console.warn is acceptable for security warnings per ESLint config
      // eslint-disable-next-line no-console
      console.warn(`[ts-chef] Security: Invalid message received: ${(result as { success: false; error: string }).error}`);
      return;
    }
    handler(result.message);
  };
}

/**
 * Validates a string input for use in search/filter operations.
 */
export function validateSearchQuery(query: unknown): ValidationResult<string> {
  if (typeof query !== "string") {
    return { success: false, error: "Search query must be a string" };
  }

  if (query.length > WebviewLimits.maxSearchQueryLength) {
    return { success: false, error: `Search query too long: ${query.length} characters` };
  }

  // Check for potential XSS or injection patterns
  // This is a basic check - the main protection is HTML escaping on output
  if (/[<>]/.test(query)) {
    // These characters should be escaped, but we allow them and rely on output escaping
    // This is just a warning check
    // eslint-disable-next-line no-console
    console.warn(`[ts-chef] Security: Search query contains potential HTML metacharacters`);
  }

  return { success: true, message: query };
}

/**
 * Validates a text input for manual input fields.
 */
export function validateManualInput(input: unknown): ValidationResult<string> {
  if (typeof input !== "string") {
    return { success: false, error: "Input must be a string" };
  }

  if (input.length > WebviewLimits.maxManualInputLength) {
    return { success: false, error: `Input too large: ${input.length} characters` };
  }

  return { success: true, message: input };
}

/**
 * Initializes message validation for a specific webview.
 * Returns a validated message handler.
 */
export function createWebviewMessageValidator<T extends BaseWebviewMessage>(
  validTypes: readonly string[],
  knownOps: ReadonlySet<string>,
): (msg: unknown) => ValidationResult<T> {
  // Store the known operations for this validator
  const ops = knownOps;
  
  return createMessageValidator<T>(validTypes, (message, type) => {
    // Validate based on message type
    switch (type) {
      case "apply":
      case "addToRecipe": {
        const opName = message.opName as string | undefined;
        if (typeof opName !== "string") {
          return { success: false, error: "opName must be a string" } as ValidationResult<T>;
        }
        if (!isKnownOperation(opName, ops)) {
          return { success: false, error: `Unknown operation: ${opName}` } as ValidationResult<T>;
        }
        break;
      }

      case "setName": {
        const name = message.name as string | undefined;
        if (typeof name !== "string") {
          return { success: false, error: "name must be a string" } as ValidationResult<T>;
        }
        if (name.length > WebviewLimits.maxNameLength) {
          return { success: false, error: "name too long" } as ValidationResult<T>;
        }
        break;
      }

      case "recipeChanged": {
        const steps = message.steps as unknown;
        if (!Array.isArray(steps)) {
          return { success: false, error: "steps must be an array" } as ValidationResult<T>;
        }
        if (steps.length > WebviewLimits.maxSteps) {
          return { success: false, error: "Too many steps" } as ValidationResult<T>;
        }
        break;
      }
    }
    return null; // Use default validation
  });
}
