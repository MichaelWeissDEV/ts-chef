declare module "ssdeep.js" {
    export function digest(input: string): string;
    export function similarity(hash1: string, hash2: string): number;
}
