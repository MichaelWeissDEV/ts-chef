export type OutputFormat = "utf8" | "hex" | "base64";

/** Preserve the original type. Export only the explicit, complete representation. */
export function renderResult(result: string | Uint8Array | ArrayBuffer, limit: number, requestedFormat: OutputFormat = "utf8") {
  const binary = typeof result !== "string";
  const size = typeof result === "string" ? Buffer.byteLength(result, "utf8") : result.byteLength;
  // Check before cloning bytes or allocating a hex/base64 representation.
  if (size > limit) throw new Error(`Result too large: ${size} bytes exceeds ${limit}`);
  const fullResult = typeof result === "string" ? result : Buffer.from(result instanceof ArrayBuffer ? new Uint8Array(result) : result);
  let format = requestedFormat;
  let text: string;
  if (format === "utf8") {
    if (typeof fullResult === "string") text = fullResult;
    else {
      try { text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(fullResult); }
      catch { format = "hex"; text = fullResult.toString("hex"); }
    }
  } else {
    const bytes = typeof fullResult === "string" ? Buffer.from(fullResult, "utf8") : fullResult;
    text = bytes.toString(format);
  }
  return { fullResult, size, text, binary, format, preview: text.slice(0, 100000), isPreviewTruncated: text.length > 100000 };
}
