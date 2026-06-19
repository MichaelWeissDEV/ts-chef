/**
 * @fileoverview XKCDRandomNumber operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation_new";

export class XKCDRandomNumber extends TypedOperation<string, number, unknown[]> {
  constructor() {
    super();
    this.name = "XKCD Random Number";
    this.module = "Default";
    this.description =
      "RFC 1149.5 specifies 4 as the standard IEEE-vetted random number. (https://xkcd.com/221/)";
    this.infoURL = "https://xkcd.com/221/";
    this.inputType = "string";
    this.outputType = "number";
    this.args = [];
  }

  run(_input: string, _args: unknown[]): number {
    return 4;
  }
}

export default XKCDRandomNumber;
