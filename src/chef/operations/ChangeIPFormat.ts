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
import { fromHex } from "../lib/Hex";

/**
 * Change IP format operation
 * 
 * @category Default
 */
export class ChangeIPFormat extends Operation {
    name = "Change IP format";
    module = "Default";
    description =
        "Convert an IP address from one format to another, e.g. <code>172.20.23.54</code> to <code>ac141736</code>";
    inputType = "string";
    outputType = "string";
    args: ArgConfig[] = [
        {
            name: "Input format",
            type: "option",
            value: ["Dotted Decimal", "Decimal", "Octal", "Hex"],
        },
        {
            name: "Output format",
            type: "option",
            value: ["Dotted Decimal", "Decimal", "Octal", "Hex"],
        },
    ];

    /**
     * Runs the Change IP format operation.
     * 
     * @param {string} input - The IP address(es) to convert.
     * @param {string[]} args - The arguments for the operation.
     * @param {string} args[0] - The input format (Dotted Decimal, Decimal, Octal, Hex).
     * @param {string} args[1] - The output format (Dotted Decimal, Decimal, Octal, Hex).
     * @returns {string} - The converted IP address(es).
     */
    run(input: string, args: any[]): string {
        const inFormat = args[0];
        const outFormat = args[1];
        const lines = input.split("\n");
        let output = "";

        for (let i = 0; i < lines.length; i++) {
            if (lines[i] === "") continue;
            let baIp: number[] = [];

            if (inFormat === outFormat) {
                output += lines[i] + "\n";
                continue;
            }

            switch (inFormat) {
                case "Dotted Decimal":
                    const octets = lines[i].split(".");
                    for (let j = 0; j < octets.length; j++) {
                        baIp.push(parseInt(octets[j], 10));
                    }
                    break;
                case "Decimal":
                    baIp = this.fromNumber(lines[i].toString(), 10);
                    break;
                case "Octal":
                    baIp = this.fromNumber(lines[i].toString(), 8);
                    break;
                case "Hex":
                    baIp = fromHex(lines[i]);
                    break;
                default:
                    throw new OperationError("Unsupported input IP format");
            }

            switch (outFormat) {
                case "Dotted Decimal":
                    let ddIp = "";
                    for (let j = 0; j < baIp.length; j++) {
                        ddIp += baIp[j] + ".";
                    }
                    output += ddIp.slice(0, -1) + "\n";
                    break;
                case "Decimal":
                    const decIp =
                        ((baIp[0] << 24) | (baIp[1] << 16) | (baIp[2] << 8) | baIp[3]) >>> 0;
                    output += decIp.toString() + "\n";
                    break;
                case "Octal":
                    const octIp =
                        ((baIp[0] << 24) | (baIp[1] << 16) | (baIp[2] << 8) | baIp[3]) >>> 0;
                    output += "0" + octIp.toString(8) + "\n";
                    break;
                case "Hex":
                    let hexIp = "";
                    for (let j = 0; j < baIp.length; j++) {
                        hexIp += Utils.hex(baIp[j]);
                    }
                    output += hexIp + "\n";
                    break;
                default:
                    throw new OperationError("Unsupported output IP format");
            }
        }

        return output.slice(0, -1);
    }

    private fromNumber(value: string, radix: number): number[] {
        const decimal = parseInt(value, radix);
        const baIp: number[] = [];
        baIp.push((decimal >> 24) & 255);
        baIp.push((decimal >> 16) & 255);
        baIp.push((decimal >> 8) & 255);
        baIp.push(decimal & 255);
        return baIp;
    }
}

export default ChangeIPFormat;
