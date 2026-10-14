const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const before = JSON.parse(fs.readFileSync('reports/v0.9.0-logs/audit-all.json'));
const after = JSON.parse(fs.readFileSync('reports/v0.9.0-logs/audit-after.json'));
const production = JSON.parse(fs.readFileSync('reports/v0.9.0-logs/audit-production.json'));
const oldLock = JSON.parse(execFileSync('git', ['show', 'HEAD:package-lock.json'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }));
const lock = require('../package-lock.json');
const packedSources = new Set();
for (const file of ['dist/extension.js.map', ...fs.readdirSync('dist/operation-chunks').filter(f => f.endsWith('.map')).map(f => 'dist/operation-chunks/' + f)]) {
  for (const source of JSON.parse(fs.readFileSync(file)).sources || []) packedSources.add(source.replaceAll('\\', '/'));
}
const inBundle = name => [...packedSources].some(source => source.includes('/node_modules/' + name + '/'));
const routes = {
  '@xmldom/xmldom': 'XPathExpression.run → DOMParser.parseFromString on imported XML; parser resource bugs plausible; fixed to patched minor.',
  'form-data': 'Transitive jsdom dependency. No direct form-data API use in src; package presence is not proof of multipart injection. Patched anyway.',
  'js-yaml': 'YAMLToJSON and parser operations; imported YAML reaches parsing. Existing limits do not replace upstream fixes; patched.',
  'linkify-it': 'RenderMarkdown with user-selectable linkification; imported Markdown can reach validators. Patched.',
  'markdown-it': 'RenderMarkdown, including linkify=true; patched without changing the operation API.',
  'moment': 'Moment Timezone operations. No explicit locale setter found in src; crafted object locale reachability was unproven. Patched.',
  'node-forge': 'RSAVerify was the sole repository-owned forge publicKey.verify call. Replaced by native PKCS#1 padding decoding and complete expected DigestInfo comparison. Extra NULL/SEQUENCE/OCTET children and wrong digest OIDs fail; canonical and omitted-NULL SHA identifiers pass. Forge hashing/PEM parsing remain for compatibility. No other src forge verification sink was found. The vulnerable library code remains bundled but the examined application verification route no longer invokes it.',
};
let output = `# v0.9.0 dependency audit\n\nAudit date: 2026-10-14. Baseline commit: 540e2c2db308a4cdf0de3031d461363706000fec.\n\n`;
output += `Raw evidence: [baseline all](v0.9.0-logs/audit-all.json), [baseline production](v0.9.0-logs/audit-production.json), [current all](v0.9.0-logs/audit-after.json), [current production](v0.9.0-logs/audit-production-after.json), [dependency tree](v0.9.0-logs/dependency-tree-after.json). Audit exit codes with findings are nonzero by design; no suppressions, force updates or package exclusions were used to hide findings.\n\n`;
output += `Baseline: ${JSON.stringify(before.metadata.vulnerabilities)}. After compatible updates: ${JSON.stringify(after.metadata.vulnerabilities)}. Counts represent npm package vulnerability records, including inherited dependency findings, not unique exploitable bugs. Production falls from seven flagged packages to node-forge alone. Critical handlebars was a development dependency and is patched.\n\n`;
output += `## Runtime findings\n\nStatic applicability is bounded by the named application calls, lockfile and production source maps. A dependency in the VSIX is not automatically an exploitable route. No root SECURITY.md was found by the skill resolver; docs/privacy-security.md supplies product context. No remote-host, adversarial operating-system or exhaustive transitive security scan is claimed.\n\n`;
for (const [name, finding] of Object.entries(production.vulnerabilities)) {
  const nodes = finding.nodes;
  output += `### ${name}\n\n- Severity: ${finding.severity}; affected range: \`${finding.range}\`.\n`;
  output += `- Installed baseline paths/versions: ${nodes.map(n => '\`' + n + '@' + oldLock.packages[n]?.version + '\`').join(', ')}.\n`;
  output += `- Current paths/versions: ${nodes.map(n => '\`' + n + '@' + lock.packages[n]?.version + '\`').join(', ')}.\n`;
  output += `- Scope: production, lazily loaded operation/runtime code; current bundled source-map evidence: **${inBundle(name) ? 'present' : 'not found'}**. VSIX stores bundled modules in dist chunks, rather than shipping every root dependency directory.\n`;
  output += `- Reachability and recommendation: ${routes[name]}\n`;
  output += `- Available npm fix: ${JSON.stringify(finding.fixAvailable)}. ${name === 'node-forge' ? 'No fixed upstream release reported. Keep the narrow verified application mitigation and re-audit when upstream ships a fix.' : 'Compatible versions selected by npm update within existing manifest ranges; full tests, typecheck, bundle and installation checks validate compatibility.'}\n`;
  output += `- Advisories: ${finding.via.filter(v => typeof v === 'object').map(v => '[' + v.title + '](' + v.url + ') (`' + v.range + '`)').join('; ')}.\n\n`;
}
output += `## All flagged baseline packages, including development tools\n\nDevelopment dependencies are excluded from the VSIX unless explicitly identified by a source map. Jest, ESLint, VSCE and documentation/build tools execute during local/CI builds only. Remaining braces findings concern deeply nested glob patterns; these tools receive repository-controlled fixed patterns, not extension-user input. Building attacker-controlled source already permits build-script execution in the same trust context; CI uses read-only tokens except the tag-only final publication job. No blanket claim of immunity for arbitrary unreviewed repositories is made.\n\nThe retained esbuild moderate advisory concerns its development HTTP server. This project uses esbuild bundle/watch commands and does not start that server. concat-md is not referenced by an npm script; legacy tooling remains a future cleanup item. No major Jest/VSCE migration was forced merely to change audit totals.\n\n| Package | Severity | Baseline installed paths / versions | Current status | Bundled in current VSIX | Advisory / inherited dependency | Fix and breaking risk |\n|---|---|---|---|---|---|---|\n`;
for (const [name, finding] of Object.entries(before.vulnerabilities)) {
  const versions = finding.nodes.map(n => n + '@' + (oldLock.packages[n]?.version || '?')).join('<br>');
  const advisory = finding.via.map(v => typeof v === 'string' ? v : '[' + v.title.replaceAll('|', '/') + '](' + v.url + ')').join('; ');
  const current = after.vulnerabilities[name];
  output += `| ${name} | ${finding.severity} | ${versions} | ${current ? current.severity + (name === 'node-forge' ? '; application path mitigated' : '; retained build-tool risk') : 'no current npm finding'} | ${inBundle(name) ? 'yes, bundled source' : 'no source-map evidence'} | ${advisory} | ${JSON.stringify(finding.fixAvailable)} |\n`;
}
output += `\nCurrent-only inherited development records (for example front-matter and ts-jest) are retained in audit-after.json; no package record is omitted from the raw artifacts. Required follow-up: re-audit upstream node-forge and upgrade development tools through a separately tested migration. An unmitigated reachable high/critical runtime finding remains a release blocker.\n`;
fs.writeFileSync('reports/v0.9.0-dependency-audit.md', output);
