// --no-dependencies excludes root node_modules before .vscodeignore is applied.
// Ship the five external runtimes under dist/node_modules for normal Node resolution.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const packages = {
  'libbzip2-wasm': ['dist/libbzip2-wasm.js'],
  '@alexaltea/capstone-js': ['dist/capstone.js', 'dist/capstone.wasm'],
  '@blu3r4y/lzma': ['index.js', 'src/lzma_worker.js'],
  'jq-web': ['jq.js', 'jq.wasm'],
  'node-md6': ['md6.js', 'README.md'],
};
const targetRoot = path.join(root, 'dist/node_modules');
fs.rmSync(targetRoot, { recursive: true, force: true });
for (const [name, files] of Object.entries(packages)) {
  const source = path.join(root, 'node_modules', name);
  const licenses = fs.readdirSync(source).filter(name => /^(?:LICENSE|COPYING|NOTICE)/i.test(name));
  for (const file of ['package.json', ...files, ...licenses]) {
    const target = path.join(targetRoot, name, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(source, file), target);
  }
}
process.stdout.write('Vendored all five external runtimes, WASM and license files under dist/node_modules.\n');
