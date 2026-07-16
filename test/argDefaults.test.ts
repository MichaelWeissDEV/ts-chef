import { resolveDefaultArg } from "../src/commands/argDefaults";
import { GenerateUUID } from "../src/chef/operations/GenerateUUID";
import { Reverse } from "../src/chef/operations/Reverse";

describe("resolveDefaultArg", () => {
  test("honours defaultIndex for option arguments", () => {
    expect(
      resolveDefaultArg({
        name: "Mode",
        type: "option",
        value: ["first", "preferred"],
        defaultIndex: 1,
      }),
    ).toBe("preferred");
  });

  test("uses real operation defaults instead of the first menu item", () => {
    expect(new GenerateUUID().args.map(resolveDefaultArg)[0]).toBe("v4");
    expect(new Reverse().args.map(resolveDefaultArg)[0]).toBe("Character");
  });
});
