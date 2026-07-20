/**
 * QR code resources
 *
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError";
import jsQR from "jsqr";
import qr from "qr-image";
import Utils from "../Utils";
import { readJimpImage } from "./JimpImage";

/**
 * Parses a QR code image from an image
 *
 * @param {ArrayBuffer} input
 * @param {boolean} normalise
 * @returns {Promise<string>}
 */
export async function parseQrCode(
  input: ArrayBuffer,
  normalise: boolean,
): Promise<string> {
  let image: Awaited<ReturnType<typeof readJimpImage>>;
  try {
    image = await readJimpImage(input);
  } catch (err) {
    throw new OperationError(`Error opening image. (${err})`);
  }

  try {
    if (normalise) {
      image.greyscale();
      image.normalize();
    }
  } catch (err) {
    throw new OperationError(`Error normalising image. (${err})`);
  }

  // Remove transparency which jsQR cannot handle
  image.scan((x: number, y: number, idx: number) => {
    // If pixel is fully transparent, make it opaque white
    if (image.bitmap.data[idx + 3] === 0x00) {
      image.bitmap.data[idx + 0] = 0xff;
      image.bitmap.data[idx + 1] = 0xff;
      image.bitmap.data[idx + 2] = 0xff;
    }
    // Otherwise, make it fully opaque at its existing colour
    image.bitmap.data[idx + 3] = 0xff;
  });
  const qrData = jsQR(
    new Uint8ClampedArray(image.bitmap.data),
    image.width,
    image.height,
  );
  if (qrData) {
    return qrData.data;
  } else {
    throw new OperationError("Could not read a QR code from the image.");
  }
}

/**
 * Generates a QR code from the input string
 *
 * @param {string} input
 * @param {string} format
 * @param {number} moduleSize
 * @param {number} margin
 * @param {string} errorCorrection
 * @returns {ArrayBuffer}
 */
export function generateQrCode(
  input: string,
  format: string,
  moduleSize: number,
  margin: number,
  errorCorrection: string,
): ArrayBuffer {
  const formats = ["SVG", "EPS", "PDF", "PNG"];
  if (!formats.includes(format.toUpperCase())) {
    throw new OperationError("Unsupported QR code format.");
  }

  let qrImage: string | Buffer;
  try {
    qrImage = qr.imageSync(input, {
      type: format.toLowerCase() as "png" | "svg" | "eps" | "pdf",
      size: moduleSize,
      margin: margin,
      ec_level: errorCorrection.charAt(0).toUpperCase() as
        | "L"
        | "M"
        | "Q"
        | "H",
    }) as string | Buffer;
  } catch (err) {
    throw new OperationError(`Error generating QR code. (${err})`);
  }

  if (!qrImage) {
    throw new OperationError("Error generating QR code.");
  }

  if (typeof qrImage === "string") return Utils.strToArrayBuffer(qrImage);
  return Uint8Array.from(qrImage).buffer;
}
