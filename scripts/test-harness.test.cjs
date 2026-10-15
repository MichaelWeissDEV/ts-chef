const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const JSZip = require('jszip');
const { sandboxArgs } = require('./vscode-test-environment.cjs');
const { validateIdentity, validateGates } = require('./release-policy.cjs');
const { verifyArtifacts } = require('./verify-release-artifacts.cjs');
test('sandbox exception is explicit, Linux-only and test-only', () => {
  assert.deepEqual(sandboxArgs('linux', {}), []);
  assert.deepEqual(sandboxArgs('linux', { TSCHEF_TEST_NO_SANDBOX: 'true' }), []);
  assert.deepEqual(sandboxArgs('linux', { TSCHEF_TEST_NO_SANDBOX: '1' }), ['--no-sandbox']);
  for (const platform of ['darwin', 'win32']) assert.deepEqual(sandboxArgs(platform, { TSCHEF_TEST_NO_SANDBOX: '1' }), []);
});
const identity = { version: '0.9.0', lockVersion: '0.9.0', rootVersion: '0.9.0', ref: 'refs/tags/v0.9.0', sha: 'a'.repeat(40), head: 'a'.repeat(40), tagCommit: 'a'.repeat(40) };
test('matching immutable tag succeeds', () => validateIdentity(identity));
for (const [name, patch] of Object.entries({ 'invalid tag': { ref: 'refs/heads/master' }, 'version mismatch': { ref: 'refs/tags/v0.8.1' }, 'wrong checkout': { head: 'b'.repeat(40) }, 'wrong tag commit': { tagCommit: 'b'.repeat(40) }, 'lock mismatch': { lockVersion: '0.8.1' } })) {
  test('release rejects ' + name, () => assert.throws(() => validateIdentity({ ...identity, ...patch })));
}
const gates = Object.fromEntries(['static-unit', 'integration', 'security', 'package'].map(name => [name, 'success']));
test('required release gates succeed together', () => validateGates(gates));
for (const name of Object.keys(gates)) for (const result of ['failure', 'skipped', 'cancelled', undefined]) {
  test(`release rejects ${name}: ${result}`, () => assert.throws(() => validateGates({ ...gates, [name]: result })));
}
test('artifact gate rejects missing VSIX/docs, wrong version and changed tested bytes', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-chef-artifact-gate-'));
  const expected = { name: 'vscode-ts-chef', publisher: 'michaelweiss', version: '0.9.0' };
  try {
    await assert.rejects(verifyArtifacts(dir, expected));
    const vsix = new JSZip();
    vsix.file('extension/package.json', JSON.stringify(expected));
    vsix.file('extension.vsixmanifest', '<Identity Version="0.9.0"/>');
    fs.writeFileSync(path.join(dir, 'vscode-ts-chef-0.9.0.vsix'), await vsix.generateAsync({ type: 'nodebuffer' }));
    await assert.rejects(verifyArtifacts(dir, expected));
    const docs = new JSZip();
    for (const name of ['index.html', 'operation-catalog.html', 'quick-workbench.html']) docs.file(name, '<html>test</html>');
    fs.writeFileSync(path.join(dir, 'ts-chef-docs-0.9.0.zip'), await docs.generateAsync({ type: 'nodebuffer' }));
    const files = await verifyArtifacts(dir, expected);
    const evidence = { version: '0.9.0', files, commit: process.env.GITHUB_SHA };
    await verifyArtifacts(dir, expected, evidence);
    vsix.file('extension/package.json', JSON.stringify({ ...expected, version: '0.8.1' }));
    fs.writeFileSync(path.join(dir, 'vscode-ts-chef-0.9.0.vsix'), await vsix.generateAsync({ type: 'nodebuffer' }));
    await assert.rejects(verifyArtifacts(dir, expected));
    vsix.file('extension/package.json', JSON.stringify(expected));
    vsix.file('extra', 'untested change');
    fs.writeFileSync(path.join(dir, 'vscode-ts-chef-0.9.0.vsix'), await vsix.generateAsync({ type: 'nodebuffer' }));
    await assert.rejects(verifyArtifacts(dir, expected, evidence));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('webview discovery tolerates detached unrelated frames but propagates real errors', async () => {
  const { findVisibleFrame } = require('./vscode-ui-driver.cjs');
  const detached = { isDetached: () => false, locator: () => ({ count: async () => { throw new Error('locator.count: Frame was detached'); } }) };
  const ready = { isDetached: () => false, locator: () => ({ count: async () => 1, isVisible: async () => true }) };
  assert.equal(await findVisibleFrame({ frames: () => [detached, ready] }, '#search', 1000), ready);
  const broken = { isDetached: () => false, locator: () => { throw new Error('Invalid selector'); } };
  await assert.rejects(findVisibleFrame({ frames: () => [broken] }, '#search', 1000), /Invalid selector/);
});

test('candidate environment strips inherited NODE_PATH instead of masking missing packaged runtimes', () => {
  const { createEnvironment } = require('./vscode-test-environment.cjs');
  const previous = process.env.NODE_PATH;
  process.env.NODE_PATH = '/unexpected-external-runtime';
  let context;
  try {
    context = createEnvironment('policy-unit');
    assert.equal(context.env.NODE_PATH, undefined);
    assert.equal(context.env.TSCHEF_EXPECTED_VERSION, require('../package.json').version);
  } finally {
    context?.cleanup();
    if (previous === undefined) delete process.env.NODE_PATH;
    else process.env.NODE_PATH = previous;
  }
});
