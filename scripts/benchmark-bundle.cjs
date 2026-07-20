/**
 * Measures cold production-bundle import cost in a fresh Node process.
 * Compare results only on the same machine and Node version.
 */

"use strict";

const Module = require("module");
const path = require("path");

let vscodeValue;
vscodeValue = new Proxy(
  function vscodeApiValue() {
    return vscodeValue;
  },
  {
    get(_target, property) {
      if (property === Symbol.toPrimitive) return () => 0;
      if (property === "then") return undefined;
      return vscodeValue;
    },
    construct() {
      return vscodeValue;
    },
    apply() {
      return vscodeValue;
    },
  },
);

const originalLoad = Module._load;
const vscodeNames = [
  "window",
  "workspace",
  "commands",
  "languages",
  "env",
  "Uri",
  "Position",
  "Range",
  "Selection",
  "MarkdownString",
  "Hover",
  "CodeLens",
  "EventEmitter",
  "TreeItem",
  "ThemeIcon",
  "ThemeColor",
  "ViewColumn",
  "TreeItemCollapsibleState",
  "OverviewRulerLane",
  "ConfigurationTarget",
  "StatusBarAlignment",
  "ProgressLocation",
  "TextEditorRevealType",
  "ExtensionMode",
];
const vscode = Object.fromEntries(
  vscodeNames.map((name) => [name, vscodeValue]),
);
const bundlePath = path.join(__dirname, "..", "dist", "extension.js");
if (global.gc) global.gc();
const before = process.memoryUsage();
const started = process.hrtime.bigint();
let extension;

try {
  Module._load = function loadWithVscodeMock(request) {
    if (request === "vscode") return vscode;
    return originalLoad.apply(this, arguments);
  };
  extension = require(bundlePath);
  if (typeof extension.activate !== "function") {
    throw new Error("Production bundle does not export activate().");
  }
} finally {
  Module._load = originalLoad;
}

if (global.gc) global.gc();
const eagerOperationChunks = extension.loadedOperationChunkIds();
const elapsedMs = Number(process.hrtime.bigint() - started) / 1_000_000;
const after = process.memoryUsage();
const mib = (bytes) => Math.round((bytes / 1024 / 1024) * 10) / 10;
const operationColdLoads = [];
for (const opName of [
  "ToBase64",
  "AESEncrypt",
  "JSONBeautify",
  "GenerateQRCode",
]) {
  if (global.gc) global.gc();
  const operationBefore = process.memoryUsage();
  const operationStarted = process.hrtime.bigint();
  extension.findOperationForDiagnostics(opName).factory();
  const operationElapsed =
    Number(process.hrtime.bigint() - operationStarted) / 1_000_000;
  if (global.gc) global.gc();
  const operationAfter = process.memoryUsage();
  operationColdLoads.push({
    opName,
    milliseconds: Math.round(operationElapsed * 10) / 10,
    rssDeltaMiB: mib(operationAfter.rss - operationBefore.rss),
    loadedChunks: extension.loadedOperationChunkIds(),
  });
}

console.log(
  JSON.stringify(
    {
      node: process.version,
      bundle: path.relative(process.cwd(), bundlePath),
      coldImportMs: Math.round(elapsedMs * 10) / 10,
      rssDeltaMiB: mib(after.rss - before.rss),
      heapUsedDeltaMiB: mib(after.heapUsed - before.heapUsed),
      rssAfterMiB: mib(after.rss),
      eagerOperationChunks: eagerOperationChunks.length,
      operationColdLoads,
    },
    null,
    2,
  ),
);
