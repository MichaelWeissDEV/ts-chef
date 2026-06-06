import { BcryptParse } from "../../src/chef/operations/BcryptParse";
import { OperationError } from "../../src/chef/errors/OperationError";

describe("BcryptParse", () => {
    const op = new BcryptParse();

    test("Parse valid hash", async () => {
        // Valid bcrypt hash is 60 chars
        const hash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgCX1n0E6Q6zIz6C96u/9y0Tf.T.";
        const result = await op.run(hash, []);
        expect(result).toContain("Rounds: 10");
        expect(result).toContain("Salt: $2a$10$N9qo8uLOickgx2ZMRZoMye");
        expect(result).toContain("Password hash: IjZAgCX1n0E6Q6zIz6C96u/9y0Tf.T.");
    });

    test("Parse valid hash with 12 rounds", async () => {
        const hash = "$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgCX1n0E6Q6zIz6C96u/9y0Tf.T.";
        const result = await op.run(hash, []);
        expect(result).toContain("Rounds: 12");
        expect(result).toContain("Salt: $2b$12$N9qo8uLOickgx2ZMRZoMye");
    });

    test("Invalid hash", async () => {
        await expect(op.run("invalid", [])).rejects.toThrow(OperationError);
    });
});
