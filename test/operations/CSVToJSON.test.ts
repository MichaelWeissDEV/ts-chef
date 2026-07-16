/**
 * @fileoverview CSVToJSON.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { CSVToJSON } from "../../src/chef/operations/CSVToJSON";

describe("CSVToJSON", () => {
  const op = new CSVToJSON();

  test("Array of arrays format", () => {
    const input = "a,b,c\n1,2,3\n4,5,6";
    const expected = [
      ["a", "b", "c"],
      ["1", "2", "3"],
      ["4", "5", "6"],
    ];
    expect(op.run(input, [",", "\n", "Array of arrays"])).toEqual(expected);
  });

  test("Array of dictionaries format", () => {
    const input = "header1,header2\nval1,val2\nval3,val4";
    const expected = [
      { header1: "val1", header2: "val2" },
      { header1: "val3", header2: "val4" },
    ];
    expect(op.run(input, [",", "\n", "Array of dictionaries"])).toEqual(
      expected,
    );
  });

  test("Custom delimiters", () => {
    const input = "a;b;c|1;2;3";
    const expected = [
      ["a", "b", "c"],
      ["1", "2", "3"],
    ];
    expect(op.run(input, [";", "|", "Array of arrays"])).toEqual(expected);
  });

  test("decodes escaped CRLF delimiters used by the default argument", () => {
    expect(
      op.run("name,age\r\nAda,42", [
        ",",
        "\\r\\n",
        "Array of dictionaries",
      ]),
    ).toEqual([{ name: "Ada", age: "42" }]);
  });

  test("Empty input", () => {
    expect(op.run("", [",", "\n", "Array of arrays"])).toEqual([]);
  });
});
