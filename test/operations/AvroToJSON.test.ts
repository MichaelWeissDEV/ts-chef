import { AvroToJSON } from "../../src/chef/operations/AvroToJSON";
import { hexToAB } from "../helpers";

describe("AvroToJSON", () => {
    const op = new AvroToJSON();

    // Small Avro file with schema {"type": "string"} and value "hello"
    const VALID_AVRO_HEX = "4f626a0104166176726f2e736368656d611022737472696e6722146176726f2e636f646563086e756c6c00e2794a730edd2c888641c88e8f1df323020c0a68656c6c6fe2794a730edd2c888641c88e8f1df323";

    test("Valid Avro to JSON", async () => {
        const input = hexToAB(VALID_AVRO_HEX);
        const result = await op.run(input, [true]);
        expect(JSON.parse(result)).toBe("hello");
    });

    test("Empty input throws error", async () => {
        const input = new ArrayBuffer(0);
        await expect(op.run(input, [true])).rejects.toThrow("Please provide an input.");
    });

    test("Invalid Avro input throws error", async () => {
        const input = hexToAB("1234567890");
        await expect(op.run(input, [true])).rejects.toThrow("Error parsing Avro file.");
    });

    test("Force Valid JSON false", async () => {
        const input = hexToAB(VALID_AVRO_HEX);
        const result = await op.run(input, [false]);
        expect(result.trim()).toBe('"hello"');
    });
});
