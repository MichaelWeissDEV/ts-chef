import { BLAKE3 } from "../../src/chef/operations/BLAKE3";
import { OperationError } from "../../src/chef/errors/OperationError";

describe("BLAKE3", () => {
    const op = new BLAKE3();

    test("BLAKE3 32 bytes Hex", async () => {
        const result = await op.run("abc", [32, ""]);
        expect(result).toBe("6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d85");
    });

    test("BLAKE3 64 bytes Hex", async () => {
        const result = await op.run("abc", [64, ""]);
        expect(result).toBe("6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d851fb250ae7393f5d02813b65d521a0d492d9ba09cf7ce7f4cffd900f23374bf0b");
    });

    test("BLAKE3 32 bytes with Key", async () => {
        const key = "12345678901234567890123456789012"; // 32 bytes
        const result = await op.run("abc", [32, key]);
        expect(result).toBe("cb9696693eb4ec3af3cec324efa304ddfba82961ca3a16534fe3657c6e59498c");
    });

    test("Invalid key length", () => {
        const key = "too short";
        expect(() => op.run("abc", [32, key])).toThrow(OperationError);
    });

    test("Empty input", async () => {
        const result = await op.run("", [32, ""]);
        expect(result).toBe("af1349b9f5f9a1a6a0404dea36dcc9499bcb25c9adc112b7cc9a93cae41f3262");
    });
});
