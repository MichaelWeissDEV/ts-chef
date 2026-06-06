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

/**
 * P-list Viewer operation
 */
export class PlistViewer extends Operation {
  /**
   * PlistViewer constructor
   */
  constructor() {
    super();

    this.name = "P-list Viewer";
    this.module = "Default";
    this.description =
      "In the macOS, iOS, NeXTSTEP, and GNUstep programming frameworks, property list files are files that store serialized objects. Property list files use the filename extension .plist, and thus are often referred to as p-list files.<br><br>This operation displays plist files in a human readable format.";
    this.infoURL = "https://wikipedia.org/wiki/Property_list";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {string} input
   * @param {any[]} args
   * @returns {string}
   */
  run(input: string, args: any[]): string {
    const plistStart = input.indexOf("<plist");
    if (plistStart === -1) return input;

    // Regexes are designed to transform the xml format into a more readable string format.
    let formattedInput = input
      .slice(plistStart)
      .replace(/<plist.+>/g, "plist => ")
      .replace(/<dict>/g, "{")
      .replace(/<\/dict>/g, "}")
      .replace(/<array>/g, "[")
      .replace(/<\/array>/g, "]")
      .replace(/<key>(.+?)<\/key>/g, (_, m) => `${m}\t=> `)
      .replace(/<real>(.+?)<\/real>/g, (_, m) => `${m}\n`)
      .replace(/<string>(.+?)<\/string>/g, (_, m) => `"${m}"\n`)
      .replace(/<integer>(.+?)<\/integer>/g, (_, m) => `${m}\n`)
      .replace(/<false\/>/g, "false")
      .replace(/<true\/>/g, "true")
      .replace(/<\/plist>/g, "/plist")
      .replace(/<date>(.+?)<\/date>/g, (_, m) => `${m}\n`)
      .replace(/<data>([\s\S]+?)<\/data>/g, (_, m) => `${m}\n`)
      .replace(/[ \t\r\f\v]/g, "");

    let result = "";
    let arrCount = 0;
    let depthCount = 0;

    /**
     * Depending on the type of brace, it will increment the depth and amount of arrays accordingly.
     */
    const braces = (elem: string, vals: string[], offset: number) => {
      const temp = vals.indexOf(elem);
      if (temp !== -1) {
        depthCount += offset;
        if (temp === 1)
          // index 1 is ']' or '[' depending on which vals is passed
          arrCount += offset;
      }
    };

    /**
     * Formats the input after the regex has replaced all of the relevant parts.
     */
    const printIt = (lines: string[], index: number) => {
      if (!lines.length) return;

      let temp = "";
      const origArr = arrCount;
      let currElem = lines[0];

      // If the current position points at a larger dynamic structure.
      if (currElem.indexOf("=>") !== -1) {
        // If the LHS also points at a larger structure (nested plists in a dictionary).
        if (lines[1] && lines[1].indexOf("=>") !== -1) {
          temp =
            currElem.slice(0, -2) + " => " + lines[1].slice(0, -2) + " =>\n";
          lines = lines.slice(1);
        } else {
          temp = currElem.slice(0, -2) + " => " + (lines[1] || "") + "\n";
        }
        lines = lines.slice(1);
      } else {
        // Controls the tab depth for how many closing braces there have been.
        braces(currElem, ["}", "]"], -1);

        // Has to be here since the formatting breaks otherwise.
        temp = currElem + "\n";
      }

      currElem = lines[0];

      // Tab out to the correct distance.
      result += "\t".repeat(Math.max(0, depthCount));

      // If it is enclosed in an array show index.
      if (arrCount > 0 && currElem !== "]") result += index.toString() + " => ";

      result += temp;

      // Controls the tab depth for how many opening braces there have been.
      if (currElem) {
        braces(currElem, ["{", "["], 1);
      }

      // If there has been a new array then reset index.
      if (arrCount > origArr) {
        printIt(lines.slice(1), 0);
      } else {
        printIt(lines.slice(1), ++index);
      }
    };

    const lines = formattedInput.split("\n").filter((e) => e !== "");
    printIt(lines, 0);
    return result;
  }
}

export default PlistViewer;
