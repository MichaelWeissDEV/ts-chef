import { BitShiftLeft } from "../../src/chef/operations/BitShiftLeft";

describe("BitShiftLeft", () => {
    const op = new BitShiftLeft();

    test("Shift left by 1", () => {
        const input = new Uint8Array([0x01, 0x02, 0x80, 0xff]).buffer;
        const result = op.run(input, [1]);
        expect(new Uint8Array(result)).toEqual(new Uint8Array([0x02, 0x04, 0x00, 0xfe]));
    });

    test("Shift left by 4", () => {
        const input = new Uint8Array([0x01, 0x02, 0x0f]).buffer;
        const result = op.run(input, [4]);
        expect(new Uint8Array(result)).toEqual(new Uint8Array([0x10, 0x20, 0xf0]));
    });

    test("Shift left by 8 (should clear all bits)", () => {
        const input = new Uint8Array([0xff, 0x55]).buffer;
        const result = op.run(input, [8]);
        expect(new Uint8Array(result)).toEqual(new Uint8Array([0x00, 0x00]));
    });

    test("Empty input", () => {
        const input = new ArrayBuffer(0);
        const result = op.run(input, [1]);
        expect(result.byteLength).toBe(0);
    });
});
