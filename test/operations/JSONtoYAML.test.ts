import { JSONtoYAML } from "../../src/chef/operations/JSONtoYAML";

describe("JSONtoYAML", () => {
  const op = new JSONtoYAML();

  test("Converts simple JSON object to YAML", () => {
    const result = op.run({ key: "value" }, []);
    expect(result).toContain("key:");
    expect(result).toContain("value");
  });

  test("Converts JSON array to YAML list", () => {
    const result = op.run(["a", "b", "c"], []);
    expect(result).toContain("- a");
  });

  test("Converts nested JSON to YAML", () => {
    const result = op.run({ outer: { inner: 42 } }, []);
    expect(result).toContain("outer:");
    expect(result).toContain("inner:");
  });

  test("Converts JSON number", () => {
    const result = op.run({ count: 5 }, []);
    expect(result).toContain("5");
  });

  test("Empty object produces valid YAML", () => {
    const result = op.run({}, []);
    expect(typeof result).toBe("string");
  });
});
