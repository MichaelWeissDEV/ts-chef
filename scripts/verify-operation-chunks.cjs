/** Verify the real production bundle loads operation chunks on demand. */

"use strict";

const Module = require("node:module");
const fs = require("node:fs");
const path = require("node:path");
const manifest = require("../dist/operation-chunks/manifest.json");

const chunkDirectory = path.join(__dirname, "..", "dist", "operation-chunks");
const manifestOperationNames = Object.keys(manifest.operations).sort();
const chunkOperationNames = Object.values(manifest.chunks).flat().sort();
if (manifest.version !== 1)
  throw new Error("Unsupported chunk manifest version.");
if (manifestOperationNames.length !== manifest.operationCount) {
  throw new Error("Operation count does not match the manifest index.");
}
if (Object.keys(manifest.chunks).length !== manifest.chunkCount) {
  throw new Error("Chunk count does not match the manifest index.");
}
if (new Set(chunkOperationNames).size !== chunkOperationNames.length) {
  throw new Error("An operation occurs in more than one chunk.");
}
if (
  JSON.stringify(chunkOperationNames) !== JSON.stringify(manifestOperationNames)
) {
  throw new Error("Chunk contents do not exactly cover the operation index.");
}
const emittedChunkIds = fs
  .readdirSync(chunkDirectory)
  .filter((fileName) => fileName.endsWith(".js"))
  .map((fileName) => fileName.slice(0, -3))
  .sort();
const manifestChunkIds = Object.keys(manifest.chunks).sort();
if (JSON.stringify(emittedChunkIds) !== JSON.stringify(manifestChunkIds)) {
  throw new Error("Emitted JavaScript chunks do not match the manifest.");
}
for (const [opName, record] of Object.entries(manifest.operations)) {
  if (!manifest.chunks[record.chunk]?.includes(opName)) {
    throw new Error(`Manifest points ${opName} at the wrong chunk.`);
  }
}

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
const originalLoad = Module._load;

try {
  Module._load = function loadWithVscodeMock(request) {
    if (request === "vscode") return vscode;
    return originalLoad.apply(this, arguments);
  };
  const extension = require(path.join(__dirname, "..", "dist", "extension.js"));
  const findOperation = extension.findOperationForDiagnostics;
  const loadedChunks = extension.loadedOperationChunkIds;
  if (
    typeof findOperation !== "function" ||
    typeof loadedChunks !== "function"
  ) {
    throw new Error("Production bundle does not expose lazy-load diagnostics.");
  }
  if (loadedChunks().length !== 0) {
    throw new Error(
      "Importing the main bundle eagerly loaded operation chunks.",
    );
  }

  const representatives = [
    "ToBase64",
    "AESEncrypt",
    "Gzip",
    "JSONBeautify",
    "ExtractURLs",
    "SHA2",
    "BSONSerialise",
    "ParseX509Certificate",
    "GenerateQRCode",
    "Enigma",
  ];
  for (const opName of representatives) {
    const metadata = findOperation(opName);
    if (!metadata) throw new Error(`Missing operation metadata for ${opName}.`);
    const operation = metadata.factory();
    if (!operation || typeof operation.run !== "function") {
      throw new Error(`Lazy factory failed for ${opName}.`);
    }
  }

  const firstPass = loadedChunks();
  if (firstPass.length < 6 || firstPass.length > representatives.length) {
    throw new Error(
      `Unexpected representative chunk count: ${firstPass.length}.`,
    );
  }
  findOperation("ToBase64").factory();
  if (JSON.stringify(loadedChunks()) !== JSON.stringify(firstPass)) {
    throw new Error(
      "Repeated operation construction reloaded an existing chunk.",
    );
  }

  for (const id of firstPass) {
    if (!manifest.chunks[id]) {
      throw new Error(`Loaded chunk ${id} is absent from the build manifest.`);
    }
  }

  let validatedOperations = 0;
  for (const [id, opNames] of Object.entries(manifest.chunks)) {
    const chunk = require(path.join(chunkDirectory, `${id}.js`));
    for (const opName of opNames) {
      const record = manifest.operations[opName];
      const operationModule = chunk.operationModules?.[opName];
      const candidate =
        operationModule?.[record.constructor] ?? operationModule?.default;
      if (typeof candidate !== "function") {
        throw new Error(
          `Chunk ${id} does not export ${record.constructor} for ${opName}.`,
        );
      }
      const instance = new candidate();
      const metadata = findOperation(opName);
      if (!metadata || instance.name !== metadata.displayName) {
        throw new Error(`Production metadata mismatch for ${opName}.`);
      }
      validatedOperations += 1;
    }
  }
  if (validatedOperations !== manifest.operationCount) {
    throw new Error(
      `Validated ${validatedOperations} of ${manifest.operationCount} operations.`,
    );
  }
  console.log(
    `Lazy loading verified (zero eager chunks; ${manifest.chunkCount} chunks and ${validatedOperations} production factories validated).`,
  );
} finally {
  Module._load = originalLoad;
}
