import { ExtractEmailAddresses } from "../../src/chef/operations/ExtractEmailAddresses";

describe("ExtractEmailAddresses", () => {
  const op = new ExtractEmailAddresses();

  test("Extracts a single email address", () => {
    const result = op.run("Contact us at test@example.com for help.", [
      false,
      false,
      false,
    ]);
    expect(result).toContain("test@example.com");
  });

  test("Extracts multiple email addresses", () => {
    const result = op.run("a@a.com and b@b.org", [false, false, false]);
    expect(result).toContain("a@a.com");
    expect(result).toContain("b@b.org");
  });

  test("Returns empty when no email found", () => {
    expect(op.run("no emails here", [false, false, false])).toBe("");
  });

  test("Empty input returns empty", () => {
    expect(op.run("", [false, false, false])).toBe("");
  });

  test("Email addresses are newline-separated", () => {
    const result = op.run("foo@a.com bar@b.com", [false, false, false]);
    expect(result.split("\n").length).toBe(2);
  });
});
