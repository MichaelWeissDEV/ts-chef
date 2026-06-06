import { Argon2 } from "../../src/chef/operations/Argon2";

describe("Argon2", () => {
    const op = new Argon2();
    const input = "password";
    const salt = { string: "somesalt", option: "UTF8" };

    test("Argon2i hashing (Encoded)", async () => {
        const result = await op.run(input, [salt, 3, 4096, 1, 32, "Argon2i", "Encoded hash"]);
        expect(result).toMatch(/^\$argon2i\$v=19\$m=4096,t=3,p=1\$/);
    });

    test("Argon2d hashing (Hex)", async () => {
        const result = await op.run(input, [salt, 3, 4096, 1, 32, "Argon2d", "Hex hash"]);
        expect(result).toMatch(/^[0-9a-f]{64}$/);
    });

    test("Argon2id hashing (Raw)", async () => {
        const result = await op.run(input, [salt, 3, 4096, 1, 32, "Argon2id", "Raw hash"]);
        expect(result.length).toBe(32);
    });

    test("Different salt formats (Hex)", async () => {
        const hexSalt = { string: "736f6d6573616c74", option: "Hex" };
        const result = await op.run(input, [hexSalt, 3, 4096, 1, 32, "Argon2i", "Encoded hash"]);
        expect(result).toMatch(/^\$argon2i\$v=19\$m=4096,t=3,p=1\$/);
    });

    test("Invalid memory cost", async () => {
        await expect(op.run(input, [salt, 3, 1, 1, 32, "Argon2i", "Encoded hash"]))
            .rejects.toThrow(/Error:/);
    });
});
