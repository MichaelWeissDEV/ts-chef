const { _electron: electron } = require('playwright');
const { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } = require('@vscode/test-electron');
const { writeFileSync, mkdirSync, readFileSync, appendFileSync } = require('node:fs');
const { createEnvironment } = require('./vscode-test-environment.cjs');
const driver = require('./vscode-ui-driver.cjs');
const { join, resolve } = require('node:path');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');
const root = resolve(__dirname, '..');
async function main() {
  const context = createEnvironment('ui');
  const { profile, env, version, isolation, electronArgs, timeouts } = context;
  let phase = 'download';
  const screenshots = context.reportDir;
  mkdirSync(screenshots, { recursive: true });
  const source = join(profile, 'source.txt');
  writeFileSync(source, 'SGVsbG8=');
  let app;
  let originalClipboard;
  const checks = [];
  try {
    const executablePath = process.env.VSCODE_EXECUTABLE || await downloadAndUnzipVSCode({ version, timeout: timeouts.download });
    let developmentPath = root;
    if (process.env.TSCHEF_TEST_VSIX) {
      phase = 'install';
      const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(executablePath);
      const install = spawnSync(cli, [...args, ...isolation,
        '--install-extension', resolve(process.env.TSCHEF_TEST_VSIX), '--force'], { env: { ...env, ELECTRON_RUN_AS_NODE: '1' }, stdio: 'inherit', timeout: timeouts.process });
      if (install.error) throw install.error;
      assert.equal(install.status, 0, 'VSIX installation failed');
      developmentPath = join(profile, 'harness');
      mkdirSync(developmentPath);
      writeFileSync(join(developmentPath, 'package.json'), JSON.stringify({ name: 'ts-chef-ui-harness', publisher: 'local', version: '1.0.0', engines: { vscode: '^1.85.0' } }));
    }
    const launchArgs = [
      ...isolation,
      '--extensionDevelopmentPath=' + developmentPath, ...electronArgs, source,
    ];
    const launch = async () => {
      const launched = await electron.launch({ executablePath, env, timeout: timeouts.launch, args: launchArgs });
      const log = text => appendFileSync(join(screenshots, 'electron.log'), context.redact(text));
      launched.process().stdout?.on('data', data => log(data.toString()));
      launched.process().stderr?.on('data', data => log(data.toString()));
      launched.process().on('exit', (code, signal) => log(JSON.stringify({ exitCode: code, signal }) + '\n'));
      const observe = page => {
        page.on('pageerror', error => log(String(error.stack || error) + '\n'));
        page.on('console', message => { if (message.type() === 'error') log(message.text() + '\n'); });
      };
      launched.on('window', observe);
      for (const page of launched.windows()) observe(page);
      return launched;
    };
    phase = 'launch';
    app = await launch();
    let page = await driver.workbench(app);
    originalClipboard = await app.evaluate(({ clipboard }) => clipboard.readText());
    page.setDefaultTimeout(timeouts.action);
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    const command = async (text, opensPicker = false) => {
      phase = 'command: ' + text;
      await driver.command(app, page, text, opensPicker);
    };
    await page.locator('.editor-group-container .monaco-editor .view-lines').first().click();
    await page.keyboard.press(`${modifier}+A`);
    await command('tschef: Open Quick Workbench');
    const getFrame = () => driver.findVisibleFrame(page, '#inputText', 30000);
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
    const findFrameWith = selector => driver.findVisibleFrame(page, selector);
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
    const restartAndCheck = async name => {
      phase = 'restart: ' + name;
      await app.close();
      app = undefined;
      app = await launch();
      page = await driver.workbench(app);
      await command('tschef: Open Quick Workbench');
      frame = await getFrame();
      await frame.locator('#searchOps').fill('ROT13');
      await frame.locator('[data-op="ROT13"] .op-favorite.active').waitFor();
      await expectValue('#inputText', '');
      await expectValue('#resultText', '');
      for (const selector of ['#copyBtn', '#replaceBtn', '#newDocBtn']) assert.equal(await frame.locator(selector).isDisabled(), true, selector);
      checks.push('restart privacy and favorite: ' + name);
    };
    await restartAndCheck('restored windows and high contrast theme');
    await frame.locator('[data-op="ROT13"]').click();
    await frame.locator('#inputText').fill('private successful input');
    await frame.locator('#runBtn').click();
    await expectValue('#resultText', 'cevingr fhpprffshy vachg');
    await restartAndCheck('successful operation');
    await frame.locator('[data-op="ROT13"]').click();
    await frame.getByRole('spinbutton', { name: 'Amount', exact: true }).fill('');
    await frame.locator('#runBtn').click();
    await frame.locator('#statusMessage.error-message').waitFor();
    await restartAndCheck('failed operation and edited arguments');
    await frame.locator('[data-op="ROT13"] .op-favorite').click();
    await frame.locator('[data-op="ROT13"] .op-favorite:not(.active)').waitFor();
    await frame.locator('[data-op="ROT13"] .op-favorite').click();
    await frame.locator('[data-op="ROT13"] .op-favorite.active').waitFor();
    await frame.locator('#inputText').fill('private'.repeat(15000));
    await restartAndCheck('changed favorite and large input with workbench open');
    context.report({ status: 'passed', phase, checksPassed: checks.length, checksFailed: 0, checks });
    process.stdout.write(JSON.stringify({ checks }) + '\n');
  } catch (error) {
    context.report({ status: 'failed', phase, checksPassed: checks.length, checksFailed: 1, checks, errorClass: error.name, message: error.message, stack: error.stack });
    if (app) await driver.diagnostics(app, screenshots).catch(() => {});
    context.preserveLogs();
    throw error;
  } finally {
    if (app) {
      if (originalClipboard !== undefined) await app.evaluate(({ clipboard }, text) => clipboard.writeText(text), originalClipboard).catch(() => {});
      try { await app.close(); }
      catch (error) {
        context.report({ status: 'failed', phase: 'cleanup', checksPassed: checks.length, checksFailed: 1, message: error.message });
        context.cleanup();
        throw error;
      }
    }
    context.cleanup();
  }
}
main().catch(error => { process.stderr.write(String(error.stack || error) + '\n'); process.exitCode = 1; });
