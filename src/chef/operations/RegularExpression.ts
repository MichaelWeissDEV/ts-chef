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

import { Operation } from "../Operation";
import { Utils } from "../Utils";
import { OperationError } from "../errors/OperationError";

const EMAIL_REGEX = /\b([\w.%+\-]+)@([\w\-]+\.)+([A-Za-z]{2,})\b/;

export class RegularExpression extends Operation {
  constructor() {
    super();
    this.name = "Regular expression";
    this.module = "Regex";
    this.description =
      "Define your own regular expression (regex) to search the input data with, optionally choosing from a list of pre-defined patterns.";
    this.infoURL = "https://wikipedia.org/wiki/Regular_expression";
    this.inputType = "string";
    this.outputType = "html";
    this.args = [
      {
        name: "Built in regexes",
        type: "populateOption",
        value: [
          { name: "User defined", value: "" },
          {
            name: "IPv4 address",
            value:
              "(?:(?:\\d|[01]?\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d|\\d)(?:\\/\\d{1,2})?",
          },
          {
            name: "Email address",
            value: EMAIL_REGEX.source,
          },
          {
            name: "URL",
            value:
              '([A-Za-z]+://)([-\\w]+(?:\\.\\w[-\\w]*)+)(:\\d+)?(/[^.!,?"<>\\[\\]{}\\s\\x7F-\\xFF]*(?:[.!,?]+[^.!,?"<>\\[\\]{}\\s\\x7F-\\xFF]+)*)?',
          },
          {
            name: "MAC address",
            value: "[A-Fa-f\\d]{2}(?:[:-][A-Fa-f\\d]{2}){5}",
          },
          {
            name: "UUID",
            value:
              "[0-9a-fA-F]{8}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{12}",
          },
          {
            name: "Strings",
            value: '[A-Za-z\\d/\\-:.,_$%\\x27"()<>= !\\[\\]{}@]{4,}',
          },
        ],
        target: 1,
      },
      { name: "Regex", type: "text", value: "" },
      { name: "Case insensitive", type: "boolean", value: true },
      { name: "^ and $ match at newlines", type: "boolean", value: true },
      { name: "Dot matches all", type: "boolean", value: false },
      { name: "Unicode support", type: "boolean", value: false },
      { name: "Astral support", type: "boolean", value: false },
      { name: "Display total", type: "boolean", value: false },
      {
        name: "Output format",
        type: "option",
        value: [
          "Highlight matches",
          "List matches",
          "List capture groups",
          "List matches with capture groups",
        ],
      },
    ];
  }

  run(input: string, args: unknown[]): string {
    const [, userRegex, i, m, s, u, , displayTotal, outputFormat] = args as [
      unknown,
      string,
      boolean,
      boolean,
      boolean,
      boolean,
      boolean,
      boolean,
      string,
    ];

    if (!userRegex || userRegex === "^" || userRegex === "$") {
      return Utils.escapeHtml(input);
    }

    let modifiers = "g";
    if (i) modifiers += "i";
    if (m) modifiers += "m";
    if (s) modifiers += "s";
    if (u) modifiers += "u";

    try {
      const regex = new RegExp(userRegex, modifiers);

      switch (outputFormat) {
        case "Highlight matches":
          return regexHighlight(input, regex, displayTotal);
        case "List matches":
          return Utils.escapeHtml(
            regexList(input, regex, displayTotal, true, false),
          );
        case "List capture groups":
          return Utils.escapeHtml(
            regexList(input, regex, displayTotal, false, true),
          );
        case "List matches with capture groups":
          return Utils.escapeHtml(
            regexList(input, regex, displayTotal, true, true),
          );
        default:
          throw new OperationError("Error: Invalid output format");
      }
    } catch (err) {
      throw new OperationError(
        "Invalid regex. Details: " + (err as Error).message,
      );
    }
  }
}

function regexList(
  input: string,
  regex: RegExp,
  displayTotal: boolean,
  matches: boolean,
  captureGroups: boolean,
): string {
  let output = "";
  let total = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input))) {
    if (match.index === regex.lastIndex) regex.lastIndex++;
    total++;
    if (matches) output += match[0] + "\n";
    if (captureGroups) {
      for (let i = 1; i < match.length; i++) {
        if (matches) output += "  Group " + i + ": ";
        output += match[i] + "\n";
      }
    }
  }

  if (displayTotal) output = "Total found: " + total + "\n\n" + output;
  return output.slice(0, -1);
}

function regexHighlight(
  input: string,
  regex: RegExp,
  displayTotal: boolean,
): string {
  let hl = 1;
  let total = 0;
  const captureGroups: string[] = [];

  let output = input.replace(regex, (match, ...rest) => {
    rest.pop();
    const offset = rest.pop() as number;
    const groups = rest as string[];
    let title = `Offset: ${offset}\n`;
    if (groups.length) {
      title += "Groups:\n";
      for (let i = 0; i < groups.length; i++) {
        title += `\t${i + 1}: ${Utils.escapeHtml(groups[i] || "")}\n`;
      }
    }
    hl = hl === 1 ? 2 : 1;
    captureGroups.push(
      `<span class='hl${hl}' title='${title}'>${Utils.escapeHtml(match)}</span>`,
    );
    return `[cc_capture_group_${total++}]`;
  });

  output = Utils.escapeHtml(output);
  output = output.replace(
    /\[cc_capture_group_(\d+)\]/g,
    (_, i) => captureGroups[parseInt(i)],
  );

  if (displayTotal) output = "Total found: " + total + "\n\n" + output;
  return output;
}

export default RegularExpression;
