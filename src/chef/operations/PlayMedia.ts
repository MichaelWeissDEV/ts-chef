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

import { fromBase64, toBase64 } from "../lib/Base64";
import { fromHex } from "../lib/Hex";
import { Operation, AnyInput } from "../Operation";
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import { isType, detectFileType } from "../lib/FileType";

/**
 * PlayMedia operation
 */
export class PlayMedia extends Operation {
  /**
   * PlayMedia constructor
   */
  constructor() {
    super();

    this.name = "Play Media";
    this.module = "Default";
    this.description =
      "Plays the input as audio or video depending on the type.<br><br>Tags: sound, movie, mp3, mp4, mov, webm, wav, ogg";
    this.infoURL = "";
    this.inputType = "string";
    this.outputType = "byteArray";
    this.presentType = "html";
    this.args = [
      {
        name: "Input format",
        type: "option",
        value: ["Raw", "Base64", "Hex"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {byteArray} The multimedia data as bytes.
   */
  run(input: string, args: unknown[]): AnyInput {
    const [inputFormat] = args as [string];

    if (!input.length) return [];

    // Convert input to raw bytes
    let bytes: number[];
    switch (inputFormat) {
      case "Hex":
        bytes = fromHex(input);
        break;
      case "Base64":
        bytes = fromBase64(input, undefined, "byteArray") as number[];
        break;
      case "Raw":
      default:
        bytes = Utils.strToByteArray(input);
        break;
    }

    // Determine file type
    if (!isType(/^(audio|video)/, new Uint8Array(bytes))) {
      throw new OperationError("Invalid or unrecognised file type");
    }

    return bytes;
  }

  /**
   * Displays an audio or video element that may be able to play the media
   * file.
   *
   * @param {byteArray} data Data containing an audio or video file.
   * @returns {string} Markup to display a media player.
   */
  async present(data: AnyInput, _args: unknown[]): Promise<AnyInput> {
    const dataBytes = data as number[];
    if (!dataBytes.length) return "";

    const types = detectFileType(new Uint8Array(dataBytes));
    const matches = /^audio|video/.exec(types[0].mime);
    if (!matches) {
      throw new OperationError("Invalid file type");
    }
    const dataURI = `data:${types[0].mime};base64,${toBase64(dataBytes)}`;
    const element = matches[0];

    let html = `<${element} src='${dataURI}' type='${types[0].mime}' controls>`;
    html += "<p>Unsupported media type.</p>";
    html += `</${element}>`;
    return html;
  }
}

export default PlayMedia;
