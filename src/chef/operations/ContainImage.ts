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

import { Operation } from "../Operation";
import OperationError from "../errors/OperationError";
import { isImage } from "../lib/FileType";
import { toBase64 } from "../lib/Base64";
import {
  Jimp,
  JimpMime,
  ResizeStrategy,
  HorizontalAlign,
  VerticalAlign,
} from "jimp";

/**
 * Contain Image operation
 */
export class ContainImage extends Operation {
  /**
   * ContainImage constructor
   */
  constructor() {
    super();

    this.name = "Contain Image";
    this.module = "Image";
    this.description =
      "Scales an image to the specified width and height, maintaining the aspect ratio. The image may be letterboxed.";
    this.infoURL = "";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.presentType = "html";
    this.args = [
      {
        name: "Width",
        type: "number",
        value: 100,
        min: 1,
      },
      {
        name: "Height",
        type: "number",
        value: 100,
        min: 1,
      },
      {
        name: "Horizontal align",
        type: "option",
        value: ["Left", "Center", "Right"],
        defaultIndex: 1,
      },
      {
        name: "Vertical align",
        type: "option",
        value: ["Top", "Middle", "Bottom"],
        defaultIndex: 1,
      },
      {
        name: "Resizing algorithm",
        type: "option",
        value: [
          "Nearest Neighbour",
          "Bilinear",
          "Bicubic",
          "Hermite",
          "Bezier",
        ],
        defaultIndex: 1,
      },
      {
        name: "Opaque background",
        type: "boolean",
        value: true,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {byteArray}
   */
  async run(input: any, args: any[]): Promise<any> {
    const [width, height, hAlign, vAlign, alg, opaqueBg] = args;

    const resizeMap: Record<string, ResizeStrategy> = {
      "Nearest Neighbour": ResizeStrategy.NEAREST_NEIGHBOR,
      Bilinear: ResizeStrategy.BILINEAR,
      Bicubic: ResizeStrategy.BICUBIC,
      Hermite: ResizeStrategy.HERMITE,
      Bezier: ResizeStrategy.BEZIER,
    };

    const alignMap: Record<string, number> = {
      Left: HorizontalAlign.LEFT,
      Center: HorizontalAlign.CENTER,
      Right: HorizontalAlign.RIGHT,
      Top: VerticalAlign.TOP,
      Middle: VerticalAlign.MIDDLE,
      Bottom: VerticalAlign.BOTTOM,
    };

    if (!isImage(input)) {
      throw new OperationError("Invalid file type.");
    }

    let image;
    try {
      image = await Jimp.read(input);
    } catch (err) {
      throw new OperationError(`Error loading image. (${err})`);
    }
    const originalMime = image.mime;
    try {
      image.contain({
        w: width,
        h: height,
        align: (alignMap[hAlign] as any) | (alignMap[vAlign] as any),
        mode: resizeMap[alg],
      });

      if (opaqueBg) {
        const newImage = new Jimp({
          width,
          height,
          color: 0x000000ff,
        });
        image = newImage.blit({
          src: image,
          x: 0,
          y: 0,
        }) as unknown as typeof image;
      }

      let imageBuffer;
      if (originalMime === "image/gif") {
        imageBuffer = await image.getBuffer(JimpMime.png);
      } else {
        imageBuffer = await image.getBuffer(
          originalMime as
            | "image/jpeg"
            | "image/gif"
            | "image/png"
            | "image/tiff"
            | "image/bmp"
            | "image/x-ms-bmp",
        );
      }
      return imageBuffer.buffer;
    } catch (err) {
      throw new OperationError(`Error containing image. (${err})`);
    }
  }

  /**
   * Displays the contained image using HTML for web apps
   * @param {ArrayBuffer} data
   * @returns {html}
   */
  present(data: ArrayBuffer) {
    if (!data.byteLength) return "";
    const dataArray = new Uint8Array(data);

    const type = isImage(dataArray);
    if (!type) {
      throw new OperationError("Invalid file type.");
    }

    return `<img src="data:${type};base64,${toBase64(dataArray)}">`;
  }
}

export default ContainImage;
