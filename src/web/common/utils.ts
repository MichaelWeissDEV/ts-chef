/**
 * @fileoverview Common utility functions for webview modules
 * @package web
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import { escapeHtml, escapeAttr } from "../../webview/security";

/**
 * Escapes a string for safe use in HTML text content.
 */
export function htmlEsc(s: string | null | undefined): string {
  return escapeHtml(s);
}

/**
 * Escapes a string for safe use in HTML attributes.
 */
export function attrEsc(s: string | null | undefined): string {
  return escapeAttr(s);
}

/**
 * Escapes a string for safe use in JavaScript string literals.
 */
export function jsEsc(s: string | null | undefined): string {
  if (s === null || s === undefined) return "''";
  const result = String(s)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `'${result}'`;
}

/**
 * Creates a safe data attribute value.
 */
export function dataAttr(value: string): string {
  return attrEsc(value);
}

/**
 * Joins CSS class names safely.
 */
export function classNames(...classes: (string | null | undefined)[]): string {
  return classes
    .filter((c) => c !== null && c !== undefined)
    .map((c) => String(c).replace(/[^a-zA-Z0-9_\-]/g, "-")) // eslint-disable-line no-useless-escape
    .filter((c) => c.length > 0)
    .join(" ");
}

/**
 * Safely truncates a string for display.
 */
export function truncate(str: string | null | undefined, maxLength: number): string {
  if (str === null || str === undefined) return "";
  const s = String(str);
  if (s.length <= maxLength) return s;
  return s.slice(0, maxLength - 3) + "...";
}

/**
 * Generates a unique ID for DOM elements.
 */
export function generateId(prefix: string = "id"): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Creates a safe ID for HTML elements.
 */
export function safeId(id: string): string {
  return String(id).replace(/[^a-zA-Z0-9_\-:]/g, "-");
}
