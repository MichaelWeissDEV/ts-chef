import { CMAC } from "../../src/chef/operations/CMAC";
import { hexToAB } from "../helpers";

describe("CMAC", () => {
    const op = new CMAC();

    const KEY128 = { string: "2b7e151628aed2a6abf7158809cf4f3c", option: "Hex" };

    test("AES-CMAC empty message", () => {
        const message = new ArrayBuffer(0);
        const result = op.run(message, [KEY128, "AES"]);
        expect(result).toBe("bb1d6929e95937287fa37d129b756746");
    });

    test("AES-CMAC 16-byte message", () => {
        const message = hexToAB("6bc1bee22e409f96e93d7e117393172a");
        const result = op.run(message, [KEY128, "AES"]);
        expect(result).toBe("070a16b46b4d4144f79bdd9dd04a287c");
    });

    test("AES-CMAC 40-byte message", () => {
        const message = hexToAB("6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e5130c81c46a35ce411");
        const result = op.run(message, [KEY128, "AES"]);
        expect(result).toBe("dfa66747de9ae63030ca32611497c827");
    });

    test("AES-CMAC 64-byte message", () => {
        const message = hexToAB("6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e5130c81c46a35ce411e56b1193073236b4346a9c7413521db2ad5d233e180b7514");
        const result = op.run(message, [KEY128, "AES"]);
        expect(result).toBe("401a51e8ceb09e5f740272d823462a36");
    });

    test("Triple DES-CMAC (short key)", () => {
        const keyShort = { string: "0123456789abcdef0123456789abcdef", option: "Hex" };
        const message = hexToAB("6bc1bee22e409f96");
        const result = op.run(message, [keyShort, "Triple DES"]);
        // We just verify it runs and returns a 8-byte (16 hex chars) result for 3DES
        expect(result.length).toBe(16);
    });

    test("Invalid key length for AES", () => {
        const invalidKey = { string: "1234", option: "Hex" };
        expect(() => op.run(new ArrayBuffer(0), [invalidKey, "AES"])).toThrow(/The key for AES must be either 16, 24, or 32 bytes/);
    });

    test("Invalid key length for Triple DES", () => {
        const invalidKey = { string: "1234", option: "Hex" };
        expect(() => op.run(new ArrayBuffer(0), [invalidKey, "Triple DES"])).toThrow(/The key for Triple DES must be 16 or 24 bytes/);
    });
});
