import { DESEncrypt } from "../../src/chef/operations/DESEncrypt";
import { DESDecrypt } from "../../src/chef/operations/DESDecrypt";

const PLAINTEXT = "hello world";
const KEY = "0123456789abcdef"; // 8 bytes
const IV  = "0000000000000000"; // 8 bytes

function symArgs(keyHex: string, ivHex: string, mode = "CBC", inputType = "Raw", outputType = "Hex"): any[] {
    return [
        { string: keyHex, option: "Hex" },
        { string: ivHex,  option: "Hex" },
        mode, inputType, outputType,
    ];
}

function symDecArgs(keyHex: string, ivHex: string, mode = "CBC"): any[] {
    return symArgs(keyHex, ivHex, mode, "Hex", "Raw");
}

describe("DESEncrypt", () => {
    test("should encrypt plaintext in CBC mode", () => {
        const enc = new DESEncrypt().run(PLAINTEXT, symArgs(KEY, IV, "CBC"));
        expect(enc).toBeDefined();
        expect(typeof enc).toBe("string");
    });

    test("should encrypt plaintext in ECB mode", () => {
        const enc = new DESEncrypt().run(PLAINTEXT, symArgs(KEY, IV, "ECB"));
        expect(enc).toBeDefined();
    });

    test("should throw error on invalid key length", () => {
        expect(() => {
            new DESEncrypt().run(PLAINTEXT, symArgs("0102", IV));
        }).toThrow(/Invalid key length/);
    });
});
