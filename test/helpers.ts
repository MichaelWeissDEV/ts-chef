/** Shared test helpers */

export function strToAB(str: string): ArrayBuffer {
  const buf = Buffer.from(str, "utf-8");
  const ab = new ArrayBuffer(buf.length);
  new Uint8Array(ab).set(buf);
  return ab;
}

export function abToStr(ab: ArrayBuffer): string {
  return Buffer.from(new Uint8Array(ab)).toString("utf-8");
}

export function byteArrToStr(arr: number[] | Uint8Array): string {
  return Buffer.from(arr).toString("utf-8");
}

export function hexToAB(hex: string): ArrayBuffer {
  const buf = Buffer.from(hex, "hex");
  const ab = new ArrayBuffer(buf.length);
  new Uint8Array(ab).set(buf);
  return ab;
}
