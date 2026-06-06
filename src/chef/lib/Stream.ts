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

export class Stream {
  bytes: Uint8Array;
  length: number;
  position: number;
  bitPos: number;

  constructor(input: Uint8Array, pos = 0, bitPos = 0) {
    this.bytes = input;
    this.length = this.bytes.length;
    this.position = pos;
    this.bitPos = bitPos;
  }

  clone(): Stream {
    return new Stream(this.bytes, this.position, this.bitPos);
  }

  getBytes(numBytes: number | null = null): Uint8Array | undefined {
    if (this.position > this.length) return undefined;
    const newPosition =
      numBytes !== null ? this.position + numBytes : this.length;
    const bytes = this.bytes.slice(this.position, newPosition);
    this.position = newPosition;
    this.bitPos = 0;
    return bytes;
  }

  readString(numBytes = -1): string | undefined {
    if (this.position > this.length) return undefined;
    if (numBytes === -1) numBytes = this.length - this.position;
    let result = "";
    for (let i = this.position; i < this.position + numBytes; i++) {
      const currentByte = this.bytes[i];
      if (currentByte === 0) break;
      result += String.fromCharCode(currentByte);
    }
    this.position += numBytes;
    this.bitPos = 0;
    return result;
  }

  readInt(numBytes: number, endianness = "be"): number | undefined {
    if (this.position > this.length) return undefined;
    let val = 0;
    if (endianness === "be") {
      for (let i = this.position; i < this.position + numBytes; i++) {
        val = (val << 8) | this.bytes[i];
      }
    } else {
      for (let i = this.position + numBytes - 1; i >= this.position; i--) {
        val = (val << 8) | this.bytes[i];
      }
    }
    this.position += numBytes;
    this.bitPos = 0;
    return val;
  }

  readBits(numBits: number, endianness = "be"): number | undefined {
    if (this.position > this.length) return undefined;

    const bitMask = (bp: number): number =>
      endianness === "be" ? (1 << (8 - bp)) - 1 : 256 - (1 << bp);

    let bitBuf = this.bytes[this.position++] & bitMask(this.bitPos);
    if (endianness !== "be") bitBuf >>>= this.bitPos;
    let bitBufLen = 8 - this.bitPos;
    this.bitPos = 0;

    while (bitBufLen < numBits) {
      if (endianness === "be")
        bitBuf = (bitBuf << bitBufLen) | this.bytes[this.position++];
      else bitBuf |= this.bytes[this.position++] << bitBufLen;
      bitBufLen += 8;
    }

    if (bitBufLen > numBits) {
      const excess = bitBufLen - numBits;
      if (endianness === "be") bitBuf >>>= excess;
      else bitBuf &= (1 << numBits) - 1;
      this.position--;
      this.bitPos = 8 - excess;
    }

    return bitBuf;
  }

  continueUntil(val: number | number[]): void {
    if (this.position > this.length) return;
    this.bitPos = 0;

    if (typeof val === "number") {
      while (
        ++this.position < this.length &&
        this.bytes[this.position] !== val
      ) {}
      return;
    }

    const length = val.length;
    const initial = val[length - 1];
    this.position = length;

    const skiptable: number[] = [];
    val.forEach((element, index) => {
      skiptable[element] = length - index;
    });

    let found = false;
    while (this.position < this.length) {
      while (
        this.position < this.length &&
        this.bytes[this.position++] !== initial
      ) {}
      found = true;
      for (let x = length - 1; x >= 0; x--) {
        if (this.bytes[this.position - length + x] !== val[x]) {
          found = false;
          this.position += skiptable[val[x]] ?? 0;
          break;
        }
      }
      if (found) {
        this.position -= length;
        break;
      }
    }
  }

  consumeWhile(val: number): void {
    while (this.position < this.length && this.bytes[this.position] === val) {
      this.position++;
    }
    this.bitPos = 0;
  }

  consumeIf(val: number): void {
    if (this.bytes[this.position] === val) {
      this.position++;
      this.bitPos = 0;
    }
  }

  moveForwardsBy(numBytes: number): void {
    const pos = this.position + numBytes;
    if (pos < 0 || pos > this.length)
      throw new Error(
        `Cannot move to position ${pos} in stream. Out of bounds.`,
      );
    this.position = pos;
    this.bitPos = 0;
  }

  moveBackwardsBy(numBytes: number): void {
    const pos = this.position - numBytes;
    if (pos < 0 || pos > this.length)
      throw new Error(
        `Cannot move to position ${pos} in stream. Out of bounds.`,
      );
    this.position = pos;
    this.bitPos = 0;
  }

  moveBackwardsByBits(numBits: number): void {
    if (numBits <= this.bitPos) {
      this.bitPos -= numBits;
    } else {
      if (this.bitPos > 0) {
        numBits -= this.bitPos;
        this.bitPos = 0;
      }
      while (numBits > 0) {
        this.moveBackwardsBy(1);
        this.bitPos = 8;
        this.moveBackwardsByBits(numBits);
        numBits -= 8;
      }
    }
  }

  moveTo(pos: number): void {
    if (pos < 0 || pos > this.length)
      throw new Error(
        `Cannot move to position ${pos} in stream. Out of bounds.`,
      );
    this.position = pos;
    this.bitPos = 0;
  }

  hasMore(): boolean {
    return this.position < this.length;
  }

  carve(start = 0, finish = this.position): Uint8Array {
    if (this.bitPos > 0) finish++;
    return this.bytes.slice(start, finish);
  }
}

export default Stream;
