import { A1Z26CipherDecode } from "../../src/chef/operations/A1Z26CipherDecode";
import { OperationError } from "../../src/chef/errors/OperationError";

describe("A1Z26CipherDecode", () => {
    const op = new A1Z26CipherDecode();

    test("Standard decoding", () => {
        expect(op.run("8 5 12 12 15", ["Space"])).toBe("hello");
    });

    test("Empty input", () => {
        expect(op.run("", ["Space"])).toBe("");
    });

    test("Different delimiter (Comma)", () => {
        expect(op.run("8,5,12,12,15", ["Comma"])).toBe("hello");
    });

    test("Invalid number (too high)", () => {
        expect(() => op.run("27", ["Space"])).toThrow(OperationError);
    });

    test("Invalid number (too low)", () => {
        expect(() => op.run("0", ["Space"])).toThrow(OperationError);
    });

    test("Invalid input (NaN)", () => {
        expect(() => op.run("abc", ["Space"])).toThrow(OperationError);
    });
});
