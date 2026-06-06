import registry, { findOp } from "../generated/opsRegistry";
import type { ArgConfig } from "../chef/Operation";
import type { PipelineStep } from "../storage/store";

/**
 * Extracts the actual default value from an ArgConfig so it matches
 * what the operation's run() method expects for each arg type.
 */
export function resolveDefaultArg(arg: ArgConfig): unknown {
  switch (arg.type) {
    case "editableOption":
    case "editableOptionShort": {
      const opts = arg.value as Array<{ name: string; value: unknown }>;
      if (!Array.isArray(opts)) return arg.value;
      const idx = typeof arg.defaultIndex === "number" ? arg.defaultIndex : 0;
      return opts[idx]?.value ?? opts[0]?.value ?? "";
    }
    case "option": {
      const opts = arg.value as unknown[];
      return Array.isArray(opts) ? (opts[0] ?? "") : arg.value;
    }
    case "argSelector": {
      // run() receives the selected option name string (e.g. "CBC")
      const opts = arg.value as Array<{ name: string }>;
      return Array.isArray(opts) ? (opts[0]?.name ?? "") : arg.value;
    }
    case "toggleString": {
      // run() receives { string: value, option: encoding }
      return {
        string: typeof arg.value === "string" ? arg.value : "",
        option: arg.toggleValues?.[0] ?? "Hex",
      };
    }
    default:
      return arg.value;
  }
}

/**
 * Converts any intermediate value to the type an operation expects.
 * Needed because ToBase32/45/58/62/85/92 declare inputType="ArrayBuffer"
 * but callers may pass a plain string.
 */
function normaliseInput(input: unknown, inputType: string): unknown {
  let buf: Buffer;
  if (typeof input === "string") {
    buf = Buffer.from(input, "utf-8");
  } else if (Array.isArray(input)) {
    buf = Buffer.from(input as number[]);
  } else if (input instanceof ArrayBuffer) {
    buf = Buffer.from(new Uint8Array(input));
  } else if (Buffer.isBuffer(input)) {
    buf = input as Buffer;
  } else if (input instanceof Uint8Array) {
    buf = Buffer.from(input);
  } else {
    buf = Buffer.from(String(input), "utf-8");
  }

  switch (inputType) {
    case "string":
      return buf.toString("utf-8");
    case "byteArray":
      return Array.from(buf);
    case "ArrayBuffer": {
      const ab = new ArrayBuffer(buf.length);
      new Uint8Array(ab).set(buf);
      return ab;
    }
    case "number":
      return Number(buf.toString("utf-8").trim());
    default:
      return buf.toString("utf-8");
  }
}

export function runOp(
  opName: string,
  input: unknown,
  args: unknown[],
): unknown {
  const entry = registry.find(
    (e) =>
      e.opName === opName ||
      e.displayName.toLowerCase() === opName.toLowerCase(),
  );
  if (!entry) throw new Error(`Unknown operation: ${opName}`);
  const op = entry.factory();
  const normalised = normaliseInput(input, op.inputType);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return op.run(normalised as any, args as any[]);
}

export function runPipeline(input: string, steps: PipelineStep[]): string {
  let current: unknown = input;
  for (const step of steps) {
    current = runOp(step.opName, current, step.args);
  }
  // Convert final result to displayable string
  if (Array.isArray(current))
    return Buffer.from(current as number[]).toString("utf-8");
  if (current instanceof ArrayBuffer)
    return Buffer.from(new Uint8Array(current as ArrayBuffer)).toString(
      "utf-8",
    );
  if (typeof current === "string") return current;
  return JSON.stringify(current, null, 2);
}

// Mini pipe language parser: "From Base64 | To Hex | URL Encode(arg1=val1, arg2=val2)"
export function parsePipeline(raw: string): PipelineStep[] {
  return raw
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((part) => parseStep(part));
}

function parseStep(part: string): PipelineStep {
  const parenIdx = part.indexOf("(");
  if (parenIdx === -1) {
    const op = resolveOp(part.trim());
    return {
      opName: op.opName,
      args: op.factory().args.map(resolveDefaultArg),
    };
  }

  const name = part.slice(0, parenIdx).trim();
  const argsStr = part.slice(parenIdx + 1, part.lastIndexOf(")")).trim();
  const op = resolveOp(name);
  const defaultArgs = op.factory().args.map(resolveDefaultArg);

  // Parse key=value pairs, handling quoted strings
  const overrides: Record<string, string> = {};
  const kvRe = /([^,=]+)=("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^,]*)/g;
  let kv: RegExpExecArray | null;
  while ((kv = kvRe.exec(argsStr)) !== null) {
    const key = kv[1].trim();
    let val = kv[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    overrides[key] = val;
  }

  // Apply overrides by name to defaultArgs
  const opDef = op.factory();
  const finalArgs = opDef.args.map((argDef, i) => {
    if (argDef.name in overrides)
      return castArg(overrides[argDef.name], argDef.type);
    if (String(i) in overrides)
      return castArg(overrides[String(i)], argDef.type);
    return resolveDefaultArg(argDef);
  });

  return { opName: op.opName, args: finalArgs };
}

function resolveOp(name: string) {
  const op =
    findOp(name) ??
    registry.find((e) => e.opName.toLowerCase() === name.toLowerCase());
  if (!op) throw new Error(`Unknown operation: "${name}"`);
  return op;
}

function castArg(val: string, type: string): unknown {
  if (type === "boolean") return val === "true" || val === "1";
  if (type === "number") return Number(val);
  return val;
}
