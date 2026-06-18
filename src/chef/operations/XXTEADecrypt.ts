/**
 * @fileoverview XXTEADecrypt operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { Operation, AnyInput } from "../Operation";
import Utils from "../Utils";
import OperationError from "../errors/OperationError";
import { decrypt } from "../lib/XXTEA";

/**
 * XXTEA Decrypt operation
 */
export class XXTEADecrypt extends Operation {
  /**
   * XXTEADecrypt constructor
   */
  constructor() {
    super();

    this.name = "XXTEA Decrypt";
    this.module = "Ciphers";
    this.description =
      "Corrected Block TEA (often referred to as XXTEA) is a block cipher designed to correct weaknesses in the original Block TEA. XXTEA operates on variable-length blocks that are some arbitrary multiple of 32 bits in size (minimum 64 bits). The number of full cycles depends on the block size, but there are at least six (rising to 32 for small block sizes). The original Block TEA applies the XTEA round function to each word in the block and combines it additively with its leftmost neighbour. Slow diffusion rate of the decryption process was immediately exploited to break the cipher. Corrected Block TEA uses a more involved round function which makes use of both immediate neighbours in processing each word in the block.";
    this.infoURL = "https://wikipedia.org/wiki/XXTEA";
    this.inputType = "ArrayBuffer";
    this.outputType = "ArrayBuffer";
    this.args = [
      {
        name: "Key",
        type: "toggleString",
        value: "",
        toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: AnyInput, args: unknown[]): AnyInput {
    const [arg0] = args as [{ string: string; option: string }];
    const key = new Uint8Array(
      Utils.convertToByteArray(arg0.string, arg0.option),
    );
    try {
      return decrypt(new Uint8Array(input as ArrayBuffer), key)!.buffer;
    } catch {
      throw new OperationError("Unable to decrypt using this key");
    }
  }
}

export default XXTEADecrypt;
