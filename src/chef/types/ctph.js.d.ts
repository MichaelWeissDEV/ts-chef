declare module "ctph.js" {
  export function similarity(hash1: string, hash2: string): number;
  export function digest(data: string | Uint8Array): string;
}
