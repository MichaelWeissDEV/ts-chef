const { _electron: electron } = require('playwright');
const { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } = require('@vscode/test-electron');
const { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');
const root = resolve(__dirname, '..');
async function main() {
  const profile = mkdtempSync(join(tmpdir(), 'ts-chef-ui-'));
  const screenshots = join(root, 'reports/v0.9.0-logs/ui');
  mkdirSync(screenshots, { recursive: true });
  const source = join(profile, 'source.txt');
  writeFileSync(source, 'SGVsbG8=');
  let app;
  let originalClipboard;
  const checks = [];
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
  try {
    const executablePath = process.env.VSCODE_EXECUTABLE || await downloadAndUnzipVSCode({ version: '1.110.0', timeout: 30000 });
    let developmentPath = root;
    if (process.env.TSCHEF_TEST_VSIX) {
      const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(executablePath);
      const install = spawnSync(cli, [...args, '--user-data-dir', join(profile, 'user'), '--extensions-dir', join(profile, 'extensions'),
        '--install-extension', resolve(process.env.TSCHEF_TEST_VSIX), '--force'], { env: { ...env, ELECTRON_RUN_AS_NODE: '1' }, stdio: 'inherit', timeout: 180000 });
      if (install.error) throw install.error;
      assert.equal(install.status, 0, 'VSIX installation failed');
      developmentPath = join(profile, 'harness');
      mkdirSync(developmentPath);
      writeFileSync(join(developmentPath, 'package.json'), JSON.stringify({ name: 'ts-chef-ui-harness', publisher: 'local', version: '1.0.0', engines: { vscode: '^1.85.0' } }));
    }
    const launchArgs = [
      '--user-data-dir', join(profile, 'user'), '--extensions-dir', join(profile, 'extensions'),
      '--extensionDevelopmentPath=' + developmentPath, '--disable-gpu', '--skip-welcome', '--skip-release-notes', '--disable-workspace-trust', source,
    ];
    app = await electron.launch({ executablePath, env, timeout: 60000, args: launchArgs });
    let page = await app.firstWindow();
    await page.locator(".monaco-workbench").waitFor();
    originalClipboard = await app.evaluate(({ clipboard }) => clipboard.readText());
    page.setDefaultTimeout(20000);
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    const command = async (text, opensPicker = false) => {
      await page.keyboard.press(`${modifier}+Shift+P`);
      const input = page.locator('.quick-input-widget input');
      await input.fill('>' + text);
      await page.locator('.quick-input-list .monaco-list-row').filter({ hasText: text }).first().click();
      if (!opensPicker) await page.locator('.quick-input-widget').waitFor({ state: 'hidden' });
    };
    await page.locator('.editor-group-container .monaco-editor .view-lines').first().click();
    await page.keyboard.press(`${modifier}+A`);
    await command('tschef: Open Quick Workbench');
    const getFrame = async () => {
      const end = Date.now() + 30000;
      while (Date.now() < end) {
        for (const frame of page.frames()) if (await frame.locator('#inputText').count()) return frame;
        await page.waitForTimeout(200);
      }
      throw new Error('Quick Workbench webview did not load');
    };
    let frame = await getFrame();
    const expectValue = async (selector, value) => {
      await frame.locator(selector).waitFor();
      const end = Date.now() + 20000;
      while (Date.now() < end) {
        if (await frame.locator(selector).inputValue() === value) return;
        await page.waitForTimeout(100);
      }
      assert.equal(await frame.locator(selector).inputValue(), value);
    };
    await frame.locator('#loadSelection').click();
    await expectValue('#inputText', 'SGVsbG8='); checks.push('selection while webview focused');
    await frame.locator('#searchOps').fill('From Base64');
    await frame.locator('[data-op="FromBase64"]').click();
    await frame.locator('#argsEditor input').first().waitFor();
    await expectValue('#resultText', 'Hello'); checks.push('click operation, parameters and automatic preview');
    await frame.locator('#replaceBtn').click();
    await page.locator('.tab').filter({ hasText: 'source.txt' }).first().click();
    await page.keyboard.press(`${modifier}+S`);
    const saveEnd = Date.now() + 10000;
    while (readFileSync(source, 'utf8') !== 'Hello' && Date.now() < saveEnd) await page.waitForTimeout(100);
    assert.equal(readFileSync(source, 'utf8'), 'Hello'); checks.push('real original-selection replacement');
    await frame.locator('#copyBtn').click();
    await frame.locator('#clearInput').click();
    await frame.locator('#loadClipboard').click();
    await expectValue('#inputText', 'Hello'); checks.push('real clipboard roundtrip');
    await frame.locator('#inputText').fill('abc');
    await frame.locator('#searchOps').fill('ROT13');
    await frame.locator('[data-op="ROT13"]').focus();
    await page.keyboard.press('Enter');
    const amount = frame.getByRole('spinbutton', { name: 'Amount', exact: true });
    await amount.fill('1');
    await frame.locator('#runBtn').focus(); await page.keyboard.press('Enter');
    await expectValue('#resultText', 'bcd'); checks.push('keyboard selection, edited number parameter, Run');
    await frame.locator('#newDocBtn').click();
    await page.locator('.monaco-editor').filter({ hasText: 'bcd' }).first().waitFor(); checks.push('new document');
    await frame.locator('#inputText').fill('abc');
    await amount.fill('');
    await frame.locator('#runBtn').click();
    await frame.locator('#statusMessage.error-message').waitFor();
    assert.equal(await frame.locator('#copyBtn').isDisabled(), true); checks.push('parameter error disables exports');
    await amount.fill('1');
    await frame.locator('.op-favorite').first().click();
    await frame.locator('.op-favorite.active').first().waitFor();
    await frame.locator('#runBtn').click();
    await expectValue('#resultText', 'bcd');
    await page.screenshot({ path: join(screenshots, 'quick-workbench.png') });
    await frame.locator('#closeBtn').click();
    await command('tschef: Open Quick Workbench');
    frame = await getFrame();
    await frame.locator('#searchOps').fill('ROT13');
    await frame.locator('[data-op="ROT13"] .op-favorite.active').waitFor(); checks.push('favorite and reopen');
    await frame.locator('#inputText').fill('');
    await frame.locator('[data-op="ROT13"]').click();
    await frame.locator('#runBtn').click();
    await expectValue('#resultText', '');
    const end = Date.now() + 10000;
    while (await frame.locator('#copyBtn').isDisabled() && Date.now() < end) await page.waitForTimeout(100);
    assert.equal(await frame.locator('#copyBtn').isDisabled(), false); checks.push('empty input and successful empty output');
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(800, 650));
    assert.equal(await frame.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    checks.push('small window without horizontal overflow');
    await page.screenshot({ path: join(screenshots, 'small-window.png') });
    for (const theme of ['Light Modern', 'Dark Modern', 'Dark High Contrast']) {
      await command('Preferences: Color Theme', true);
      await page.locator('.quick-input-list .monaco-list-row').filter({ hasText: 'Dark Modern' }).first().waitFor();
      await page.locator('.quick-input-widget input').fill(theme);
      await page.locator('.quick-input-list .monaco-list-row').filter({ hasText: theme }).first().click();
      await page.locator('.quick-input-widget').waitFor({ state: 'hidden' });
      await frame.locator('#inputText').waitFor();
      const themeClass = theme === 'Light Modern' ? 'vscode-light' : theme === 'Dark Modern' ? 'vscode-dark' : 'vscode-high-contrast';
      await frame.locator('body.' + themeClass).waitFor();
      assert.ok((await frame.locator('body').getAttribute('class')).includes(themeClass));
      await page.screenshot({ path: join(screenshots, theme.toLowerCase().replaceAll(' ', '-') + '.png') });
      checks.push('theme: ' + theme);
    }
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1400, 900));
    await command('View: Show tschef');
    const findFrameWith = async selector => {
      const end = Date.now() + 20000;
      while (Date.now() < end) {
        for (const candidate of page.frames()) if (await candidate.locator(selector).count() && await candidate.locator(selector).isVisible()) return candidate;
        await page.waitForTimeout(100);
      }
      throw new Error('Missing webview ' + selector);
    };
    const opsFrame = await findFrameWith('#search');
    await opsFrame.locator('#search').fill('From Base64');
    await opsFrame.locator('[data-op="FromBase64"] .op-add').click();
    const recipeFrame = await findFrameWith('#steps');
    await recipeFrame.locator('.step-name').filter({ hasText: 'From Base64' }).waitFor();
    checks.push('Operations View adds operation to Recipe View');
    await command('tschef: Open Pipeline Editor');
    const pipelineFrame = await findFrameWith('#pipeName');
    await pipelineFrame.locator('#operationSearch').fill('From Base64');
    await pipelineFrame.locator('[data-op-name="FromBase64"]').waitFor();
    await pipelineFrame.locator('#graphModeButton').click();
    await pipelineFrame.locator('#graphView:not(.hidden)').waitFor();
    checks.push('Pipeline Editor and graph view open');
    await page.screenshot({ path: join(screenshots, 'pipeline-editor.png') });
    await app.close();
    app = await electron.launch({ executablePath, env, timeout: 60000, args: launchArgs });
    page = await app.firstWindow();
    page.setDefaultTimeout(20000);
    await page.locator('.monaco-workbench').waitFor();
    await command('tschef: Open Quick Workbench');
    frame = await getFrame();
    await frame.locator('#searchOps').fill('ROT13');
    await frame.locator('[data-op="ROT13"] .op-favorite.active').waitFor();
    await expectValue('#inputText', '');
    assert.equal(await frame.locator('#copyBtn').isDisabled(), true);
    checks.push('favorites restored across full VS Code restart without retaining input/results');
    writeFileSync(join(root, 'reports/v0.9.0-logs/ui.json'), JSON.stringify({ checks, mode: process.env.TSCHEF_TEST_VSIX ? 'installed-vsix' : 'development', platform: process.platform, arch: process.arch, vscode: '1.110.0' }, null, 2));
    process.stdout.write(JSON.stringify({ checks }) + '\n');
  } catch (error) {
    if (app) for (const page of app.windows()) { process.stderr.write(JSON.stringify(await page.locator('.quick-input-list .monaco-list-row').allTextContents()) + '\n'); await page.screenshot({ path: join(screenshots, 'failure.png') }).catch(() => {}); }
    throw error;
  } finally {
    if (app) {
      if (originalClipboard !== undefined) await app.evaluate(({ clipboard }, text) => clipboard.writeText(text), originalClipboard).catch(() => {});
      await app.close();
    }
    rmSync(profile, { recursive: true, force: true });
  }
}
main().catch(error => { process.stderr.write(String(error.stack || error) + '\n'); process.exitCode = 1; });
