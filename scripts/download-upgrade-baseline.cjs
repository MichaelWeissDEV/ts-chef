// Official immutable release asset; do not substitute a locally rebuilt baseline.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const expected = '2d1e6ddda1a1d69cf18202c2777811d07da953c7b09ef63a077f09c4b51ae12f';
async function main() {
  const target = path.resolve('.vscode-test/vscode-ts-chef-0.8.1.vsix');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (!fs.existsSync(target)) {
    const response = await fetch('https://github.com/MichaelWeissDEV/ts-chef/releases/download/v0.8.1/vscode-ts-chef-0.8.1.vsix', { signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error(`Baseline download failed: ${response.status}`);
    fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  }
  if (createHash('sha256').update(fs.readFileSync(target)).digest('hex') !== expected) throw new Error('Official upgrade baseline SHA-256 mismatch');
  process.stdout.write('Official v0.8.1 baseline verified: SHA-256 ' + expected + '\n');
}
main().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
