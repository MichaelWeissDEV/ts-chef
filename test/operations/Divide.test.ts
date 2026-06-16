import { Divide } from "../../src/chef/operations/Divide";

describe("Divide", () => {
  const op = new Divide();

  test("12 divided by 4 is 3", () => {
    expect(op.run("12\n4", ["Line feed"]).toNumber()).toBe(3);
  });

  test("Single number returns that number", () => {
    expect(op.run("7", ["Line feed"]).toNumber()).toBe(7);
  });

  test("10 divided by 2 divided by 5 is 1", () => {
    expect(op.run("10\n2\n5", ["Line feed"]).toNumber()).toBe(1);
  });

  test("100 divided by 4 is 25", () => {
    expect(op.run("100\n4", ["Line feed"]).toNumber()).toBe(25);
  });

  test("Division with comma delimiter", () => {
    expect(op.run("20,5", ["Comma"]).toNumber()).toBe(4);
  });
});
