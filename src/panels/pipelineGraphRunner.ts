import type { AnyInput } from "../chef/Operation";
import { runOpAsync } from "../commands/runner";
import {
  type PipelineGraphOperationNode,
  type PipelineGraphOutputNode,
  type PipelineGraphNode,
  validatePipelineGraph,
} from "./pipelineGraphModel";

export const LIVE_GRAPH_LIMITS = Object.freeze({
  maxInputSize: 256 * 1024,
  maxNodeOutputSize: 4 * 1024 * 1024,
  maxTotalOutputSize: 16 * 1024 * 1024,
});

/** Explicit runs are more permissive than previews, but remain memory-bounded. */
export const MANUAL_GRAPH_LIMITS = Object.freeze({
  maxInputSize: 64 * 1024 * 1024,
  maxNodeOutputSize: 64 * 1024 * 1024,
  maxTotalOutputSize: 256 * 1024 * 1024,
});

export type PipelineGraphErrorCode =
  | "OPERATION_NOT_ALLOWED"
  | "OPERATION_POLICY_ERROR"
  | "OPERATION_FAILED"
  | "NODE_OUTPUT_LIMIT"
  | "TOTAL_OUTPUT_LIMIT"
  | "VALUE_NOT_CLONEABLE"
  | "UPSTREAM_ERROR"
  | "OUTPUT_DISCONNECTED";

export interface PipelineGraphNodeError {
  code: PipelineGraphErrorCode;
  /** Node at which the root failure occurred. */
  nodeId: string;
  message: string;
}

export interface PipelineGraphOutputResult {
  outputId: string;
  name: string;
  /**
   * Present for successful outputs, including when the value is undefined.
   * Terminal fan-outs are read-only aliases of their source value; operations
   * still receive independent clones, so no branch can mutate a sibling.
   */
  value?: AnyInput;
  error?: PipelineGraphNodeError;
  /** Input, operation and output node IDs traversed by this branch. */
  path: string[];
}

export type PipelineGraphOperationPolicy =
  | ReadonlySet<string>
  | ((opName: string, node: PipelineGraphOperationNode) => boolean);

export interface PipelineGraphNodeEvent {
  nodeId: string;
  nodeType: PipelineGraphNode["type"];
  status: "running" | "success" | "error" | "blocked" | "disconnected";
  path: string[];
  /** Output-node events omit the value; consume it from the returned Map. */
  value?: AnyInput;
  error?: PipelineGraphNodeError;
}

export interface PipelineGraphRunOptions {
  /**
   * Live mode installs conservative defaults and requires an explicit operation
   * policy so network, filesystem and other side-effect operations cannot run
   * merely because the editor input changed.
   */
  live?: boolean;
  allowedOperations?: PipelineGraphOperationPolicy;
  maxInputSize?: number;
  maxNodeOutputSize?: number;
  maxTotalOutputSize?: number;
  signal?: AbortSignal;
  /** Dependency injection for tests and specialised hosts. */
  runOperation?: (
    opName: string,
    input: AnyInput,
    args: unknown[],
    node: PipelineGraphOperationNode,
  ) => AnyInput | Promise<AnyInput>;
  /** Receives bounded-lifecycle events and defensive result copies. */
  onNodeSettled?: (
    event: PipelineGraphNodeEvent,
  ) => void | Promise<void>;
}

export type PipelineGraphExecutionCode =
  | "LIVE_POLICY_REQUIRED"
  | "INVALID_LIMIT"
  | "INPUT_LIMIT"
  | "GRAPH_ABORTED";

export class PipelineGraphExecutionError extends Error {
  constructor(
    public readonly code: PipelineGraphExecutionCode,
    message: string,
  ) {
    super(message);
    this.name = "PipelineGraphExecutionError";
  }
}

interface SuccessfulState {
  value: AnyInput;
  path: string[];
}

interface FailedState {
  error: PipelineGraphNodeError;
  path: string[];
}

type NodeState = SuccessfulState | FailedState;

function isFailed(state: NodeState): state is FailedState {
  return "error" in state;
}

