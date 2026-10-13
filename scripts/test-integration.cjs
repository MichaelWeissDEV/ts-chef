const { spawnSync } = require('node:child_process');
const { mkdtempSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const root = resolve(__dirname, '..');
const profile = mkdtempSync(join(tmpdir(), 'ts-chef-host-'));
const executable = process.env.VSCODE_EXECUTABLE || '/Applications/Visual Studio Code.app/Contents/MacOS/Code';
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const result = spawnSync(executable, [
  '--user-data-dir', join(profile, 'user'), '--extensions-dir', join(profile, 'extensions'),
  '--extensionDevelopmentPath=' + root, '--extensionTestsPath=' + join(root, 'dist/integration.cjs'),
  '--disable-gpu', '--skip-welcome', '--skip-release-notes', '--disable-workspace-trust',
], { env, stdio: 'inherit', timeout: 120000 });
if (result.error) process.stderr.write(String(result.error) + '\n');
process.exit(result.status ?? 1);
