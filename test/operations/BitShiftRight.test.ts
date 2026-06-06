import { BitShiftRight } from "../../src/chef/operations/BitShiftRight";

describe("BitShiftRight", () => {
    const op = new BitShiftRight();

    test("Logical shift right by 1", () => {
        const input = new Uint8Array([0x01, 0x02, 0x80, 0xff]).buffer;
        const result = op.run(input, [1, "Logical shift"]);
        expect(new Uint8Array(result)).toEqual(new Uint8Array([0x00, 0x01, 0x40, 0x7f]));
    });

    test("Arithmetic shift right by 1", () => {
        const input = new Uint8Array([0x01, 0x02, 0x80, 0xff]).buffer;
        const result = op.run(input, [1, "Arithmetic shift"]);
        // 0x01 -> 0x00
        // 0x02 -> 0x01
        // 0x80 (1000 0000) -> 0x40 (0100 0000) ^ 0x80 = 0xC0 (1100 0000)
        // 0xff (1111 1111) -> 0x7f (0111 1111) ^ 0x80 = 0xff (1111 1111)
        expect(new Uint8Array(result)).toEqual(new Uint8Array([0x00, 0x01, 0xc0, 0xff]));
    });

    test("Logical shift right by 4", () => {
        const input = new Uint8Array([0x10, 0x80, 0xff]).buffer;
        const result = op.run(input, [4, "Logical shift"]);
        expect(new Uint8Array(result)).toEqual(new Uint8Array([0x01, 0x08, 0x0f]));
    });

    test("Arithmetic shift right by 4", () => {
        const input = new Uint8Array([0x10, 0x80, 0xff]).buffer;
        const result = op.run(input, [4, "Arithmetic shift"]);
        // 0x10 (0001 0000) -> (0x10 >>> 4) ^ 0 = 0x01
        // 0x80 (1000 0000) -> (0x80 >>> 4) ^ 0x80 = 0x08 ^ 0x80 = 0x88 (1000 1000)
        // 0xff (1111 1111) -> (0xff >>> 4) ^ 0x80 = 0x0f ^ 0x80 = 0x8f (1000 1111)
        expect(new Uint8Array(result)).toEqual(new Uint8Array([0x01, 0x88, 0x8f]));
    });

    test("Empty input", () => {
        const input = new ArrayBuffer(0);
        const result = op.run(input, [1, "Logical shift"]);
        expect(result.byteLength).toBe(0);
    });
});
