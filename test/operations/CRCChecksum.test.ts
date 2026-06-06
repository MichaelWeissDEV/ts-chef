import { CRCChecksum } from "../../src/chef/operations/CRCChecksum";
import { strToAB } from "../helpers";

describe("CRCChecksum", () => {
    const op = new CRCChecksum();
    const INPUT = strToAB("123456789");

    test("CRC-32", () => {
        const result = op.run(INPUT, ["CRC-32"]);
        expect(result).toBe("cbf43926");
    });

    test("CRC-16/CCITT-FALSE", () => {
        const result = op.run(INPUT, ["CRC-16/CCITT-FALSE"]);
        expect(result).toBe("29b1");
    });

    test("CRC-16/ARC", () => {
        const result = op.run(INPUT, ["CRC-16/ARC"]);
        expect(result).toBe("bb3d");
    });

    test("CRC-8", () => {
        const result = op.run(INPUT, ["CRC-8"]);
        expect(result).toBe("f4");
    });

    test("CRC-64/XZ", () => {
        const result = op.run(INPUT, ["CRC-64/XZ"]);
        expect(result).toBe("995dc9bbdf1939fa");
    });

    test("Custom CRC (CRC-32 parameters)", () => {
        const width = { string: "32", option: "Decimal" };
        const poly = { string: "04c11db7", option: "Hex" };
        const init = { string: "ffffffff", option: "Hex" };
        const xorOut = { string: "ffffffff", option: "Hex" };
        
        const result = op.run(INPUT, ["Custom", width, poly, init, "True", "True", xorOut]);
        expect(result).toBe("cbf43926");
    });

    test("Custom CRC (CRC-16 parameters)", () => {
        const width = { string: "16", option: "Decimal" };
        const poly = { string: "8005", option: "Hex" };
        const init = { string: "0000", option: "Hex" };
        const xorOut = { string: "0000", option: "Hex" };
        
        const result = op.run(INPUT, ["Custom", width, poly, init, "True", "True", xorOut]);
        expect(result).toBe("bb3d");
    });

    test("Invalid custom CRC arguments", () => {
        const invalidWidth = { string: "abc", option: "Decimal" };
        expect(() => op.run(INPUT, ["Custom", invalidWidth, {}, {}, "True", "True", {}])).toThrow(/Invalid custom CRC arguments/);
    });

    test("Unknown checksum algorithm", () => {
        expect(() => op.run(INPUT, ["Unknown"])).toThrow(/Unknown checksum algorithm/);
    });
});
