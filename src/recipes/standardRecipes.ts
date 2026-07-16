/**
 * @fileoverview Built-in, loadable pipeline recipes for common data conversion
 * and defensive malware-analysis tasks.
 * @package recipes
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import type { ArgConfig } from "../chef/Operation";
import { parsePipeline } from "../commands/runner";
import { findOp } from "../opsRegistry";
import type { Pipeline, PipelineStep } from "../storage/store";

/** Marker used by UIs to distinguish immutable bundled recipes from user data. */
export const BUILT_IN_RECIPE_SOURCE = "built-in" as const;

export type StandardRecipeCategory =
  | "Decoding"
  | "Encoding"
  | "Structured data"
  | "Malware analysis"
  | "Indicators";

/** Serializable catalog entry. The pipe syntax is the single source of truth. */
export interface StandardRecipeDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: StandardRecipeCategory;
  readonly tags: readonly string[];
  readonly raw: string;
}

/** A recipe materialised into the same shape consumed by the pipeline runner. */
export interface BuiltInPipeline extends Pipeline {
  readonly id: string;
  readonly category: StandardRecipeCategory;
  readonly tags: string[];
  readonly scope: typeof BUILT_IN_RECIPE_SOURCE;
  readonly source: typeof BUILT_IN_RECIPE_SOURCE;
}

export interface StandardRecipeFilter {
  /** Limit the catalog to a single UI category. */
  readonly category?: StandardRecipeCategory;
  /** All requested tags must be present. Tag matching is case-insensitive. */
  readonly tags?: readonly string[];
  /** Free-text search over id, name, description and tags. */
  readonly search?: string;
}

export type StandardRecipeValidationCode =
  | "duplicate-id"
  | "duplicate-name"
  | "empty-pipeline"
  | "parse-error"
  | "unknown-operation"
  | "argument-count"
  | "invalid-argument";

export interface StandardRecipeValidationIssue {
  readonly recipeId: string;
  readonly code: StandardRecipeValidationCode;
  readonly message: string;
  readonly stepIndex?: number;
  readonly argumentIndex?: number;
}

function defineRecipe(
  definition: StandardRecipeDefinition,
): Readonly<StandardRecipeDefinition> {
  return Object.freeze({
    ...definition,
    tags: Object.freeze([...definition.tags]),
  });
}

/**
 * Bundled recipes. Canonical operation names are used in `raw` so recipes are
 * stable even when an operation's display label changes.
 */
