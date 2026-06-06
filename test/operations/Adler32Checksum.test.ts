import { Adler32Checksum } from "../../src/chef/operations/Adler32Checksum";
import { strToAB } from "../helpers";

describe("Adler32Checksum", () => {
    const op = new Adler32Checksum();

    test("Standard string 'Wikipedia'", () => {
        expect(op.run(strToAB("Wikipedia"), [])).toBe("11e60398");
    });

    test("Short string 'abc'", () => {
        expect(op.run(strToAB("abc"), [])).toBe("024d0127");
    });

    test("Empty input", () => {
        expect(op.run(strToAB(""), [])).toBe("00000001");
    });

    test("Longer string", () => {
        const input = "The quick brown fox jumps over the lazy dog";
        expect(op.run(strToAB(input), [])).toBe("5bdc0fda");
    });
});
