const assert = require('node:assert/strict');
const semver = require('semver');
function validateIdentity({ version, lockVersion, rootVersion, ref, sha, head, tagCommit }) {
  assert.equal(semver.valid(version), version, 'Invalid SemVer');
  assert.equal(lockVersion, version, 'Lockfile version mismatch');
  assert.equal(rootVersion, version, 'Lockfile root version mismatch');
  assert.equal(ref, `refs/tags/v${version}`, 'Release requires the exact version tag');
  assert.match(sha || '', /^[a-f0-9]{40}$/, 'Invalid trigger commit');
  assert.equal(head, sha, 'Checkout differs from trigger commit');
  assert.equal(tagCommit, sha, 'Tag differs from trigger commit');
}
function validateGates(results) {
  for (const gate of ['static-unit', 'integration', 'security', 'package']) assert.equal(results[gate], 'success', `${gate} gate did not succeed`);
}
module.exports = { validateIdentity, validateGates };

if (require.main === module) validateGates(Object.fromEntries(Object.entries(JSON.parse(process.env.TSCHEF_GATE_RESULTS)).map(([name, job]) => [name, job.result])));
