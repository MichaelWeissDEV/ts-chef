import { DisassembleX86 } from "../../src/chef/operations/DisassembleX86";

describe("DisassembleX86", () => {
  test("never silently turns non-empty machine code into empty output", () => {
    const operation = new DisassembleX86();
    expect(() =>
      operation.run("90c3", [
        "64",
        "Full x86 architecture",
        16,
        0,
        true,
        true,
      ]),
    ).toThrow(/backend is unavailable/i);
  });
});
