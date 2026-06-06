import { AddLineNumbers } from "../../src/chef/operations/AddLineNumbers";

describe("AddLineNumbers", () => {
    const op = new AddLineNumbers();

    test("Basic line numbering", () => {
        const input = "line one\nline two\nline three";
        const result = op.run(input, [0]);
        expect(result).toBe("1 line one\n2 line two\n3 line three");
    });

    test("Line numbering with offset", () => {
        const input = "line one\nline two";
        const result = op.run(input, [10]);
        expect(result).toBe("11 line one\n12 line two");
    });

    test("Line numbering with padding", () => {
        const input = "a\nb\nc\nd\ne\nf\ng\nh\ni\nj"; // 10 lines
        const result = op.run(input, [0]);
        const lines = result.split("\n");
        expect(lines[0]).toBe(" 1 a");
        expect(lines[9]).toBe("10 j");
    });

    test("Empty string", () => {
        const input = "";
        const result = op.run(input, [0]);
        expect(result).toBe("1 ");
    });
});
