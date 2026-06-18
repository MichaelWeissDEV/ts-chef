/**
 * @fileoverview ExtractAudioMetadata operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import { makeEmptyReport, sniffContainer } from "../lib/AudioMetaSchema";
import {
  parseMp3,
  parseRiffWave,
  parseFlac,
  parseOgg,
  parseMp4BestEffort,
  parseAiffBestEffort,
  parseAacAdts,
  parseAc3,
  parseWmaAsf,
} from "../lib/AudioParsers";

/**
 * Extract Audio Metadata operation.
 */
export class ExtractAudioMetadata extends Operation {
  /** Creates the Extract Audio Metadata operation. */
  constructor() {
    super();

    this.name = "Extract Audio Metadata";
    this.module = "Default";
    this.description =
      "Extract common audio metadata across MP3 (ID3v2/ID3v1/GEOB), WAV/BWF/BW64 (INFO/bext/iXML/axml), FLAC (Vorbis Comment/Picture), OGG (Vorbis/OpusTags), AAC (ADTS), AC3 (Dolby Digital), WMA (ASF), plus best-effort MP4/M4A and AIFF scanning. Outputs normalized JSON.";
    this.infoURL = "https://wikipedia.org/wiki/Audio_file_format";
    this.inputType = "ArrayBuffer";
    this.outputType = "JSON";
    this.presentType = "html";

    this.args = [
      { name: "Filename (optional)", type: "string", value: "" },
      {
        name: "Max embedded text bytes (iXML/axml/etc)",
        type: "number",
        value: 1024 * 512,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {any[]} args
   * @returns {any}
   */
  run(input: ArrayBuffer, args: unknown[]): AnyInput {
    const [arg0, arg1] = args as [string, number];
    const filename = (arg0 || "").trim() || null;
    const maxTextBytes = Number.isFinite(arg1)
      ? Math.max(1024, arg1)
      : 1024 * 512;

    if (!(input instanceof ArrayBuffer) || input.byteLength === 0)
      throw new OperationError(
        "No input data. Load an audio file (drag/drop or use the open file button).",
      );

    const bytes = new Uint8Array(input);
    const container = sniffContainer(bytes);
    const report = makeEmptyReport(filename, bytes.length, container);

    try {
      const parsers: Record<string, () => void> = {
        mp3: () => parseMp3(bytes, report),
        wav: () => parseRiffWave(bytes, report, maxTextBytes),
        bw64: () => parseRiffWave(bytes, report, maxTextBytes),
        flac: () => parseFlac(bytes, report, maxTextBytes),
        ogg: () => parseOgg(bytes, report),
        opus: () => parseOgg(bytes, report),
        mp4: () => parseMp4BestEffort(bytes, report),
        m4a: () => parseMp4BestEffort(bytes, report),
        aiff: () => parseAiffBestEffort(bytes, report, maxTextBytes),
        aac: () => parseAacAdts(bytes, report),
        ac3: () => parseAc3(bytes, report),
        wma: () => parseWmaAsf(bytes, report),
      };
      if (parsers[container.type]) {
        parsers[container.type]();
      } else {
        report.errors.push({
          stage: "sniff",
          message:
            "Unknown/unsupported container (best-effort scan not implemented).",
        });
      }
    } catch (e: any) {
      report.errors.push({ stage: "parse", message: String(e?.message || e) });
    }

    return report;
  }

  /** Renders the extracted metadata as an HTML table. */
  present(data: AnyInput): string {
    const d = data as any;
    if (!d || typeof d !== "object") return JSON.stringify(d, null, 4);

    const esc = Utils.escapeHtml;
    let html = `<table class="table table-hover table-sm table-bordered table-nonfluid">\n`;

    const row = (k: string, v: any) =>
      `<tr><td>${esc(String(k))}</td><td>${esc(String(v ?? ""))}</td></tr>\n`;
    const section = (title: string) =>
      `<tr><th colspan="2" style="background:#e9ecef;text-align:center">${esc(title)}</th></tr>\n`;
    const objRows = (obj: any, filter = (v: any) => v !== null) => {
      for (const [k, v] of Object.entries(obj)) {
        if (filter(v)) html += row(k, v);
      }
    };
    const objSection = (
      obj: any,
      title: string,
      filter?: (v: any) => boolean,
    ) => {
      if (!obj) return;
      html += section(title);
      objRows(obj, filter);
    };
    const listSection = (
      arr: any[] | undefined,
      title: string,
      fmt: (item: any) => string,
    ) => {
      if (!arr?.length) return;
      html += section(title);
      for (const item of arr) html += fmt(item);
    };

    html += section("Artifact");
    html += row("Filename", d.artifact?.filename || "(none)");
    html += row(
      "Size",
      `${(d.artifact?.byte_length ?? 0).toLocaleString()} bytes`,
    );
    html += row("Container", d.artifact?.container?.type);
    html += row("MIME", d.artifact?.container?.mime);
    if (d.artifact?.container?.brand)
      html += row("Brand", d.artifact.container.brand);

    html += section("Detections");
    html += row(
      "Metadata systems",
      (d.detections?.metadata_systems || []).join(", ") || "None",
    );
    html += row(
      "Provenance systems",
      (d.detections?.provenance_systems || []).join(", ") || "None",
    );

    const common = d.tags?.common || {};
    html += section("Common Tags");
    if (Object.values(common).some((v) => v !== null)) {
      for (const [key, val] of Object.entries(common)) {
        if (val !== null)
          html += row(key.charAt(0).toUpperCase() + key.slice(1), val);
      }
    } else {
      html += row("(none)", "No common tags found");
    }

    listSection(d.tags?.raw?.id3v2?.frames, "ID3v2 Frames", (f: any) => {
      const val =
        typeof f.decoded === "object"
          ? JSON.stringify(f.decoded)
          : (f.decoded ?? `(${f.size} bytes)`);
      return row(f.id + (f.description ? ` \u2014 ${f.description}` : ""), val);
    });
    objSection(d.tags?.raw?.id3v1, "ID3v1", (v: any) => !!v);
    listSection(d.tags?.raw?.apev2?.items, "APEv2 Tags", (i: any) =>
      row(i.key, i.value),
    );

    if (d.tags?.raw?.vorbis_comments?.comments?.length) {
      html += section("Vorbis Comments");
      html += row("Vendor", d.tags.raw.vorbis_comments.vendor);
      for (const c of d.tags.raw.vorbis_comments.comments)
        html += row(c.key, c.value);
    }

    objSection(d.tags?.raw?.riff?.info, "RIFF INFO", () => true);
    objSection(d.tags?.raw?.riff?.bext, "BWF bext");
    listSection(d.tags?.raw?.riff?.chunks, "RIFF Chunks", (c: any) =>
      row(c.id, `${c.size} bytes @ offset ${c.offset}`),
    );
    listSection(d.tags?.raw?.flac?.blocks, "FLAC Metadata Blocks", (b: any) =>
      row(b.type, `${b.length} bytes`),
    );

    if (d.tags?.raw?.mp4?.top_level_atoms?.length) {
      html += section("MP4 Top-Level Atoms");
      const atoms = d.tags.raw.mp4.top_level_atoms;
      for (const a of atoms.slice(0, 50))
        html += row(a.type, `${a.size} bytes @ offset ${a.offset}`);
      if (atoms.length > 50)
        html += row("...", `${atoms.length - 50} more atoms`);
    }

    listSection(d.tags?.raw?.aiff?.chunks, "AIFF Chunks", (c: any) =>
      row(c.id, c.value),
    );
    objSection(d.tags?.raw?.aac, "AAC ADTS");
    objSection(d.tags?.raw?.ac3, "AC3 (Dolby Digital)");
    objSection(
      d.tags?.raw?.asf?.content_description,
      "ASF Content Description",
      (v: any) => !!v,
    );
    listSection(
      d.tags?.raw?.asf?.extended_content,
      "ASF Extended Content",
      (item: any) => row(item.name, item.value),
    );
    listSection(d.embedded, "Embedded Objects", (e: any) =>
      row(
        e.id,
        `${e.content_type || "unknown"} \u2014 ${(e.byte_length ?? 0).toLocaleString()} bytes`,
      ),
    );

    if (d.provenance?.c2pa?.present) {
      html += section("C2PA Provenance");
      html += row("Present", "Yes");
      for (const emb of d.provenance.c2pa.embedding || [])
        html += row(
          "Carrier",
          `${emb.carrier} \u2014 ${(emb.byte_length ?? 0).toLocaleString()} bytes`,
        );
    }

    listSection(d.errors, "Errors", (e: any) => row(e.stage, e.message));

    html += "</table>";
    return html;
  }
}

export default ExtractAudioMetadata;
