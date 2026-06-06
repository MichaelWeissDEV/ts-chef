/*
 * -----------------------------------------------------------------------------
 * Project:     ts-chef
 * Model:       Qwen 3.5 Coder Next (Local)
 * Version:     1.0.0
 * Author:      Michael Weiss
 * Source:      Ported from GCHQ's CyberChef (JavaScript)
 * License:     Apache License 2.0
 * Description: TypeScript implementation of CyberChef modules.
 * Note:        First Port done by Local Model, Cleanup and fixes by Author
 * -----------------------------------------------------------------------------
 */

import {
  FILE_SIGNATURES,
  FileSignature,
  SignatureMatch,
} from "./FileSignatures";

/**
 * Checks whether a signature matches a buffer.
 */
function signatureMatches(
  sig: SignatureMatch | SignatureMatch[],
  buf: Uint8Array,
  offset: number = 0,
): boolean {
  if (Array.isArray(sig)) {
    for (let i = 0; i < sig.length; i++) {
      if (bytesMatch(sig[i], buf, offset)) return true;
    }
    return false;
  } else {
    return bytesMatch(sig, buf, offset);
  }
}

/**
 * Checks whether a set of bytes match the given buffer.
 */
function bytesMatch(
  sig: SignatureMatch,
  buf: Uint8Array,
  offset: number = 0,
): boolean {
  for (const sigoffset in sig) {
    const pos = parseInt(sigoffset, 10) + offset;
    const val = sig[sigoffset];
    switch (typeof val) {
      case "number": // Static check
        if (buf[pos] !== val) return false;
        break;
      case "object": // Array of options
        if (val.indexOf(buf[pos]) < 0) return false;
        break;
      case "function": // More complex calculation
        if (!val(buf[pos])) return false;
        break;
      default:
        throw new Error(`Unrecognised signature type at offset ${sigoffset}`);
    }
  }
  return true;
}

/**
 * Given a buffer, detects magic byte sequences at specific positions and returns the
 * extension and mime type.
 */
export function detectFileType(
  buf: Uint8Array | ArrayBuffer,
  categories: string[] = Object.keys(FILE_SIGNATURES),
): FileSignature[] {
  const data = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;

  if (!(data && data.length > 1)) {
    return [];
  }

  const matchingFiles: FileSignature[] = [];
  const signatures: { [key: string]: FileSignature[] } = {};

  for (const cat in FILE_SIGNATURES) {
    if (categories.includes(cat)) {
      signatures[cat] = FILE_SIGNATURES[cat];
    }
  }

  for (const cat in signatures) {
    const category = signatures[cat];

    category.forEach((filetype) => {
      if (signatureMatches(filetype.signature, data)) {
        matchingFiles.push(filetype);
      }
    });
  }
  return matchingFiles;
}

/**
 * Given a buffer, searches for magic byte sequences at all possible positions and returns
 * the extensions and mime types.
 */
export function scanForFileTypes(
  buf: Uint8Array,
  categories: string[] = Object.keys(FILE_SIGNATURES),
): { offset: number; fileDetails: FileSignature }[] {
  if (!(buf && buf.length > 1)) {
    return [];
  }

  const foundFiles: { offset: number; fileDetails: FileSignature }[] = [];
  const signatures: { [key: string]: FileSignature[] } = {};

  for (const cat in FILE_SIGNATURES) {
    if (categories.includes(cat)) {
      signatures[cat] = FILE_SIGNATURES[cat];
    }
  }

  for (const cat in signatures) {
    const category = signatures[cat];

    for (let i = 0; i < category.length; i++) {
      const filetype = category[i];
      const sigs = Array.isArray(filetype.signature)
        ? filetype.signature
        : [filetype.signature];

      sigs.forEach((sig) => {
        let pos = 0;
        while ((pos = locatePotentialSig(buf, sig, pos)) >= 0) {
          if (bytesMatch(sig, buf, pos)) {
            foundFiles.push({
              offset: pos,
              fileDetails: filetype,
            });
          }
          pos++;
        }
      });
    }
  }

  return foundFiles.sort((a, b) => a.offset - b.offset);
}

/**
 * Fastcheck function to quickly scan the buffer for the first byte in a signature.
 */
function locatePotentialSig(
  buf: Uint8Array,
  sig: SignatureMatch,
  offset: number,
): number {
  const k = parseInt(Object.keys(sig)[0], 10);
  const v = Object.values(sig)[0];
  switch (typeof v) {
    case "number":
      return buf.indexOf(v, offset + k) - k;
    case "object":
      for (let i = offset + k; i < buf.length; i++) {
        if (v.indexOf(buf[i]) >= 0) return i - k;
      }
      return -1;
    case "function":
      for (let i = offset + k; i < buf.length; i++) {
        if (v(buf[i])) return i - k;
      }
      return -1;
    default:
      throw new Error("Unrecognised signature type");
  }
}

/**
 * Detects whether the given buffer is a file of the type specified.
 */
export function isType(
  type: string | RegExp,
  buf: Uint8Array | ArrayBuffer,
): string | false {
  const types = detectFileType(buf);

  if (!types.length) return false;

  if (typeof type === "string") {
    return types.reduce((acc: string | false, t) => {
      const mime = t.mime.startsWith(type) ? t.mime : false;
      return acc || mime;
    }, false);
  } else if (type instanceof RegExp) {
    return types.reduce((acc: string | false, t) => {
      const mime = type.test(t.mime) ? t.mime : false;
      return acc || mime;
    }, false);
  } else {
    throw new Error("Invalid type input.");
  }
}

/**
 * Detects whether the given buffer contains an image file.
 */
export function isImage(buf: Uint8Array | ArrayBuffer): string | false {
  return isType("image", buf);
}

/**
 * Attempts to extract a file from a data stream given its offset and extractor function.
 */
export function extractFile(
  bytes: Uint8Array,
  fileDetail: FileSignature,
  offset: number,
): any {
  if (fileDetail.extractor) {
    const fileData = fileDetail.extractor(bytes, offset);
    const ext = fileDetail.extension.split(",")[0];
    return {
      data: fileData,
      fileName: `extracted_at_0x${offset.toString(16)}.${ext}`,
      type: fileDetail.mime,
    };
  }

  throw new Error(
    `No extraction algorithm available for "${fileDetail.mime}" files`,
  );
}