function executionError(
  code: PipelineGraphExecutionCode,
  message: string,
): PipelineGraphExecutionError {
  return new PipelineGraphExecutionError(code, message);
}

function configuredLimit(
  value: number | undefined,
  fallback: number,
  name: string,
): number {
  const selected = value ?? fallback;
  if (
    selected !== Number.POSITIVE_INFINITY &&
    (!Number.isSafeInteger(selected) || selected < 0)
  ) {
    throw executionError("INVALID_LIMIT", `${name} must be a non-negative safe integer`);
  }
  return selected;
}

function errorMessage(error: unknown): string {
  let message: string;
  if (error instanceof Error) message = error.message;
  else {
    try {
      message = String(error);
    } catch {
      message = "Unknown operation error";
    }
  }
  let safe = "";
  for (const character of message) {
    const code = character.charCodeAt(0);
    safe += code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d
      ? "�"
      : character;
    if (safe.length >= 2_000) break;
  }
  return safe.slice(0, 2_000);
}

/**
 * Estimate retained data without JSON serialisation. The walk is bounded by
 * `limit`, handles binary values directly, and does not recurse on the JS stack.
 */
export function graphValueSize(value: unknown, limit = Number.MAX_SAFE_INTEGER): number {
  const pending: unknown[] = [value];
  const seen = new WeakSet<object>();
  let size = 0;
  const add = (amount: number): boolean => {
    size += amount;
    return size > limit;
  };
  while (pending.length > 0) {
    const current = pending.pop();
    if (current === null || current === undefined) {
      if (add(1)) return size;
      continue;
    }
    if (typeof current === "string") {
      if (add(Buffer.byteLength(current, "utf8"))) return size;
      continue;
    }
    if (typeof current === "number" || typeof current === "bigint") {
      if (add(8)) return size;
      continue;
    }
    if (typeof current === "boolean") {
      if (add(1)) return size;
      continue;
    }
    if (typeof current !== "object") return limit + 1;
    if (current instanceof ArrayBuffer) {
      if (add(current.byteLength)) return size;
      continue;
    }
    if (
      typeof SharedArrayBuffer !== "undefined" &&
      current instanceof SharedArrayBuffer
    ) {
      if (add(current.byteLength)) return size;
      continue;
    }
    if (ArrayBuffer.isView(current)) {
      if (add(current.byteLength)) return size;
      continue;
    }
    if (seen.has(current)) {
      if (add(8)) return size;
      continue;
    }
    seen.add(current);
    if (Array.isArray(current)) {
      if (add(current.length)) return size;
      for (let index = 0; index < current.length; index += 1) {
        pending.push(current[index]);
      }
      continue;
    }
    if (current instanceof Map) {
      if (add(current.size * 2)) return size;
      for (const [key, item] of current) pending.push(key, item);
      continue;
    }
    if (current instanceof Set) {
      if (add(current.size)) return size;
      for (const item of current) pending.push(item);
      continue;
    }
    let descriptors: Record<string, PropertyDescriptor>;
    try {
      descriptors = Object.getOwnPropertyDescriptors(current);
    } catch {
      return limit + 1;
    }
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (!("value" in descriptor)) return limit + 1;
      if (add(Buffer.byteLength(key, "utf8"))) return size;
      pending.push(descriptor.value);
    }
  }
  return size;
}

