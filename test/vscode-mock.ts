/**
 * Minimal `vscode` API mock for unit-testing modules that import `vscode`.
 * Wired in via jest `moduleNameMapper` (see jest.config.js). Only the surface
 * actually used by the code under test is implemented; extend as needed.
 *
 * Tests drive behavior through the `__test` helpers and assert on the exported
 * jest spies (clipboardWrite, statusBarMessage).
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

export const clipboardWrite = jest.fn<void, [string]>();
export const statusBarMessage = jest.fn<void, [string, number?]>();
export const showInformationMessage = jest.fn(
  async (..._args: unknown[]): Promise<string | undefined> =>
    infoMessageResponse,
);

export const workspace = {
  getConfiguration: (_section?: string) => ({
    get: <T>(key: string, fallback: T): T =>
      (key in configValues ? (configValues[key] as T) : fallback),
  }),
};

export const window = {
  showInformationMessage,
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
  clipboardWrite.mockClear();
  statusBarMessage.mockClear();
  showInformationMessage.mockClear();
}

/** Set the value returned by `getConfiguration("tschef").get(key, …)`. */
export function __setConfig(key: string, value: unknown): void {
  configValues[key] = value;
}

/** Set the button label returned by `showInformationMessage`. */
export function __setInfoResponse(response: string | undefined): void {
  infoMessageResponse = response;
}
