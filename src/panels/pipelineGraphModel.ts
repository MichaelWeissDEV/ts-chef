import type { PipelineStep } from "../storage/store";

/** Hard limits for graph data received from the webview or storage. */
export const PIPELINE_GRAPH_LIMITS = Object.freeze({
  // 512 legacy operations plus the graph input and output endpoints.
  maxNodes: 514,
  maxEdges: 1_024,
  maxIdLength: 128,
  maxLabelLength: 128,
  maxOperationNameLength: 256,
  maxCoordinate: 1_000_000,
  maxArgumentsPerNode: 256,
  maxArgumentDepth: 12,
  maxArgumentItems: 100_000,
  maxArgumentCharacters: 4 * 1024 * 1024,
  maxArgumentStringLength: 1024 * 1024,
  maxArgumentKeyLength: 4_096,
});

export type PipelineGraphArgument =
  | string
  | number
  | boolean
  | null
  | undefined
  | PipelineGraphArgument[]
  | { [key: string]: PipelineGraphArgument };

interface PositionedGraphNode {
  id: string;
  x: number;
  y: number;
}

export interface PipelineGraphInputNode extends PositionedGraphNode {
  type: "input";
}

export interface PipelineGraphOperationNode extends PositionedGraphNode {
  type: "operation";
  opName: string;
  args: PipelineGraphArgument[];
}

export interface PipelineGraphOutputNode extends PositionedGraphNode {
  type: "output";
  name: string;
}

export type PipelineGraphNode =
  | PipelineGraphInputNode
  | PipelineGraphOperationNode
  | PipelineGraphOutputNode;

export interface PipelineGraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface PipelineGraph {
  version: 1;
  nodes: PipelineGraphNode[];
  edges: PipelineGraphEdge[];
}

export interface ValidatedPipelineGraph {
  /** A defensive, schema-normalised copy of the graph. */
  graph: PipelineGraph;
  inputId: string;
  /** Stable lexical Kahn ordering, including disconnected nodes. */
  topologicalOrder: string[];
  /** Nodes connected to the input, in topological order. */
  reachableNodeIds: string[];
  /** Nodes that cannot receive input, in topological order. */
  disconnectedNodeIds: string[];
  nodesById: ReadonlyMap<string, PipelineGraphNode>;
  inboundByNode: ReadonlyMap<string, PipelineGraphEdge | undefined>;
  outboundByNode: ReadonlyMap<string, readonly PipelineGraphEdge[]>;
}

export type PipelineGraphValidationCode =
  | "INVALID_GRAPH"
  | "GRAPH_LIMIT"
  | "INVALID_NODE"
  | "INVALID_EDGE"
  | "DUPLICATE_ID"
  | "INVALID_CONNECTION"
  | "MULTIPLE_INBOUND"
  | "GRAPH_CYCLE";

export class PipelineGraphValidationError extends Error {
  constructor(
    public readonly code: PipelineGraphValidationCode,
    public readonly path: string,
    message: string,
  ) {
    super(`${path}: ${message}`);
    this.name = "PipelineGraphValidationError";
  }
}

export interface PipelineGraphValidationOptions {
  /** Optional registry check used by hosts which have an operation catalogue. */
  isKnownOperation?: (opName: string) => boolean;
}

function fail(
  code: PipelineGraphValidationCode,
  path: string,
  message: string,
): never {
  throw new PipelineGraphValidationError(code, path, message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch {
    return false;
  }
}

/** Read only own data properties; accessors are not executed during validation. */
function dataProperty(record: Record<string, unknown>, key: string): unknown {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(record, key);
    if (!descriptor || !("value" in descriptor)) return undefined;
    return descriptor.value;
  } catch {
    return undefined;
  }
}

function compareIds(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function containsControlCharacters(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

function validateId(value: unknown, path: string): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > PIPELINE_GRAPH_LIMITS.maxIdLength ||
    !/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(value)
  ) {
    return fail(
      "INVALID_NODE",
      path,
      "must be a non-empty graph identifier containing only letters, numbers, '.', '_', ':' or '-'",
    );
  }
  return value;
}

