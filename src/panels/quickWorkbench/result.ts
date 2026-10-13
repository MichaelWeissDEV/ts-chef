/** Preserve engine bytes; text-only actions export binary results as explicit hex. */
export function renderResult(result: string | Uint8Array | ArrayBuffer, limit: number) {
  let binary = false;
  const fullResult = typeof result === "string" ? result : Buffer.from(result instanceof ArrayBuffer ? new Uint8Array(result) : result);
  const size = typeof fullResult === "string" ? Buffer.byteLength(fullResult, "utf8") : fullResult.byteLength;
  if (size > limit) throw new Error(`Result too large: ${size} bytes exceeds ${limit}`);
  let text: string;
  if (typeof fullResult === "string") text = fullResult;
  else {
    try { text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(fullResult); }
    catch { binary = true; text = fullResult.toString("hex"); }
  }
  return { fullResult, size, text, binary, preview: text.slice(0, 100000), isPreviewTruncated: text.length > 100000 };
}
