import {
  MAX_YARA_RULE_BYTES,
  MAX_YARA_SAMPLE_BYTES,
  yaraLimitError,
} from "../../src/chef/operations/YARARules";

describe("YARA safety limits", () => {
  test("accepts samples and rules at their limits", () => {
    expect(yaraLimitError(MAX_YARA_SAMPLE_BYTES, "rule ok {} ")).toBeUndefined();
    expect(
      yaraLimitError(0, "a".repeat(MAX_YARA_RULE_BYTES)),
    ).toBeUndefined();
  });

  test("rejects oversized samples before WASM initialisation", () => {
    expect(yaraLimitError(MAX_YARA_SAMPLE_BYTES + 1, "rule ok {}"))
      .toContain("64 MiB");
  });

  test("measures rule size as UTF-8 bytes", () => {
    expect(yaraLimitError(0, "é".repeat(MAX_YARA_RULE_BYTES / 2 + 1)))
      .toContain("2 MiB");
  });
});
