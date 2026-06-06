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
  run(input: any, args: any[]): any {
    const secretStr = new TextDecoder("utf-8").decode(input).trim();
    const secret = secretStr ? secretStr.toUpperCase().replace(/\s+/g, "") : "";

    const hotp = new OTPAuth.HOTP({
      issuer: "",
      label: args[0],
      algorithm: "SHA1",
      digits: args[1],
      counter: args[2],
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    const uri = hotp.toString();
    const code = hotp.generate();

    return `URI: ${uri}\n\nPassword: ${code}`;
  }
}

export default GenerateHOTP;
