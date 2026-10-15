// Official downloader; every launch uses a disposable profile, never the user's profile.
const { spawnSync } = require('node:child_process');
const { mkdirSync, writeFileSync, readFileSync, existsSync } = require('node:fs');
const { createEnvironment } = require('./vscode-test-environment.cjs');
const { withLegacyRuntimeFixture } = require('./legacy-upgrade-fixture.cjs');
const { join, resolve } = require('node:path');
const { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } = require('@vscode/test-electron');
const root = resolve(__dirname, '..');

async function main() {
  const context = createEnvironment('host');
  const { profile, env, version, isolation, electronArgs, timeouts } = context;
  let phase = 'download';
  let exitCode, signal;
  let processNumber = 0;
  const execute = (command, args, extraEnv = {}) => {
    const result = spawnSync(command, args, { env: { ...env, ...extraEnv }, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: timeouts.process });
    const output = context.redact((result.stdout || '') + (result.stderr || ''));
    process.stdout.write(output);
    writeFileSync(join(context.reportDir, `process-${++processNumber}.log`), output);
    exitCode = result.status; signal = result.signal;
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`VS Code exited with ${result.status}, signal ${result.signal}`);
  };
  const upgrade = { baseline: null, candidate: null, failures: [], baselineRuntimeFixture: 'official 0.8.1 archive omits external runtimes; supplied only for historical baseline execution', candidateRuntimeFixture: false };
  try {
    const executable = process.env.VSCODE_EXECUTABLE || await downloadAndUnzipVSCode({ version, timeout: timeouts.download });

    let developmentPath = root;
    if (process.env.TSCHEF_TEST_VSIX) {
      phase = 'install';
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
            process.stdout.write('Legacy baseline only: providing omitted runtimes in the isolated profile; fixture is removed before candidate installation.\n');
            withLegacyRuntimeFixture(profile, join(root, 'dist/node_modules'), () => {
              execute(executable, [...isolation, '--extensionDevelopmentPath=' + developmentPath,
                '--extensionTestsPath=' + join(root, 'dist/integration-tests/upgradeSeed.js'), ...electronArgs]);
            });
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
    phase = 'harness-launch';
    execute(executable, [...isolation, '--extensionDevelopmentPath=' + developmentPath,
      '--extensionTestsPath=' + join(root, 'dist/integration-tests/run.js'), ...electronArgs]);
    if (process.env.TSCHEF_UPGRADE_FROM) {
      upgrade.candidate = 'passed';
      writeFileSync(resolve(root, 'reports/v0.9.0-logs/upgrade-summary.json'), JSON.stringify(upgrade, null, 2));
      if (upgrade.failures.length) throw new Error('Baseline upgrade gate failed; candidate recovery passed. See upgrade-summary.json');
    }
    const checks = JSON.parse(readFileSync(env.TSCHEF_INTEGRATION_REPORT, 'utf8'));
    context.report({ status: 'passed', phase, checksPassed: checks.checks, checksFailed: 0, exitCode, signal });
  } catch (error) {
    if (existsSync(env.TSCHEF_INTEGRATION_REPORT)) phase = 'extension-tests';
    context.report({ status: 'failed', phase, checksFailed: 1, exitCode, signal, errorClass: error.name, message: error.message, stack: error.stack });
    context.preserveLogs();
    throw error;
  } finally {
    context.cleanup();
  }
}
main().catch(error => { process.stderr.write(`Integration test failed: ${error.stack || error}\n`); process.exitCode = 1; });
