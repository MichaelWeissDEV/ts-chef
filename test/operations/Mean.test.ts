import { Mean } from "../../src/chef/operations/Mean";

describe("Mean", () => {
  const op = new Mean();

  test("Mean of 1, 2, 3 is 2", () => {
    expect(op.run("1\n2\n3", ["Line feed"]).toNumber()).toBe(2);
  });

  test("Mean of a single number equals that number", () => {
    expect(op.run("7", ["Line feed"]).toNumber()).toBe(7);
  });

  test("Mean with space delimiter", () => {
    expect(op.run("10 20 30", ["Space"]).toNumber()).toBe(20);
  });

  test("Mean of 0, 0, 0 is 0", () => {
    expect(op.run("0\n0\n0", ["Line feed"]).toNumber()).toBe(0);
  });

  test("Mean with decimal values", () => {
    expect(op.run("1.5\n2.5", ["Line feed"]).toNumber()).toBe(2);
  });
});
