/**
 * Builds the operation implementations into bounded, synchronously loadable
 * CommonJS chunks. The main extension bundle contains metadata only.
 */

"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const esbuild = require("esbuild");
const shardPlan = require("../src/operationChunkPlan.json");
const chunkOverrides = require("../src/operationChunkOverrides.json");

const projectRoot = path.resolve(__dirname, "..");
const registryPath = path.join(projectRoot, "src", "opsRegistry.ts");
const outputDirectory = path.join(projectRoot, "dist", "operation-chunks");

// qr-image 3.2.0 still uses Node's deprecated Buffer constructor. Modernise
// those calls while bundling so production chunks do not emit DEP0005 and
// numeric allocations retain their original semantics.
const moderniseQrImageBuffers = {
  name: "modernise-qr-image-buffers",
  setup(build) {
    build.onLoad(
      { filter: /node_modules[\\/]qr-image[\\/]lib[\\/].*\.js$/ },
      (args) => {
        let contents = fs.readFileSync(args.path, "utf8");
        contents = contents
          .replaceAll("new Buffer(4)", "Buffer.alloc(4)")
          .replaceAll("new Buffer(N)", "Buffer.alloc(N)")
          .replaceAll(
            "new Buffer(template.data_len)",
            "Buffer.alloc(template.data_len)",
          )
          .replaceAll("new Buffer((X + 1) * X)", "Buffer.alloc((X + 1) * X)")
          .replace(/new Buffer\(([^\n]+)\)/g, "Buffer.from($1)");
        if (contents.includes("new Buffer(")) {
          throw new Error(
            `Unconverted deprecated Buffer constructor in ${args.path}`,
          );
        }
        return { contents, loader: "js" };
      },
    );
  },
};

function stableHash(value) {
  let hash = 0x811c9dc5;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function safeModuleName(moduleName) {
  return moduleName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function chunkId(moduleName, opName) {
  if (chunkOverrides[opName]) return chunkOverrides[opName];
  const shards = shardPlan[moduleName] ?? 1;
  const shard = stableHash(opName) % shards;
  return `${safeModuleName(moduleName)}-${String(shard).padStart(2, "0")}`;
}

function registryEntries() {
  const source = fs.readFileSync(registryPath, "utf8");
  const pattern =
    /opName:\s*"([^"]+)"[\s\S]*?module:\s*"([^"]+)"[\s\S]*?factory:\s*lazyFactory\(\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\s*,?\s*\)/g;
  const entries = [...source.matchAll(pattern)].map((match) => ({
    opName: match[1],
    module: match[2],
    factoryOpName: match[3],
    factoryModule: match[4],
    constructorName: match[5],
  }));
  if (entries.length === 0) {
    throw new Error("No lazy operation registry entries were found.");
  }
  if (new Set(entries.map((entry) => entry.opName)).size !== entries.length) {
    throw new Error("The lazy operation registry contains duplicate names.");
  }
  for (const entry of entries) {
    if (
      entry.opName !== entry.factoryOpName ||
      entry.module !== entry.factoryModule
    ) {
      throw new Error(`Lazy factory metadata mismatch for ${entry.opName}.`);
    }
    const sourceFile = path.join(
      projectRoot,
      "src",
      "chef",
      "operations",
      `${entry.opName}.ts`,
    );
    if (!fs.existsSync(sourceFile)) {
      throw new Error(`Missing operation source: ${sourceFile}`);
    }
  }

  const registeredNames = new Set(entries.map((entry) => entry.opName));
  for (const [moduleName, shards] of Object.entries(shardPlan)) {
    if (!Number.isInteger(shards) || shards < 1 || shards > 64) {
      throw new Error(`Invalid shard count for ${moduleName}: ${shards}`);
    }
  }
  for (const [opName, id] of Object.entries(chunkOverrides)) {
    if (!registeredNames.has(opName)) {
      throw new Error(`Chunk override references unknown operation: ${opName}`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(id)) {
      throw new Error(`Invalid chunk override for ${opName}: ${id}`);
    }
  }
  return entries;
}

async function main() {
  const entries = registryEntries();
  const groups = new Map();
  for (const entry of entries) {
    const id = chunkId(entry.module, entry.opName);
    const group = groups.get(id) ?? [];
    group.push(entry);
    groups.set(id, group);
  }

  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "ts-chef-operation-chunks-"),
  );
  try {
    const entryPoints = {};
    for (const [id, group] of groups) {
      const imports = [];
      const properties = [];
      group.forEach((entry, index) => {
        const binding = `operation${index}`;
        const sourcePath = path
          .join(projectRoot, "src", "chef", "operations", entry.opName)
          .replaceAll(path.sep, "/");
        imports.push(
          `import * as ${binding} from ${JSON.stringify(sourcePath)};`,
        );
        properties.push(`${JSON.stringify(entry.opName)}: ${binding}`);
      });
      const entryFile = path.join(temporaryDirectory, `${id}.ts`);
      fs.writeFileSync(
        entryFile,
        `${imports.join("\n")}\nexport const operationModules = {${properties.join(",")}};\n`,
      );
      entryPoints[id] = entryFile;
    }

    fs.rmSync(outputDirectory, { recursive: true, force: true });
    await esbuild.build({
      entryPoints,
      outdir: outputDirectory,
      bundle: true,
      platform: "node",
      format: "cjs",
      target: "node18",
      sourcemap: true,
      define: { "require.resolve": "false" },
      plugins: [moderniseQrImageBuffers],
      logLevel: "info",
      external: [
        "vscode",
        "libbzip2-wasm",
        "@alexaltea/capstone-js",
        "@blu3r4y/lzma",
        "jq-web",
        "node-md6",
      ],
    });

    const manifest = {
      version: 1,
      operationCount: entries.length,
      chunkCount: groups.size,
      operations: Object.fromEntries(
        entries.map((entry) => [
          entry.opName,
          {
            chunk: chunkId(entry.module, entry.opName),
            module: entry.module,
            constructor: entry.constructorName,
          },
        ]),
      ),
      chunks: Object.fromEntries(
        [...groups].map(([id, group]) => [
          id,
          group.map((entry) => entry.opName).sort(),
        ]),
      ),
    };
    fs.writeFileSync(
      path.join(outputDirectory, "manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
    console.log(
      `Built ${manifest.operationCount} operations in ${manifest.chunkCount} lazy chunks.`,
    );
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
