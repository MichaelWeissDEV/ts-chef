import { RemoveDiacritics } from "../../src/chef/operations/RemoveDiacritics";

describe("RemoveDiacritics", () => {
  const op = new RemoveDiacritics();

  test("Removes accents from French chars", () => {
    expect(op.run("café", [])).toBe("cafe");
  });

  test("Removes multiple diacritics", () => {
    expect(op.run("naïve résumé", [])).toBe("naive resume");
  });

  test("String without diacritics unchanged", () => {
    expect(op.run("hello world", [])).toBe("hello world");
  });

  test("German umlauts are stripped of diacritics", () => {
    expect(op.run("über", [])).toBe("uber");
  });

  test("Empty input", () => {
    expect(op.run("", [])).toBe("");
  });
});
