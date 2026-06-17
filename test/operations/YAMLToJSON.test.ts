import { YAMLToJSON } from "../../src/chef/operations/YAMLToJSON";

describe("YAMLToJSON", () => {
  const op = new YAMLToJSON();

  test("Converts simple YAML to JSON object", () => {
    const result = op.run("key: value", []);
    expect(result).toEqual({ key: "value" });
  });

  test("Converts YAML list to JSON array", () => {
    const result = op.run("- a\n- b\n- c", []);
    expect(result).toEqual(["a", "b", "c"]);
  });

  test("Converts nested YAML", () => {
    const result = op.run("outer:\n  inner: 42", []);
    expect((result as { outer: { inner: number } }).outer.inner).toBe(42);
  });

  test("Converts YAML number to number", () => {
    const result = op.run("count: 5", []);
    expect((result as { count: number }).count).toBe(5);
  });

  test("Invalid YAML throws OperationError", () => {
    expect(() => op.run("{ invalid yaml :", [])).toThrow();
  });
});
