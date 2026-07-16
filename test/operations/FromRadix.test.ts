import { FromRadix } from "../../src/chef/operations/FromRadix";

describe("FromRadix", () => {
  const operation = new FromRadix();

  test("decodes valid fixed-width and delimited values", () => {
    expect(operation.run("0100000101000010", ["None", 2, 8])).toEqual([
      65, 66,
    ]);
    expect(operation.run("65,66", ["Comma", 10, 3])).toEqual([65, 66]);
  });

  test("rejects invalid digits, partial groups and byte overflow", () => {
    expect(() => operation.run("10102", ["None", 2, 5])).toThrow();
    expect(() => operation.run("101", ["None", 2, 8])).toThrow();
    expect(() => operation.run("256", ["Space", 10, 3])).toThrow();
    expect(() => operation.run("-1", ["Space", 10, 3])).toThrow();
  });
});
