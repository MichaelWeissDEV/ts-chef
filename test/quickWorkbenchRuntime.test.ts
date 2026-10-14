import { JSDOM } from "jsdom";
import { QuickWorkbenchPanel, QuickWorkbenchDeps } from "../src/panels/quickWorkbench/QuickWorkbenchPanel";

function setup() {
  const run = jest.fn(async () => ({ result: "Hello" }));
  const deps = { resourceRoot: `${process.cwd()}/dist`, listOps: () => [{ opName: "FromBase64", displayName: "From Base64", module: "Encoding" }, { opName: "AES", displayName: "AES", module: "Cipher" }], argDefsFor: () => [], runOperation: run,
    isSafeForPreview: (name: string) => name === "FromBase64",
    getSelection: jest.fn(), getDocumentText: jest.fn(), getClipboardText: jest.fn(),
    replaceSelection: jest.fn(), createNewDocument: jest.fn() } as QuickWorkbenchDeps;
  const controller = new QuickWorkbenchPanel(deps);
  controller.initialize([{ opName: "FromBase64" }, { opName: "AES" }] as never);
  const posted: unknown[] = [];
  const dom = new JSDOM(controller["buildHtml"]("", "test"), { runScripts: "dangerously",
    beforeParse(window) { Object.assign(window, { acquireVsCodeApi: () => ({ postMessage: (msg: unknown) => posted.push(msg) }) }); } });
  const send = (data: unknown) => dom.window.dispatchEvent(new dom.window.MessageEvent("message", { data }));
  const input = dom.window.document.getElementById("inputText") as HTMLTextAreaElement;
  return { controller, run, dom, posted, send, input };
}

test("real webview script synchronizes input and selects Base64 without exceptions", () => {
  const { dom, posted, send, input } = setup();
  const errors: unknown[] = [];
  dom.window.addEventListener("error", (e) => errors.push(e.error));
  input.value = "SGVsbG8=";
  input.dispatchEvent(new dom.window.Event("input"));
  expect(posted).toContainEqual(expect.objectContaining({ type: "inputChanged", text: "SGVsbG8=" }));
  send({ type: "setOperations", operations: [{ opName: "FromBase64", displayName: "From Base64", module: "Encoding" }] });
  (dom.window.document.querySelector(".op-item") as HTMLElement).click();
  expect(errors).toEqual([]);
  (dom.window.document.getElementById("clearInput") as HTMLElement).click();
  expect(posted).toContainEqual(expect.objectContaining({ type: "clearInput" }));
  dom.window.close();
});

test("host discards a completion after input changes or clear", async () => {
  const { controller, run, dom } = setup();
  let finish!: (v: { result: string }) => void;
  run.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  await controller["handleMessage"]({ type: "inputChanged", text: "SGVsbG8=" });
  const pending = controller["handleMessage"]({ type: "applyOperation", opName: "FromBase64", args: {}, requestId: 1, mode: "manual" });
  await controller["handleMessage"]({ type: "clearInput" });
  finish({ result: "old" });
  await pending;
  expect(controller["resultState"]).toBeNull();
  dom.window.close();
});

test("host request generation is independent of UI request IDs and preview is plain text", async () => {
  const { controller, run, dom } = setup();
  run.mockResolvedValue({ result: "<script>&hello</script>" });
  await controller["handleMessage"]({ type: "inputChanged", text: "input" });
  await controller["handleMessage"]({ type: "applyOperation", opName: "FromBase64", args: {}, requestId: 42, mode: "manual" });
  expect(controller["resultState"]?.preview).toBe("<script>&hello</script>");
  dom.window.close();
});

test("host rejects unsafe automatic execution", async () => {
  const { controller, run, dom } = setup();
  await controller["handleMessage"]({ type: "inputChanged", text: "input" });
  await controller["handleMessage"]({ type: "applyOperation", opName: "AES", args: {}, requestId: 1, mode: "preview" });
  expect(run).not.toHaveBeenCalled();
  dom.window.close();
});

test("A finishing after B cannot overwrite B or update recents", async () => {
  const { controller, run, dom } = setup();
  let finish!: (v: { result: string }) => void;
  run.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  await controller["handleMessage"]({ type: "inputChanged", text: "input" });
  const pending = controller["handleMessage"]({ type: "applyOperation", opName: "FromBase64", args: {}, requestId: 7, mode: "manual" });
  run.mockResolvedValueOnce({ result: "B" });
  await controller["handleMessage"]({ type: "applyOperation", opName: "AES", args: {}, requestId: 8, mode: "manual" });
  finish({ result: "A" }); await pending;
  expect(controller["resultState"]?.text).toBe("B");
  expect(controller["state"].recents).toEqual(["AES"]);
  dom.window.close();
});

