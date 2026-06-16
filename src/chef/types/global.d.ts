declare global {
  interface Window {
    sendStatusMessage(message: string): void;
  }
  interface WorkerGlobalScope {
    sendStatusMessage(message: string): void;
  }
  var sendStatusMessage: (message: string) => void;
}

export {};
