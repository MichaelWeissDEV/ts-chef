import * as vscode from "vscode";
import { ScanState } from "./scanState";
import { runOp } from "../commands/runner";

export class HoverProvider implements vscode.HoverProvider {
  constructor(private state: ScanState) {}

  provideHover(
    doc: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.Hover | undefined {
    const threshold: number = vscode.workspace
      .getConfiguration("tschef")
      .get("confidenceThreshold", 0.9);
    const matches = this.state.get(doc.uri);
    const match = matches.find((m) => m.range.contains(position));
    if (!match) return;

    const highConf = match.matches.filter((r) => r.confidence >= threshold);
    if (highConf.length === 0) return;

    const md = new vscode.MarkdownString(
      "**ts-chef** — likely match(es):\n\n",
      true,
    );
    md.isTrusted = true;

    for (const result of highConf) {
      const conf = Math.round(result.confidence * 100);
      let preview = "";
      try {
        const out = runOp(result.opName, match.value, result.defaultArgs);
        let str: string;
        if (Array.isArray(out))
          str = Buffer.from(out as number[]).toString("utf-8");
        else if (typeof out === "string") str = out;
        else str = JSON.stringify(out);
        preview = str.length === 0 ? "(empty result)" : str.slice(0, 80);
      } catch (e) {
        preview = `(error: ${String(e).slice(0, 60)})`;
      }

      const convertCmd = encodeURIComponent(
        JSON.stringify({
          opName: result.opName,
          value: match.value,
          args: result.defaultArgs,
        }),
      );
      md.appendMarkdown(
        `- **${result.label}** (${conf}%) → \`${preview}\` ` +
          `[Convert](command:tschef.applyConversion?${convertCmd})\n\n`,
      );
    }

    return new vscode.Hover(md, match.range);
  }
}
