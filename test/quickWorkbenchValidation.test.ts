/**
 * @fileoverview Tests for Quick Workbench message validation
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import { WebviewLimits } from "../src/webview/security";
import { validateQuickWorkbenchMessage } from "../src/panels/quickWorkbench/protocol";

describe("Quick Workbench Message Validation", () => {
  const knownOps = new Set(["FromBase64", "ToBase64", "ROT13", "JSONBeautify"]);

  describe("Valid messages", () => {
    it("should accept valid loadSelection message", () => {
      const result = validateQuickWorkbenchMessage({ type: "loadSelection" }, knownOps);
      expect(result.success).toBe(true);
      expect(result.message?.type).toBe("loadSelection");
    });

    it("should accept valid applyOperation message", () => {
      const result = validateQuickWorkbenchMessage({
        type: "applyOperation",
        opName: "FromBase64",
        args: {},
        requestId: 1
      }, knownOps);
      expect(result.success).toBe(true);
      expect(result.message?.type).toBe("applyOperation");
    });

    it("should accept valid inputChanged message", () => {
      const result = validateQuickWorkbenchMessage({
        type: "inputChanged",
        text: "test input"
      }, knownOps);
      expect(result.success).toBe(true);
      expect(result.message?.type).toBe("inputChanged");
    });

    it("should accept valid searchOperations message", () => {
      const result = validateQuickWorkbenchMessage({
        type: "searchOperations",
        query: "base64"
      }, knownOps);
      expect(result.success).toBe(true);
      expect(result.message?.type).toBe("searchOperations");
    });

    it("should accept valid addToFavorites message", () => {
      const result = validateQuickWorkbenchMessage({
        type: "addToFavorites",
        opName: "FromBase64"
      }, knownOps);
      expect(result.success).toBe(true);
      expect(result.message?.type).toBe("addToFavorites");
    });
  });

  describe("Invalid message types", () => {
    it("should reject unknown message type", () => {
      const result = validateQuickWorkbenchMessage({
        type: "unknownType"
      }, knownOps);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown message type");
    });

    it("should reject message without type", () => {
      const result = validateQuickWorkbenchMessage({
        someField: "value"
      }, knownOps);
      expect(result.success).toBe(false);
    });

    it("should reject null message", () => {
      const result = validateQuickWorkbenchMessage(null, knownOps);
      expect(result.success).toBe(false);
      expect(result.error).toContain("must be an object");
    });

    it("should reject non-object message", () => {
      const result = validateQuickWorkbenchMessage("string", knownOps);
      expect(result.success).toBe(false);
    });
  });

  describe("Operation name validation", () => {
    it("should reject unknown operation name", () => {
      const result = validateQuickWorkbenchMessage({
        type: "applyOperation",
        opName: "UnknownOperation",
        args: {},
        requestId: 1
      }, knownOps);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown operation");
    });

    it("should reject opName that is too long", () => {
      const longOpName = "a".repeat(WebviewLimits.maxOperationNameLength + 1);
      const result = validateQuickWorkbenchMessage({
        type: "applyOperation",
        opName: longOpName,
        args: {},
        requestId: 1
      }, knownOps);
      expect(result.success).toBe(false);
      expect(result.error).toContain("too long");
    });

    it("should reject non-string opName", () => {
      const result = validateQuickWorkbenchMessage({
        type: "applyOperation",
        opName: 123,
        args: {},
        requestId: 1
      }, knownOps);
      expect(result.success).toBe(false);
      expect(result.error).toContain("must be a string");
    });
  });

  describe("Input validation", () => {
    it("should reject inputChanged with non-string text", () => {
      const result = validateQuickWorkbenchMessage({
        type: "inputChanged",
        text: 123
      }, knownOps);
      expect(result.success).toBe(false);
      expect(result.error).toContain("must be a string");
    });

    it("should reject inputChanged with text exceeding max length", () => {
      const longText = "a".repeat(WebviewLimits.maxManualInputLength + 1);
      const result = validateQuickWorkbenchMessage({
        type: "inputChanged",
        text: longText
      }, knownOps);
      expect(result.success).toBe(false);
      expect(result.error).toContain("too large");
    });
  });

  describe("Search query validation", () => {
    it("should reject searchOperations with non-string query", () => {
      const result = validateQuickWorkbenchMessage({
        type: "searchOperations",
        query: 123
      }, knownOps);
      expect(result.success).toBe(false);
      expect(result.error).toContain("must be a string");
    });

    it("should reject searchOperations with query exceeding max length", () => {
      const longQuery = "a".repeat(WebviewLimits.maxSearchQueryLength + 1);
      const result = validateQuickWorkbenchMessage({
        type: "searchOperations",
        query: longQuery
      }, knownOps);
      expect(result.success).toBe(false);
      expect(result.error).toContain("too long");
    });
  });

  describe("Request ID validation", () => {
    it("should reject applyOperation with non-number requestId", () => {
      const result = validateQuickWorkbenchMessage({
        type: "applyOperation",
        opName: "FromBase64",
        args: {},
        requestId: "not a number"
      }, knownOps);
      expect(result.success).toBe(false);
      expect(result.error).toContain("must be a valid number");
    });

    it("should reject applyOperation with NaN requestId", () => {
      const result = validateQuickWorkbenchMessage({
        type: "applyOperation",
        opName: "FromBase64",
        args: {},
        requestId: NaN
      }, knownOps);
      expect(result.success).toBe(false);
    });

    it("should reject applyOperation with Infinity requestId", () => {
      const result = validateQuickWorkbenchMessage({
        type: "applyOperation",
        opName: "FromBase64",
        args: {},
        requestId: Infinity
      }, knownOps);
      expect(result.success).toBe(false);
    });
  });

  describe("Arguments validation", () => {
    it("should accept applyOperation with empty args", () => {
      const result = validateQuickWorkbenchMessage({
        type: "applyOperation",
        opName: "FromBase64",
        args: {},
        requestId: 1
      }, knownOps);
      expect(result.success).toBe(true);
    });

    it("should accept applyOperation with undefined args", () => {
      const result = validateQuickWorkbenchMessage({
        type: "applyOperation",
        opName: "FromBase64",
        requestId: 1
      }, knownOps);
      expect(result.success).toBe(true);
    });

    it("should reject applyOperation with args array instead of object", () => {
      const result = validateQuickWorkbenchMessage({
        type: "applyOperation",
        opName: "FromBase64",
        args: ["arg1", "arg2"],
        requestId: 1
      }, knownOps);
      expect(result.success).toBe(false);
      expect(result.error).toContain("must be an object");
    });

    it("should reject applyOperation with too many args", () => {
      const args: Record<string, string> = {};
      for (let i = 0; i < WebviewLimits.maxArgsPerStep + 1; i++) {
        args[`arg${i}`] = "value";
      }
      const result = validateQuickWorkbenchMessage({
        type: "applyOperation",
        opName: "FromBase64",
        args,
        requestId: 1
      }, knownOps);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Too many arguments");
    });

    it("should reject applyOperation with long argument key", () => {
      const longKey = "a".repeat(101);
      const result = validateQuickWorkbenchMessage({
        type: "applyOperation",
        opName: "FromBase64",
        args: { [longKey]: "value" },
        requestId: 1
      }, knownOps);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid argument key");
    });

    it("should reject applyOperation with long string argument value", () => {
      const longValue = "a".repeat(WebviewLimits.maxArgumentStringLength + 1);
      const result = validateQuickWorkbenchMessage({
        type: "applyOperation",
        opName: "FromBase64",
        args: { arg1: longValue },
        requestId: 1
      }, knownOps);
      expect(result.success).toBe(false);
      expect(result.error).toContain("too long");
    });

    it("should reject applyOperation with too many items in array argument", () => {
      const largeArray = new Array(WebviewLimits.maxValueItems + 1).fill("item");
      const result = validateQuickWorkbenchMessage({
        type: "applyOperation",
        opName: "FromBase64",
        args: { arg1: largeArray },
        requestId: 1
      }, knownOps);
      expect(result.success).toBe(false);
      expect(result.error).toContain("too many items");
    });
  });

  describe("getArgDefs validation", () => {
    it("should accept valid getArgDefs message", () => {
      const result = validateQuickWorkbenchMessage({
        type: "getArgDefs",
        opName: "FromBase64"
      }, knownOps);
      expect(result.success).toBe(true);
      expect(result.message?.type).toBe("getArgDefs");
    });

    it("should reject getArgDefs with unknown operation", () => {
      const result = validateQuickWorkbenchMessage({
        type: "getArgDefs",
        opName: "UnknownOp"
      }, knownOps);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown operation");
    });
  });
});
