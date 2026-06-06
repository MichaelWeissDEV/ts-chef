interface OperationState {
  opList: Array<{ name: string; ingValues: unknown[] }>;
  [key: string]: unknown;
}

export function getLabelIndex(name: string, state: OperationState): number {
  return state.opList.findIndex((operation) => {
    return operation.name === "Label" && name === operation.ingValues[0];
  });
}
