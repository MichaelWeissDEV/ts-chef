const { expect } = require('playwright/test');
// Reacquire a visible workbench for every process; firstWindow can be auxiliary.
async function workbench(app) {
  let selected;
  await expect.poll(async () => {
    for (const page of app.windows()) {
      if (!page.isClosed() && await page.locator('.monaco-workbench').isVisible().catch(() => false)) {
        selected = page;
        return true;
      }
    }
    return false;
  }, { timeout: 30000, message: 'No visible VS Code workbench window' }).toBe(true);
  selected.setDefaultTimeout(20000);
  await focusWorkbench(app, selected);
  return selected;
}
async function focusWorkbench(app, page) {
  await page.bringToFront();
  await app.browserWindow(page).then(window => window.evaluate(win => { if (win.isMinimized()) win.restore(); win.show(); win.focus(); }));
  await page.locator('.monaco-workbench').waitFor({ state: 'visible' });
  // Click the neutral status bar to move keyboard focus out of restored webviews.
  await page.locator('.monaco-workbench .part.statusbar').click({ position: { x: 4, y: 4 } });
  await expect.poll(() => page.evaluate(() => document.hasFocus()), { timeout: 5000, message: 'Workbench renderer lacks keyboard focus' }).toBe(true);
  const dialogs = page.locator('.monaco-dialog-box');
  if (await dialogs.isVisible()) throw new Error('Unexpected modal dialog blocks the workbench: ' + await dialogs.innerText());
}
async function command(app, page, text, opensPicker = false) {
  await focusWorkbench(app, page);
  await page.keyboard.press('Escape');
  const input = page.locator('.quick-input-widget input:visible');
  const shortcut = process.platform === 'darwin' ? 'Meta+Shift+P' : 'Control+Shift+P';
  await page.keyboard.press(shortcut);
  // Only retry when focus was demonstrably lost, never retry the command itself.
  try { await input.waitFor({ state: 'visible', timeout: 5000 }); }
  catch (error) {
    if (await page.evaluate(() => document.hasFocus())) throw error;
    await focusWorkbench(app, page);
    await page.keyboard.press(shortcut);
    await input.waitFor({ state: 'visible', timeout: 5000 });
  }
  await expect(input).toBeEditable();
  await input.fill('>' + text);
  const label = page.locator('.quick-input-list .monaco-list-row .label-name').getByText(text, { exact: true });
  await expect(label).toHaveCount(1);
  await label.click();
  if (!opensPicker) await page.locator('.quick-input-widget').waitFor({ state: 'hidden' });
}
async function findVisibleFrame(page, selector, timeout = 20000) {
  let selected;
  await expect.poll(async () => {
    // VS Code can replace unrelated iframe documents while views initialize.
    // Re-enumerate frames on every probe, retaining no detached frame handles.
    for (const frame of page.frames()) {
      if (frame.isDetached()) continue;
      try {
        const locator = frame.locator(selector);
        if (await locator.count() && await locator.isVisible() && !frame.isDetached()) {
          selected = frame;
          return true;
        }
      } catch (error) {
        if (!frame.isDetached() && !/Frame was detached|Execution context was destroyed/.test(error.message)) throw error;
      }
    }
    return false;
  }, { timeout, message: 'Missing visible webview: ' + selector }).toBe(true);
  return selected;
}
async function diagnostics(app, directory) {
  const fs = require('node:fs');
  const path = require('node:path');
  const windows = [];
  for (const [index, page] of app.windows().entries()) {
    const state = await page.evaluate(() => ({ title: document.title, focused: document.hasFocus(),
      workbench: !!document.querySelector('.monaco-workbench'),
      quickInput: [...document.querySelectorAll('.quick-input-widget')].map(el => ({ visible: !!el.getClientRects().length, text: el.textContent })),
      dialogs: [...document.querySelectorAll('.monaco-dialog-box')].map(el => el.textContent) })).catch(error => ({ error: String(error) }));
    windows.push({ ...state, url: page.url().replace(/file:\/\/[^?#]+/, 'file://<test-workbench>'), frames: page.frames().length });
    await page.screenshot({ path: path.join(directory, `failure-${index}.png`) }).catch(() => {});
  }
  fs.writeFileSync(path.join(directory, 'windows.json'), JSON.stringify({ windowCount: windows.length, windows }, null, 2));
  return windows;
}
module.exports = { workbench, command, diagnostics, findVisibleFrame };
