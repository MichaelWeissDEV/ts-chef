import * as vscode from "vscode";
import { HoverProvider } from "../src/providers/hoverProvider";
import { ScanState } from "../src/providers/scanState";

function documentFor(text: string, languageId = "plaintext"): vscode.TextDocument {
  const lines = text.split("\n");
  return {
    uri: vscode.Uri.file("/tmp/hover-test.txt"),
    version: 1,
    languageId,
    lineAt: (line: number) => ({ text: lines[line] }),
    getText: (range?: vscode.Range) => {
      if (!range) return text;
      if (range.start.line === range.end.line)
        return lines[range.start.line].slice(
          range.start.character,
          range.end.character,
        );
      return text;
    },
  } as vscode.TextDocument;
}

const token = { isCancellationRequested: false } as vscode.CancellationToken;

describe("HoverProvider", () => {
  test("decodes an encoded value on demand without a document scan", async () => {
    const encoded = Buffer.from("Hello from instant hover", "utf-8").toString(
      "base64",
    );
    const doc = documentFor(`const payload = "${encoded}";`, "typescript");
    const hover = await new HoverProvider(new ScanState()).provideHover(
      doc,
      new vscode.Position(0, 20),
      token,
    );
    const markdown = (hover?.contents[0] as vscode.MarkdownString).value;
    expect(markdown).toContain("String analysis");
    expect(markdown).toContain("Hello from instant hover");
    expect(markdown).toContain("tschef.applyConversion");
  });

  test("shows code-literal conversions and two's complement", async () => {
    const doc = documentFor("let mask: u8 = 0xffu8;", "rust");
    const hover = await new HoverProvider(new ScanState()).provideHover(
      doc,
      new vscode.Position(0, 18),
      token,
    );
    const markdown = (hover?.contents[0] as vscode.MarkdownString).value;
    expect(markdown).toContain("Instant integer calculator");
    expect(markdown).toContain("Two's complement (8-bit)");
    expect(markdown).toContain("signed interpretation: `-1`");
    expect(markdown).toContain("tschef.replaceIntegerLiteral");
  });

  test("prefers a JWT detection over overlapping Base64 fragments", async () => {
    const jwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
      "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0." +
      "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJVadQssw5c";
    const doc = documentFor(jwt);
    const hover = await new HoverProvider(new ScanState()).provideHover(
      doc,
      new vscode.Position(0, 5),
      token,
    );
    expect((hover?.contents[0] as vscode.MarkdownString).value).toContain(
      "**JWT**",
    );
  });

  test("whitelists only ts-chef commands for untrusted decoded content", async () => {
    const malicious =
      "` [Run command](command:workbench.action.terminal.new) ` payload padding";
    const encoded = Buffer.from(malicious, "utf-8").toString("base64");
    const doc = documentFor(encoded);
    const hover = await new HoverProvider(new ScanState()).provideHover(
      doc,
      new vscode.Position(0, 5),
      token,
    );
    const markdown = hover?.contents[0] as vscode.MarkdownString;
    expect(markdown.value).toContain("```text");
    expect(markdown.isTrusted).toEqual({
      enabledCommands: [
        "tschef.applyConversion",
        "tschef.applyPipelineConversion",
        "tschef.replaceIntegerLiteral",
      ],
    });
  });

  test("targets a complete long Base64 token instead of a cropped middle", async () => {
    const encoded = Buffer.from("long payload ".repeat(7_000)).toString(
      "base64",
    );
    const doc = documentFor(encoded);
    const hover = await new HoverProvider(new ScanState()).provideHover(
      doc,
      new vscode.Position(0, Math.floor(encoded.length / 2)),
      token,
    );
    expect(hover?.range?.start.character).toBe(0);
    expect(hover?.range?.end.character).toBe(encoded.length);
  });

  test("long-token recovery excludes an assignment prefix", async () => {
    const encoded = Buffer.from("assigned long payload ".repeat(7_000)).toString(
      "base64",
    );
    const prefix = "PAYLOAD=";
    const doc = documentFor(`${prefix}${encoded}`, "shellscript");
    const hover = await new HoverProvider(new ScanState()).provideHover(
      doc,
      new vscode.Position(0, prefix.length + Math.floor(encoded.length / 2)),
      token,
    );
    expect(hover?.range?.start.character).toBe(prefix.length);
    expect(hover?.range?.end.character).toBe(prefix.length + encoded.length);
  });
});