function validateCoordinate(value: unknown, path: string): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    Math.abs(value) > PIPELINE_GRAPH_LIMITS.maxCoordinate
  ) {
    return fail(
      "INVALID_NODE",
      path,
      `must be a finite coordinate between -${PIPELINE_GRAPH_LIMITS.maxCoordinate} and ${PIPELINE_GRAPH_LIMITS.maxCoordinate}`,
    );
  }
  return value;
}

interface ArgumentBudget {
  items: number;
  characters: number;
  active: Set<object>;
}

function validateArgument(
  value: unknown,
  path: string,
  depth: number,
  budget: ArgumentBudget,
): PipelineGraphArgument {
  budget.items += 1;
  if (budget.items > PIPELINE_GRAPH_LIMITS.maxArgumentItems) {
    return fail("GRAPH_LIMIT", path, "graph arguments contain too many values");
  }
  if (depth > PIPELINE_GRAPH_LIMITS.maxArgumentDepth) {
    return fail("GRAPH_LIMIT", path, "graph argument nesting is too deep");
  }
  if (typeof value === "string") {
    if (value.length > PIPELINE_GRAPH_LIMITS.maxArgumentStringLength) {
      return fail("GRAPH_LIMIT", path, "graph argument string is too large");
    }
    budget.characters += value.length;
    if (budget.characters > PIPELINE_GRAPH_LIMITS.maxArgumentCharacters) {
      return fail("GRAPH_LIMIT", path, "graph arguments contain too much text");
    }
    return value;
  }
  if (
    value === null ||
    value === undefined ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return fail("INVALID_NODE", path, "argument numbers must be finite");
    }
    return value;
  }
  if (typeof value !== "object") {
    return fail("INVALID_NODE", path, "argument is not structured-clone-safe data");
  }
  if (budget.active.has(value)) {
    return fail("INVALID_NODE", path, "cyclic operation arguments are not supported");
  }
  budget.active.add(value);
  try {
    if (Array.isArray(value)) {
      return value.map((item, index) =>
        validateArgument(item, `${path}[${index}]`, depth + 1, budget),
      );
    }
    if (!isRecord(value)) {
      return fail("INVALID_NODE", path, "argument objects must be plain objects");
    }
    const result: Record<string, PipelineGraphArgument> = {};
    let keys: string[];
    try {
      keys = Object.keys(value).sort(compareIds);
    } catch {
      return fail("INVALID_NODE", path, "argument object cannot be inspected safely");
    }
    for (const key of keys) {
      if (
        key === "__proto__" ||
        key === "prototype" ||
        key === "constructor" ||
        key.length > PIPELINE_GRAPH_LIMITS.maxArgumentKeyLength
      ) {
        return fail("INVALID_NODE", `${path}.${key}`, "unsafe or excessive argument key");
      }
      budget.characters += key.length;
      if (budget.characters > PIPELINE_GRAPH_LIMITS.maxArgumentCharacters) {
        return fail("GRAPH_LIMIT", path, "graph arguments contain too much text");
      }
      let descriptor: PropertyDescriptor | undefined;
      try {
        descriptor = Object.getOwnPropertyDescriptor(value, key);
      } catch {
        return fail("INVALID_NODE", `${path}.${key}`, "argument property cannot be inspected safely");
      }
      if (!descriptor || !("value" in descriptor)) {
        return fail("INVALID_NODE", `${path}.${key}`, "argument accessors are not supported");
      }
      result[key] = validateArgument(
        descriptor.value,
        `${path}.${key}`,
        depth + 1,
        budget,
      );
    }
    return result;
  } finally {
    budget.active.delete(value);
  }
}

