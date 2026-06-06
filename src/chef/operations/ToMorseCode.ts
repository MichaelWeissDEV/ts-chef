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

const MORSE_TABLE: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--",
  ":": "---...",
  ";": "-.-.-.",
  "!": "-.-.--",
  "?": "..--..",
  "'": ".----.",
  '"': ".-..-.",
  "/": "-..-.",
  "-": "-....-",
  "+": ".-.-.",
  "(": "-.--.",
  ")": "-.--.-",
  "@": ".--.-.",
  "=": "-...-",
  "&": ".-...",
  _: "..--.-",
  $: "...-..-",
};

export class ToMorseCode extends Operation {
  constructor() {
    super();
    this.name = "To Morse Code";
    this.module = "Default";
    this.description =
      "Translates alphanumeric characters into Morse Code with the specified symbol set.";
    this.infoURL = "https://wikipedia.org/wiki/Morse_code";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Format",
        type: "option",
        value: ["Dots/Dashes", "Binary", "Decimal", "Hex", "BART"],
      },
      {
        name: "Letter delimiter",
        type: "option",
        value: [
          "Space",
          "Line feed",
          "CRLF",
          "Forward slash",
          "Backslash",
          "Comma",
          "Semi-colon",
        ],
      },
      {
        name: "Word delimiter",
        type: "option",
        value: [
          "Line feed",
          "CRLF",
          "Space",
          "Forward slash",
          "Backslash",
          "Comma",
          "Semi-colon",
        ],
      },
    ];
  }

  run(input: string, args: unknown[]): string {
    const format = args[0] as string;
    const letterDelimOpts: Record<string, string> = {
      Space: " ",
      "Line feed": "\n",
      CRLF: "\r\n",
      "Forward slash": "/",
      Backslash: "\\",
      Comma: ",",
      "Semi-colon": ";",
    };
    const wordDelimOpts: Record<string, string> = {
      "Line feed": "\n",
      CRLF: "\r\n",
      Space: " ",
      "Forward slash": "/",
      Backslash: "\\",
      Comma: ",",
      "Semi-colon": ";",
    };
    const letterDelim = letterDelimOpts[args[1] as string] ?? " ";
    const wordDelim = wordDelimOpts[args[2] as string] ?? "\n";

    const words = input.toUpperCase().split(" ");
    const encodedWords = words.map((word) => {
      const letters = Array.from(word)
        .map((ch) => {
          const code = MORSE_TABLE[ch];
          if (!code) return "";
          if (format === "Dots/Dashes") return code;
          if (format === "Binary")
            return (
              code
                .split("")
                .map((c) => (c === "." ? "10" : "1110"))
                .join("0") + "000"
            );
          if (format === "Decimal")
            return (
              code
                .split("")
                .map((c) => (c === "." ? "1" : "7"))
                .join("0") + "0"
            );
          if (format === "Hex")
            return (
              code
                .split("")
                .map((c) => (c === "." ? "1" : "7"))
                .join("0") + "0"
            );
          if (format === "BART")
            return code.replace(/\./g, "dot").replace(/-/g, "dash");
          return code;
        })
        .filter((s) => s !== "");
      return letters.join(letterDelim);
    });

    return encodedWords.join(wordDelim);
  }
}

export default ToMorseCode;
