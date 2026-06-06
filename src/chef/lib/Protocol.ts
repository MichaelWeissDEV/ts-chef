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

import BigNumber from "bignumber.js";
import { toHexFast } from "./Hex";

/**
 * Recursively displays a JSON object as an HTML table
 */
export function objToTable(obj: any, nested: boolean = false): string {
  let html = `<table
        class='table table-sm table-nonfluid ${nested ? "mb-0 table-borderless" : "table-bordered"}'
        style='table-layout: fixed; ${nested ? "margin: -1px !important;" : ""}'>`;
  if (!nested)
    html += `<tr>
            <th>Field</th>
            <th>Value</th>
        </tr>`;

  for (const key in obj) {
    if (typeof obj[key] === "function") continue;

    html += `<tr><td style='word-wrap: break-word'>${key}</td>`;
    if (typeof obj[key] === "object" && obj[key] !== null)
      html += `<td style='padding: 0'>${objToTable(obj[key], true)}</td>`;
    else html += `<td>${obj[key]}</td>`;
    html += "</tr>";
  }
  html += "</table>";
  return html;
}

/**
 * Converts bytes into a BigNumber string
 */
export function bytesToLargeNumber(bs: Uint8Array): string {
  return new BigNumber(toHexFast(bs), 16).toString();
}