function normaliseNode(
  value: unknown,
  index: number,
  budget: ArgumentBudget,
  options: PipelineGraphValidationOptions,
): PipelineGraphNode {
  const path = `nodes[${index}]`;
  if (!isRecord(value)) return fail("INVALID_NODE", path, "must be an object");
  const id = validateId(dataProperty(value, "id"), `${path}.id`);
  const x = validateCoordinate(dataProperty(value, "x"), `${path}.x`);
  const y = validateCoordinate(dataProperty(value, "y"), `${path}.y`);
  const type = dataProperty(value, "type");
  if (type === "input") return { id, type, x, y };
  if (type === "operation") {
    const opName = dataProperty(value, "opName");
    if (
      typeof opName !== "string" ||
      !opName.trim() ||
      opName.length > PIPELINE_GRAPH_LIMITS.maxOperationNameLength ||
      containsControlCharacters(opName)
    ) {
      return fail("INVALID_NODE", `${path}.opName`, "invalid operation name");
    }
    if (options.isKnownOperation && !options.isKnownOperation(opName)) {
      return fail("INVALID_NODE", `${path}.opName`, `unknown operation '${opName}'`);
    }
    const args = dataProperty(value, "args");
    if (
      !Array.isArray(args) ||
      args.length > PIPELINE_GRAPH_LIMITS.maxArgumentsPerNode
    ) {
      return fail(
        "GRAPH_LIMIT",
        `${path}.args`,
        `must be an array of at most ${PIPELINE_GRAPH_LIMITS.maxArgumentsPerNode} arguments`,
      );
    }
    return {
      id,
      type,
      opName,
      args: args.map((argument, argumentIndex) =>
        validateArgument(
          argument,
          `${path}.args[${argumentIndex}]`,
          0,
          budget,
        ),
      ),
      x,
      y,
    };
  }
  if (type === "output") {
    const name = dataProperty(value, "name");
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.length > PIPELINE_GRAPH_LIMITS.maxLabelLength ||
      containsControlCharacters(name)
    ) {
      return fail("INVALID_NODE", `${path}.name`, "invalid output name");
    }
    return { id, type, name, x, y };
  }
  return fail("INVALID_NODE", `${path}.type`, "unknown graph node type");
}

function normaliseEdge(value: unknown, index: number): PipelineGraphEdge {
  const path = `edges[${index}]`;
  if (!isRecord(value)) return fail("INVALID_EDGE", path, "must be an object");
  return {
    id: validateId(dataProperty(value, "id"), `${path}.id`),
    source: validateId(dataProperty(value, "source"), `${path}.source`),
    target: validateId(dataProperty(value, "target"), `${path}.target`),
  };
}

function insertSorted(values: string[], value: string): void {
  let low = 0;
  let high = values.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (values[middle] < value) low = middle + 1;
    else high = middle;
  }
  values.splice(low, 0, value);
}

/**
 * Validate a graph and build deterministic traversal indexes. Disconnected
 * nodes are valid editor state, but are explicitly reported and never run.
 */
