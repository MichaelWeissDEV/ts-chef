import { WebviewLimits, isKnownOperation, isValidMessageType } from "../../webview/security";
export type ArgValue = string | number | boolean | string[] | Record<string, unknown> | null;
export type QuickWorkbenchIncomingMessage =
  | { type: "loadSelection"; revision?: number }
  | { type: "loadDocument"; revision?: number }
  | { type: "loadClipboard"; revision?: number }
  | { type: "clearInput"; revision?: number }
  | { type: "invalidate" }
  | { type: "inputChanged"; text: string; revision?: number }
  | { type: "applyOperation"; opName: string; args: Record<string, ArgValue>; requestId: number; mode?: "manual" | "preview" }
  | { type: "searchOperations"; query: string }
  | { type: "addToFavorites"; opName: string }
  | { type: "removeFromFavorites"; opName: string }
  | { type: "copyResult" }
  | { type: "replaceSelection" }
  | { type: "newDocument" }
  | { type: "close" }
  | { type: "getOps" }
  | { type: "getArgDefs"; opName: string };

type ValidationResult<T> =
  | { success: true; message: T }
  | { success: false; error: string };

/**
 * Validates incoming Quick Workbench messages.
 */
export function validateQuickWorkbenchMessage(
  msg: unknown,
  knownOpNames: ReadonlySet<string>,
): ValidationResult<QuickWorkbenchIncomingMessage> {
  if (msg === null || typeof msg !== "object") {
    return { success: false, error: "Message must be an object" };
  }

  const message = msg as Record<string, unknown>;
  const messageType = message.type;

  // Validate message type
  const validTypes = [
    "loadSelection", "loadDocument", "loadClipboard", "clearInput", "invalidate",
    "inputChanged", "applyOperation", "searchOperations",
    "addToFavorites", "removeFromFavorites", "copyResult",
    "replaceSelection", "newDocument", "close", "getOps", "getArgDefs"
  ] as const;

  if (!isValidMessageType(messageType, validTypes)) {
    return { success: false, error: `Unknown message type: ${String(messageType)}` };
  }

  try {
    const fields: Record<string, string[]> = { inputChanged: ["text", "revision"], loadSelection: ["revision"], loadDocument: ["revision"], loadClipboard: ["revision"], clearInput: ["revision"], searchOperations: ["query"], applyOperation: ["opName", "args", "requestId", "mode"], getArgDefs: ["opName"], addToFavorites: ["opName"], removeFromFavorites: ["opName"] };
    if (Object.keys(message).some(key => key !== "type" && !(fields[String(messageType)] || []).includes(key))) return { success: false, error: "Unexpected message field" };
    if (message.revision !== undefined && (!Number.isSafeInteger(message.revision) || Number(message.revision) < 0)) return { success: false, error: "Invalid input revision" };
    switch (messageType) {
      case "loadSelection":
      case "loadDocument":
      case "loadClipboard":
      case "clearInput":
      case "invalidate":
      case "copyResult":
      case "replaceSelection":
      case "newDocument":
      case "close":
      case "getOps":
        return { success: true, message: { type: messageType as typeof messageType, ...(message.revision === undefined ? {} : { revision: Number(message.revision) }) } };

      case "inputChanged": {
        const text = message.text;
        if (typeof text !== "string") {
          return { success: false, error: "text must be a string" };
        }
        if (text.length > WebviewLimits.maxManualInputLength) {
          return { success: false, error: `Input too large: ${text.length} characters` };
        }
        return { success: true, message: { type: "inputChanged", text, ...(message.revision === undefined ? {} : { revision: Number(message.revision) }) } };
      }

      case "searchOperations": {
        const query = message.query;
        if (typeof query !== "string") {
          return { success: false, error: "query must be a string" };
        }
        if (query.length > WebviewLimits.maxSearchQueryLength) {
          return { success: false, error: `Search query too long: ${query.length} characters` };
        }
        return { success: true, message: { type: "searchOperations", query } };
      }

      case "addToFavorites":
      case "removeFromFavorites": {
        const opName = message.opName;
        if (typeof opName !== "string") {
          return { success: false, error: "opName must be a string" };
        }
        if (opName.length > WebviewLimits.maxOperationNameLength) {
          return { success: false, error: `opName too long: ${opName.length} characters` };
        }
        if (!isKnownOperation(opName, knownOpNames)) {
          return { success: false, error: `Unknown operation: ${opName}` };
        }
        return { success: true, message: { type: messageType, opName } };
      }

      case "applyOperation": {
        const opName = message.opName;
        const args = message.args;
        const requestId = message.requestId;
        if (message.mode !== undefined && message.mode !== "manual" && message.mode !== "preview") return { success: false, error: "Invalid execution mode" };

        if (typeof opName !== "string") {
          return { success: false, error: "opName must be a string" };
        }
        if (opName.length > WebviewLimits.maxOperationNameLength) {
          return { success: false, error: `opName too long: ${opName.length} characters` };
        }
        if (!isKnownOperation(opName, knownOpNames)) {
          return { success: false, error: `Unknown operation: ${opName}` };
        }
        if (typeof requestId !== "number" || (!Number.isSafeInteger(requestId) || requestId < 0)) {
          return { success: false, error: "requestId must be a valid number" };
        }
        if (args !== undefined && args !== null && (typeof args !== "object" || Array.isArray(args))) {
          return { success: false, error: "args must be an object or null" };
        }
        if (args !== null && args !== undefined) {
          const argsObj = args as Record<string, unknown>;
          const argKeys = Object.keys(argsObj);
          if (argKeys.length > WebviewLimits.maxArgsPerStep) {
            return { success: false, error: `Too many arguments: ${argKeys.length}` };
          }
          validateValues(argsObj);
          for (const [key, value] of Object.entries(argsObj)) {
            if (typeof key !== "string" || key.length > 100) {
              return { success: false, error: `Invalid argument key: ${key}` };
            }
            // Validate value types and sizes
            if (typeof value === "string") {
              if (value.length > WebviewLimits.maxArgumentStringLength) {
                return { success: false, error: `Argument ${key} too long` };
              }
            } else if (Array.isArray(value)) {
              if (value.length > WebviewLimits.maxValueItems) {
                return { success: false, error: `Argument ${key} has too many items` };
              }
            } else if (typeof value === "object" && value !== null) {
              const objSize = JSON.stringify(value).length;
              if (objSize > WebviewLimits.maxArgumentCharacters) {
                return { success: false, error: `Argument ${key} too large` };
              }
            }
          }
        }
        return { success: true, message: { type: "applyOperation", opName, args: (args || {}) as Record<string, ArgValue>, requestId, mode: message.mode === "manual" ? "manual" : "preview" } };
      }

      case "getArgDefs": {
        const opName = message.opName;
        if (typeof opName !== "string") {
          return { success: false, error: "opName must be a string" };
        }
        if (opName.length > WebviewLimits.maxOperationNameLength) {
          return { success: false, error: `opName too long: ${opName.length} characters` };
        }
        if (!isKnownOperation(opName, knownOpNames)) {
          return { success: false, error: `Unknown operation: ${opName}` };
        }
        return { success: true, message: { type: "getArgDefs", opName } };
      }

      default:
        return { success: false, error: `Unhandled message type: ${String(messageType)}` };
    }
  } catch (e) {
    return { success: false, error: `Invalid message structure: ${e instanceof Error ? e.message : String(e)}` };
  }
}


function validateValues(value: unknown, depth = 0, seen = new Set<object>()): void {
  if (depth > 4) throw new Error("Arguments nested too deeply");
  if (typeof value === "string") { if (value.length > WebviewLimits.maxArgumentStringLength) throw new Error("Argument too long"); return; }
  if (typeof value === "boolean" || value === null) return;
  if (typeof value === "number" && Number.isFinite(value)) return;
  if (!value || typeof value !== "object" || seen.has(value)) throw new Error("Unsupported argument value");
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw new Error("Unsupported argument object");
  if (Object.keys(value).length > WebviewLimits.maxValueItems) throw new Error("Argument has too many items");
  seen.add(value);
  for (const [key, child] of Object.entries(value)) {
    if (["__proto__", "constructor", "prototype"].includes(key)) throw new Error("Invalid argument key");
    validateValues(child, depth + 1, seen);
  }
  seen.delete(value);
  if (depth === 0 && JSON.stringify(value).length > WebviewLimits.maxArgumentCharacters) throw new Error("Arguments too large");
}