export const STANDARD_RECIPE_DEFINITIONS: readonly Readonly<StandardRecipeDefinition>[] =
  Object.freeze([
    defineRecipe({
      id: "decode-base64",
      name: "Decode Base64",
      description:
        "Decode standard RFC 4648 Base64 into its original bytes or text.",
      category: "Decoding",
      tags: ["base64", "decode", "text", "bytes"],
      raw: "FromBase64",
    }),
    defineRecipe({
      id: "decode-base64url",
      name: "Decode Base64URL",
      description:
        "Decode the URL-safe Base64 alphabet commonly used by tokens and web payloads.",
      category: "Decoding",
      tags: ["base64url", "base64", "decode", "web"],
      raw: 'FromBase64(Alphabet="A-Za-z0-9-_", Remove non-alphabet chars=true, Strict mode=false)',
    }),
    defineRecipe({
      id: "decode-hex",
      name: "Decode hexadecimal bytes",
      description:
        "Convert a hexadecimal byte string back to its original data.",
      category: "Decoding",
      tags: ["hex", "decode", "bytes"],
      raw: "FromHex",
    }),
    defineRecipe({
      id: "decode-binary",
      name: "Decode binary bytes",
      description:
        "Convert groups of eight binary digits back to their original data.",
      category: "Decoding",
      tags: ["binary", "decode", "bytes"],
      raw: "FromBinary",
    }),
    defineRecipe({
      id: "decode-url-base64",
      name: "URL-decode, then Base64-decode",
      description:
        "Unescape a percent-encoded value before decoding its Base64 payload.",
      category: "Decoding",
      tags: ["url", "base64", "decode", "layered"],
      raw: "URLDecode | FromBase64",
    }),
    defineRecipe({
      id: "decode-powershell-encoded-command",
      name: "Decode PowerShell EncodedCommand",
      description:
        "Decode the Base64 and UTF-16LE encoding used by PowerShell -EncodedCommand.",
      category: "Malware analysis",
      tags: ["powershell", "base64", "utf-16le", "deobfuscation"],
      raw: 'FromBase64 | DecodeText(Encoding="UTF-16LE (1200)")',
    }),
    defineRecipe({
      id: "encode-base64",
      name: "Encode as Base64",
      description: "Encode arbitrary input using standard RFC 4648 Base64.",
      category: "Encoding",
      tags: ["base64", "encode", "text", "bytes"],
      raw: "ToBase64",
    }),
    defineRecipe({
      id: "encode-hex-compact",
      name: "Encode as compact hex",
      description:
        "Render input as a continuous hexadecimal string without delimiters.",
      category: "Encoding",
      tags: ["hex", "encode", "bytes"],
      raw: 'ToHex(Delimiter="None", Bytes per line=0)',
    }),
    defineRecipe({
      id: "encode-binary",
      name: "Encode as binary bytes",
      description:
        "Render every input byte as eight binary digits separated by spaces.",
      category: "Encoding",
      tags: ["binary", "encode", "bytes"],
      raw: 'ToBinary(Delimiter="Space", Byte length=8)',
    }),
    defineRecipe({
      id: "format-json",
      name: "Format JSON",
      description:
        "Validate and pretty-print JSON using four-space indentation.",
      category: "Structured data",
      tags: ["json", "format", "beautify"],
      raw: "JSONBeautify",
    }),
    defineRecipe({
      id: "minify-json",
      name: "Minify JSON",
      description: "Validate JSON and remove insignificant whitespace.",
      category: "Structured data",
      tags: ["json", "minify", "format"],
      raw: "JSONMinify",
    }),
    defineRecipe({
      id: "yaml-to-formatted-json",
      name: "YAML to formatted JSON",
      description:
        "Convert YAML to JSON and render the result in a readable form.",
      category: "Structured data",
      tags: ["yaml", "json", "convert", "format"],
      raw: "YAMLToJSON | JSONBeautify",
    }),
    defineRecipe({
      id: "csv-to-formatted-json",
      name: "CSV to formatted JSON",
      description: "Convert header-based CSV rows to a formatted JSON array.",
      category: "Structured data",
      tags: ["csv", "json", "convert", "format"],
      raw: "CSVToJSON | JSONBeautify",
    }),
    defineRecipe({
      id: "inspect-jwt",
      name: "Inspect JWT payload",
      description:
        "Decode a JSON Web Token without treating the unverified payload as trusted.",
      category: "Structured data",
      tags: ["jwt", "json", "token", "decode"],
      raw: "JWTDecode | JSONBeautify",
    }),
    defineRecipe({
      id: "parse-uri",
      name: "Parse URI",
      description:
        "Split a URI into protocol, authentication, host, path, query and fragment fields.",
      category: "Structured data",
      tags: ["uri", "url", "parse", "network"],
      raw: "ParseURI",
    }),
    defineRecipe({
      id: "decode-base64-gzip-payload",
      name: "Decode Base64-wrapped Gzip payload",
      description:
        "Decode a Base64 wrapper and decompress the contained Gzip stream.",
      category: "Malware analysis",
      tags: ["base64", "gzip", "decode", "deobfuscation"],
      raw: "FromBase64 | Gunzip",
    }),
    defineRecipe({
      id: "extract-printable-strings",
      name: "Extract printable strings",
      description:
        "Extract unique printable strings from single-byte and UTF-16 data for static triage.",
      category: "Malware analysis",
      tags: ["strings", "static-analysis", "binary", "triage"],
      raw: 'Strings(Encoding="All", Minimum length=5, Match="All printable chars (A)", Display total=true, Sort=true, Unique=true)',
    }),
    defineRecipe({
      id: "detect-file-type",
      name: "Detect file type by signature",
      description:
        "Identify binary data by file signatures instead of trusting its file extension.",
      category: "Malware analysis",
      tags: ["file-type", "signature", "binary", "triage"],
      raw: "DetectFileType",
    }),
    defineRecipe({
      id: "measure-byte-entropy",
      name: "Measure byte entropy",
      description:
        "Measure Shannon entropy to spot likely packed, compressed or encrypted data.",
      category: "Malware analysis",
      tags: ["entropy", "packing", "encryption", "binary"],
      raw: "Entropy",
    }),
    defineRecipe({
      id: "xor-single-byte-bruteforce",
      name: "Brute-force single-byte XOR",
      description:
        "Try every one-byte XOR key against the first 100 bytes and label each candidate.",
      category: "Malware analysis",
      tags: ["xor", "brute-force", "deobfuscation", "binary"],
      raw: "XORBruteForce",
    }),
    defineRecipe({
      id: "beautify-javascript",
      name: "Beautify suspicious JavaScript",
      description:
        "Parse and reformat valid JavaScript while retaining comments for manual review.",
      category: "Malware analysis",
      tags: ["javascript", "beautify", "deobfuscation", "script"],
      raw: "GenericCodeBeautify",
    }),
    defineRecipe({
      id: "decode-microsoft-script",
      name: "Decode Microsoft encoded script",
      description:
        "Decode legacy Microsoft Script Encoder content and format the resulting JavaScript.",
      category: "Malware analysis",
      tags: ["javascript", "vbscript", "microsoft", "deobfuscation"],
      raw: "MicrosoftScriptDecoder | GenericCodeBeautify",
    }),
    defineRecipe({
      id: "analyse-hash",
      name: "Identify hash candidates",
      description:
        "Report hash length and algorithms that commonly produce that size.",
      category: "Malware analysis",
      tags: ["hash", "identify", "triage"],
      raw: "AnalyseHash",
    }),
    defineRecipe({
      id: "extract-safe-urls",
      name: "Extract and safely defang URLs",
      description:
        "Normalise defanged URLs for matching, extract unique URLs, then safely defang the result.",
      category: "Indicators",
      tags: ["ioc", "url", "extract", "defang"],
      raw: "FangURL | ExtractURLs(Display total=true, Sort=true, Unique=true) | DefangURL",
    }),
    defineRecipe({
      id: "extract-safe-ip-addresses",
      name: "Extract and defang IP addresses",
      description:
        "Extract unique IPv4 and IPv6 indicators and defang the output for safe sharing.",
      category: "Indicators",
      tags: ["ioc", "ip", "extract", "defang"],
      raw: "ExtractIPAddresses(IPv4=true, IPv6=true, Remove local IPv4 addresses=false, Display total=true, Sort=true, Unique=true) | DefangIPAddresses",
    }),
    defineRecipe({
      id: "extract-domains",
      name: "Extract domain indicators",
      description:
        "Extract, sort and deduplicate domain names, including underscore-based records.",
      category: "Indicators",
      tags: ["ioc", "domain", "dns", "extract"],
      // Numeric index avoids ambiguity because this argument's display name contains commas.
      raw: "ExtractDomains(Display total=true, Sort=true, Unique=true, 3=true)",
    }),
    defineRecipe({
      id: "extract-hashes",
      name: "Extract hash indicators",
      description:
        "Extract common hexadecimal hash lengths and include a result count.",
      category: "Indicators",
      tags: ["ioc", "hash", "extract"],
      raw: "ExtractHashes(All hashes=true, Display Total=true)",
    }),
    defineRecipe({
      id: "extract-file-paths",
      name: "Extract file paths",
      description:
        "Extract, sort and deduplicate Windows and Unix paths from logs or strings.",
      category: "Indicators",
      tags: ["ioc", "path", "filesystem", "extract"],
      raw: "ExtractFilePaths(Windows=true, UNIX=true, Display total=true, Sort=true, Unique=true)",
    }),
  ]);

