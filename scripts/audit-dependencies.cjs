const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const root = require('node:path').resolve(__dirname, '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
function audit(production) {
  const run = spawnSync(npm, ['audit', ...(production ? ['--omit=dev'] : []), '--json'], { cwd: root, encoding: 'utf8', timeout: 120000 });
  if (run.error) throw run.error;
  const report = JSON.parse(run.stdout);
  fs.mkdirSync('reports/v0.9.0-logs', { recursive: true });
  fs.writeFileSync(`reports/v0.9.0-logs/audit-${production ? 'production-' : ''}final.json`, run.stdout);
  assert.ok(!report.error && report.metadata && report.vulnerabilities && (run.status === 0 || run.status === 1), 'Audit failed to return a complete advisory report');
  return report;
}
try {
  const all = audit(false), production = audit(true);
  assert.equal(all.metadata.vulnerabilities.critical, 0, 'Unreviewed critical dependency finding blocks release');
  const mitigations = [];
  for (const [name, finding] of Object.entries(production.vulnerabilities)) {
    if (finding.severity !== 'high' && finding.severity !== 'critical') continue;
    const knownMitigation = name === 'node-forge' && require('../node_modules/node-forge/package.json').version === '1.4.0' &&
      finding.via.every(advisory => typeof advisory === 'object' && advisory.url === 'https://github.com/advisories/GHSA-86w9-cpqp-85rv');
    assert.ok(knownMitigation, `Unreviewed ${finding.severity} runtime finding in ${name} blocks release`);
    // Keep the advisory visible. The preceding required RSA regression tests
    // prove the application-boundary mitigation; this is not an npm suppression.
    mitigations.push({ name, advisory: 'GHSA-86w9-cpqp-85rv', status: 'library remains vulnerable; application verification boundary mitigated', evidence: 'test/operations/RSAVerify.test.ts' });
  }
  fs.writeFileSync('reports/v0.9.0-logs/audit-gate.json', JSON.stringify({ all: all.metadata.vulnerabilities, production: production.metadata.vulnerabilities, mitigations }, null, 2));
  process.stdout.write(JSON.stringify({ all: all.metadata.vulnerabilities, production: production.metadata.vulnerabilities, mitigations }, null, 2) + '\n');
} catch (error) { process.stderr.write(String(error.stack || error) + '\n'); process.exitCode = 1; }
