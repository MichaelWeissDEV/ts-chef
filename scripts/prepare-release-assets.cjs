// Build publication assets from the verified package, never repackage here.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { verifyArtifacts } = require('./verify-release-artifacts.cjs');
async function main() {
  const root = path.resolve(__dirname, '..');
  const directory = path.resolve(process.argv[2] || root);
  const manifest = require('../package.json');
  const evidence = JSON.parse(fs.readFileSync(path.join(directory, 'release-artifacts.json'), 'utf8'));
  const files = await verifyArtifacts(directory, manifest, evidence);
  const notes = fs.readFileSync(path.join(root, `reports/v${manifest.version}-release-notes.md`), 'utf8');
  const base = `https://github.com/MichaelWeissDEV/ts-chef/releases/download/v${manifest.version}`;
  const downloads = files.map(file => `- [${file.name}](${base}/${file.name})`).join('\n');
  fs.writeFileSync(path.join(directory, 'release-notes.md'), notes + `\n\n## Downloads\n\n${downloads}\n\nInstall the VSIX using **Extensions: Install from VSIX...** in VS Code. Verify its SHA-256 against the attached SHA256SUMS file. Marketplace and Open VSX updates are published separately.\n`);
  files.push({ name: 'release-artifacts.json', sha256: createHash('sha256').update(fs.readFileSync(path.join(directory, 'release-artifacts.json'))).digest('hex') });
  fs.writeFileSync(path.join(directory, 'SHA256SUMS'), files.map(file => `${file.sha256}  ${file.name}`).join('\n') + '\n');
  process.stdout.write(`Prepared English release notes and checksums for ${manifest.version}\n`);
}
main().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
