const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const JSZip = require('jszip');
async function verifyArtifacts(directory, expected, evidence) {
  const files = [];
  for (const name of [`vscode-ts-chef-${expected.version}.vsix`, `ts-chef-docs-${expected.version}.zip`]) {
    const bytes = fs.readFileSync(path.join(directory, name));
    const zip = await JSZip.loadAsync(bytes, { checkCRC32: true });
    if (name.endsWith('.vsix')) {
      const manifest = JSON.parse(await zip.file('extension/package.json').async('string'));
      for (const key of ['name', 'publisher', 'version']) assert.equal(manifest[key], expected[key], `VSIX ${key} mismatch`);
      assert.ok((await zip.file('extension.vsixmanifest').async('string')).includes(`Version="${expected.version}"`));
    } else {
      for (const file of ['index.html', 'operation-catalog.html', 'quick-workbench.html']) assert.match(await zip.file(file).async('string'), /<html/);
    }
    files.push({ name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  if (evidence) {
    assert.equal(evidence.version, expected.version);
    assert.deepEqual(evidence.files, files, 'Artifacts differ from tested bytes');
    if (process.env.GITHUB_SHA) assert.equal(evidence.commit, process.env.GITHUB_SHA, 'Artifact commit differs from workflow commit');
  }
  return files;
}
async function main() {
  const directory = path.resolve(process.argv[2] || '.');
  const expected = require('../package.json');
  const filename = path.join(directory, 'release-artifacts.json');
  const write = process.argv.includes('--write');
  const files = await verifyArtifacts(directory, expected, write ? null : JSON.parse(fs.readFileSync(filename, 'utf8')));
  if (write) fs.writeFileSync(filename, JSON.stringify({ version: expected.version, commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), files }, null, 2));
  process.stdout.write('Release artifact versions, documentation and SHA-256 verified\n');
}
if (require.main === module) main().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
module.exports = { verifyArtifacts };
