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
import { OperationError } from "../errors/OperationError";
import { flatten } from "flat";

export class JSONToCSV extends Operation {
  private cellDelim = ",";
  private rowDelim = "\r\n";
  private flattened: unknown[] = [];

  constructor() {
    super();
    this.name = "JSON to CSV";
    this.module = "Default";
    this.description =
      "Converts JSON data to a CSV based on the definition in RFC 4180.";
    this.infoURL = "https://wikipedia.org/wiki/Comma-separated_values";
    this.inputType = "JSON";
    this.outputType = "string";
    this.args = [
      {
        name: "Cell delimiter",
        type: "binaryShortString",
        value: ",",
      },
      {
        name: "Row delimiter",
        type: "binaryShortString",
        value: "\\r\\n",
      },
    ];
  }

  run(input: unknown, args: unknown[]): string {
    const [cellDelim, rowDelim] = args as [string, string];
    this.cellDelim = cellDelim;
    this.rowDelim = rowDelim;
    this.flattened = Array.isArray(input) ? input : [input];

    try {
      return this.toCSV();
    } catch {
      try {
        const f = flatten(input as Record<string, unknown>);
        this.flattened = Array.isArray(f) ? f : [f];
        return this.toCSV(true);
      } catch (err) {
        throw new OperationError("Unable to parse JSON to CSV: " + err);
      }
    }
  }

  private toCSV(force = false): string {
    const first = this.flattened[0];

    if (Array.isArray(first)) {
      return (
        (this.flattened as unknown[][])
          .map((row) =>
            row
              .map((d) => this.escapeCellContents(d, force))
              .join(this.cellDelim),
          )
          .join(this.rowDelim) + this.rowDelim
      );
    }

    const header = Object.keys(first as Record<string, unknown>);
    return (
      header
        .map((d) => this.escapeCellContents(d, force))
        .join(this.cellDelim) +
      this.rowDelim +
      (this.flattened as Record<string, unknown>[])
        .map((row) =>
          header
            .map((h) => row[h])
            .map((d) => this.escapeCellContents(d, force))
            .join(this.cellDelim),
        )
        .join(this.rowDelim) +
      this.rowDelim
    );
  }

  private escapeCellContents(data: unknown, force = false): string {
    let s: string;
    if (data == null || typeof data !== "object") {
      s = `${data}`;
    } else if (force) {
      s = JSON.stringify(data);
    } else {
      s = `${data}`;
    }

    s = s.replace(/"/g, '""');

    if (
      s.indexOf(this.cellDelim) >= 0 ||
      s.indexOf(this.rowDelim) >= 0 ||
      s.indexOf("\n") >= 0 ||
      s.indexOf("\r") >= 0 ||
      s.indexOf('"') >= 0
    ) {
      s = `"${s}"`;
    }

    return s;
  }
}

export default JSONToCSV;