function fallbackClone(value: unknown, seen = new WeakMap<object, unknown>()): unknown {
  if (value === null || typeof value !== "object") return value;
  const existing = seen.get(value);
  if (existing !== undefined) return existing;
  if (value instanceof ArrayBuffer) return value.slice(0);
  if (
    typeof SharedArrayBuffer !== "undefined" &&
    value instanceof SharedArrayBuffer
  ) {
    const result = new ArrayBuffer(value.byteLength);
    new Uint8Array(result).set(new Uint8Array(value));
    return result;
  }
  if (ArrayBuffer.isView(value)) {
    const copied = Uint8Array.from(
      new Uint8Array(value.buffer, value.byteOffset, value.byteLength),
    );
    if (value instanceof DataView) return new DataView(copied.buffer);
    if (Buffer.isBuffer(value)) return Buffer.from(copied);
    const bytesPerElement =
      (value as unknown as { BYTES_PER_ELEMENT?: number }).BYTES_PER_ELEMENT ?? 1;
    const Constructor = value.constructor as unknown as new (
      buffer: ArrayBuffer,
      byteOffset: number,
      length: number,
    ) => ArrayBufferView;
    return new Constructor(copied.buffer, 0, value.byteLength / bytesPerElement);
  }
  if (Array.isArray(value)) {
    const result: unknown[] = [];
    seen.set(value, result);
    for (const item of value) result.push(fallbackClone(item, seen));
    return result;
  }
  if (value instanceof Map) {
    const result = new Map<unknown, unknown>();
    seen.set(value, result);
    for (const [key, item] of value) {
      result.set(fallbackClone(key, seen), fallbackClone(item, seen));
    }
    return result;
  }
  if (value instanceof Set) {
    const result = new Set<unknown>();
    seen.set(value, result);
    for (const item of value) result.add(fallbackClone(item, seen));
    return result;
  }
  if (value instanceof Date) return new Date(value.getTime());
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new Error("value contains an unsupported object type");
  }
  const result: Record<string, unknown> = {};
  seen.set(value, result);
  for (const [key, descriptor] of Object.entries(
    Object.getOwnPropertyDescriptors(value),
  )) {
    if (!("value" in descriptor)) throw new Error("value contains an accessor");
    result[key] = fallbackClone(descriptor.value, seen);
  }
  return result;
}

function containsSharedMemory(value: unknown): boolean {
  if (typeof SharedArrayBuffer === "undefined") return false;
  const pending: unknown[] = [value];
  const seen = new WeakSet<object>();
  while (pending.length > 0) {
    const current = pending.pop();
    if (current === null || typeof current !== "object") continue;
    if (current instanceof SharedArrayBuffer) return true;
    if (ArrayBuffer.isView(current) && current.buffer instanceof SharedArrayBuffer) {
      return true;
    }
    if (seen.has(current)) continue;
    seen.add(current);
    if (current instanceof Map) {
      for (const [key, item] of current) pending.push(key, item);
      continue;
    }
    if (current instanceof Set) {
      for (const item of current) pending.push(item);
      continue;
    }
    let descriptors: Record<string, PropertyDescriptor>;
    try {
      descriptors = Object.getOwnPropertyDescriptors(current);
    } catch {
      return true;
    }
    for (const descriptor of Object.values(descriptors)) {
      if (!("value" in descriptor)) return true;
      pending.push(descriptor.value);
    }
  }
  return false;
}

/** Clone data before every branch so an operation cannot mutate a sibling. */
export function cloneGraphValue<T extends AnyInput>(value: T): T {
  if (containsSharedMemory(value)) return fallbackClone(value) as T;
  const clone = (
    globalThis as unknown as { structuredClone?: <V>(input: V) => V }
  ).structuredClone;
  if (clone) return clone(value);
  return fallbackClone(value) as T;
}

function nodeError(
  code: PipelineGraphErrorCode,
  nodeId: string,
  message: string,
): PipelineGraphNodeError {
  return { code, nodeId, message };
}

function operationAllowed(
  policy: PipelineGraphOperationPolicy | undefined,
  node: PipelineGraphOperationNode,
): boolean {
  if (!policy) return true;
  if (typeof policy !== "function") return policy.has(node.opName);
  const policyNode: PipelineGraphOperationNode = {
    ...node,
    args: cloneGraphValue(node.args as AnyInput) as PipelineGraphOperationNode["args"],
  };
  return policy(node.opName, policyNode);
}

function checkAbort(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw executionError("GRAPH_ABORTED", "Pipeline graph execution was cancelled");
  }
}

/**
 * Execute all input-reachable branches in stable topological order. Operations
 * are sequential by design: this makes live previews deterministic while still
 * isolating failures to descendants of the failed branch.
 */
