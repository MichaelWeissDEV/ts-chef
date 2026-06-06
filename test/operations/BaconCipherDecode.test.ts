import { BaconCipherDecode } from "../../src/chef/operations/BaconCipherDecode";

describe("BaconCipherDecode", () => {
    const op = new BaconCipherDecode();

    test("Decode Complete alphabet (0/1)", () => {
        // hello: h=00111, e=00100, l=01011, l=01011, o=01110
        expect(op.run("0011100100010110101101110", ["Complete", "0/1", false])).toBe("HELLO");
    });

    test("Decode Standard alphabet (0/1)", () => {
        // hello: h=00111, e=00100, l=01010, l=01010, o=01101
        expect(op.run("0011100100010100101001101", ["Standard (I=J and U=V)", "0/1", false])).toBe("HELLO");
    });

    test("Decode Complete alphabet (A/B)", () => {
        // hello: h=AABBB, e=AABAA, l=ABABB, l=ABABB, o=ABBBA
        expect(op.run("AABBB AABAA ABABB ABABB ABBBA", ["Complete", "A/B", false])).toBe("HELLO");
    });

    test("Decode Complete alphabet (Case)", () => {
        // hello: h=aaBBB, e=aaBaa, l=aBaBB, l=aBaBB, o=aBBBa
        // uppercase = 1, lowercase = 0
        expect(op.run("aaBBB aaBaa aBaBB aBaBB aBBBa", ["Complete", "Case", false])).toBe("HELLO");
    });

    test("Decode with Invert Translation", () => {
        // hello (Complete, 0/1) inverted: h=11000, e=11011, l=10100, l=10100, o=10001
        expect(op.run("1100011011101001010010001", ["Complete", "0/1", true])).toBe("HELLO");
    });

    test("Decode Complete alphabet (A-M/N-Z first letter)", () => {
        // hello: h=00111, e=00100, l=01011, l=01011, o=01110
        // 0: A-M, 1: N-Z. We need 25 words. First letter of each word matters.
        const helloAMNZ = "apple apple Nut Nut Nut apple apple Nut apple apple apple Nut apple Nut Nut apple Nut apple Nut Nut apple Nut Nut Nut apple";
        expect(op.run(helloAMNZ, ["Complete", "A-M/N-Z first letter", false])).toBe("HELLO");
    });

    test("Empty input", () => {
        expect(op.run("", ["Complete", "0/1", false])).toBe("");
    });
});
