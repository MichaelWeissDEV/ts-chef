import { Bcrypt } from "../../src/chef/operations/Bcrypt";
import bcrypt from "bcryptjs";

describe("Bcrypt", () => {
    const op = new Bcrypt();

    test("Generate hash", async () => {
        const password = "password123";
        const hash = await op.run(password, [10]);
        expect(hash).toBeDefined();
        expect(hash.startsWith("$2a$10$")).toBe(true);
        const match = await bcrypt.compare(password, hash);
        expect(match).toBe(true);
    });

    test("Different rounds", async () => {
        const password = "password123";
        const hash = await op.run(password, [4]);
        expect(hash.startsWith("$2a$04$")).toBe(true);
        const match = await bcrypt.compare(password, hash);
        expect(match).toBe(true);
    });

    test("Empty password", async () => {
        const password = "";
        const hash = await op.run(password, [10]);
        expect(hash).toBeDefined();
        const match = await bcrypt.compare(password, hash);
        expect(match).toBe(true);
    });
});
