/**
 * @fileoverview format helpers — content-type detection and long-line reflow
 * @package providers
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

/** A beautifier operation plus the editor language to open its result in. */
export interface FormatChoice {
  /** Human label shown to the user. */
  label: string;
  /** Registry opName of the beautifier, or null for plain reflow. */
  opName: string | null;
  /** Arguments for the beautifier operation. */
  args: unknown[];
  /** VS Code language id for the result document. */
  languageId: string;
}

/**
 * Guess the best beautifier for `text` by structure sniffing. Returns null when
 * nothing structured is recognised (caller can fall back to reflow).
 */
export function detectFormat(text: string): FormatChoice | null {
  const t = text.trim();
  if (!t) return null;

  // JSON — object/array that parses.
  if (/^[[{]/.test(t) && /[\]}]$/.test(t)) {
    try {
      JSON.parse(t);
      return {
        label: "JSON",
        opName: "JSONBeautify",
        args: ["    ", false, false],
        languageId: "json",
      };
    } catch {
      // not valid JSON — fall through
    }
  }

  // XML / HTML.
  if (/^<\?xml/i.test(t) || (/^<[a-zA-Z!]/.test(t) && /<\/[a-zA-Z]|\/>/.test(t))) {
    const isHtml = /^<(!doctype html|html)\b/i.test(t);
    return {
      label: isHtml ? "HTML/XML" : "XML",
      opName: "XMLBeautify",
      args: ["    "],
      languageId: isHtml ? "html" : "xml",
    };
  }

  // SQL — starts with a common statement keyword.
  if (
    /^\s*(select|insert|update|delete|create|alter|drop|with|merge)\b/i.test(t)
  ) {
    return {
      label: "SQL",
      opName: "SQLBeautify",
      args: ["    "],
      languageId: "sql",
    };
  }

  // CSS — selector { prop: value; } blocks.
  if (/[.#]?[\w-]+\s*\{[^}]*:[^}]*\}/.test(t)) {
    return {
      label: "CSS",
      opName: "CSSBeautify",
      args: ["    "],
      languageId: "css",
    };
  }

  // JavaScript-ish — has braces and common JS tokens. Uses the dependency-free
  // GenericCodeBeautify (JavaScriptBeautify needs escodegen, which isn't bundled).
  if (
    /[{};]/.test(t) &&
    /\b(function|const|let|var|=>|return|if|for|while|class)\b/.test(t)
  ) {
    return {
      label: "JavaScript",
      opName: "GenericCodeBeautify",
      args: [],
      languageId: "javascript",
    };
  }

  return null;
}

/**
 * Reflow an extremely long single line (or a blob with very long lines) into a
 * readable multi-line form, without changing the data — only whitespace is
 * inserted. Handles three common shapes:
 *
 * - continuous hex / Base64 → wrapped into fixed-width rows;
 * - delimiter-heavy strings (`;`, `&`, `,`) → one item per line;
 * - everything else → soft-wrapped at word boundaries near `width`.
 */
export function makeReadable(text: string, width = 100): string {
  const longest = text
    .split("\n")
    .reduce((m, l) => Math.max(m, l.length), 0);
  // Already readable — nothing to do.
  if (longest <= width * 1.5) return text;

  return text
    .split("\n")
    .map((line) => (line.length > width * 1.5 ? reflowLine(line, width) : line))
    .join("\n");
}

function reflowLine(line: string, width: number): string {
  const trimmed = line.trim();

  // Continuous hex or Base64 → fixed-width rows.
  if (/^[0-9a-fA-F]{40,}$/.test(trimmed)) return chunk(trimmed, 64);
  if (/^[A-Za-z0-9+/=_-]{80,}$/.test(trimmed)) return chunk(trimmed, width);

  // Structured delimiters — split so each entry is on its own line.
  for (const delim of [";", "&", ",", "|"]) {
    const parts = trimmed.split(delim);
    if (parts.length >= 4 && parts.every((p) => p.length < width)) {
      return parts
        .map((p, i) => (i < parts.length - 1 ? p + delim : p))
        .join("\n");
    }
  }

  // Fallback: soft-wrap at whitespace near the target width.
  return softWrap(line, width);
}

/** Split a string into fixed-length rows. */
export function chunk(s: string, size: number): string {
  const rows: string[] = [];
  for (let i = 0; i < s.length; i += size) rows.push(s.slice(i, i + size));
  return rows.join("\n");
}

/** Wrap on whitespace so no line greatly exceeds `width`; hard-splits runs. */
export function softWrap(line: string, width: number): string {
  const words = line.split(/(\s+)/);
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur.length + w.length > width && cur.trim()) {
      out.push(cur.trimEnd());
      cur = "";
    }
    if (w.length > width && !w.includes(" ")) {
      if (cur.trim()) {
        out.push(cur.trimEnd());
        cur = "";
      }
      out.push(chunk(w, width));
      continue;
    }
    cur += w;
  }
  if (cur.trim()) out.push(cur.trimEnd());
  return out.join("\n");
}
