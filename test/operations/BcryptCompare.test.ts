import { BcryptCompare } from "../../src/chef/operations/BcryptCompare";
import bcrypt from "bcryptjs";

describe("BcryptCompare", () => {
  const op = new BcryptCompare();

  test("Match password", async () => {
    const password = "password123";
    const hash = await bcrypt.hash(password, 10);
    const result = await op.run(password, [hash]);
    expect(result).toBe("Match: " + password);
  });

  test("No match", async () => {
    const password = "password123";
    const hash = await bcrypt.hash("different_password", 10);
    const result = await op.run(password, [hash]);
    expect(result).toBe("No match");
  });

  test("Invalid hash format", async () => {
    // Some invalid formats might just return "No match" instead of throwing
    const result = await op.run("password", ["invalid_hash"]);
    expect(result).toBe("No match");
  });
});