export function validatePipelineGraph(
  value: unknown,
  options: PipelineGraphValidationOptions = {},
): ValidatedPipelineGraph {
  if (!isRecord(value)) return fail("INVALID_GRAPH", "graph", "must be an object");
  if (dataProperty(value, "version") !== 1) {
    return fail("INVALID_GRAPH", "graph.version", "only graph version 1 is supported");
  }
  const rawNodes = dataProperty(value, "nodes");
  const rawEdges = dataProperty(value, "edges");
  if (!Array.isArray(rawNodes)) {
    return fail("INVALID_GRAPH", "graph.nodes", "must be an array");
  }
  if (!Array.isArray(rawEdges)) {
    return fail("INVALID_GRAPH", "graph.edges", "must be an array");
  }
  if (rawNodes.length > PIPELINE_GRAPH_LIMITS.maxNodes) {
    return fail(
      "GRAPH_LIMIT",
      "graph.nodes",
      `cannot contain more than ${PIPELINE_GRAPH_LIMITS.maxNodes} nodes`,
    );
  }
  if (rawEdges.length > PIPELINE_GRAPH_LIMITS.maxEdges) {
    return fail(
      "GRAPH_LIMIT",
      "graph.edges",
      `cannot contain more than ${PIPELINE_GRAPH_LIMITS.maxEdges} edges`,
    );
  }

  const budget: ArgumentBudget = { items: 0, characters: 0, active: new Set() };
  const nodes = rawNodes.map((node, index) =>
    normaliseNode(node, index, budget, options),
  );
  const edges = rawEdges.map(normaliseEdge);
  const nodesById = new Map<string, PipelineGraphNode>();
  for (const node of nodes) {
    if (nodesById.has(node.id)) {
      return fail("DUPLICATE_ID", `nodes.${node.id}`, "duplicate node id");
    }
    nodesById.set(node.id, node);
  }
  const inputNodes = nodes.filter(
    (node): node is PipelineGraphInputNode => node.type === "input",
  );
  if (inputNodes.length !== 1) {
    return fail("INVALID_GRAPH", "graph.nodes", "must contain exactly one input node");
  }

  const edgeIds = new Set<string>();
  const connections = new Set<string>();
  const inboundByNode = new Map<string, PipelineGraphEdge | undefined>();
  const outboundByNode = new Map<string, PipelineGraphEdge[]>();
  const indegree = new Map<string, number>();
  for (const node of nodes) {
    inboundByNode.set(node.id, undefined);
    outboundByNode.set(node.id, []);
    indegree.set(node.id, 0);
  }
  for (const edge of edges) {
    if (edgeIds.has(edge.id)) {
      return fail("DUPLICATE_ID", `edges.${edge.id}`, "duplicate edge id");
    }
    edgeIds.add(edge.id);
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);
    if (!source || !target) {
      return fail("INVALID_EDGE", `edges.${edge.id}`, "references an unknown node");
    }
    if (source.type === "output") {
      return fail("INVALID_CONNECTION", `edges.${edge.id}.source`, "output nodes cannot have outgoing edges");
    }
    if (target.type === "input") {
      return fail("INVALID_CONNECTION", `edges.${edge.id}.target`, "the input node cannot have incoming edges");
    }
    if (edge.source === edge.target) {
      return fail("GRAPH_CYCLE", `edges.${edge.id}`, "self-connections are not allowed");
    }
    const connection = `${edge.source}\u0000${edge.target}`;
    if (connections.has(connection)) {
      return fail("INVALID_EDGE", `edges.${edge.id}`, "duplicates an existing connection");
    }
    connections.add(connection);
    if (inboundByNode.get(edge.target)) {
      return fail(
        "MULTIPLE_INBOUND",
        `edges.${edge.id}.target`,
        "operation and output nodes accept at most one incoming edge",
      );
    }
    inboundByNode.set(edge.target, edge);
    outboundByNode.get(edge.source)?.push(edge);
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
  }
  for (const outbound of outboundByNode.values()) {
    outbound.sort((left, right) =>
      compareIds(left.target, right.target) || compareIds(left.id, right.id),
    );
  }

  const ready = [...nodesById.keys()]
    .filter((id) => indegree.get(id) === 0)
    .sort(compareIds);
  const topologicalOrder: string[] = [];
  while (ready.length > 0) {
    const id = ready.shift() as string;
    topologicalOrder.push(id);
    for (const edge of outboundByNode.get(id) ?? []) {
      const remaining = (indegree.get(edge.target) ?? 0) - 1;
      indegree.set(edge.target, remaining);
      if (remaining === 0) insertSorted(ready, edge.target);
    }
  }
  if (topologicalOrder.length !== nodes.length) {
    const cyclic = [...nodesById.keys()]
      .filter((id) => (indegree.get(id) ?? 0) > 0)
      .sort(compareIds);
    return fail(
      "GRAPH_CYCLE",
      "graph.edges",
      `cycle detected involving ${cyclic.join(", ")}`,
    );
  }

  const reachable = new Set<string>([inputNodes[0].id]);
  for (const id of topologicalOrder) {
    if (!reachable.has(id)) continue;
    for (const edge of outboundByNode.get(id) ?? []) reachable.add(edge.target);
  }
  const reachableNodeIds = topologicalOrder.filter((id) => reachable.has(id));
  const disconnectedNodeIds = topologicalOrder.filter((id) => !reachable.has(id));
  return {
    graph: { version: 1, nodes, edges },
    inputId: inputNodes[0].id,
    topologicalOrder,
    reachableNodeIds,
    disconnectedNodeIds,
    nodesById,
    inboundByNode,
    outboundByNode,
  };
}

