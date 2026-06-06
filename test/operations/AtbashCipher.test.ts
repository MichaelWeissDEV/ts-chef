import { AtbashCipher } from "../../src/chef/operations/AtbashCipher";

describe("AtbashCipher", () => {
    const op = new AtbashCipher();

    test("Encoding 'abc' to 'zyx'", () => {
        expect(op.run("abc", [])).toBe("zyx");
    });

    test("Encoding 'ABC' to 'ZYX'", () => {
        expect(op.run("ABC", [])).toBe("ZYX");
    });

    test("Reciprocal nature: encoding twice returns original", () => {
        const input = "Hello World!";
        const encoded = op.run(input, []);
        expect(op.run(encoded, [])).toBe(input);
    });

    test("Non-alphabetic characters remain unchanged", () => {
        expect(op.run("123 !@#", [])).toBe("123 !@#");
    });

    test("Full alphabet encoding", () => {
        const input = "abcdefghijklmnopqrstuvwxyz";
        const expected = "zyxwvutsrqponmlkjihgfedcba";
        expect(op.run(input, [])).toBe(expected);
    });
});
