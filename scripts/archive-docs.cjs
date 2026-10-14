const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const JSZip = require('jszip');
async function main() {
  const root = path.resolve(__dirname, '..');
  const html = path.join(root, 'docs/_build/html');
  const zip = new JSZip();
  const add = dir => {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, item.name);
      if (item.isDirectory()) add(file);
      else if (item.isFile()) zip.file(path.relative(html, file).split(path.sep).join('/'), fs.readFileSync(file));
      else throw new Error('Unexpected documentation entry: ' + file);
    }
  };
  add(html);
  assert.ok(zip.file('index.html'));
  assert.ok(zip.file('operation-catalog.html'));
  const file = path.join(root, `ts-chef-docs-${require('../package.json').version}.zip`);
  fs.writeFileSync(file, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  const verified = await JSZip.loadAsync(fs.readFileSync(file), { checkCRC32: true });
  assert.match(await verified.file('index.html').async('string'), /<html/);
  process.stdout.write(`Verified documentation archive ${file} (${Object.keys(verified.files).length} entries)\n`);
}
main().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
