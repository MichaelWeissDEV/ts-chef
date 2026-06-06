import "reflect-metadata";
import { AMFEncode } from "../../src/chef/operations/AMFEncode";

describe("AMFEncode", () => {
    const op = new AMFEncode();

    test("AMF3 Encode simple object", () => {
        const input = { foo: "bar" };
        const result = op.run(input, ["AMF3"]);
        expect(result).toBeDefined();
        expect(result.byteLength).toBeGreaterThan(0);
    });

    test("AMF0 Encode simple object", () => {
        const input = { foo: "bar" };
        const result = op.run(input, ["AMF0"]);
        expect(result).toBeDefined();
        expect(result.byteLength).toBeGreaterThan(0);
    });

    test("AMF3 Encode number", () => {
        const input = 123;
        const result = op.run(input, ["AMF3"]);
        expect(result).toBeDefined();
        expect(result.byteLength).toBeGreaterThan(0);
    });

    test("AMF3 Encode string", () => {
        const input = "hello";
        const result = op.run(input, ["AMF3"]);
        expect(result).toBeDefined();
        expect(result.byteLength).toBeGreaterThan(0);
    });
});
