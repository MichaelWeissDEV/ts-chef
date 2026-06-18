/**
 * @fileoverview operationsViewProvider.test module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import {
  OperationsViewProvider,
  type OpInfo,
  type OperationsViewDeps,
} from "../src/providers/operationsViewProvider";

type View = Parameters<OperationsViewProvider["resolveWebviewView"]>[0];

function makeView(): {
  view: View;
  posted: unknown[];
  fire: (msg: unknown) => void;
} {
  const posted: unknown[] = [];
  let handler: ((msg: unknown) => void) | undefined;
  const fake = {
    webview: {
      options: {},
      html: "",
      onDidReceiveMessage: (cb: (msg: unknown) => void) => {
        handler = cb;
      },
      postMessage: (m: unknown) => {
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

const OPS: OpInfo[] = [
  { opName: "ToHex", displayName: "To Hex", module: "Encoding" },
  { opName: "ToBase64", displayName: "To Base64", module: "Encoding" },
];

function makeDeps(over: Partial<OperationsViewDeps> = {}): OperationsViewDeps {
  return {
    listOps: () => OPS,
    apply: jest.fn(),
    addToRecipe: jest.fn(),
    ...over,
  };
}

describe("OperationsViewProvider", () => {
  test("resolveWebviewView enables scripts and sets HTML", () => {
    const { view } = makeView();
    new OperationsViewProvider(makeDeps()).resolveWebviewView(view);
    expect(view.webview.options).toEqual({ enableScripts: true });
    expect(view.webview.html).toContain("Filter operations");
  });

  test("getOps posts the operation list back to the webview", () => {
    const { view, posted, fire } = makeView();
    new OperationsViewProvider(makeDeps()).resolveWebviewView(view);
    fire({ type: "getOps" });
    expect(posted).toEqual([{ type: "opsList", ops: OPS }]);
  });

  test("apply forwards the op name to the injected callback", () => {
    const apply = jest.fn();
    const { view, fire } = makeView();
    new OperationsViewProvider(makeDeps({ apply })).resolveWebviewView(view);
    fire({ type: "apply", opName: "ToHex" });
    expect(apply).toHaveBeenCalledWith("ToHex");
  });

  test("addToRecipe forwards the op name to the injected callback", () => {
    const addToRecipe = jest.fn();
    const { view, fire } = makeView();
    new OperationsViewProvider(makeDeps({ addToRecipe })).resolveWebviewView(
      view,
    );
    fire({ type: "addToRecipe", opName: "ToBase64" });
    expect(addToRecipe).toHaveBeenCalledWith("ToBase64");
  });

  test("getOps before the view is resolved does not throw", () => {
    const provider = new OperationsViewProvider(makeDeps());
    expect(() => provider.handleMessage({ type: "getOps" })).not.toThrow();
  });
});
