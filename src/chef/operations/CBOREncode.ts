/**
 * @fileoverview CBOREncode operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
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

  run(input: string, _args: unknown[]): ArrayBuffer {
    return new Uint8Array(Cbor.encodeCanonical(input)).buffer;
  }
}

export default CBOREncode;
