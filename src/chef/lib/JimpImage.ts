/**
 * @fileoverview Image decoding helpers that avoid Jimp's dynamic MIME import.
 * @package chef/lib
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import { Jimp } from "jimp";
import { isImage } from "./FileType";

export type SupportedJimpMime =
  | "image/jpeg"
  | "image/gif"
  | "image/png"
  | "image/tiff"
  | "image/bmp"
  | "image/x-ms-bmp";

/** Decodes a supported image using the MIME type already identified by ts-chef. */
export async function readJimpImage(input: ArrayBuffer) {
  const mime = isImage(input);
  if (!mime) throw new Error("Unsupported image format");
  const format = new Jimp({ width: 1, height: 1 }).formats.find(
    (candidate) => candidate.mime === mime,
  );
  if (!format?.decode) throw new Error(`No decoder available for ${mime}`);
  const bitmap = await format.decode(Buffer.from(new Uint8Array(input)));
  const image = Jimp.fromBitmap(bitmap);
  image.mime = mime;
  return image;
}
