import { CetaceanCipherEncode } from "../../src/chef/operations/CetaceanCipherEncode";

describe("CetaceanCipherEncode", () => {
    const op = new CetaceanCipherEncode();

    test("Standard encoding ('hi')", () => {
        expect(op.run("hi", [])).toBe("EEEEEEEEEeeEeEEEEEEEEEEEEeeEeEEe");
    });

    test("Encoding with space", () => {
        expect(op.run("h i", [])).toBe("EEEEEEEEEeeEeEEE EEEEEEEEEeeEeEEe");
    });

    test("Empty input", () => {
        expect(op.run("", [])).toBe("");
    });
});