function cloneDefinition(
  definition: Readonly<StandardRecipeDefinition>,
): StandardRecipeDefinition {
  return { ...definition, tags: [...definition.tags] };
}

/** Return detached definition objects suitable for webview serialization. */
export function getStandardRecipeDefinitions(): StandardRecipeDefinition[] {
  return STANDARD_RECIPE_DEFINITIONS.map(cloneDefinition);
}

function searchableText(
  definition: Readonly<StandardRecipeDefinition>,
): string {
  return [
    definition.id,
    definition.name,
    definition.description,
    definition.category,
    ...definition.tags,
  ]
    .join(" ")
    .toLocaleLowerCase();
}

function matchesFilter(
  definition: Readonly<StandardRecipeDefinition>,
  filter: StandardRecipeFilter,
): boolean {
  if (filter.category && definition.category !== filter.category) return false;

  const tags = new Set(definition.tags.map((tag) => tag.toLocaleLowerCase()));
  if (filter.tags?.some((tag) => !tags.has(tag.trim().toLocaleLowerCase()))) {
    return false;
  }

  const search = filter.search?.trim().toLocaleLowerCase();
  return !search || searchableText(definition).includes(search);
}

function materialise(
  definition: Readonly<StandardRecipeDefinition>,
): BuiltInPipeline {
  return {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    category: definition.category,
    tags: [...definition.tags],
    raw: definition.raw,
    steps: parsePipeline(definition.raw),
    scope: BUILT_IN_RECIPE_SOURCE,
    source: BUILT_IN_RECIPE_SOURCE,
  };
}

