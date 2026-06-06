import { CountOccurrences } from "../../src/chef/operations/CountOccurrences";

describe("CountOccurrences", () => {
    const op = new CountOccurrences();

    test("Simple string", () => {
        expect(op.run("hello world hello", [{ string: "hello", option: "Simple string" }])).toBe(2);
    });

    test("Regex", () => {
        expect(op.run("hello 123 world 456", [{ string: "\\d+", option: "Regex" }])).toBe(2);
    });

    test("Extended", () => {
        expect(op.run("line1\nline2", [{ string: "\\n", option: "Extended (\\n, \\t, \\x...)" }])).toBe(1);
    });
});
