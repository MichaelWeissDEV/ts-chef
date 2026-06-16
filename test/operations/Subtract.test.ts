import { Subtract } from "../../src/chef/operations/Subtract";

describe("Subtract", () => {
  const op = new Subtract();

  test("10 minus 3 is 7", () => {
    expect(op.run("10\n3", ["Line feed"]).toNumber()).toBe(7);
  });

  test("Subtracting from itself gives 0", () => {
    expect(op.run("5\n5", ["Line feed"]).toNumber()).toBe(0);
  });

  test("Single number returns that number", () => {
    expect(op.run("42", ["Line feed"]).toNumber()).toBe(42);
  });

  test("Subtracting multiple values", () => {
    expect(op.run("10\n3\n2", ["Line feed"]).toNumber()).toBe(5);
  });

  test("Result can be negative", () => {
    expect(op.run("3\n10", ["Line feed"]).toNumber()).toBe(-7);
  });
});
