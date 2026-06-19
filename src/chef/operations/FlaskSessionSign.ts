/**
 * @fileoverview FlaskSessionSign operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import CryptoApi from "crypto-api/src/crypto-api";
import Utils from "../Utils";
import { toBase64 } from "../lib/Base64";
import OperationError from "../errors/OperationError";

/**
 * Flask Session Sign operation
 */
export class FlaskSessionSign extends TypedOperation<AnyInput, AnyInput, unknown[]> {
  /**
   * FlaskSessionSign constructor
   */
  constructor() {
    super();

    this.name = "Flask Session Sign";
    this.module = "Crypto";
    this.description =
      "Signs a JSON payload to produce a Flask session cookie (itsdangerous HMAC).";
    this.inputType = "JSON";
    this.outputType = "string";
    this.args = [
      {
        name: "Key",
        type: "toggleString",
        value: "",
        toggleValues: ["Hex", "Decimal", "Binary", "Base64", "UTF8", "Latin1"],
      },
      {
        name: "Salt",
        type: "toggleString",
        value: "cookie-session",
        toggleValues: ["UTF8", "Hex", "Decimal", "Binary", "Base64", "Latin1"],
      },
      {
        name: "Algorithm",
        type: "option",
        value: ["sha1", "sha256"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: AnyInput, args: unknown[]): AnyInput {
    const [arg0, arg1, arg2] = args as [
      { string: string; option: string },
      { string: string; option: string },
      string,
    ];
    if (!arg0.string) {
      throw new OperationError("Secret key required");
    }
    const key = Utils.convertToByteString(arg0.string, arg0.option);
    const salt = Utils.convertToByteString(
      arg1.string || "cookie-session",
      arg1.option,
    );
    const algorithm = arg2 || "sha1";

    const payloadB64 = toBase64(Utils.strToByteArray(JSON.stringify(input)));
    const payload = payloadB64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    const derivedKey = CryptoApi.getHmac(key, CryptoApi.getHasher(algorithm));
    derivedKey.update(salt);

    const currentTimeStamp = Math.ceil(Date.now() / 1000);
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setInt32(0, currentTimeStamp, false);
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    const timeB64 = toBase64(Utils.strToByteArray(binary));
    const time = timeB64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    const data = Utils.convertToByteString(payload + "." + time, "utf8");
    const sign = CryptoApi.getHmac(
      derivedKey.finalize(),
      CryptoApi.getHasher(algorithm),
    );
    sign.update(data);

    const signB64 = toBase64(sign.finalize());
    const sign64 = signB64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    return payload + "." + time + "." + sign64;
  }
}

export default FlaskSessionSign;
