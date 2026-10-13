/**
 * @fileoverview Central webview security utilities for ts-chef
 * @package webview
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 *
 * This module provides security utilities for all webviews including:
 * - CSP nonce generation
 * - HTML escaping
 * - Message validation helpers
 * - Content Security Policy templates
 */

import * as crypto from "node:crypto";

/**
 * Generates a cryptographically secure nonce for CSP.
 * Each webview should get a unique nonce.
 */
export function generateNonce(): string {
  const buffer = crypto.randomBytes(16);
  return buffer.toString("base64");
}

/**
 * Creates a base64-encoded nonce for use in CSP headers.
 * VS Code requires the nonce to be base64 encoded.
 */
export function createNonce(): string {
  return generateNonce();
}

/**
 * Standard CSP template for webviews.
 * Uses nonce-based policy for scripts and styles.
 * Allows only same-origin resources and data URIs for images.
 */
export function createWebviewCsp(nonce: string): string {
  return `default-src 'none'; img-src 'self' data:; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}';`;
}

/**
 * Escapes HTML special characters to prevent XSS.
 * Use this for all user-generated content displayed in HTML.
 */
export function escapeHtml(text: string | null | undefined): string {
  if (text === null || text === undefined) {
    return "";
  }
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Escapes text for use in HTML attributes.
 * Similar to escapeHtml but optimized for attribute contexts.
 */
export function escapeAttr(text: string | null | undefined): string {
  if (text === null || text === undefined) {
    return "";
  }
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Escapes text for use in JavaScript string literals.
 * Use when injecting values into inline scripts.
 */
export function escapeJs(text: string | null | undefined): string {
  if (text === null || text === undefined) {
    return "''";
  }
  const result = String(text)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `'${result}'`;
}

/**
 * Maximum lengths for various inputs to prevent DoS attacks.
 * These should be used consistently across all webviews.
 */
export const WebviewLimits = {
  // Message field limits
  maxMessageTypeLength: 64,
  maxOperationNameLength: 256,
  maxStepIdLength: 128,
  maxNameLength: 200,
  maxDescriptionLength: 8000,
  maxManualInputLength: 16 * 1024 * 1024, // 16 MiB
  
  // Collection limits
  maxSteps: 512,
  maxArgsPerStep: 256,
  maxValueDepth: 12,
  maxValueItems: 100000,
  maxArgumentCharacters: 4 * 1024 * 1024, // 4 MiB
  maxArgumentStringLength: 1024 * 1024, // 1 MiB
  
  // UI limits
  maxSearchQueryLength: 500,
  maxDisplayNameLength: 200,
  maxHintLength: 500,
  
  // Output limits
  maxPreviewLength: 4096,
  maxErrorMessageLength: 1000,
} as const;

/**
 * Validates that a string is a known operation name.
 * Should be used to validate all operation names coming from webviews.
 */
export function isKnownOperation(
  opName: string,
  knownOperations: ReadonlySet<string>,
): boolean {
  if (typeof opName !== "string") return false;
  if (opName.length === 0 || opName.length > WebviewLimits.maxOperationNameLength) {
    return false;
  }
  return knownOperations.has(opName);
}

/**
 * Validates a message type string.
 * Should be used to validate message.type fields.
 */
export function isValidMessageType(
  type: unknown,
  validTypes: readonly string[],
): type is string {
  if (typeof type !== "string") return false;
  if (type.length > WebviewLimits.maxMessageTypeLength) return false;
  return validTypes.includes(type);
}

/**
 * Creates a safe data attribute value for HTML.
 * Use for data-* attributes that will be read by JavaScript.
 */
export function safeDataAttribute(value: string): string {
  // Data attributes need HTML escaping and should be safe for JavaScript
  return escapeAttr(value);
}

/**
 * Creates a safe class name string for HTML.
 * Ensures class names don't contain dangerous characters.
 */
export function safeClassName(...classes: (string | null | undefined)[]): string {
  return classes
    .filter((c) => c !== null && c !== undefined)
    .map((c) => String(c).replace(/[^a-zA-Z0-9_\-]/g, "-")) // eslint-disable-line no-useless-escape
    .filter((c) => c.length > 0)
    .join(" ");
}

/**
 * Creates a safe ID attribute value for HTML.
 * Ensures IDs are valid and don't contain special characters.
 */
export function safeId(id: string): string {
  return String(id).replace(/[^a-zA-Z0-9_\-:]/g, "-");
}

/**
 * Validates that a string contains only safe characters for CSS.
 * Use for dynamic CSS values.
 */
export function isSafeCssValue(value: string): boolean {
  // CSS values should not contain semicolons, braces, or other CSS metacharacters
  // that could be used for injection
  const unsafeChars = /[;{}<>&\\]/;
  return typeof value === "string" && !unsafeChars.test(value);
}

/**
 * Safely truncates a string for display.
 * Ensures the result doesn't exceed the maximum length.
 */
export function truncateForDisplay(
  text: string | null | undefined,
  maxLength: number = WebviewLimits.maxPreviewLength,
): string {
  if (text === null || text === undefined) return "";
  const str = String(text);
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Options for configuring webview security.
 */
export interface WebviewSecurityOptions {
  /** Whether to enable CSP (should always be true in production) */
  enableCsp?: boolean;
  /** Whether to use nonce-based CSP (recommended) */
  useNonce?: boolean;
  /** Additional CSP directives to include */
  additionalCspDirectives?: string[];
}

/**
 * Default security options for webviews.
 */
export const defaultWebviewSecurityOptions: Required<WebviewSecurityOptions> = {
  enableCsp: true,
  useNonce: true,
  additionalCspDirectives: [],
};

/**
 * Creates a complete security configuration for a webview.
 */
export function createWebviewSecurityConfig(
  options: WebviewSecurityOptions = {},
): {
  nonce: string;
  csp: string;
  options: Required<WebviewSecurityOptions>;
} {
  const mergedOptions = {
    ...defaultWebviewSecurityOptions,
    ...options,
  };

  const nonce = mergedOptions.useNonce ? createNonce() : "";
  
  let csp = mergedOptions.enableCsp
    ? createWebviewCsp(nonce)
    : "";

  if (mergedOptions.additionalCspDirectives.length > 0) {
    csp += " " + mergedOptions.additionalCspDirectives.join(" ");
  }

  return {
    nonce,
    csp,
    options: mergedOptions,
  };
}

/**
 * Common error messages for security validation failures.
 */
export const SecurityErrors = {
  invalidOperation: (opName: string) =>
    `Invalid operation name: '${opName}'. Operation not found in registry.`,
  invalidMessageType: (type: string) =>
    `Invalid message type: '${type}'. Unknown or unsupported message type.`,
  messageTooLarge: (size: number, max: number) =>
    `Message too large: ${size} bytes exceeds maximum of ${max} bytes.`,
  argumentTooLarge: (index: number, size: number, max: number) =>
    `Argument ${index} too large: ${size} bytes exceeds maximum of ${max} bytes.`,
  tooManySteps: (count: number, max: number) =>
    `Too many steps: ${count} exceeds maximum of ${max} steps.`,
  invalidInputLength: (length: number, max: number) =>
    `Input too large: ${length} characters exceeds maximum of ${max} characters.`,
} as const;
