/**
 * @fileoverview CompareCTPHHashes operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, ArgConfig } from "../Operation_new";
import { OperationError } from "../errors/OperationError";
import { Utils } from "../Utils";
import { HASH_DELIM_OPTIONS } from "../lib/Delim";
import * as ctphjs from "ctph.js";

export class CompareCTPHHashes extends TypedOperation<string, number, unknown[]> {
  name = "Compare CTPH hashes";
  module = "Crypto";
  description =
    "Compares two Context Triggered Piecewise Hashing (CTPH) fuzzy hashes to determine the similarity between them on a scale of 0 to 100.";
  infoURL = "https://forensics.wiki/context_triggered_piecewise_hashing/";
  inputType = "string";
  outputType = "number";
  args: ArgConfig[] = [
    {
      name: "Delimiter",
      type: "option",
      value: HASH_DELIM_OPTIONS,
    },
  ];

  run(input: string, args: unknown[]): number {
    const samples = input.split(Utils.charRep(args[0] as string));
    if (samples.length !== 2)
      throw new OperationError("Incorrect number of samples.");
    return ctphjs.similarity(samples[0], samples[1]);
  }
}

export default CompareCTPHHashes;
