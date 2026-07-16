/**
 * Conservative allowlist for automatic live preview. Everything not listed
 * here requires an explicit Run. This keeps expensive, random, networked and
 * malware-analysis operations out of automatic execution.
 */
const SAFE_LIVE_OPERATIONS = new Set<string>([
  "FromBase32",
  "FromBase45",
  "FromBase58",
  "FromBase62",
  "FromBase64",
  "FromBase85",
  "FromBase92",
  "FromBinary",
  "FromCharcode",
  "FromDecimal",
  "FromHex",
  "FromHTMLEntity",
  "FromModhex",
  "FromMorseCode",
  "FromOctal",
  "FromQuotedPrintable",
  "ToBase32",
  "ToBase45",
  "ToBase58",
  "ToBase62",
  "ToBase64",
  "ToBase85",
  "ToBase92",
  "ToBinary",
  "ToCharcode",
  "ToDecimal",
  "ToHex",
  "ToHTMLEntity",
  "ToModhex",
  "ToMorseCode",
  "ToOctal",
  "ToQuotedPrintable",
  "URLDecode",
  "URLEncode",
  "AddLineNumbers",
  "AlternatingCaps",
  "CSSBeautify",
  "CSSMinify",
  "CSVToJSON",
  "DefangIPAddresses",
  "DefangURL",
  "DropBytes",
  "EscapeString",
  "EscapeUnicodeCharacters",
  "FangURL",
  "Head",
  "HTMLToText",
  "JavaScriptBeautify",
  "JSONBeautify",
  "JSONMinify",
  "JSONToCSV",
  "JSONtoYAML",
  "PadLines",
  "RemoveLineNumbers",
  "RemoveWhitespace",
  "Reverse",
  "ROT13",
  "ROT47",
  "SQLBeautify",
  "SQLMinify",
  "StripHTMLTags",
  "SwapCase",
  "Tail",
  "TakeBytes",
  "ToCamelCase",
  "ToKebabCase",
  "ToLowerCase",
  "ToSnakeCase",
  "ToUpperCase",
  "Trim",
  "UnescapeString",
  "UnescapeUnicodeCharacters",
  "XMLBeautify",
  "XMLMinify",
]);

export const MAX_LIVE_INPUT_CHARACTERS = 64 * 1024;
export const MAX_LIVE_OUTPUT_CHARACTERS = 4 * 1024 * 1024;

export function isOperationSafeForLive(
  opName: string,
  manualBake = false,
): boolean {
  return !manualBake && SAFE_LIVE_OPERATIONS.has(opName);
}

export function firstUnsafeLiveOperation(
  steps: ReadonlyArray<{ opName: string }>,
  manualBakeFor: (opName: string) => boolean,
): string | undefined {
  return steps.find(
    (step) => !isOperationSafeForLive(step.opName, manualBakeFor(step.opName)),
  )?.opName;
}
