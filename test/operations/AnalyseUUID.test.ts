import { AnalyseUUID } from "../../src/chef/operations/AnalyseUUID";
import { OperationError } from "../../src/chef/errors/OperationError";

describe("AnalyseUUID", () => {
    const op = new AnalyseUUID();

    test("UUID v1 analysis", () => {
        const input = "6307b060-1c30-11ec-9621-0242ac130002";
        const result = op.run(input, [true]);
        expect(result).toContain("Version:\n1");
        expect(result).toContain("Timestamp:");
        expect(result).toContain("Node:\n02:42:AC:13:00:02");
    });

    test("UUID v4 analysis", () => {
        const input = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
        const result = op.run(input, [true]);
        expect(result).toContain("Version:\n4");
        expect(result).toContain("No metadata available");
    });

    test("UUID v7 analysis", () => {
        const input = "017f22e2-79b0-7cc3-98c4-dc0c0c07398f";
        const result = op.run(input, [true]);
        expect(result).toContain("Version:\n7");
        expect(result).toContain("Timestamp:");
    });

    test("UUID analysis without metadata", () => {
        const input = "6307b060-1c30-11ec-9621-0242ac130002";
        const result = op.run(input, [false]);
        expect(result).toContain("Version:\n1");
        expect(result).not.toContain("Timestamp:");
    });

    test("Trimmed input", () => {
        const input = "  f47ac10b-58cc-4372-a567-0e02b2c3d479  ";
        const result = op.run(input, [true]);
        expect(result).toContain("Version:\n4");
    });

    test("Invalid UUID", () => {
        expect(() => op.run("invalid-uuid", [true])).toThrow(OperationError);
    });
});
