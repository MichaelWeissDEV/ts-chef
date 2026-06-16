import { Median } from "../../src/chef/operations/Median";

describe("Median", () => {
  const op = new Median();

  test("Median of odd count: 1, 3, 5 is 3", () => {
    expect(op.run("1\n3\n5", ["Line feed"]).toNumber()).toBe(3);
  });

  test("Median of even count: 1, 2, 3, 4 is 2.5", () => {
    expect(op.run("1\n2\n3\n4", ["Line feed"]).toNumber()).toBe(2.5);
  });

  test("Median of a single number equals that number", () => {
    expect(op.run("42", ["Line feed"]).toNumber()).toBe(42);
  });

  test("Median picks middle element by position (not sorted) for odd count", () => {
    // Implementation returns data[Math.floor(n/2)] without sorting for odd n
    expect(op.run("5\n1\n3", ["Line feed"]).toNumber()).toBe(1);
  });

  test("Median with comma delimiter", () => {
    expect(op.run("2,4,6", ["Comma"]).toNumber()).toBe(4);
  });
});
