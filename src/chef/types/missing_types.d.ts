/**
 * @fileoverview Type definitions for missing_types.d
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

declare module "crypto-api/src/crypto-api";
declare module "../vendor/gost/gostDigest";
declare module "jq-web";
declare module "kbpgp";
declare module "@wavesenterprise/crypto-gost-js/index.js";
declare module "zlibjs/bin/gunzip.min.js";
declare module "zlibjs/bin/zlib_and_gzip.min.js";
declare module "zlibjs";
declare module "nwmatcher";
declare module "xmldom";
declare module "jsrsasign";
declare module "lz-string";
declare module "moment";
declare module "uuid";
declare module "js-yaml";
declare module "bcryptjs";
declare module "node-forge";
declare module "pako";
declare module "tar-stream";
declare module "vkbeautify";
declare module "geodesy";
declare module "ngeohash";
declare module "jsonwebtoken";
declare module "scryptsy";
declare module "sql-formatter";
declare module "ssdeep.js";
declare module "xpath";
declare module "rison";
declare module "d3-hexbin" {
  export interface HexbinBin<Datum> extends Array<Datum> {
    x: number;
    y: number;
  }

  export interface Hexbin<Datum extends [number, number]> {
    (points: Datum[]): Array<HexbinBin<Datum>>;
    radius(value: number): Hexbin<Datum>;
    extent(value: [[number, number], [number, number]]): Hexbin<Datum>;
    hexagon(radius?: number): string;
  }

  export function hexbin<Datum extends [number, number]>(): Hexbin<Datum>;

  const defaultExport: { hexbin: typeof hexbin };
  export default defaultExport;
}
declare module "xregexp";
