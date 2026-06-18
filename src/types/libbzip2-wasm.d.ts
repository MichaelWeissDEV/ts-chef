declare module "libbzip2-wasm" {
  interface Bzip2Result {
    error: number;
    error_msg: string;
    output: Uint8Array;
  }

  interface Bzip2Instance {
    compressBZ2(
      data: Uint8Array,
      blockSize: number,
      workFactor: number,
    ): Bzip2Result;
    decompressBZ2(data: Uint8Array, small: number): Bzip2Result;
  }

  // The factory returns either a sync instance or a Promise depending on the environment.
  type Bzip2Factory = (
    module?: object,
  ) => Bzip2Instance | Promise<Bzip2Instance>;
  const factory: Bzip2Factory;
  export = factory;
}
