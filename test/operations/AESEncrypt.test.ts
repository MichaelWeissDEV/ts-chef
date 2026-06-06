import { AESEncrypt } from "../../src/chef/operations/AESEncrypt";

describe("AESEncrypt", () => {
    const op = new AESEncrypt();
    const PLAINTEXT = "hello world";
    const KEY128 = { string: "000102030405060708090a0b0c0d0e0f", option: "Hex" };
    const IV = { string: "000102030405060708090a0b0c0d0e0f", option: "Hex" };

    test("AES-128 CBC encryption", () => {
        const result = op.run(PLAINTEXT, [KEY128, IV, "CBC", "Raw", "Hex", { string: "", option: "Hex" }]);
        expect(result).toBe("7caf58cd4062c28fd34f7c6aa2212fef");
    });

    test("AES-128 ECB encryption", () => {
        const result = op.run(PLAINTEXT, [KEY128, IV, "ECB", "Raw", "Hex", { string: "", option: "Hex" }]);
        expect(result).toBe("9276fdf384f38518fa6c8310f191678d");
    });

    test("AES-128 CTR encryption", () => {
        const result = op.run(PLAINTEXT, [KEY128, IV, "CTR", "Raw", "Hex", { string: "", option: "Hex" }]);
        expect(result).toBe("62f167d92e4e872a83aff0");
    });

    test("AES-128 GCM encryption", () => {
        const result = op.run(PLAINTEXT, [KEY128, IV, "GCM", "Raw", "Hex", { string: "", option: "Hex" }]);
        expect(result).toContain("Tag: ");
        expect(result).toContain("c2cdfff2f6a2beac83d473");
    });

    test("AES-128 CBC NoPadding (valid length)", () => {
        const input16 = "1234567890123456";
        const result = op.run(input16, [KEY128, IV, "CBC/NoPadding", "Raw", "Hex", { string: "", option: "Hex" }]);
        expect(result).toBe("5bb030162b6bd315bc0a1364e1598c95");
    });

    test("AES-128 CBC NoPadding (invalid length)", () => {
        expect(() => op.run(PLAINTEXT, [KEY128, IV, "CBC/NoPadding", "Raw", "Hex", { string: "", option: "Hex" }])).toThrow(/multiple of 16/);
    });

    test("Invalid key length", () => {
        const invalidKey = { string: "1234", option: "Hex" };
        expect(() => op.run(PLAINTEXT, [invalidKey, IV, "CBC", "Raw", "Hex", { string: "", option: "Hex" }])).toThrow(/Invalid key length/);
    });
});
