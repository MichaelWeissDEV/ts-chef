import { BSONDeserialise } from "../../src/chef/operations/BSONDeserialise";
import { hexToAB } from "../helpers";
import { OperationError } from "../../src/chef/errors/OperationError";

describe("BSONDeserialise", () => {
  const op = new BSONDeserialise();

  test("Standard BSON deserialisation", () => {
    // {"hello": "world"}
    const input = hexToAB("160000000268656c6c6f0006000000776f726c640000");
    const result = op.run(input, []);
    const parsed = JSON.parse(result);
    expect(parsed).toEqual({ hello: "world" });
  });

  test("Empty input", () => {
    expect(op.run(new ArrayBuffer(0), [])).toBe("");
  });

  test("Invalid BSON error", () => {
    const input = hexToAB("12345678");
    expect(() => op.run(input, [])).toThrow(OperationError);
  });
});
