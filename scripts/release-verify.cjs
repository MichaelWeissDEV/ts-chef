// Local only: this script contains no git mutations or publication commands.
const { spawnSync } = require('node:child_process');
const { mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const root = resolve(__dirname, '..');
const version = require('../package.json').version;
const vsix = resolve(root, `vscode-ts-chef-${version}.vsix`);
const results = [];
mkdirSync(resolve(root, 'reports/v0.9.0-logs'), { recursive: true });
const execute = (name, command, args, extraEnv = {}) => {
  const started = Date.now();
  const result = spawnSync(command, args, { cwd: root, env: { ...process.env, ...extraEnv }, stdio: 'inherit', timeout: 900000 });
  results.push({ name, exitCode: result.status, signal: result.signal, error: result.error?.message, milliseconds: Date.now() - started });
  writeFileSync(resolve(root, 'reports/v0.9.0-logs/release-verify.json'), JSON.stringify({ version, results, completed: false }, null, 2));
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${name} failed with ${result.status}`);
};
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
try {
  for (const script of ['verify:manifest', 'lint:check', 'typecheck', 'build']) execute(script, npm, ['run', script]);
  execute('unit', npm, ['test', '--', '--runInBand']);
  execute('dependency audit', npm, ['run', 'audit:dependencies']);
  execute('host integration', npm, ['run', 'test:integration']);
  execute('webview UI', npm, ['run', 'test:ui']);
  execute('documentation', npm, ['run', 'docs:html']);
  execute('documentation archive', npm, ['run', 'docs:archive']);
  execute('package', process.execPath, [resolve(require.resolve('@vscode/vsce/package.json'), '..', 'vsce'), 'package', '--no-dependencies', '--out', vsix]);
  execute('package content', process.execPath, [resolve(root, 'scripts/verify-vsix.cjs'), vsix]);
  execute('installed VSIX integration', process.execPath, [resolve(root, 'scripts/test-integration.cjs')], { TSCHEF_TEST_VSIX: vsix });
  execute('installed VSIX UI', process.execPath, [resolve(root, 'scripts/test-ui.cjs')], { TSCHEF_TEST_VSIX: vsix });
  writeFileSync(resolve(root, 'reports/v0.9.0-logs/release-verify.json'), JSON.stringify({ version, results, completed: true, artifacts: [vsix, resolve(root, `ts-chef-docs-${version}.zip`)] }, null, 2));
  process.stdout.write(`Local release verification succeeded. Artifacts: ${vsix}, ts-chef-docs-${version}.zip\n`);
} catch (error) {
  process.stderr.write(String(error.stack || error) + '\n'); process.exitCode = 1;
}
