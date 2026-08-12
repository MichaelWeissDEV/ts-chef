#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const registryPath = path.join(root, "src", "opsRegistry.ts");
const outputPath = path.join(root, "docs", "operation-catalog.md");
const source = fs.readFileSync(registryPath, "utf8");

const entryPattern = /\{\s*opName:\s*"([^"]+)",\s*displayName:\s*"([^"]+)",\s*module:\s*"([^"]+)"[\s\S]*?factory:\s*lazyFactory\([\s\S]*?\),\s*\}/g;
const operations = [];
let match;

while ((match = entryPattern.exec(source)) !== null) {
  operations.push({ opName: match[1], displayName: match[2], module: match[3] });
}

if (operations.length < 400) {
  throw new Error(`Parsed only ${operations.length} registry entries; refusing to replace the catalog.`);
}

operations.sort((left, right) =>
  left.module.localeCompare(right.module) ||
  left.displayName.localeCompare(right.displayName),
);

const groups = new Map();
for (const operation of operations) {
  const group = groups.get(operation.module) ?? [];
  group.push(operation);
  groups.set(operation.module, group);
}

const lines = [
  "# Complete operation catalog",
  "",
  `This page lists all **${operations.length} operations** registered by ts-chef. It is generated from \`src/opsRegistry.ts\`; run \`npm run docs:catalog\` after changing the registry. Operation display names are the names used in pipeline expressions and search.`,
  "",
  "```{admonition} Arguments and defaults",
  ":class: tip",
  "Open an operation in the Operations view or Pipeline Editor to see its current argument controls, allowed values, descriptions, and defaults. The source link is provided for implementation-level detail.",
  "```",
  "",
  "## Category summary",
  "",
  "| Category | Operations |",
  "| --- | ---: |",
];

for (const [moduleName, entries] of groups) {
  const anchor = moduleName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  lines.push(`| [${moduleName}](#${anchor}) | ${entries.length} |`);
}

for (const [moduleName, entries] of groups) {
  lines.push("", `## ${moduleName}`, "", "| Display name | Internal ID | Source |", "| --- | --- | --- |");
  for (const operation of entries) {
    const encodedPath = encodeURIComponent(operation.opName).replace(/%2F/g, "/");
    lines.push(
      `| \`${operation.displayName.replace(/\|/g, "\\|")}\` | \`${operation.opName}\` | [\`${operation.opName}.ts\`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/${encodedPath}.ts) |`,
    );
  }
}

lines.push(
  "",
  "## Search tips",
  "",
  "- Search by the visible display name, for example `From Base64`, `AES Decrypt`, or `JSON Beautify`.",
  "- Use the Operations view to filter the same catalog interactively and configure arguments.",
  "- Pipeline expressions are case-insensitive during lookup, but using the documented spelling makes shared definitions easier to read.",
  "- An implementation is loaded lazily only when its arguments or execution code is needed.",
  "",
);

fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${operations.length} operations in ${groups.size} categories to ${path.relative(root, outputPath)}.`);
