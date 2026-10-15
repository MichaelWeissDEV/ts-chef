// Test-only Electron policy. Never imported by the extension or VS Code CLI.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const timeouts = Object.freeze({ download: 30000, launch: 60000, action: 20000, process: 180000 });
function sandboxArgs(platform = process.platform, env = process.env) {
  return platform === 'linux' && env.TSCHEF_TEST_NO_SANDBOX === '1' ? ['--no-sandbox'] : [];
}
function createEnvironment(suite) {
  const version = process.env.VSCODE_TEST_VERSION || '1.110.0';
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Use a fixed VS Code version');
  const mode = process.env.TSCHEF_TEST_VSIX ? (process.env.TSCHEF_UPGRADE_FROM ? 'upgrade' : 'installed-vsix') : 'development';
  const platform = process.platform === 'linux' ? 'ubuntu-24.04' : `macos-${process.arch}`;
  const run = process.env.TSCHEF_TEST_RUN || new Date().toISOString().replace(/[:.]/g, '-');
  if (!/^[A-Za-z0-9_-]+$/.test(run)) throw new Error('Invalid test run identifier');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), `ts-chef-${suite}-`));
  const reportDir = path.join(root, 'reports/test-results', platform, suite, mode, run);
  fs.mkdirSync(reportDir, { recursive: true });
  const env = { ...process.env, TSCHEF_EXPECTED_VERSION: require('../package.json').version, TSCHEF_INTEGRATION_REPORT: path.join(reportDir, 'checks.json') };
  delete env.ELECTRON_RUN_AS_NODE;
  const isolation = ['--user-data-dir', path.join(profile, 'user'), '--extensions-dir', path.join(profile, 'extensions')];
  const electronArgs = [...sandboxArgs(), '--disable-gpu', '--skip-welcome', '--skip-release-notes', '--disable-workspace-trust'];
  const metadata = { platform: process.platform, architecture: process.arch, nodeVersion: process.version, vscodeVersion: version, testSuite: suite, mode, sandbox: sandboxArgs().length ? 'explicit test-only no-sandbox' : 'enabled' };
  process.stdout.write(JSON.stringify(metadata) + '\n');
  // Redact ephemeral/private paths before persisting diagnostics.
  const redact = value => String(value).split(profile).join('<test-profile>').split(root).join('<repository>').split(os.homedir()).join('<home>');
  const report = data => fs.writeFileSync(path.join(reportDir, 'summary.json'), JSON.stringify({ ...metadata, timestamp: new Date().toISOString(), ...data }, (_key, value) => typeof value === 'string' ? redact(value) : value, 2));
  const preserveLogs = () => {
    const source = path.join(profile, 'user/logs');
    const copy = (dir, target) => {
      if (!fs.existsSync(dir)) return;
      fs.mkdirSync(target, { recursive: true });
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const from = path.join(dir, entry.name), to = path.join(target, entry.name);
        if (entry.isDirectory()) copy(from, to);
        else if (/\.(log|txt|json)$/.test(entry.name)) fs.writeFileSync(to, redact(fs.readFileSync(from, 'utf8')));
      }
    };
    copy(source, path.join(reportDir, 'vscode-logs'));
  };
  return { root, version, profile, reportDir, timeouts, env, isolation, electronArgs, metadata, report, preserveLogs, redact,
    cleanup: () => fs.rmSync(profile, { recursive: true, force: true }) };
}
module.exports = { sandboxArgs, createEnvironment, timeouts };
