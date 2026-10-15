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
  // Reject branch/manual dispatch before resolving any untrusted git ref.
  assert.equal(ref, 'refs/tags/v' + manifest.version, 'Release requires the exact version tag');
  require('./release-policy.cjs').validateIdentity({ version: manifest.version,
    lockVersion: lock.version, rootVersion: lock.packages[''].version,
    ref, sha: process.env.GITHUB_SHA,
    head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    tagCommit: execFileSync('git', ['rev-parse', ref + '^{commit}'], { encoding: 'utf8' }).trim() });
}
process.stdout.write(`Manifest and lockfile verified: ${manifest.version}\n`);
