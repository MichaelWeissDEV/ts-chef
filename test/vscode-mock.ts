/**
 * Minimal `vscode` API mock for unit-testing modules that import `vscode`.
 * Wired in via jest `moduleNameMapper` (see jest.config.js). Only the surface
 * actually used by the code under test is implemented; extend as needed.
 *
 * Tests drive behavior through the `__*` helpers and assert on the exported
 * jest spies (clipboardWrite, statusBarMessage, showWarningMessage, …).
 */

export class Position {
  constructor(
    public readonly line: number,
    public readonly character: number,
  ) {}
}

export class Selection {
  constructor(
    public readonly anchor: Position | number,
    public readonly active: Position | number,
  ) {}
  get isEmpty(): boolean {
    return JSON.stringify(this.anchor) === JSON.stringify(this.active);
  }
}

// ── test-controlled state ─────────────────────────────────────────────────────
let configValues: Record<string, unknown> = {};
let infoMessageResponse: string | undefined = undefined;
let workspaceFolder: string | undefined = undefined;
let quickPickResponse: ((items: readonly unknown[]) => unknown) | undefined;
let lastQuickPickItems: readonly unknown[] = [];

export const clipboardWrite = jest.fn<void, [string]>();
export const statusBarMessage = jest.fn<void, [string, number?]>();
export const showInformationMessage = jest.fn(
  async (..._args: unknown[]): Promise<string | undefined> =>
    infoMessageResponse,
);
export const showWarningMessage = jest.fn(
  async (..._args: unknown[]): Promise<string | undefined> => undefined,
);
export const showQuickPick = jest.fn(
  async (items: readonly unknown[]): Promise<unknown> => {
    lastQuickPickItems = items;
    return quickPickResponse ? quickPickResponse(items) : items[0];
  },
);

export const workspace = {
  getConfiguration: (_section?: string) => ({
    get: <T>(key: string, fallback: T): T =>
      key in configValues ? (configValues[key] as T) : fallback,
  }),
  get workspaceFolders() {
    return workspaceFolder
      ? [{ uri: { fsPath: workspaceFolder } }]
      : undefined;
  },
};

export const window = {
  showInformationMessage,
  showWarningMessage,
  showQuickPick,
  setStatusBarMessage: (msg: string, timeout?: number) =>
    statusBarMessage(msg, timeout),
};

export const env = {
  clipboard: { writeText: (text: string) => clipboardWrite(text) },
};

/** Reset all mock state + spies between tests. */
export function __reset(): void {
  configValues = {};
  infoMessageResponse = undefined;
  workspaceFolder = undefined;
  quickPickResponse = undefined;
  lastQuickPickItems = [];
  clipboardWrite.mockClear();
  statusBarMessage.mockClear();
  showInformationMessage.mockClear();
  showWarningMessage.mockClear();
  showQuickPick.mockClear();
}

/** Set the value returned by `getConfiguration("tschef").get(key, …)`. */
export function __setConfig(key: string, value: unknown): void {
  configValues[key] = value;
}

/** Set the button label returned by `showInformationMessage`. */
export function __setInfoResponse(response: string | undefined): void {
  infoMessageResponse = response;
}

/** Set (or clear) the first workspace folder's path. */
export function __setWorkspaceFolder(fsPath: string | undefined): void {
  workspaceFolder = fsPath;
}

/** Choose which item `showQuickPick` returns, given the items it was passed. */
export function __setQuickPickResponse(
  fn: (items: readonly unknown[]) => unknown,
): void {
  quickPickResponse = fn;
}

/** The items most recently passed to `showQuickPick`. */
export function __getLastQuickPickItems(): readonly unknown[] {
  return lastQuickPickItems;
}
