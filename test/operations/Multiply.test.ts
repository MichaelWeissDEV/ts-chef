import { Multiply } from "../../src/chef/operations/Multiply";

describe("Multiply", () => {
  const op = new Multiply();

  test("3 times 4 is 12", () => {
    expect(op.run("3\n4", ["Line feed"]).toNumber()).toBe(12);
  });

  test("Multiplying by 1 returns same value", () => {
    expect(op.run("7\n1", ["Line feed"]).toNumber()).toBe(7);
  });

  test("Multiplying by 0 returns 0", () => {
    expect(op.run("5\n0", ["Line feed"]).toNumber()).toBe(0);
  });

  test("Single number returns that number", () => {
    expect(op.run("9", ["Line feed"]).toNumber()).toBe(9);
  });

  test("Multiple values", () => {
    expect(op.run("2\n3\n4", ["Line feed"]).toNumber()).toBe(24);
  });
});
