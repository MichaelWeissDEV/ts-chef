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

import { Operation, ArgConfig } from "../Operation";
import * as Cbor from "cbor";

export class CBOREncode extends Operation {
  name = "CBOR Encode";
  module = "Serialise";
  description =
    "Concise Binary Object Representation (CBOR) is a binary data serialization format loosely based on JSON. Like JSON it allows the transmission of data objects that contain name–value pairs, but in a more concise manner. This increases processing and transfer speeds at the cost of human readability. It is defined in IETF RFC 8949.";
  infoURL = "https://wikipedia.org/wiki/CBOR";
  inputType = "JSON";
  outputType = "ArrayBuffer";
  args: ArgConfig[] = [];

  run(input: any, args: any[]): ArrayBuffer {
    return new Uint8Array(Cbor.encodeCanonical(input)).buffer;
  }
}

export default CBOREncode;
