interface GostAlgorithm {
  name: string;
  version?: number;
  mode?: string;
  sBox?: unknown;
  length?: number;
}

class GostDigest {
  private algorithm: GostAlgorithm;

  constructor(algorithm: GostAlgorithm) {
    this.algorithm = algorithm;
  }

  digest(data: Uint8Array | number[]): Uint8Array {
    void this.algorithm;
    void data;
    return new Uint8Array(32);
  }
}

export default GostDigest;
