const fs = require('node:fs');
const assert = require('node:assert/strict');
const JSZip = require('jszip');
const path = require('node:path');
const { createHash } = require('node:crypto');
async function main() {
  const expected = require('../package.json');
  const filename = process.argv[2] || `vscode-ts-chef-${expected.version}.vsix`;
  const bytes = fs.readFileSync(filename);
  const zip = await JSZip.loadAsync(bytes, { checkCRC32: true });
  const manifest = JSON.parse(await zip.file('extension/package.json').async('string'));
  assert.equal(manifest.name, expected.name);
  assert.equal(manifest.publisher, expected.publisher);
  assert.equal(manifest.version, expected.version);
  assert.deepEqual(manifest.contributes, expected.contributes);
  assert.deepEqual(manifest.activationEvents, expected.activationEvents);
  const xml = await zip.file('extension.vsixmanifest').async('string');
  assert.ok(xml.includes(`Version="${expected.version}"`));
  const required = ['dist/extension.js', 'dist/quickWorkbench.js', 'dist/quickWorkbench.css',
    'dist/operation-chunks/manifest.json', 'assets/logo.jpg', 'media/icon.svg',
    'dist/node_modules/libbzip2-wasm/dist/libbzip2-wasm.js',
    'dist/node_modules/@alexaltea/capstone-js/dist/capstone.js', 'dist/node_modules/@alexaltea/capstone-js/dist/capstone.wasm',
    'dist/node_modules/@blu3r4y/lzma/index.js', 'dist/node_modules/@blu3r4y/lzma/src/lzma_worker.js',
    'dist/node_modules/jq-web/jq.js', 'dist/node_modules/jq-web/jq.wasm', 'dist/node_modules/node-md6/md6.js'];
  const chunks = JSON.parse(await zip.file('extension/dist/operation-chunks/manifest.json').async('string'));
  for (const id of Object.keys(chunks.chunks)) required.push(`dist/operation-chunks/${id}.js`);
  assert.equal(chunks.operationCount, 479);
  assert.equal(chunks.chunkCount, Object.keys(chunks.chunks).length);
  assert.equal(Object.keys(chunks.operations).length, chunks.operationCount);
  for (const name of ['libbzip2-wasm', '@alexaltea/capstone-js', '@blu3r4y/lzma', 'jq-web', 'node-md6']) {
    const licenses = fs.readdirSync(path.resolve(__dirname, '../node_modules', name)).filter(file => /^(LICENSE|COPYING|NOTICE)/i.test(file));
    if (name === 'node-md6') {
      // Upstream ships the CC0 waiver in README, not a separate LICENSE file.
      required.push('dist/node_modules/node-md6/README.md');
      assert.match(await zip.file('extension/dist/node_modules/node-md6/README.md').async('string'), /waived all copyright/);
    } else assert.ok(licenses.length, `Missing upstream license for ${name}`);
    for (const license of licenses) required.push(`dist/node_modules/${name}/${license}`);
    required.push(`dist/node_modules/${name}/package.json`);
  }
  for (const file of required) assert.ok(zip.file('extension/' + file), `Missing runtime resource: ${file}`);
  const files = Object.keys(zip.files).filter(name => !zip.files[name].dir);
  assert.ok(!files.includes('extension/release-artifacts.json'), 'Verification manifest must not ship inside the product');
  for (const file of files) {
    assert.ok(!/^extension\/(?:test|test-report|coverage|src|scripts|reports|\.vscode-test|\.git|\.aws|\.codex|\.agents)\//.test(file), `Forbidden development/secret path: ${file}`);
    assert.ok(!/(?:\.map$|\.env(?:\.|$)|\.vsix$|\.zip$|dist\/integration\.cjs$|dist\/integration-tests\/)/.test(file), `Forbidden package entry: ${file}`);
  }
  const report = { filename: path.basename(filename), version: manifest.version, identifier: manifest.publisher + '.' + manifest.name,
    sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, operations: chunks.operationCount, chunks: chunks.chunkCount, files };
  fs.mkdirSync('reports/v0.9.0-logs', { recursive: true });
  fs.writeFileSync('reports/v0.9.0-logs/vsix.json', JSON.stringify(report, null, 2));
  process.stdout.write(`Verified ${filename}: ${files.length} files, ${chunks.operationCount} operations, SHA256 ${report.sha256}\n`);
}
main().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
