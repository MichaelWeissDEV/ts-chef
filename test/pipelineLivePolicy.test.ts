import { isOperationSafeForLive } from "../src/panels/pipelineLivePolicy";

describe("pipeline live preview policy", () => {
  test.each([
    "YARARules",
    "GenerateRSAKeyPair",
    "Scrypt",
    "Magic",
    "FindReplace",
    // YAML aliases can expand a tiny document into a very large object before
    // the post-step output limit can measure it.
    "YAMLToJSON",
  ])("%s requires explicit Run", (opName) => {
    expect(isOperationSafeForLive(opName)).toBe(false);
  });

  test.each(["FromBase64", "ToHex", "Reverse", "JSONBeautify"])(
    "%s is safe for live preview",
    (opName) => {
      expect(isOperationSafeForLive(opName)).toBe(true);
    },
  );

  test("manualBake overrides the allowlist", () => {
    expect(isOperationSafeForLive("Reverse", true)).toBe(false);
  });
});
