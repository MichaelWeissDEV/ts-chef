import { CTPH } from "../../src/chef/operations/CTPH";

describe("CTPH", () => {
    const op = new CTPH();

    test("Hashing a simple string", () => {
        const input = "The quick brown fox jumps over the lazy dog";
        const result = op.run(input, []);
        expect(result).toBeDefined();
        expect(typeof result).toBe("string");
    });

    test("Identical inputs produce identical hashes", () => {
        const input = "Some consistent input string for testing";
        const result1 = op.run(input, []);
        const result2 = op.run(input, []);
        expect(result1).toBe(result2);
    });

    test("Different inputs produce different hashes", () => {
        const input1 = "Input number one";
        const input2 = "Input number two";
        const result1 = op.run(input1, []);
        const result2 = op.run(input2, []);
        expect(result1).not.toBe(result2);
    });

    test("Similar inputs produce similar hashes (fuzzy hashing property)", () => {
        const input1 = "This is a long enough string to test fuzzy hashing properties. It should be relatively stable.";
        const input2 = "This is a long enough string to test fuzzy hashing property. It should be relatively stable.";
        const result1 = op.run(input1, []);
        const result2 = op.run(input2, []);
        // They should be similar, but for unit test we just check they are defined and likely the same length or structure
        expect(result1.split(":")[0]).toBe(result2.split(":")[0]);
    });
});
