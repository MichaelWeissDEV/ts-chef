/**
 * Typed, validated messages exchanged with the pipeline editor webview.
 * The webview is an untrusted boundary: every value is checked before it is
 * allowed to reach the operation runner or persistent storage.
 */

import {
  type PipelineGraph,
  PipelineGraphValidationError,
  validatePipelineGraph,
} from "./pipelineGraphModel";

export const INPUT_SOURCES = [
  "manual",
  "selection",
  "document",
  "clipboard",
] as const;

export const OUTPUT_TARGETS = [
  "preview",
  "clipboard",
  "replaceSelection",
  "newDocument",
] as const;

export type PipelineInputSource = (typeof INPUT_SOURCES)[number];
export type PipelineOutputTarget = (typeof OUTPUT_TARGETS)[number];

export interface PanelPipelineStep {
  id: string;
  opName: string;
  args: unknown[];
}

export type PipelinePanelMessage =
  | { type: "ready" }
  | { type: "invalidateRuns" }
  | {
      type: "run";
      requestId: number;
      explicit: boolean;
      steps: PanelPipelineStep[];
      inputSource: PipelineInputSource;
      outputTarget: PipelineOutputTarget;
      manualInput: string;
    }
  | {
      type: "runGraph";
      requestId: number;
      explicit: boolean;
      graph: PipelineGraph;
      activeOutputId?: string;
      inputSource: PipelineInputSource;
      outputTarget: PipelineOutputTarget;
      manualInput: string;
    }
  | { type: "graphChanged"; graph: PipelineGraph }
  | {
      type: "parseRaw";
      requestId: number;
      raw: string;
      previousSteps: PanelPipelineStep[];
    }
  | {
      type: "save";
      name: string;
      description: string;
      raw: string;
      steps: PanelPipelineStep[];
      graph?: PipelineGraph;
      activeOutputId?: string;
    };

export type MessageDecodeResult =
  | { ok: true; message: PipelinePanelMessage }
  | { ok: false; error: string; requestId?: number };

const MAX_STEPS = 512;
const MAX_ARGS_PER_STEP = 256;
const MAX_NAME_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 8_000;
const MAX_RAW_LENGTH = 256_000;
const MAX_MANUAL_INPUT_LENGTH = 16 * 1024 * 1024;
const MAX_VALUE_DEPTH = 12;
const MAX_VALUE_ITEMS = 100_000;
const MAX_ARGUMENT_CHARACTERS = 4 * 1024 * 1024;
const MAX_ARGUMENT_STRING_LENGTH = 1024 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requestIdFrom(value: unknown): number | undefined {
  if (!isRecord(value)) return undefined;
  const id = value.requestId;
  return Number.isSafeInteger(id) && (id as number) >= 0
    ? (id as number)
    : undefined;
}

function isSafeArgumentValue(
  value: unknown,
  depth: number,
  budget: { remainingItems: number; remainingCharacters: number },
): boolean {
  if (--budget.remainingItems < 0 || depth > MAX_VALUE_DEPTH) return false;
  if (typeof value === "string") {
    budget.remainingCharacters -= value.length;
    return (
      value.length <= MAX_ARGUMENT_STRING_LENGTH &&
      budget.remainingCharacters >= 0
    );
  }
  if (value === null || value === undefined || typeof value === "boolean") {
    return true;
  }
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) {
    return value.every((item) => isSafeArgumentValue(item, depth + 1, budget));
  }
  if (!isRecord(value)) return false;
  return Object.entries(value).every(
    ([key, item]) =>
      key.length <= 4_096 &&
      (budget.remainingCharacters -= key.length) >= 0 &&
      isSafeArgumentValue(item, depth + 1, budget),
  );
}

export function validatePanelSteps(
  value: unknown,
  knownOperations: ReadonlySet<string>,
): PanelPipelineStep[] | string {
  if (!Array.isArray(value)) return "steps must be an array";
  if (value.length > MAX_STEPS)
    return `pipelines are limited to ${MAX_STEPS} steps`;

  const ids = new Set<string>();
  const result: PanelPipelineStep[] = [];
  const budget = {
    remainingItems: MAX_VALUE_ITEMS,
    remainingCharacters: MAX_ARGUMENT_CHARACTERS,
  };
  for (let index = 0; index < value.length; index++) {
    const candidate = value[index];
    if (!isRecord(candidate)) return `step ${index + 1} is not an object`;
    const { id, opName, args } = candidate;
    if (typeof id !== "string" || !id || id.length > 128)
      return `step ${index + 1} has an invalid id`;
    if (ids.has(id)) return `step id "${id}" is duplicated`;
    ids.add(id);
    if (
      typeof opName !== "string" ||
      !opName ||
      opName.length > 256 ||
      !knownOperations.has(opName)
    ) {
      return `step ${index + 1} references an unknown operation`;
    }
    if (!Array.isArray(args) || args.length > MAX_ARGS_PER_STEP)
      return `step ${index + 1} has invalid arguments`;
    if (!args.every((arg) => isSafeArgumentValue(arg, 0, budget)))
      return `step ${index + 1} contains unsupported argument data`;
    result.push({ id, opName, args });
  }
  return result;
}