export async function runPipelineGraph(
  graph: unknown,
  input: AnyInput,
  options: PipelineGraphRunOptions = {},
): Promise<Map<string, PipelineGraphOutputResult>> {
  const validated = validatePipelineGraph(graph);
  if (options.live && !options.allowedOperations) {
    throw executionError(
      "LIVE_POLICY_REQUIRED",
      "Live graph execution requires an explicit allowedOperations policy",
    );
  }
  const maxInputSize = configuredLimit(
    options.maxInputSize,
    options.live
      ? LIVE_GRAPH_LIMITS.maxInputSize
      : MANUAL_GRAPH_LIMITS.maxInputSize,
    "maxInputSize",
  );
  const maxNodeOutputSize = configuredLimit(
    options.maxNodeOutputSize,
    options.live
      ? LIVE_GRAPH_LIMITS.maxNodeOutputSize
      : MANUAL_GRAPH_LIMITS.maxNodeOutputSize,
    "maxNodeOutputSize",
  );
  const maxTotalOutputSize = configuredLimit(
    options.maxTotalOutputSize,
    options.live
      ? LIVE_GRAPH_LIMITS.maxTotalOutputSize
      : MANUAL_GRAPH_LIMITS.maxTotalOutputSize,
    "maxTotalOutputSize",
  );
  if (graphValueSize(input, maxInputSize) > maxInputSize) {
    throw executionError(
      "INPUT_LIMIT",
      `Graph input exceeds the ${maxInputSize.toLocaleString()} byte/item live limit`,
    );
  }
  checkAbort(options.signal);

  const states = new Map<string, NodeState>();
  const outputs = new Map<string, PipelineGraphOutputResult>();
  let totalOutputSize = 0;
  const emit = async (event: PipelineGraphNodeEvent): Promise<void> => {
    if (!options.onNodeSettled) return;
    checkAbort(options.signal);
    let copy: PipelineGraphNodeEvent;
    try {
      copy = {
        ...event,
        path: [...event.path],
        ...(Object.prototype.hasOwnProperty.call(event, "value")
          ? { value: cloneGraphValue(event.value as AnyInput) }
          : {}),
        ...(event.error ? { error: { ...event.error } } : {}),
      };
    } catch {
      return;
    }
    try {
      await options.onNodeSettled(copy);
    } catch {
      // A preview renderer is observational and cannot fail graph execution.
    }
  };

  const inputPath = [validated.inputId];
  states.set(validated.inputId, { value: input, path: inputPath });
  await emit({
    nodeId: validated.inputId,
    nodeType: "input",
    status: "success",
    path: inputPath,
    value: input,
  });

  for (const nodeId of validated.reachableNodeIds) {
    checkAbort(options.signal);
    if (nodeId === validated.inputId) continue;
    const node = validated.nodesById.get(nodeId);
    if (!node) continue;
    const inbound = validated.inboundByNode.get(nodeId);
    const sourceState = inbound ? states.get(inbound.source) : undefined;
    if (!sourceState) continue;
    const path = [...sourceState.path, nodeId];

    if (isFailed(sourceState)) {
      const state: FailedState = { error: sourceState.error, path };
      states.set(nodeId, state);
      if (node.type === "output") {
        outputs.set(node.id, {
          outputId: node.id,
          name: node.name,
          error: state.error,
          path,
        });
      }
      await emit({
        nodeId,
        nodeType: node.type,
        status: "blocked",
        path,
        error: state.error,
      });
      continue;
    }

    if (node.type === "operation") {
      await emit({
        nodeId: node.id,
        nodeType: node.type,
        status: "running",
        path,
      });
      let allowed: boolean;
      try {
        allowed = operationAllowed(options.allowedOperations, node);
      } catch (error) {
        const failure = nodeError(
          "OPERATION_POLICY_ERROR",
          node.id,
          `Operation policy failed: ${errorMessage(error)}`,
        );
        states.set(node.id, { error: failure, path });
        await emit({
          nodeId: node.id,
          nodeType: node.type,
          status: "error",
          path,
          error: failure,
        });
        continue;
      }
      if (!allowed) {
        const failure = nodeError(
          "OPERATION_NOT_ALLOWED",
          node.id,
          `Operation '${node.opName}' is not allowed in this graph run`,
        );
        states.set(node.id, { error: failure, path });
        await emit({
          nodeId: node.id,
          nodeType: node.type,
          status: "error",
          path,
          error: failure,
        });
        continue;
      }
      let operationInput: AnyInput;
      let args: unknown[];
      try {
        operationInput = cloneGraphValue(sourceState.value);
        args = cloneGraphValue(node.args as AnyInput) as unknown[];
      } catch (error) {
        const failure = nodeError(
          "VALUE_NOT_CLONEABLE",
          node.id,
          `Unable to isolate graph branch input: ${errorMessage(error)}`,
        );
        states.set(node.id, { error: failure, path });
        await emit({
          nodeId: node.id,
          nodeType: node.type,
          status: "error",
          path,
          error: failure,
        });
        continue;
      }
      try {
        const result = await (options.runOperation ?? runOpAsync)(
          node.opName,
          operationInput,
          args,
          node,
        );
        checkAbort(options.signal);
        const resultSize = graphValueSize(result, maxNodeOutputSize);
        if (resultSize > maxNodeOutputSize) {
          throw nodeError(
            "NODE_OUTPUT_LIMIT",
            node.id,
            `Node output exceeds the ${maxNodeOutputSize.toLocaleString()} byte/item limit`,
          );
        }
        if (totalOutputSize + resultSize > maxTotalOutputSize) {
          throw nodeError(
            "TOTAL_OUTPUT_LIMIT",
            node.id,
            `Graph outputs exceed the ${maxTotalOutputSize.toLocaleString()} byte/item total limit`,
          );
        }
        totalOutputSize += resultSize;
        states.set(node.id, { value: result, path });
        await emit({
          nodeId: node.id,
          nodeType: node.type,
          status: "success",
          path,
          value: result,
        });
      } catch (error) {
        if (
          error instanceof PipelineGraphExecutionError &&
          error.code === "GRAPH_ABORTED"
        ) {
          throw error;
        }
        const supplied = error as Partial<PipelineGraphNodeError>;
        const failure =
          supplied &&
          (supplied.code === "NODE_OUTPUT_LIMIT" ||
            supplied.code === "TOTAL_OUTPUT_LIMIT") &&
          supplied.nodeId === node.id &&
          typeof supplied.message === "string"
            ? (supplied as PipelineGraphNodeError)
            : nodeError("OPERATION_FAILED", node.id, errorMessage(error));
        states.set(node.id, { error: failure, path });
        await emit({
          nodeId: node.id,
          nodeType: node.type,
          status: "error",
          path,
          error: failure,
        });
      }
      continue;
    }

    if (node.type === "output") {
      // A terminal node is a named view, not another transformation. Keeping a
      // source reference makes 200 outputs over one 64 MiB value O(1) in data
      // memory. All actual operation branches were cloned before execution.
      const value = sourceState.value;
      states.set(node.id, { value, path });
      outputs.set(node.id, {
        outputId: node.id,
        name: node.name,
        value,
        path,
      });
      // Do not clone the value once per output for preview events. The final Map
      // carries it and the host can render the currently selected output only.
      await emit({
        nodeId: node.id,
        nodeType: node.type,
        status: "success",
        path,
      });
    }
  }

  const disconnectedOutputs = validated.disconnectedNodeIds
    .map((id) => validated.nodesById.get(id))
    .filter((node): node is PipelineGraphOutputNode => node?.type === "output");
  for (const output of disconnectedOutputs) {
    const error = nodeError(
      "OUTPUT_DISCONNECTED",
      output.id,
      `Output '${output.name}' is not connected to the graph input`,
    );
    const path = [output.id];
    outputs.set(output.id, {
      outputId: output.id,
      name: output.name,
      error,
      path,
    });
    await emit({
      nodeId: output.id,
      nodeType: "output",
      status: "disconnected",
      path,
      error,
    });
  }

  // Node array ordering is presentation state; output ordering is stable by ID.
  return new Map(
    [...outputs.entries()].sort(([left], [right]) =>
      left < right ? -1 : left > right ? 1 : 0,
    ),
  );
}
