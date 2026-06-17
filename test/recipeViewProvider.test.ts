import {
  RecipeViewProvider,
  type RecipeStep,
  type RecipeViewDeps,
} from "../src/providers/recipeViewProvider";
import type { ArgConfig } from "../src/chef/Operation";

type View = Parameters<RecipeViewProvider["resolveWebviewView"]>[0];

function makeView(): {
  view: View;
  posted: Array<{ type: string; name?: string; steps?: unknown[] }>;
  fire: (msg: unknown) => void;
} {
  const posted: Array<{ type: string; name?: string; steps?: unknown[] }> = [];
  let handler: ((msg: unknown) => void) | undefined;
  const fake = {
    webview: {
      options: {},
      html: "",
      onDidReceiveMessage: (cb: (msg: unknown) => void) => {
        handler = cb;
      },
      postMessage: (m: { type: string }) => {
        posted.push(m);
        return Promise.resolve(true);
      },
    },
  };
  return {
    view: fake as unknown as View,
    posted,
    fire: (msg) => handler?.(msg),
  };
}

const ARG_DEFS: Record<string, ArgConfig[]> = {
  ToHex: [{ name: "Delimiter", type: "string", value: "Space" }],
  ToBase64: [],
};

function makeDeps(over: Partial<RecipeViewDeps> = {}): RecipeViewDeps {
  return {
    argDefsFor: (opName) => ARG_DEFS[opName],
    displayNameFor: (opName) =>
      opName === "ToHex"
        ? "To Hex"
        : opName === "ToBase64"
          ? "To Base64"
          : opName,
    apply: jest.fn(),
    save: jest.fn(),
    ...over,
  };
}

function lastSetState(posted: Array<{ type: string }>) {
  return [...posted].reverse().find((m) => m.type === "setState") as {
    type: string;
    name: string;
    steps: Array<{ opName: string; displayName: string; args: unknown[] }>;
  };
}

describe("RecipeViewProvider", () => {
  test("ready posts the current (empty) state", () => {
    const { view, posted, fire } = makeView();
    new RecipeViewProvider(makeDeps()).resolveWebviewView(view);
    fire({ type: "ready" });
    expect(lastSetState(posted)).toMatchObject({ name: "", steps: [] });
  });

  test("addOperation appends a step with default args and posts state", () => {
    const { view, posted, fire } = makeView();
    const provider = new RecipeViewProvider(makeDeps());
    provider.resolveWebviewView(view);
    fire({ type: "ready" });
    provider.addOperation("ToHex");
    const state = lastSetState(posted);
    expect(state.steps).toHaveLength(1);
    expect(state.steps[0]).toMatchObject({
      opName: "ToHex",
      displayName: "To Hex",
      args: ["Space"],
    });
  });

  test("addOperation for an unknown op adds nothing", () => {
    const { view, posted, fire } = makeView();
    const provider = new RecipeViewProvider(makeDeps());
    provider.resolveWebviewView(view);
    provider.addOperation("Nope");
    fire({ type: "ready" });
    expect(lastSetState(posted).steps).toHaveLength(0);
  });

  test("addOperation works before the view is resolved (canonical state)", () => {
    const { view, posted, fire } = makeView();
    const provider = new RecipeViewProvider(makeDeps());
    provider.addOperation("ToBase64");
    provider.resolveWebviewView(view);
    fire({ type: "ready" });
    expect(lastSetState(posted).steps).toHaveLength(1);
  });

  test("loadRecipe replaces steps + name and posts state", () => {
    const { view, posted, fire } = makeView();
    const provider = new RecipeViewProvider(makeDeps());
    provider.resolveWebviewView(view);
    const steps: RecipeStep[] = [{ opName: "ToHex", args: ["Comma"] }];
    provider.loadRecipe(steps, "my recipe");
    fire({ type: "ready" });
    const state = lastSetState(posted);
    expect(state.name).toBe("my recipe");
    expect(state.steps[0]).toMatchObject({ opName: "ToHex", args: ["Comma"] });
  });

  test("apply forwards the current recipe steps", () => {
    const apply = jest.fn();
    const provider = new RecipeViewProvider(makeDeps({ apply }));
    const steps: RecipeStep[] = [{ opName: "ToHex", args: ["Space"] }];
    provider.handleMessage({ type: "recipeChanged", steps });
    provider.handleMessage({ type: "apply" });
    expect(apply).toHaveBeenCalledWith(steps);
  });

  test("save forwards the trimmed name and current steps", () => {
    const save = jest.fn();
    const provider = new RecipeViewProvider(makeDeps({ save }));
    const steps: RecipeStep[] = [{ opName: "ToBase64", args: [] }];
    provider.handleMessage({ type: "recipeChanged", steps });
    provider.handleMessage({ type: "setName", name: "  hex  " });
    provider.handleMessage({ type: "save" });
    expect(save).toHaveBeenCalledWith("hex", steps);
  });

  test("loadRecipe deep-copies args so later edits don't mutate the source", () => {
    const provider = new RecipeViewProvider(makeDeps());
    const source: RecipeStep[] = [{ opName: "ToHex", args: ["Space"] }];
    provider.loadRecipe(source, "r");
    const apply = jest.fn();
    const provider2 = new RecipeViewProvider(makeDeps({ apply }));
    provider2.loadRecipe(source, "r");
    provider2.handleMessage({ type: "apply" });
    const passed = apply.mock.calls[0][0] as RecipeStep[];
    expect(passed[0].args).not.toBe(source[0].args);
  });
});