function decodeRun(
  value: Record<string, unknown>,
  knownOperations: ReadonlySet<string>,
): MessageDecodeResult {
  const requestId = requestIdFrom(value);
  if (requestId === undefined)
    return { ok: false, error: "run request has an invalid requestId" };
  if (typeof value.explicit !== "boolean")
    return { ok: false, error: "run request has no explicit flag", requestId };
  const steps = validatePanelSteps(value.steps, knownOperations);
  if (typeof steps === "string") return { ok: false, error: steps, requestId };
  if (
    typeof value.inputSource !== "string" ||
    !INPUT_SOURCES.includes(value.inputSource as PipelineInputSource)
  ) {
    return { ok: false, error: "unknown pipeline input source", requestId };
  }
  if (
    typeof value.outputTarget !== "string" ||
    !OUTPUT_TARGETS.includes(value.outputTarget as PipelineOutputTarget)
  ) {
    return { ok: false, error: "unknown pipeline output target", requestId };
  }
  if (
    typeof value.manualInput !== "string" ||
    value.manualInput.length > MAX_MANUAL_INPUT_LENGTH
  ) {
    return {
      ok: false,
      error: "manual input is invalid or too large",
      requestId,
    };
  }
  return {
    ok: true,
    message: {
      type: "run",
      requestId,
      explicit: value.explicit,
      steps,
      inputSource: value.inputSource as PipelineInputSource,
      outputTarget: value.outputTarget as PipelineOutputTarget,
      manualInput: value.manualInput,
    },
  };
}

interface DecodedRunEndpoints {
  requestId: number;
  explicit: boolean;
  inputSource: PipelineInputSource;
  outputTarget: PipelineOutputTarget;
  manualInput: string;
}

function decodeRunEndpoints(
  value: Record<string, unknown>,
  label: string,
): DecodedRunEndpoints | MessageDecodeResult {
  const requestId = requestIdFrom(value);
  if (requestId === undefined)
    return { ok: false, error: `${label} request has an invalid requestId` };
  if (typeof value.explicit !== "boolean")
    return {
      ok: false,
      error: `${label} request has no explicit flag`,
      requestId,
    };
  if (
    typeof value.inputSource !== "string" ||
    !INPUT_SOURCES.includes(value.inputSource as PipelineInputSource)
  ) {
    return { ok: false, error: "unknown pipeline input source", requestId };
  }
  if (
    typeof value.outputTarget !== "string" ||
    !OUTPUT_TARGETS.includes(value.outputTarget as PipelineOutputTarget)
  ) {
    return { ok: false, error: "unknown pipeline output target", requestId };
  }
  if (
    typeof value.manualInput !== "string" ||
    value.manualInput.length > MAX_MANUAL_INPUT_LENGTH
  ) {
    return {
      ok: false,
      error: "manual input is invalid or too large",
      requestId,
    };
  }
  return {
    requestId,
    explicit: value.explicit,
    inputSource: value.inputSource as PipelineInputSource,
    outputTarget: value.outputTarget as PipelineOutputTarget,
    manualInput: value.manualInput,
  };
}

function decodeGraph(
  value: unknown,
  knownOperations: ReadonlySet<string>,
): PipelineGraph | string {
  try {
    return validatePipelineGraph(value, {
      isKnownOperation: (opName) => knownOperations.has(opName),
    }).graph;
  } catch (error) {
    return error instanceof PipelineGraphValidationError
      ? error.message
      : "graph is invalid";
  }
}

function decodeActiveOutputId(
  value: unknown,
  graph: PipelineGraph,
): { ok: true; value?: string } | { ok: false } {
  if (value === undefined || value === "") return { ok: true };
  if (typeof value !== "string" || value.length > 128) return { ok: false };
  const output = graph.nodes.find((node) => node.id === value);
  return output?.type === "output"
    ? { ok: true, value }
    : { ok: false };
}