/**
 * Load fresh pipeline objects. No returned array, step, argument or tag array is
 * shared with a later call, so editors may modify a loaded recipe safely.
 */
export function loadStandardRecipes(
  filter: StandardRecipeFilter = {},
): BuiltInPipeline[] {
  return STANDARD_RECIPE_DEFINITIONS.filter((definition) =>
    matchesFilter(definition, filter),
  ).map(materialise);
}

/** Load one fresh built-in pipeline by its stable id (case-insensitive). */
export function loadStandardRecipe(id: string): BuiltInPipeline | undefined {
  const normalisedId = id.trim().toLocaleLowerCase();
  const definition = STANDARD_RECIPE_DEFINITIONS.find(
    (candidate) => candidate.id.toLocaleLowerCase() === normalisedId,
  );
  return definition ? materialise(definition) : undefined;
}

function isValidArgument(value: unknown, definition: ArgConfig): boolean {
  switch (definition.type) {
    case "boolean":
      return typeof value === "boolean";
    case "number":
      return (
        typeof value === "number" &&
        Number.isFinite(value) &&
        (definition.min === undefined || value >= definition.min) &&
        (definition.max === undefined || value <= definition.max)
      );
    case "option":
      return (
        Array.isArray(definition.value) &&
        definition.value.some((option) => Object.is(option, value))
      );
    case "argSelector":
      return (
        typeof value === "string" &&
        Array.isArray(definition.value) &&
        definition.value.some(
          (option) =>
            typeof option === "object" &&
            option !== null &&
            "name" in option &&
            option.name === value,
        )
      );
    case "toggleString":
      return (
        typeof value === "object" &&
        value !== null &&
        "string" in value &&
        typeof value.string === "string" &&
        "option" in value &&
        typeof value.option === "string"
      );
    case "editableOption":
    case "editableOptionShort":
    case "binaryShortString":
    case "binaryString":
    case "shortString":
    case "string":
    case "text":
      return typeof value === "string";
    default:
      // Some CyberChef UI-only argument kinds have no stronger runtime shape.
      return value !== undefined;
  }
}

/**
 * Validate catalog ids, operation names and every materialised argument against
 * the live operation registry. This is also useful as a release-time health check.
 */
export function validateStandardRecipes(
  definitions: readonly Readonly<StandardRecipeDefinition>[] = STANDARD_RECIPE_DEFINITIONS,
): StandardRecipeValidationIssue[] {
  const issues: StandardRecipeValidationIssue[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();

  for (const definition of definitions) {
    const idKey = definition.id.toLocaleLowerCase();
    const nameKey = definition.name.toLocaleLowerCase();
    if (ids.has(idKey)) {
      issues.push({
        recipeId: definition.id,
        code: "duplicate-id",
        message: `Duplicate standard recipe id: ${definition.id}`,
      });
    }
    if (names.has(nameKey)) {
      issues.push({
        recipeId: definition.id,
        code: "duplicate-name",
        message: `Duplicate standard recipe name: ${definition.name}`,
      });
    }
    ids.add(idKey);
    names.add(nameKey);

    let steps: PipelineStep[];
    try {
      steps = parsePipeline(definition.raw);
    } catch (error) {
      issues.push({
        recipeId: definition.id,
        code: "parse-error",
        message: error instanceof Error ? error.message : String(error),
      });
      continue;
    }

    if (steps.length === 0) {
      issues.push({
        recipeId: definition.id,
        code: "empty-pipeline",
        message: "Standard recipe contains no operations.",
      });
      continue;
    }

    steps.forEach((step, stepIndex) => {
      const meta = findOp(step.opName);
      if (!meta) {
        issues.push({
          recipeId: definition.id,
          code: "unknown-operation",
          stepIndex,
          message: `Unknown operation: ${step.opName}`,
        });
        return;
      }

      const argumentDefinitions = meta.factory().args;
      if (step.args.length !== argumentDefinitions.length) {
        issues.push({
          recipeId: definition.id,
          code: "argument-count",
          stepIndex,
          message: `${step.opName} expects ${argumentDefinitions.length} arguments, received ${step.args.length}.`,
        });
      }

      argumentDefinitions.forEach((argumentDefinition, argumentIndex) => {
        if (!isValidArgument(step.args[argumentIndex], argumentDefinition)) {
          issues.push({
            recipeId: definition.id,
            code: "invalid-argument",
            stepIndex,
            argumentIndex,
            message: `Invalid value for ${step.opName}.${argumentDefinition.name}.`,
          });
        }
      });
    });
  }

  return issues;
}
