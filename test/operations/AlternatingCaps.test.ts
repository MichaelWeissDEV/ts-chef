import { AlternatingCaps } from "../../src/chef/operations/AlternatingCaps";

describe("AlternatingCaps", () => {
    const op = new AlternatingCaps();

    test("Standard alternating caps", () => {
        expect(op.run("hello", [])).toBe("hElLo");
    });

    test("Alternating caps with spaces", () => {
        expect(op.run("hello world", [])).toBe("hElLo WoRlD");
    });

    test("Alternating caps with numbers and symbols", () => {
        expect(op.run("123 abc!", [])).toBe("123 aBc!");
    });

    test("Already caps", () => {
        expect(op.run("HELLO", [])).toBe("hElLo");
    });

    test("Empty input", () => {
        expect(op.run("", [])).toBe("");
    });

    test("Non-ASCII letters", () => {
        // α is lower, so it stays lower and previousCaps becomes false.
        // β is lower, it becomes Upper (Β) and previousCaps becomes true.
        // γ is lower, it becomes Lower (γ) and previousCaps becomes false.
        expect(op.run("αβγ", [])).toBe("αΒγ");
    });
});
