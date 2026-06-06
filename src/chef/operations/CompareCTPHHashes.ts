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
import { OperationError } from "../errors/OperationError";
import { Utils } from "../Utils";
import { HASH_DELIM_OPTIONS } from "../lib/Delim";
import * as ctphjs from "ctph.js";

export class CompareCTPHHashes extends Operation {
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

  run(input: string, args: any[]): number {
    const samples = input.split(Utils.charRep(args[0]));
    if (samples.length !== 2)
      throw new OperationError("Incorrect number of samples.");
    return ctphjs.similarity(samples[0], samples[1]);
  }
}

export default CompareCTPHHashes;