test("an error invalidates an earlier success, including empty successes", async () => {
  const { controller, run, dom } = setup();
  await controller["handleMessage"]({ type: "inputChanged", text: "input" });
  run.mockResolvedValueOnce({ result: "" });
  await controller["handleMessage"]({ type: "applyOperation", opName: "FromBase64", args: {}, requestId: 1, mode: "manual" });
  expect(controller["resultState"]?.success).toBe(true);
  run.mockRejectedValueOnce(new Error("failed"));
  await controller["handleMessage"]({ type: "applyOperation", opName: "FromBase64", args: {}, requestId: 2, mode: "manual" });
  expect(controller["resultState"]).toBeNull();
  dom.window.close();
});

test("oversized preview is rejected while explicit execution remains available", async () => {
  const { controller, run, dom } = setup();
  await controller["handleMessage"]({ type: "inputChanged", text: "a".repeat(65537) });
  await controller["handleMessage"]({ type: "applyOperation", opName: "FromBase64", args: {}, requestId: 1, mode: "preview" });
  expect(run).not.toHaveBeenCalled();
  await controller["handleMessage"]({ type: "applyOperation", opName: "FromBase64", args: {}, requestId: 2, mode: "manual" });
  expect(run).toHaveBeenCalledTimes(1);
  dom.window.close();
});

test("close and reopen discards pending work and accepts fresh UI counters", async () => {
  const { controller, run, dom } = setup();
  await controller.show();
  let finish!: (v: { result: string }) => void;
  run.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  await controller["handleMessage"]({ type: "inputChanged", text: "input" });
  const pending = controller["handleMessage"]({ type: "applyOperation", opName: "FromBase64", args: {}, requestId: 99, mode: "manual" });
  controller.dispose();
  await controller.show();
  controller.initialize([{ opName: "FromBase64" }] as never);
  finish({ result: "old" }); await pending;
  expect(controller["resultState"]).toBeNull();
  await controller["handleMessage"]({ type: "inputChanged", text: "input" });
  await controller["handleMessage"]({ type: "applyOperation", opName: "FromBase64", args: {}, requestId: 1, mode: "manual" });
  expect(controller["resultState"]?.text).toBe("Hello");
  controller.dispose(); dom.window.close();
});

test("an old clipboard read cannot overwrite newer manual input", async () => {
  const { controller, dom } = setup();
  let finish!: (text: string) => void;
  controller["deps"].getClipboardText = () => new Promise(resolve => { finish = resolve; });
  const pending = controller["handleMessage"]({ type: "loadClipboard", revision: 1 });
  await controller["handleMessage"]({ type: "inputChanged", text: "new", revision: 2 });
  finish("old"); await pending;
  expect(controller["inputContext"]?.text).toBe("new");
  await controller["handleMessage"]({ type: "inputChanged", text: "stale", revision: 1 });
  expect(controller["inputContext"]?.text).toBe("new");
  dom.window.close();
});

test("failed source reads invalidate exports without an escaping rejection", async () => {
  const { controller, dom } = setup();
  await controller["handleMessage"]({ type: "inputChanged", text: "input" });
  await controller["handleMessage"]({ type: "applyOperation", opName: "FromBase64", args: {}, requestId: 1, mode: "manual" });
  controller["deps"].getClipboardText = async () => { throw new Error("unavailable"); };
  await expect(controller["handleMessage"]({ type: "loadClipboard" })).resolves.toBeUndefined();
  expect(controller["resultState"]).toBeNull();
  expect(controller["inputContext"]).toBeNull();
  dom.window.close();
});

test("ready handshake creates an empty context distinct from a missing source", async () => {
  const { controller, run, dom } = setup();
  await controller["handleMessage"]({ type: "getOps" });
  await controller["handleMessage"]({ type: "applyOperation", opName: "FromBase64", args: {}, requestId: 1, mode: "manual" });
  expect(run).toHaveBeenCalledWith("FromBase64", "", []);
  await controller["handleMessage"]({ type: "loadDocument" });
  expect(controller["inputContext"]).toBeNull();
  expect(controller["resultState"]).toBeNull();
  dom.window.close();
});

test("oversized source input and unavailable clipboard never create a valid empty context", async () => {
  const { controller, run, dom } = setup();
  controller["deps"].getDocumentText = () => "x".repeat(16 * 1024 * 1024 + 1);
  await controller["handleMessage"]({ type: "loadDocument" });
  expect(controller["inputContext"]).toBeNull();
  await controller["handleMessage"]({ type: "applyOperation", opName: "FromBase64", args: {}, requestId: 1, mode: "manual" });
  expect(run).not.toHaveBeenCalled();
  controller["deps"].getClipboardText = async () => undefined;
  await controller["handleMessage"]({ type: "loadClipboard" });
  expect(controller["inputContext"]).toBeNull();
  dom.window.close();
});
