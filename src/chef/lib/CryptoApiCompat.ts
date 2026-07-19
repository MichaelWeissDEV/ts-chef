/**
 * @fileoverview Binary-safe compatibility layer for crypto-api 0.7.x.
 * @package chef/lib
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import LegacyCryptoApi from "crypto-api";

interface LegacyHasher {
  blockSize: number;
  unitSize: number;
  updateFromArray(input: number[]): void;
  finalize(): number[];
}

interface LegacyCryptoApiShape {
  hasher(name: string, options?: Record<string, unknown>): LegacyHasher;
}

function rawToBytes(raw: string): number[] {
  return Array.from(raw, (character) => character.charCodeAt(0) & 0xff);
}

function bytesToRaw(bytes: number[]): string {
  return bytes.map((byte) => String.fromCharCode(byte)).join("");
}

class CompatHasher {
  private hasher: LegacyHasher;
  readonly blockSizeInBytes: number;

  constructor(
    readonly name: string,
    readonly options: Record<string, unknown> = {},
  ) {
    this.hasher = this.createHasher();
    this.blockSizeInBytes = this.hasher.blockSize * this.hasher.unitSize;
  }

  private createHasher(): LegacyHasher {
    return (LegacyCryptoApi as unknown as LegacyCryptoApiShape).hasher(
      this.name,
      this.options,
    );
  }

  update(input: string): void {
    this.hasher.updateFromArray(rawToBytes(input));
  }

  finalize(): string {
    return bytesToRaw(this.hasher.finalize());
  }

  reset(): void {
    this.hasher = this.createHasher();
  }
}

class CompatHmac {
  private readonly inner: CompatHasher;
  private readonly outerPad: number[];

  constructor(key: string, hasher: CompatHasher) {
    let keyBytes = rawToBytes(key);
    if (keyBytes.length > hasher.blockSizeInBytes) {
      const keyHasher = new CompatHasher(hasher.name, hasher.options);
      keyHasher.update(bytesToRaw(keyBytes));
      keyBytes = rawToBytes(keyHasher.finalize());
    }
    keyBytes = keyBytes.concat(
      new Array(Math.max(0, hasher.blockSizeInBytes - keyBytes.length)).fill(0),
    );

    const innerPad = keyBytes.map((byte) => byte ^ 0x36);
    this.outerPad = keyBytes.map((byte) => byte ^ 0x5c);
    this.inner = new CompatHasher(hasher.name, hasher.options);
    this.inner.update(bytesToRaw(innerPad));
  }

  update(input: string): void {
    this.inner.update(input);
  }

  finalize(): string {
    const innerDigest = this.inner.finalize();
    const outer = new CompatHasher(this.inner.name, this.inner.options);
    outer.update(bytesToRaw(this.outerPad));
    outer.update(innerDigest);
    return outer.finalize();
  }
}

const CryptoApi = {
  getHasher(
    name: string,
    options: Record<string, unknown> = {},
  ): CompatHasher {
    return new CompatHasher(name.toLowerCase(), options);
  },

  getHmac(key: string, hasher: CompatHasher): CompatHmac {
    return new CompatHmac(key, hasher);
  },

  encoder: {
    toHex(raw: string): string {
      return rawToBytes(raw)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    },
  },
};

export default CryptoApi;
