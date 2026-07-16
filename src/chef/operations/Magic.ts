/**
 * @fileoverview Magic operation - bounded automatic decoding suggestions
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original concept
 */

import { TypedOperation } from "../Operation";
import MagicLib, {
  MAGIC_MAX_INTERMEDIATE_BYTES,
  type MagicResult,
} from "../lib/Magic";

/**
 * Detects bounded decode chains and returns them as structured JSON. This is a
 * normal data operation (not flow control), so it works in the operation
 * picker, saved recipes and graph/list pipelines alike.
 */
export class Magic extends TypedOperation<string, MagicResult[], unknown[]> {
  constructor() {
    super();

    this.name = "Magic";
    this.module = "Default";
    this.description =
      "Detects likely encoding and compression layers, safely evaluates bounded decode chains, and returns loadable operation recipes with decoded previews. Input, intermediate values, recursion, candidates, decompression output, and previews are hard-limited. The intensive-mode and language-support arguments remain for saved-recipe compatibility but brute force and language scoring are intentionally not performed.";
    this.infoURL =
      "https://github.com/gchq/CyberChef/wiki/Automatic-detection-of-encoded-data-using-CyberChef-Magic";
    this.inputType = "string";
    this.outputType = "json";
    this.presentType = "json";
    this.args = [
      {
        name: "Depth",
        type: "number",
        value: 3,
        min: 1,
        max: 3,
        step: 1,
        hint: "Maximum decode layers (hard-capped at 3).",
      },
      {
        name: "Intensive mode (compatibility only)",
        type: "boolean",
        value: false,
        hint: "Retained for older recipes; unsafe brute force is not performed.",
      },
      {
        name: "Extensive language support (compatibility only)",
        type: "boolean",
        value: false,
        hint: "Retained for older recipes; language scoring is not performed.",
      },
      {
        name: "Crib (literal text)",
        type: "string",
        value: "",
        maxLength: 128,
        hint: "Optional case-insensitive literal required in the bounded preview.",
      },
    ];
  }

  async run(input: string, args: unknown[]): Promise<MagicResult[]> {
    const [depth = 3, intensive = false, extLang = false, crib = ""] = args;
    const magic = new MagicLib(input, {
      maxIntermediateBytes: MAGIC_MAX_INTERMEDIATE_BYTES,
    });

    return magic.speculativeExecution(
      Number(depth),
      Boolean(extLang),
      crib as string,
      [],
      Boolean(intensive),
      null,
    );
  }
}

export default Magic;
