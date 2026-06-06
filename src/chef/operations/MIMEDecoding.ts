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
import Utils from "../Utils";
import { fromHex } from "../lib/Hex";
import { fromBase64 } from "../lib/Base64";
import cptable from "codepage";

/**
 * MIME Decoding operation
 */
export class MIMEDecoding extends Operation {
  /**
   * MIMEDecoding constructor
   */
  constructor() {
    super();

    this.name = "MIME Decoding";
    this.module = "Default";
    this.description =
      "Enables the decoding of MIME message header extensions for non-ASCII text";
    this.infoURL = "https://tools.ietf.org/html/rfc2047";
    this.inputType = "byteArray";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {byteArray} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    const mimeEncodedText = Utils.byteArrayToUtf8(input);
    const encodedHeaders = mimeEncodedText.replace(/\r\n/g, "\n");

    const decodedHeader = this.decodeHeaders(encodedHeaders);

    return decodedHeader;
  }

  /**
   * Decode MIME header strings
   *
   * @param headerString
   */
  decodeHeaders(headerString: string) {
    // No encoded words detected
    let i = headerString.indexOf("=?");
    if (i === -1) return headerString;

    let decodedHeaders = headerString.slice(0, i);
    let header = headerString.slice(i);

    let isBetweenWords = false;
    let start, cur, charset, encoding, j, end, text;
    while (header.length > -1) {
      start = header.indexOf("=?");
      if (start === -1) break;
      cur = start + "=?".length;

      i = header.slice(cur).indexOf("?");
      if (i === -1) break;

      charset = header.slice(cur, cur + i);
      cur += i + "?".length;

      if (header.length < cur + "Q??=".length) break;

      encoding = header[cur];
      cur += 1;

      if (header[cur] !== "?") break;

      cur += 1;

      j = header.slice(cur).indexOf("?=");
      if (j === -1) break;

      text = header.slice(cur, cur + j);
      end = cur + j + "?=".length;

      if (encoding.toLowerCase() === "b") {
        text = fromBase64(text) as string;
      } else if (encoding.toLowerCase() === "q") {
        text = this.parseQEncodedWord(text);
      } else {
        isBetweenWords = false;
        decodedHeaders += header.slice(0, start + 2);
        header = header.slice(start + 2);
      }

      if (
        start > 0 &&
        (!isBetweenWords || header.slice(0, start).search(/\S/g) > -1)
      ) {
        decodedHeaders += header.slice(0, start);
      }

      decodedHeaders += this.convertFromCharset(charset, text);

      header = header.slice(end);
      isBetweenWords = true;
    }

    if (header.length > 0) {
      decodedHeaders += header;
    }

    return decodedHeaders;
  }

  /**
   * Converts decoded text for supported charsets.
   * Supports UTF-8, US-ASCII, ISO-8859-*
   *
   * @param encodedWord
   */
  convertFromCharset(charset: string, encodedText: string) {
    charset = charset.toLowerCase();
    const parsedCharset = charset.split("-");

    if (
      parsedCharset.length === 2 &&
      parsedCharset[0] === "utf" &&
      charset === "utf-8"
    ) {
      return cptable.utils.decode(65001, encodedText);
    } else if (parsedCharset.length === 2 && charset === "us-ascii") {
      return cptable.utils.decode(20127, encodedText);
    } else if (
      parsedCharset.length === 3 &&
      parsedCharset[0] === "iso" &&
      parsedCharset[1] === "8859"
    ) {
      const isoCharset = parseInt(parsedCharset[2], 10);
      if (isoCharset >= 1 && isoCharset <= 16) {
        return cptable.utils.decode(28590 + isoCharset, encodedText);
      }
    }

    throw new OperationError("Unhandled Charset");
  }

  /**
   * Parses a Q encoded word
   *
   * @param encodedWord
   */
  parseQEncodedWord(encodedWord: string) {
    let decodedWord = "";
    for (let i = 0; i < encodedWord.length; i++) {
      if (encodedWord[i] === "_") {
        decodedWord += " ";
        // Parse hex encoding
      } else if (encodedWord[i] === "=") {
        if (i + 2 >= encodedWord.length)
          throw new OperationError("Incorrectly Encoded Word");
        const decodedHex = Utils.byteArrayToChars(
          fromHex(encodedWord.substring(i + 1, i + 3)),
        );
        decodedWord += decodedHex;
        i += 2;
      } else if (
        (encodedWord[i].charCodeAt(0) >= " ".charCodeAt(0) &&
          encodedWord[i].charCodeAt(0) <= "~".charCodeAt(0)) ||
        encodedWord[i] === "\n" ||
        encodedWord[i] === "\r" ||
        encodedWord[i] === "\t"
      ) {
        decodedWord += encodedWord[i];
      } else {
        throw new OperationError("Incorrectly Encoded Word");
      }
    }

    return decodedWord;
  }
}

export default MIMEDecoding;
