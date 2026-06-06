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

import Operation from "../Operation";
import Utils from "../Utils";
import forge from "node-forge";
import OperationError from "../errors/OperationError";

/**
 * DES Encrypt operation
 *
 * @category Ciphers
 * @see DESDecrypt
 */
export class DESEncrypt extends Operation {
    /**
     * DESEncrypt constructor
     */
    constructor() {
        super();

        this.name = "DES Encrypt";
        this.module = "Ciphers";
        this.description =
            "DES is a previously dominant algorithm for encryption, and was published as an official U.S. Federal Information Processing Standard (FIPS). It is now considered to be insecure due to its small key size.<br><br><b>Key:</b> DES uses a key length of 8 bytes (64 bits).<br><br>You can generate a password-based key using one of the KDF operations.<br><br><b>IV:</b> The Initialization Vector should be 8 bytes long. If not entered, it will default to 8 null bytes.<br><br><b>Padding:</b> In CBC and ECB mode, PKCS#7 padding will be used.";
        this.infoURL = "https://wikipedia.org/wiki/Data_Encryption_Standard";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Key",
                type: "toggleString",
                value: "",
                toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
            },
            {
                name: "IV",
                type: "toggleString",
                value: "",
                toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
            },
            {
                name: "Mode",
                type: "argSelector",
                value: [
                    {
                        name: "CBC",
                        off: [5],
                    },
                    {
                        name: "CFB",
                        off: [5],
                    },
                    {
                        name: "OFB",
                        off: [5],
                    },
                    {
                        name: "CTR",
                        off: [5],
                    },
                    {
                        name: "ECB",
                        off: [5],
                    },
                ],
            },
            {
                name: "Input",
                type: "option",
                value: ["Raw", "Hex"],
            },
            {
                name: "Output",
                type: "option",
                value: ["Hex", "Raw"],
            },
        ];
    }

    /**
     * @param {string} input
     * @param {any[]} args
     * @returns {string}
     *
     * @throws {OperationError} if invalid key/IV length
     */
    run(input: string, args: any[]): string {
        const key = Utils.convertToByteString(args[0].string, args[0].option),
            iv = Utils.convertToByteString(args[1].string, args[1].option),
            mode = args[2].substring(0, 3),
            inputType = args[3],
            outputType = args[4];

        if (key.length !== 8) {
            throw new OperationError(
                `Invalid key length: ${key.length} bytes

DES uses a key length of 8 bytes (64 bits).`
            );
        }
        if (iv.length !== 8 && mode !== "ECB") {
            throw new OperationError(
                `Invalid IV length: ${iv.length} bytes

DES uses an IV length of 8 bytes (64 bits).
Make sure you have specified the type correctly (e.g. Hex vs UTF8).`
            );
        }

        const byteInput = Utils.convertToByteString(input, inputType);

        const cipher = forge.cipher.createCipher(("DES-" + mode) as forge.cipher.Algorithm, key);
        cipher.start({
            iv: iv.length === 0 ? "" : iv,
        } as forge.cipher.StartOptions);
        cipher.update(forge.util.createBuffer(byteInput));
        cipher.finish();

        return outputType === "Hex" ? cipher.output.toHex() : cipher.output.getBytes();
    }
}

export default DESEncrypt;
