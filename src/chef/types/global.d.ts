declare global {
  interface Window {
    sendStatusMessage(message: string): void;
  }
  interface WorkerGlobalScope {
    sendStatusMessage(message: string): void;
  }
  // eslint-disable-next-line no-var
  var sendStatusMessage: (message: string) => void;
}

export {};
