import { BSONSerialise } from "../../src/chef/operations/BSONSerialise";
import { OperationError } from "../../src/chef/errors/OperationError";

describe("BSONSerialise", () => {
    const op = new BSONSerialise();

    test("Standard JSON serialisation", () => {
        const input = '{"hello": "world"}';
        const result = op.run(input, []);
        const hex = Buffer.from(result).toString("hex");
        expect(hex).toBe("160000000268656c6c6f0006000000776f726c640000");
    });

    test("Empty input", () => {
        const result = op.run("", []);
        expect(result.byteLength).toBe(0);
    });

    test("Invalid JSON error", () => {
        const input = '{invalid}';
        expect(() => op.run(input, [])).toThrow(OperationError);
    });
});
