/**
 * @fileoverview vscode-mock module for ts-chef extension
 * @package core
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

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
  // Real Selections extend Range; the controllers read `.start`/`.end`.
  get start(): Position {
    return this.orderedFirst()
      ? (this.anchor as Position)
      : (this.active as Position);
  }
  get end(): Position {
    return this.orderedFirst()
      ? (this.active as Position)
      : (this.anchor as Position);
  }
  private orderedFirst(): boolean {
    const a = this.anchor as Position;
    const b = this.active as Position;
    return a.line < b.line || (a.line === b.line && a.character <= b.character);
  }
}

export class Range {
  readonly start: Position;
  readonly end: Position;
  constructor(
    startLine: number,
    startChar: number,
    endLine: number,
    endChar: number,
  ) {
    this.start = new Position(startLine, startChar);
    this.end = new Position(endLine, endChar);
  }
}

export class CodeLens {
  constructor(
    public readonly range: unknown,
    public readonly command?: unknown,
  ) {}
}

export class EventEmitter<T> {
  private listeners: ((e: T) => void)[] = [];
  readonly event = (listener: (e: T) => void): { dispose(): void } => {
    this.listeners.push(listener);
    return { dispose: () => undefined };
  };
  fire(data: T): void {
    for (const l of this.listeners) l(data);
  }
  dispose(): void {
    this.listeners = [];
  }
}

export const ViewColumn = { Beside: 2 } as const;

// ── test-controlled state ─────────────────────────────────────────────────────
let configValues: Record<string, unknown> = {};
let infoMessageResponse: string | undefined = undefined;
let workspaceFolder: string | undefined = undefined;
let quickPickResponse: ((items: readonly unknown[]) => unknown) | undefined;
let lastQuickPickItems: readonly unknown[] = [];
let registeredCommands: Record<string, (...args: unknown[]) => unknown> = {};
let lastWebviewPanel: FakeWebviewPanel | undefined;

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
    return workspaceFolder ? [{ uri: { fsPath: workspaceFolder } }] : undefined;
  },
};

/** A controllable stand-in for `vscode.WebviewPanel`. */
export type FakeWebviewPanel = {
  webview: {
    html: string;
    onDidReceiveMessage: (cb: (msg: unknown) => void) => void;
  };
  onDidDispose: (cb: () => void) => void;
  reveal: jest.Mock;
  dispose: () => void;
  disposed: boolean;
  /** Simulate the webview posting a message back to the extension. */
  __fireMessage: (msg: unknown) => void;
};

export const window = {
  showInformationMessage,
  showWarningMessage,
  showQuickPick,
  setStatusBarMessage: (msg: string, timeout?: number) =>
    statusBarMessage(msg, timeout),
  createWebviewPanel: (..._args: unknown[]): FakeWebviewPanel => {
    let messageHandler: ((msg: unknown) => void) | undefined;
    let disposeHandler: (() => void) | undefined;
    const panel: FakeWebviewPanel = {
      webview: {
        html: "",
        onDidReceiveMessage: (cb) => {
          messageHandler = cb;
        },
      },
      onDidDispose: (cb) => {
        disposeHandler = cb;
      },
      reveal: jest.fn(),
      disposed: false,
      dispose: () => {
        panel.disposed = true;
        disposeHandler?.();
      },
      __fireMessage: (msg) => messageHandler?.(msg),
    };
    lastWebviewPanel = panel;
    return panel;
  },
};

export const languages = {
  registerCodeLensProvider: (..._args: unknown[]) => ({
    dispose: () => undefined,
  }),
};

export const commands = {
  registerCommand: (id: string, cb: (...args: unknown[]) => unknown) => {
    registeredCommands[id] = cb;
    return { dispose: () => undefined };
  },
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
  registeredCommands = {};
  lastWebviewPanel = undefined;
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

/** Invoke a command registered via `commands.registerCommand`. */
export function __invokeCommand(id: string, ...args: unknown[]): unknown {
  const cb = registeredCommands[id];
  if (!cb) throw new Error(`No command registered for "${id}"`);
  return cb(...args);
}

/** The most recently created webview panel, or undefined if none. */
export function __getWebviewPanel(): FakeWebviewPanel | undefined {
  return lastWebviewPanel;
}