export interface LinearPipelineGraphOptions {
  outputName?: string;
  startX?: number;
  startY?: number;
  horizontalGap?: number;
}

/** Migrate the legacy ordered representation to a deterministic linear graph. */
export function linearPipelineToGraph(
  steps: readonly PipelineStep[],
  options: LinearPipelineGraphOptions = {},
): PipelineGraph {
  if (steps.length > PIPELINE_GRAPH_LIMITS.maxNodes - 2) {
    return fail("GRAPH_LIMIT", "steps", "linear pipeline has too many operations");
  }
  const startX = options.startX ?? 80;
  const startY = options.startY ?? 160;
  const horizontalGap = options.horizontalGap ?? 240;
  const nodes: PipelineGraphNode[] = [
    { id: "input", type: "input", x: startX, y: startY },
  ];
  const edges: PipelineGraphEdge[] = [];
  let previous = "input";
  steps.forEach((step, index) => {
    const id = `operation-${index + 1}`;
    nodes.push({
      id,
      type: "operation",
      opName: step.opName,
      args: step.args as PipelineGraphArgument[],
      x: startX + horizontalGap * (index + 1),
      y: startY,
    });
    edges.push({ id: `edge-${index + 1}`, source: previous, target: id });
    previous = id;
  });
  const outputId = "output";
  nodes.push({
    id: outputId,
    type: "output",
    name: options.outputName ?? "Output",
    x: startX + horizontalGap * (steps.length + 1),
    y: startY,
  });
  edges.push({
    id: `edge-${steps.length + 1}`,
    source: previous,
    target: outputId,
  });
  return validatePipelineGraph({ version: 1, nodes, edges }).graph;
}

/** Return the operation path for a particular connected output branch. */
export function graphStepsForOutput(
  value: unknown,
  outputId: string,
): PipelineStep[] | undefined {
  const validated = validatePipelineGraph(value);
  const output = validated.nodesById.get(outputId);
  if (!output || output.type !== "output") return undefined;
  if (validated.disconnectedNodeIds.includes(outputId)) return undefined;
  const reversed: PipelineGraphOperationNode[] = [];
  let current = outputId;
  while (current !== validated.inputId) {
    const inbound = validated.inboundByNode.get(current);
    if (!inbound) return undefined;
    const source = validated.nodesById.get(inbound.source);
    if (!source) return undefined;
    if (source.type === "operation") reversed.push(source);
    current = source.id;
  }
  return reversed.reverse().map((node) => ({
    opName: node.opName,
    args: [...node.args],
  }));
}

/**
 * Convert a graph back to the legacy primary pipeline only when the complete
 * graph is one connected, non-branching path with exactly one output.
 */
export function graphToPrimarySteps(value: unknown): PipelineStep[] | undefined {
  const validated = validatePipelineGraph(value);
  const outputs = validated.graph.nodes.filter(
    (node): node is PipelineGraphOutputNode => node.type === "output",
  );
  if (outputs.length !== 1 || validated.disconnectedNodeIds.length > 0) {
    return undefined;
  }
  for (const id of validated.reachableNodeIds) {
    const node = validated.nodesById.get(id);
    const outbound = validated.outboundByNode.get(id)?.length ?? 0;
    if (node?.type !== "output" && outbound !== 1) return undefined;
  }
  return graphStepsForOutput(validated.graph, outputs[0].id);
}
