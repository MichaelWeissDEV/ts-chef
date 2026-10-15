const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
// The immutable 0.8.1 VSIX omitted externals. Supply them outside the installed
// extension through normal Node resolution, then remove them before upgrading.
function withLegacyRuntimeFixture(profile, runtimes, executeBaseline) {
  const target = path.join(profile, 'node_modules');
  assert.ok(!fs.existsSync(target), 'Legacy fixture must not overwrite existing modules');
  fs.cpSync(runtimes, target, { recursive: true });
  try { return executeBaseline(); }
  finally { fs.rmSync(target, { recursive: true, force: true }); }
}
module.exports = { withLegacyRuntimeFixture };
