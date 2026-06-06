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
import * as bson from "bson";
import OperationError from "../errors/OperationError";

/**
 * BSON deserialise operation
 * 
 * @category Serialise
 * @see https://wikipedia.org/wiki/BSON
 */
export class BSONDeserialise extends Operation {
    /**
     * BSONDeserialise constructor
     */
    constructor() {
        super();

        this.name = "BSON deserialise";
        this.module = "Serialise";
        this.description =
            "BSON is a computer data interchange format used mainly as a data storage and network transfer format in the MongoDB database. It is a binary form for representing simple data structures, associative arrays (called objects or documents in MongoDB), and various data types of specific interest to MongoDB. The name 'BSON' is based on the term JSON and stands for 'Binary JSON'.<br><br>Input data should be in a raw bytes format.";
        this.infoURL = "https://wikipedia.org/wiki/BSON";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * Runs the operation.
     * 
     * @param {ArrayBuffer} input
     * @param {any[]} _args
     * @returns {string}
     */
    run(input: ArrayBuffer, _args: any[]): string {
        if (!input.byteLength) return "";

        try {
            const data = bson.deserialize(Buffer.from(input));
            return JSON.stringify(data, null, 2);
        } catch (err: any) {
            throw new OperationError(err.toString());
        }
    }
}

export default BSONDeserialise;
