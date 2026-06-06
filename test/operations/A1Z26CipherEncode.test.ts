import { A1Z26CipherEncode } from "../../src/chef/operations/A1Z26CipherEncode";
import { A1Z26CipherDecode } from "../../src/chef/operations/A1Z26CipherDecode";

describe("A1Z26CipherEncode", () => {
    const op = new A1Z26CipherEncode();

    test("Standard encoding", () => {
        expect(op.run("hello", ["Space"])).toBe("8 5 12 12 15");
    });

    test("Empty input", () => {
        expect(op.run("", ["Space"])).toBe("");
    });

    test("Different delimiter (Comma)", () => {
        expect(op.run("hello", ["Comma"])).toBe("8,5,12,12,15");
    });

    test("Non-alphabet characters dropped", () => {
        expect(op.run("h!e@l#l$o", ["Space"])).toBe("8 5 12 12 15");
    });

    test("Case insensitivity", () => {
        expect(op.run("HELLO", ["Space"])).toBe("8 5 12 12 15");
    });

    test("Round-trip", () => {
        const input = "helloworld";
        const encoded = op.run(input, ["Space"]);
        const decoded = new A1Z26CipherDecode().run(encoded, ["Space"]);
        expect(decoded).toBe(input);
    });
});
