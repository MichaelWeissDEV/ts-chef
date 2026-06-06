import { CartesianProduct } from "../../src/chef/operations/CartesianProduct";
import { OperationError } from "../../src/chef/errors/OperationError";

describe("CartesianProduct", () => {
  const op = new CartesianProduct();

  test("Two sets", () => {
    const input = "1,2\n\nA,B";
    const expected = "(1,A),(1,B),(2,A),(2,B)";
    expect(op.run(input, ["\n\n", ","])).toBe(expected);
  });

  test("Three sets", () => {
    const input = "1\n\nA\n\n!";
    const expected = "(1,A,!)";
    expect(op.run(input, ["\n\n", ","])).toBe(expected);
  });

  test("Custom delimiters", () => {
    const input = "1;2|A;B";
    const expected = "(1:A);(1:B);(2:A);(2:B)";
    // Note: CartesianProduct uses itemDelimiter in result as well
    // Wait, looking at the code:
    // .map((set) => `(${set.join(",")})`)
    // .join(this.itemDelimiter);
    // It hardcodes ',' for set join, but uses itemDelimiter for joining sets.
    // Let's re-verify:
    // return this.computeCartesian(splitSets)
    //     .map((set) => `(${set.join(",")})`)
    //     .join(this.itemDelimiter);

    // If itemDelimiter is ':', result would be (1,A):(1,B):(2,A):(2,B)
    expect(op.run(input, ["|", ";"])).toBe("(1,A);(1,B);(2,A);(2,B)");
  });

  test("Less than two sets should throw", () => {
    const input = "1,2,3";
    expect(() => op.run(input, ["\n\n", ","])).toThrow(OperationError);
  });

  test("Empty set (one of them)", () => {
    const input = "1,2\n\n";
    // splitSets = [['1', '2'], ['']]
    // product = [['1', ''], ['2', '']]
    // result = (1,):(2,)
    expect(op.run(input, ["\n\n", ","])).toBe("(1,),(2,)");
  });
});
