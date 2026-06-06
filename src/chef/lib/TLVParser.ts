/**
 * Parser for Type-length-value data.
 *
 * @author gchq77703 []
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

interface TLVParserOptions {
  location?: number;
  bytesInLength?: number;
  basicEncodingRules?: boolean;
}

const defaults: Required<TLVParserOptions> = {
  location: 0,
  bytesInLength: 1,
  basicEncodingRules: false,
};

/**
 * TLVParser library
 */
export default class TLVParser {
  input: number[] | Uint8Array;
  location: number;
  bytesInLength: number;
  basicEncodingRules: boolean;

  /**
   * TLVParser constructor
   *
   * @param {number[] | Uint8Array} input
   * @param {TLVParserOptions} options
   */
  constructor(input: number[] | Uint8Array, options?: TLVParserOptions) {
    this.input = input;
    this.location = defaults.location;
    this.bytesInLength = defaults.bytesInLength;
    this.basicEncodingRules = defaults.basicEncodingRules;
    if (options) {
      Object.assign(this, options);
    }
  }

  /**
   * @returns {number}
   */
  getLength(): number {
    if (this.basicEncodingRules) {
      const bit = this.input[this.location];
      if (bit & 0x80) {
        this.bytesInLength = bit & ~0x80;
      } else {
        this.location++;
        return bit & ~0x80;
      }
    }

    let length = 0;

    for (let i = 0; i < this.bytesInLength; i++) {
      length += this.input[this.location] * Math.pow(Math.pow(2, 8), i);
      this.location++;
    }

    return length;
  }

  /**
   * @param {number} length
   * @returns {number[]}
   */
  getValue(length: number): number[] {
    const value: number[] = [];

    for (let i = 0; i < length; i++) {
      if (this.location > this.input.length) return value;
      value.push(this.input[this.location]);
      this.location++;
    }

    return value;
  }

  /**
   * @returns {boolean}
   */
  atEnd(): boolean {
    return this.input.length <= this.location;
  }
}
