// Official downloader; every launch uses a disposable profile, never the user's profile.
const { spawnSync } = require('node:child_process');
const { mkdtempSync, rmSync, mkdirSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } = require('@vscode/test-electron');
const root = resolve(__dirname, '..');
const version = process.env.VSCODE_TEST_VERSION || '1.110.0';
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Use a fixed VS Code version');
async function main() {
  const profile = mkdtempSync(join(tmpdir(), 'ts-chef-host-'));
  const env = { ...process.env, TSCHEF_INTEGRATION_REPORT: resolve(root, 'reports/v0.9.0-logs/integration.json') };
  delete env.ELECTRON_RUN_AS_NODE;
  const execute = (command, args, extraEnv = {}) => {
    const result = spawnSync(command, args, { env: { ...env, ...extraEnv }, stdio: 'inherit', timeout: 180000 });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`VS Code exited with ${result.status}, signal ${result.signal}`);
  };
  const upgrade = { baseline: null, candidate: null, failures: [] };
  try {
    const executable = process.env.VSCODE_EXECUTABLE || await downloadAndUnzipVSCode({ version, timeout: 30000 });
    const isolation = ['--user-data-dir', join(profile, 'user'), '--extensions-dir', join(profile, 'extensions')];
    let developmentPath = root;
    if (process.env.TSCHEF_TEST_VSIX) {
      const [cli, ...cliArgs] = resolveCliArgsFromVSCodeExecutablePath(executable);
      developmentPath = join(profile, 'harness');
      mkdirSync(developmentPath);
      writeFileSync(join(developmentPath, 'package.json'), JSON.stringify({ name: 'ts-chef-test-harness', publisher: 'local', version: '1.0.0', engines: { vscode: '^1.85.0' } }));
      for (const vsix of [process.env.TSCHEF_UPGRADE_FROM, process.env.TSCHEF_TEST_VSIX].filter(Boolean)) {
        execute(cli, [...cliArgs, ...isolation, '--install-extension', resolve(vsix), '--force'], { ELECTRON_RUN_AS_NODE: '1' });
        if (vsix === process.env.TSCHEF_UPGRADE_FROM) {
          const globalDir = join(profile, 'user/User/globalStorage/michaelweiss.vscode-ts-chef');
          mkdirSync(globalDir, { recursive: true });
          const seed = {
            [join(globalDir, 'variables.json')]: JSON.stringify([{ name: 'upgrade-input', value: 'SGVsbG8=', description: 'Upgrade fixture' }]),
            [join(globalDir, 'pipelines.json')]: JSON.stringify([{ name: 'upgrade-probe', raw: 'From Base64', steps: [{ opName: 'FromBase64', args: ['A-Za-z0-9+/=', true, false] }] }]),
            [join(profile, 'user/User/settings.json')]: JSON.stringify({ 'tschef.pipelineResultAction': 'copy' }),
          };
          for (const [file, content] of Object.entries(seed)) writeFileSync(file, content);
          env.TSCHEF_UPGRADE_STORAGE = join(profile, 'upgrade-storage.json');
          writeFileSync(env.TSCHEF_UPGRADE_STORAGE, JSON.stringify(seed));
          try {
            execute(executable, [...isolation, '--extensionDevelopmentPath=' + developmentPath,
              '--extensionTestsPath=' + join(root, 'dist/integration-tests/upgradeSeed.js'), '--disable-gpu', '--skip-welcome', '--disable-workspace-trust']);
            upgrade.baseline = 'passed';
          } catch (error) {
            // Keep the failed baseline test as a failed gate, but still test recovery
            // and data preservation after upgrade. Never turn this failure green.
            upgrade.baseline = 'failed';
            upgrade.failures.push(String(error));
          }
        }
      }
    }
    execute(executable, [...isolation, '--extensionDevelopmentPath=' + developmentPath,
      '--extensionTestsPath=' + join(root, 'dist/integration-tests/run.js'), '--disable-gpu', '--skip-welcome',
      '--skip-release-notes', '--disable-workspace-trust']);
    if (process.env.TSCHEF_UPGRADE_FROM) {
      upgrade.candidate = 'passed';
      writeFileSync(resolve(root, 'reports/v0.9.0-logs/upgrade-summary.json'), JSON.stringify(upgrade, null, 2));
      if (upgrade.failures.length) throw new Error('Baseline upgrade gate failed; candidate recovery passed. See upgrade-summary.json');
    }
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
}
main().catch(error => { process.stderr.write(`Integration test failed: ${error.stack || error}\n`); process.exitCode = 1; });
