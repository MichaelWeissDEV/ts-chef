import { pickScope } from "../src/commands/scopePicker";
import {
  __reset,
  __setQuickPickResponse,
  __getLastQuickPickItems,
  showQuickPick,
} from "./vscode-mock";

type ScopeItem = { label: string; scope: string };

beforeEach(() => __reset());

describe("pickScope", () => {
  test("lists the default scope first, labeled (default)", async () => {
    await pickScope("global", "Save x");
    const items = __getLastQuickPickItems() as ScopeItem[];
    expect(items[0].scope).toBe("global");
    expect(items[0].label).toContain("(default)");
    expect(items[1].scope).toBe("workspace");
    expect(items[1].label).not.toContain("(default)");
  });

  test("honours a workspace default ordering", async () => {
    await pickScope("workspace", "Save x");
    const items = __getLastQuickPickItems() as ScopeItem[];
    expect(items[0].scope).toBe("workspace");
    expect(items[0].label).toContain("(default)");
  });

  test("returns the picked scope", async () => {
    __setQuickPickResponse(
      (items) => (items as ScopeItem[]).find((i) => i.scope === "workspace"),
    );
    expect(await pickScope("global", "Save x")).toBe("workspace");
  });

  test("returns undefined when dismissed", async () => {
    __setQuickPickResponse(() => undefined);
    expect(await pickScope("global", "Save x")).toBeUndefined();
    expect(showQuickPick).toHaveBeenCalled();
  });
});
