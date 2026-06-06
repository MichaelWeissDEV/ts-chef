import { ConditionalJump } from "../../src/chef/operations/ConditionalJump";

describe("ConditionalJump", () => {
    const operation = new ConditionalJump();

    test("should return input unchanged (logic is handled by Recipe runner)", () => {
        const input = "test data";
        const args = ["^test", false, "label1", 10];
        expect(operation.run(input, args)).toBe(input);
    });

    test("should return input unchanged with inverted match", () => {
        const input = "other data";
        const args = ["^test", true, "label1", 10];
        expect(operation.run(input, args)).toBe(input);
    });
});
