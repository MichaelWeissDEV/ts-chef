declare module "libbzip2-wasm" {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Bzip2Instance {
        compressBZ2(data: Uint8Array, blockSize: number, workFactor: number): { error: number; error_msg: string; output: Uint8Array };
        decompressBZ2(data: Uint8Array, small: number): { error: number; error_msg: string; output: Uint8Array };
    }

    // The factory returns either a sync instance or a Promise depending on the environment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type Bzip2Factory = (module?: object) => any;
    const factory: Bzip2Factory;
    export = factory;
}
