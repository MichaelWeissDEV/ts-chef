import { ChaCha } from "../../src/chef/operations/ChaCha";
import { OperationError } from "../../src/chef/errors/OperationError";

describe("ChaCha", () => {
    const op = new ChaCha();

    const key = "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";
    const nonce = "000000000000004a00000000";
    const counter = 1;
    const rounds = "20";

    test("Encryption and Decryption (Symmetry)", () => {
        const input = "Hello World";
        const args = [
            { string: key, option: "Hex" },
            { string: nonce, option: "Hex" },
            counter,
            rounds,
            "Raw",
            "Hex"
        ];

        const encrypted = op.run(input, args);
        expect(encrypted).not.toBe(input);

        const decryptArgs = [
            { string: key, option: "Hex" },
            { string: nonce, option: "Hex" },
            counter,
            rounds,
            "Hex",
            "Raw"
        ];
        const decrypted = op.run(encrypted, decryptArgs);
        expect(decrypted).toBe(input);
    });

    test("Invalid key length", () => {
        const args = [
            { string: "1234", option: "Hex" },
            { string: nonce, option: "Hex" },
            counter,
            rounds,
            "Raw",
            "Hex"
        ];
        expect(() => op.run("input", args)).toThrow(OperationError);
    });

    test("Invalid nonce length", () => {
         const args = [
            { string: key, option: "Hex" },
            { string: "1234", option: "Hex" },
            counter,
            rounds,
            "Raw",
            "Hex"
        ];
        expect(() => op.run("input", args)).toThrow(OperationError);
    });
});
