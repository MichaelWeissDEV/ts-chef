import { resolveVariableTemplates } from "../src/storage/variableResolution";
import type { ScopedVariable } from "../src/storage/store";

describe("stored variable resolution", () => {
  test("resolves explicit templates with workspace precedence in one load", () => {
    const loadAll = jest.fn<ScopedVariable[], []>(() => [
      { name: "key", value: "workspace", scope: "workspace" },
      { name: "key", value: "global", scope: "global" },
      { name: "other", value: "value", scope: "global" },
    ]);
    expect(
      resolveVariableTemplates("{{ key }} / {{other}} / {{missing}}", {
        loadAll,
      }),
    ).toBe("workspace / value / {{missing}}");
    expect(loadAll).toHaveBeenCalledTimes(1);
  });

  test("does not rewrite PowerShell, shell, or source-code dollar names", () => {
    const loadAll = jest.fn<ScopedVariable[], []>(() => [
      { name: "env", value: "MUTATED", scope: "global" },
      { name: "payload", value: "MUTATED", scope: "global" },
    ]);
    const sample = "$env:PATH; $payload; ${payload}; Get-Item $HOME";
    expect(resolveVariableTemplates(sample, { loadAll })).toBe(sample);
  });
});
