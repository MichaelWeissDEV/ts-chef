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
  isBefore(other: Position): boolean {
    return (
      this.line < other.line ||
      (this.line === other.line && this.character < other.character)
    );
  }
  isAfter(other: Position): boolean {
    return other.isBefore(this);
  }
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
  constructor(start: Position, end: Position);
  constructor(startLine: number, startChar: number, endLine: number, endChar: number);
  constructor(
    startOrLine: Position | number,
    endOrChar: Position | number,
    endLine?: number,
    endChar?: number,
  ) {
    if (startOrLine instanceof Position && endOrChar instanceof Position) {
      this.start = startOrLine;
      this.end = endOrChar;
    } else {
      this.start = new Position(startOrLine as number, endOrChar as number);
      this.end = new Position(endLine as number, endChar as number);
    }
  }
  contains(position: Position): boolean {
    return !position.isBefore(this.start) && !position.isAfter(this.end);
  }
  intersection(other: Range): Range | undefined {
    const start = this.start.isAfter(other.start) ? this.start : other.start;
    const end = this.end.isBefore(other.end) ? this.end : other.end;
    return end.isBefore(start) ? undefined : new Range(start, end);
  }
}

export class MarkdownString {
  value: string;
  isTrusted: boolean | { enabledCommands: readonly string[] } | undefined;
  supportHtml = false;
  constructor(value = "", _supportThemeIcons?: boolean) {
    this.value = value;
  }
  appendMarkdown(value: string): MarkdownString {
    this.value += value;
    return this;
  }
  appendCodeblock(value: string, language = ""): MarkdownString {
    this.value += `\n\`\`\`${language}\n${value}\n\`\`\`\n`;
    return this;
  }
}

export class Hover {
  readonly contents: MarkdownString[];
  constructor(
    contents: MarkdownString,
    public readonly range?: Range,
  ) {
    this.contents = [contents];
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

export const TreeItemCollapsibleState = {
  None: 0,
  Collapsed: 1,
  Expanded: 2,
} as const;

export class TreeItem {
  label: string;
  description?: string;
  tooltip?: unknown;
  iconPath?: unknown;
  resourceUri?: unknown;
  contextValue?: string;
  command?: unknown;
  collapsibleState: number;
  constructor(label: string, collapsibleState = 0) {
    this.label = label;
    this.collapsibleState = collapsibleState;
  }
}

export class ThemeIcon {
  static readonly File = new ThemeIcon("file");
  constructor(public readonly id: string) {}
}

export class Uri {
  private constructor(
    public readonly scheme: string,
    public readonly fsPath: string,
  ) {}
  toString(): string {
    return `${this.scheme}://${this.fsPath}`;
  }
  static file(fsPath: string): Uri {
    return new Uri("file", fsPath);
  }
  static parse(value: string): Uri {
    const idx = value.indexOf("://");
    return idx >= 0
      ? new Uri(value.slice(0, idx), value.slice(idx + 3))
      : new Uri("file", value);
  }
}

// ── test-controlled state ─────────────────────────────────────────────────────
let configValues: Record<string, unknown> = {};
let infoMessageResponse: string | undefined = undefined;
let workspaceFolder: string | undefined = undefined;
let workspaceTrusted = true;
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
  get isTrusted() {
    return workspaceTrusted;
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
  activeTextEditor: undefined as unknown,
  visibleTextEditors: [] as unknown[],
  createTextEditorDecorationType: (_opts: unknown) => ({
    dispose: () => undefined,
  }),
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

export const OverviewRulerLane = { Left: 1, Center: 2, Right: 4, Full: 7 };

export const ConfigurationTarget = { Global: 1, Workspace: 2, WorkspaceFolder: 3 };

export class ThemeColor {
  constructor(public readonly id: string) {}
}

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
  workspaceTrusted = true;
  quickPickResponse = undefined;
  lastQuickPickItems = [];
  registeredCommands = {};
  lastWebviewPanel = undefined;
  clipboardWrite.mockClear();
  statusBarMessage.mockClear();
  showInformationMessage.mockClear();
  showWarningMessage.mockClear();
  showQuickPick.mockClear();
  window.activeTextEditor = undefined;
}

/** Set the active editor (a minimal `{ document: { uri } }` is enough). */
export function __setActiveEditor(editor: unknown): void {
  window.activeTextEditor = editor;
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

/** Set whether the mock workspace is trusted (Restricted Mode when false). */
export function __setWorkspaceTrusted(trusted: boolean): void {
  workspaceTrusted = trusted;
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