function decodeRunGraph(
  value: Record<string, unknown>,
  knownOperations: ReadonlySet<string>,
  graphOperations: ReadonlySet<string>,
): MessageDecodeResult {
  const endpoints = decodeRunEndpoints(value, "graph run");
  if ("ok" in endpoints) return endpoints;
  const graph = decodeGraph(value.graph, knownOperations);
  if (typeof graph === "string") {
    return { ok: false, error: graph, requestId: endpoints.requestId };
  }
  const validated = validatePipelineGraph(graph);
  const reachable = new Set(validated.reachableNodeIds);
  const unsupported = graph.nodes.find(
    (node) =>
      node.type === "operation" &&
      reachable.has(node.id) &&
      !graphOperations.has(node.opName),
  );
  if (unsupported?.type === "operation") {
    return {
      ok: false,
      error: `operation '${unsupported.opName}' is not supported in graph mode`,
      requestId: endpoints.requestId,
    };
  }
  const activeOutput = decodeActiveOutputId(value.activeOutputId, graph);
  if (!activeOutput.ok) {
    return {
      ok: false,
      error: "active graph output is invalid",
      requestId: endpoints.requestId,
    };
  }
  return {
    ok: true,
    message: {
      type: "runGraph",
      ...endpoints,
      graph,
      ...(activeOutput.value ? { activeOutputId: activeOutput.value } : {}),
    },
  };
}

function decodeGraphChanged(
  value: Record<string, unknown>,
  knownOperations: ReadonlySet<string>,
): MessageDecodeResult {
  const graph = decodeGraph(value.graph, knownOperations);
  return typeof graph === "string"
    ? { ok: false, error: graph }
    : { ok: true, message: { type: "graphChanged", graph } };
}

function decodeParseRaw(
  value: Record<string, unknown>,
  knownOperations: ReadonlySet<string>,
): MessageDecodeResult {
  const requestId = requestIdFrom(value);
  if (requestId === undefined)
    return { ok: false, error: "parse request has an invalid requestId" };
  if (typeof value.raw !== "string" || value.raw.length > MAX_RAW_LENGTH)
    return {
      ok: false,
      error: "pipeline text is invalid or too large",
      requestId,
    };
  const previousSteps = validatePanelSteps(
    value.previousSteps,
    knownOperations,
  );
  if (typeof previousSteps === "string")
    return { ok: false, error: previousSteps, requestId };
  return {
    ok: true,
    message: {
      type: "parseRaw",
      requestId,
      raw: value.raw,
      previousSteps,
    },
  };
}

function decodeSave(
  value: Record<string, unknown>,
  knownOperations: ReadonlySet<string>,
): MessageDecodeResult {
  if (typeof value.name !== "string" || value.name.length > MAX_NAME_LENGTH)
    return { ok: false, error: "pipeline name is invalid" };
  if (
    typeof value.description !== "string" ||
    value.description.length > MAX_DESCRIPTION_LENGTH
  ) {
    return { ok: false, error: "pipeline description is invalid" };
  }
  if (typeof value.raw !== "string" || value.raw.length > MAX_RAW_LENGTH)
    return { ok: false, error: "pipeline text is invalid or too large" };
  const steps = validatePanelSteps(value.steps, knownOperations);
  if (typeof steps === "string") return { ok: false, error: steps };
  let graph: PipelineGraph | undefined;
  let activeOutputId: string | undefined;
  if (value.graph !== undefined) {
    const decodedGraph = decodeGraph(value.graph, knownOperations);
    if (typeof decodedGraph === "string")
      return { ok: false, error: decodedGraph };
    graph = decodedGraph;
    const decodedOutput = decodeActiveOutputId(value.activeOutputId, graph);
    if (!decodedOutput.ok)
      return { ok: false, error: "active graph output is invalid" };
    activeOutputId = decodedOutput.value;
  } else if (value.activeOutputId !== undefined) {
    return { ok: false, error: "active output requires a graph" };
  }
  return {
    ok: true,
    message: {
      type: "save",
      name: value.name,
      description: value.description,
      raw: value.raw,
      steps,
      ...(graph ? { graph } : {}),
      ...(activeOutputId ? { activeOutputId } : {}),
    },
  };
}

export function decodePipelinePanelMessage(
  value: unknown,
  knownOperations: ReadonlySet<string>,
  graphOperations: ReadonlySet<string> = knownOperations,
): MessageDecodeResult {
  if (!isRecord(value) || typeof value.type !== "string")
    return { ok: false, error: "malformed pipeline editor message" };
  switch (value.type) {
    case "ready":
      return { ok: true, message: { type: "ready" } };
    case "invalidateRuns":
      return { ok: true, message: { type: "invalidateRuns" } };
    case "run":
      return decodeRun(value, knownOperations);
    case "runGraph":
      return decodeRunGraph(value, knownOperations, graphOperations);
    case "graphChanged":
      return decodeGraphChanged(value, knownOperations);
    case "parseRaw":
      return decodeParseRaw(value, knownOperations);
    case "save":
      return decodeSave(value, knownOperations);
    default:
      return {
        ok: false,
        error: `unknown pipeline editor message: ${value.type}`,
        requestId: requestIdFrom(value),
      };
  }
}
