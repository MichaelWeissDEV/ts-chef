/**
 * @fileoverview ToTable operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

export class ToTable extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "To table";
    this.module = "Default";
    this.description =
      "Displays the input as a text table, treating the first row as a header.";
    this.inputType = "string";
    this.outputType = "html";
    this.args = [
      { name: "Cell delimiter", type: "binaryShortString", value: "," },
      { name: "Row delimiter", type: "binaryShortString", value: "\\n" },
      { name: "Header in first row", type: "boolean", value: true },
      {
        name: "Treat multiple delimiters as one",
        type: "boolean",
        value: false,
      },
    ];
  }

  run(input: string, args: unknown[]): string {
    const cellDelim =
      (args[0] as string).replace(/\\n/g, "\n").replace(/\\t/g, "\t") || ",";
    const rowDelim =
      (args[1] as string).replace(/\\n/g, "\n").replace(/\\t/g, "\t") || "\n";
    const firstRowAsHeader = args[2] as boolean;
    const multipleDelims = args[3] as boolean;

    const rows = input.split(rowDelim).filter((r) => r.length > 0);
    if (rows.length === 0) return "";

    function splitRow(row: string): string[] {
      if (multipleDelims) {
        return row.split(
          new RegExp(
            `[${cellDelim.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}]+`,
          ),
        );
      }
      return row.split(cellDelim);
    }

    const tableRows = rows.map(splitRow);
    let html = '<table class="table table-bordered"><tbody>';

    tableRows.forEach((row, i) => {
      html += "<tr>";
      const tag = firstRowAsHeader && i === 0 ? "th" : "td";
      row.forEach((cell) => {
        html += `<${tag}>${cell.trim()}</${tag}>`;
      });
      html += "</tr>";
    });

    html += "</tbody></table>";
    return html;
  }
}

export default ToTable;
