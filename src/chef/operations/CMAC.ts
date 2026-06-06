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
import { toHexFast } from "../lib/Hex";
import * as forge from "node-forge";

/**
 * CMAC operation
 *
 * @category Crypto
 * @see https://wikipedia.org/wiki/CMAC
 */
export class CMAC extends Operation {
    name = "CMAC";
    module = "Crypto";
    description =
        "CMAC is a block-cipher based message authentication code algorithm.<br><br>RFC4493 defines AES-CMAC that uses AES encryption with a 128-bit key.<br>NIST SP 800-38B suggests usages of AES with other key lengths and Triple DES.";
    infoURL = "https://wikipedia.org/wiki/CMAC";
    inputType = "ArrayBuffer";
    outputType = "string";
    args: ArgConfig[] = [
        {
            name: "Key",
            type: "toggleString",
            value: "",
            toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
        },
        {
            name: "Encryption algorithm",
            type: "option",
            value: ["AES", "Triple DES"],
        },
    ];

    /**
     * Runs the CMAC operation.
     *
     * @param {ArrayBuffer} input
     * @param {any[]} args
     * @returns {string}
     */
    run(input: ArrayBuffer, args: any[]): string {
        const key = Utils.convertToByteString(args[0].string, args[0].option);
        const algo = args[1];

        const info = (() => {
            switch (algo) {
                case "AES":
                    if (key.length !== 16 && key.length !== 24 && key.length !== 32) {
                        throw new OperationError(
                            `The key for AES must be either 16, 24, or 32 bytes (currently ${key.length} bytes)`
                        );
                    }
                    return {
                        algorithm: "AES-ECB",
                        key: key,
                        blockSize: 16,
                        Rb: new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x87]),
                    };
                case "Triple DES":
                    if (key.length !== 16 && key.length !== 24) {
                        throw new OperationError(
                            `The key for Triple DES must be 16 or 24 bytes (currently ${key.length} bytes)`
                        );
                    }
                    return {
                        algorithm: "3DES-ECB",
                        key: key.length === 16 ? key + key.substring(0, 8) : key,
                        blockSize: 8,
                        Rb: new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0x1b]),
                    };
                default:
                    throw new OperationError("Undefined encryption algorithm");
            }
        })();

        const xor = (a: Uint8Array, b: Uint8Array, out?: Uint8Array): Uint8Array => {
            if (!out) out = new Uint8Array(a.length);
            for (let i = 0; i < a.length; i++) {
                out[i] = a[i] ^ b[i];
            }
            return out;
        };

        const leftShift1 = (a: Uint8Array): Uint8Array => {
            const out = new Uint8Array(a.length);
            let carry = 0;
            for (let i = a.length - 1; i >= 0; i--) {
                out[i] = ((a[i] << 1) | carry) & 0xff;
                carry = a[i] >> 7;
            }
            return out;
        };

        const encrypt = (a: Uint8Array, out?: Uint8Array): Uint8Array => {
            if (!out) out = new Uint8Array(a.length);
            const cipher = forge.cipher.createCipher(
                info.algorithm as forge.cipher.Algorithm,
                forge.util.createBuffer(info.key, "raw")
            );
            cipher.start({ iv: "" });
            cipher.update(forge.util.createBuffer(a as any));
            cipher.finish();
            const cipherText = cipher.output.getBytes();
            for (let i = 0; i < a.length; i++) {
                out[i] = cipherText.charCodeAt(i);
            }
            return out;
        };

        const L = encrypt(new Uint8Array(info.blockSize));
        const K1 = leftShift1(L);
        if (L[0] & 0x80) xor(K1, info.Rb, K1);
        const K2 = leftShift1(K1);
        if (K1[0] & 0x80) xor(K2, info.Rb, K2);

        const inputBytes = new Uint8Array(input);
        const n = Math.ceil(inputBytes.length / info.blockSize);
        const lastBlock = (() => {
            if (n === 0) {
                const data = new Uint8Array(K2);
                data[0] ^= 0x80;
                return data;
            }
            const inputLast = inputBytes.slice(info.blockSize * (n - 1));
            if (inputLast.length === info.blockSize) {
                return xor(inputLast, K1);
            } else {
                const data = new Uint8Array(info.blockSize);
                data.set(inputLast, 0);
                data[inputLast.length] = 0x80;
                return xor(data, K2);
            }
        })();

        const X = new Uint8Array(info.blockSize);
        const Y = new Uint8Array(info.blockSize);
        for (let i = 0; i < n - 1; i++) {
            const block = inputBytes.slice(info.blockSize * i, info.blockSize * (i + 1));
            xor(X, block, Y);
            encrypt(Y, X);
        }
        xor(lastBlock, X, Y);
        const T = encrypt(Y);
        return toHexFast(T);
    }
}

export default CMAC;
