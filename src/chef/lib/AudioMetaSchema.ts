export interface AudioReport {
  schema_version: string;
  artifact: {
    filename: string;
    byte_length: number;
    container: { type: string; brand: string | null; mime: string | null };
  };
  detections: { metadata_systems: unknown[]; provenance_systems: unknown[] };
  tags: {
    common: {
      title: null | string;
      artist: null | string;
      album: null | string;
      date: null | string;
      track: null | string;
      genre: null | string;
      comment: null | string;
      composer: null | string;
      copyright: null | string;
      language: null | string;
    };
    raw: Record<string, unknown>;
  };
  embedded: unknown[];
  provenance: Record<string, unknown>;
  errors: unknown[];
}

export interface ContainerInfo {
  type: string;
  brand?: string | null;
  mime?: string | null;
}

export function makeEmptyReport(
  filename: string,
  byteLength: number,
  container: ContainerInfo,
): AudioReport {
  return {
    schema_version: "audio-meta-1.0",
    artifact: {
      filename,
      byte_length: byteLength,
      container: {
        type: container.type,
        brand: container.brand ?? null,
        mime: container.mime ?? null,
      },
    },
    detections: { metadata_systems: [], provenance_systems: [] },
    tags: {
      common: {
        title: null,
        artist: null,
        album: null,
        date: null,
        track: null,
        genre: null,
        comment: null,
        composer: null,
        copyright: null,
        language: null,
      },
      raw: {},
    },
    embedded: [],
    provenance: {},
    errors: [],
  };
}

export function sniffContainer(b: Uint8Array): ContainerInfo {
  if (b.length >= 3 && b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33)
    return { type: "mp3", mime: "audio/mpeg" };
  if (b.length >= 2 && b[0] === 0xff && (b[1] & 0xe0) === 0xe0) {
    if ((b[1] & 0x06) === 0x00) return { type: "aac", mime: "audio/aac" };
    return { type: "mp3", mime: "audio/mpeg" };
  }
  if (
    b.length >= 4 &&
    b[0] === 0x66 &&
    b[1] === 0x4c &&
    b[2] === 0x61 &&
    b[3] === 0x43
  )
    return { type: "flac", mime: "audio/flac" };
  if (
    b.length >= 4 &&
    b[0] === 0x4f &&
    b[1] === 0x67 &&
    b[2] === 0x67 &&
    b[3] === 0x53
  )
    return { type: "ogg", mime: "audio/ogg" };
  if (
    b.length >= 12 &&
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46
  )
    return { type: "riff-wave", mime: "audio/wav" };
  return { type: "unknown", mime: null };
}
