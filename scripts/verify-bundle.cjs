/**
 * Loads the production bundle with a permissive VS Code API stand-in.
 * This catches top-level module resolution failures before a VSIX is built.
 */

"use strict";

const Module = require("module");
const fs = require("fs");
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

const projectRoot = path.resolve(__dirname, "..");
const bundlePath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(projectRoot, "dist", "extension.js");
const maxMainBundleBytes = 3 * 1024 * 1024;
const mainBundleBytes = fs.statSync(bundlePath).size;
if (mainBundleBytes > maxMainBundleBytes) {
  throw new Error(
    `Production entry bundle is ${(mainBundleBytes / 1024 / 1024).toFixed(1)} MiB; ` +
      `the metadata-only budget is ${maxMainBundleBytes / 1024 / 1024} MiB.`,
  );
}
const originalLoad = Module._load;

try {
  Module._load = function loadWithVscodeMock(request) {
    if (request === "vscode") return vscode;
    return originalLoad.apply(this, arguments);
  };
  const extension = require(bundlePath);
  if (typeof extension.activate !== "function") {
    throw new Error("Production bundle does not export activate().");
  }
} finally {
  Module._load = originalLoad;
}

console.log(
  `Production bundle activation import verified (${(mainBundleBytes / 1024 / 1024).toFixed(1)} MiB).`,
);
