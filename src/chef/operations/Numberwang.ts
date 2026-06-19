/**
 * @fileoverview Numberwang operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

const DID_YOU_KNOW = [
  "Numberwang, contrary to popular belief, is a fruit and not a vegetable.",
  "Robert Webb once got WordWang while presenting an episode of Numberwang.",
  "The 6705th digit of pi is Numberwang.",
  "Numberwang was invented on a Sevenday.",
  "680 asteroids have been named after Numberwang.",
  'Archimedes is most famous for proclaiming "That\'s Numberwang!" during an epiphany about water displacement.',
  "Numberwang Day is celebrated in Japan on every day of the year apart from June 6.",
  "Biologists recently discovered Numberwang within a strand of human DNA.",
  'Numbernot is a special type of non-Numberwang number. It is divisible by 3 and the letter "y".',
  '"Numberwang" has the code U+46402 in Unicode.',
];

export class Numberwang extends TypedOperation<string, string, unknown[]> {
  constructor() {
    super();
    this.name = "Numberwang";
    this.module = "Default";
    this.description = "Based on the popular gameshow by Mitchell and Webb.";
    this.infoURL =
      "https://wikipedia.org/wiki/That_Mitchell_and_Webb_Look#Recurring_sketches";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    let output: string;
    if (!input) {
      output = "Let's play Wangernumb!";
    } else {
      const match = input.match(
        /(f0rty-s1x|shinty-six|filth-hundred and neeb|-?sqrt?\d+(\.\d+)?i?([a-z]?)%?)/i,
      );
      if (match) {
        if (match[3]) output = match[0] + "! That's AlphaNumericWang!";
        else output = match[0] + "! That's Numberwang!";
      } else {
        output = "Sorry, that's not Numberwang. Let's rotate the board!";
      }
    }

    const rand = Math.floor(Math.random() * DID_YOU_KNOW.length);
    return output + "\n\nDid you know: " + DID_YOU_KNOW[rand];
  }
}

export default Numberwang;
