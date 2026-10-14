const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const manifest = require('../package.json');
const lock = require('../package-lock.json');
const semver = require('semver');
assert.equal(semver.valid(manifest.version), manifest.version, 'Package version must be canonical SemVer');
assert.equal(lock.version, manifest.version);
assert.equal(lock.packages[''].version, manifest.version);
assert.equal(manifest.publisher + '.' + manifest.name, 'michaelweiss.vscode-ts-chef');
assert.equal(manifest.main, './dist/extension.js');
assert.equal(new Set(manifest.contributes.commands.map(c => c.command)).size, manifest.contributes.commands.length);
if (process.argv.includes('--tag')) {
  const ref = process.env.GITHUB_REF || '';
  assert.ok(ref.startsWith('refs/tags/'), 'Release requires an existing tag ref, never a branch');
  assert.equal(ref.slice('refs/tags/'.length), 'v' + manifest.version, 'Tag and manifest must match exactly');
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), process.env.GITHUB_SHA, 'Release commit must match the trigger commit');
}
process.stdout.write(`Manifest and lockfile verified: ${manifest.version}\n`);
