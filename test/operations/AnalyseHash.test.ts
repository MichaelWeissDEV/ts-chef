import { AnalyseHash } from "../../src/chef/operations/AnalyseHash";
import { OperationError } from "../../src/chef/errors/OperationError";

describe("AnalyseHash", () => {
    const op = new AnalyseHash();

    test("MD5 hash analysis", () => {
        const input = "5d41402abc4b2a76b9719d911017c592";
        const result = op.run(input, []);
        expect(result).toContain("Hash length: 32");
        expect(result).toContain("Byte length: 16");
        expect(result).toContain("Bit length:  128");
        expect(result).toContain("MD5");
    });

    test("SHA-1 hash analysis", () => {
        const input = "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d";
        const result = op.run(input, []);
        expect(result).toContain("Bit length:  160");
        expect(result).toContain("SHA-1");
    });

    test("Hash with spaces", () => {
        const input = "5d 41 40 2a bc 4b 2a 76 b9 71 9d 91 10 17 c5 92";
        const result = op.run(input, []);
        expect(result).toContain("Bit length:  128");
        expect(result).toContain("MD5");
    });

    test("Unknown hash length", () => {
        const input = "abcde"; // 5 chars -> 20 bits (not in switch)
        // bitLength = (5/2)*8 = 20
        const result = op.run(input + "0", []); // 6 chars -> 24 bits
        expect(result).toContain("Unknown");
    });

    test("Invalid hash (non-hex)", () => {
        expect(() => op.run("ghijk", [])).toThrow(OperationError);
    });

    test("Empty input", () => {
        expect(() => op.run("", [])).toThrow(OperationError);
    });
});
