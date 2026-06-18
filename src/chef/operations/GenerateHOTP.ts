/**
 * @fileoverview GenerateHOTP operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";
import * as OTPAuth from "otpauth";

/**
 * Generate HOTP operation
 */
export class GenerateHOTP extends Operation {
  /**
   *
   */
  constructor() {
    super();

    this.name = "Generate HOTP";
    this.module = "Default";
    this.description =
      "The HMAC-based One-Time Password algorithm (HOTP) is an algorithm that computes a one-time password from a shared secret key and an incrementing counter. It has been adopted as Internet Engineering Task Force standard RFC 4226, is the cornerstone of Initiative For Open Authentication (OAUTH), and is used in a number of two-factor authentication systems.<br><br>Enter the secret as the input or leave it blank for a random secret to be generated.";
    this.infoURL =
      "https://wikipedia.org/wiki/HMAC-based_One-time_Password_algorithm";
    this.inputType = "ArrayBuffer";
    this.outputType = "string";
    this.args = [
      {
        name: "Name",
        type: "string",
        value: "",
      },
      {
        name: "Code length",
        type: "number",
        value: 6,
      },
      {
        name: "Counter",
        type: "number",
        value: 0,
      },
    ];
  }

  /**
   *
   */
  run(input: AnyInput, args: unknown[]): AnyInput {
    const [label, digits, counter] = args as [string, number, number];
    const secretStr = new TextDecoder("utf-8")
      .decode(input as ArrayBuffer)
      .trim();
    const secret = secretStr ? secretStr.toUpperCase().replace(/\s+/g, "") : "";

    const hotp = new OTPAuth.HOTP({
      issuer: "",
      label: label,
      algorithm: "SHA1",
      digits: digits,
      counter: counter,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    const uri = hotp.toString();
    const code = hotp.generate();

    return `URI: ${uri}\n\nPassword: ${code}`;
  }
}

export default GenerateHOTP;
