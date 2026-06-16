declare module "scryptsy" {
  function scryptsy(
    key: Buffer | string,
    salt: Buffer | string,
    N: number,
    r: number,
    p: number,
    dkLen: number,
    progressCallback?: (progress: number) => void,
  ): Buffer;
  export = scryptsy;
}
