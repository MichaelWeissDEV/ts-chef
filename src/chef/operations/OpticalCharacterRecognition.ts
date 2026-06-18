/**
 * @fileoverview OpticalCharacterRecognition operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation } from "../Operation";
import OperationError from "../errors/OperationError";
import { isImage } from "../lib/FileType";
import { toBase64 } from "../lib/Base64";

import { createWorker } from "tesseract.js";

const OEM_MODES = ["Tesseract only", "LSTM only", "Tesseract/LSTM Combined"];

/**
 * Optical Character Recognition operation
 */
export class OpticalCharacterRecognition extends Operation {
  /**
   * OpticalCharacterRecognition constructor
   */
  constructor() {
    super();

    this.name = "Optical Character Recognition";
    this.module = "OCR";
    this.description =
      "Optical character recognition or optical character reader (OCR) is the mechanical or electronic conversion of images of typed, handwritten or printed text into machine-encoded text.<br><br>Supported image formats: png, jpg, bmp, pbm.";
    this.infoURL = "https://wikipedia.org/wiki/Optical_character_recognition";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Show confidence",
        type: "boolean",
        value: true,
      },
      {
        name: "OCR Engine Mode",
        type: "option",
        value: OEM_MODES,
        defaultIndex: 1,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {string}
   */
  async run(input: ArrayBuffer, args: unknown[]): Promise<string> {
    const [showConfidence, oemChoice] = args as [boolean, string];

    const type = isImage(input);
    if (!type) {
      throw new OperationError(
        "Unsupported file type (supported: jpg,png,pbm,bmp) or no file provided",
      );
    }

    const assetDir = `${(global as any).docURL || ""}/assets/`;
    const oem = OEM_MODES.indexOf(oemChoice);

    try {
      const image = `data:${type};base64,${toBase64(input)}`;
      const worker = await createWorker("eng", oem, {
        workerPath: `${assetDir}tesseract/worker.min.js`,
        langPath: `${assetDir}tesseract/lang-data`,
        corePath: `${assetDir}tesseract/tesseract-core.wasm.js`,
        logger: () => {},
      });
      const result = await worker.recognize(image);

      if (showConfidence) {
        return `Confidence: ${result.data.confidence}%\n\n${result.data.text}`;
      } else {
        return result.data.text;
      }
    } catch (err) {
      throw new OperationError(`Error performing OCR on image. (${err})`);
    }
  }
}

export default OpticalCharacterRecognition;
