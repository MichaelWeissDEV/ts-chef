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

export function caseInsensitiveSort(a: string, b: string): number {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

export function ipSort(a: string, b: string): number {
  const partsA = a.split(".");
  const partsB = b.split(".");
  const numA =
    parseInt(partsA[0]) * 0x1000000 +
    parseInt(partsA[1]) * 0x10000 +
    parseInt(partsA[2]) * 0x100 +
    parseInt(partsA[3]);
  const numB =
    parseInt(partsB[0]) * 0x1000000 +
    parseInt(partsB[1]) * 0x10000 +
    parseInt(partsB[2]) * 0x100 +
    parseInt(partsB[3]);

  if (isNaN(numA) && !isNaN(numB)) return 1;
  if (!isNaN(numA) && isNaN(numB)) return -1;
  if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b);
  return numA - numB;
}

export function numericSort(a: string, b: string): number {
  const aP = a.split(/([^\d]+)/);
  const bP = b.split(/([^\d]+)/);

  for (let i = 0; i < aP.length && i < bP.length; i++) {
    const aN = parseFloat(aP[i]);
    const bN = parseFloat(bP[i]);
    if (isNaN(aN) && !isNaN(bN)) return 1;
    if (!isNaN(aN) && isNaN(bN)) return -1;
    if (isNaN(aN) && isNaN(bN)) {
      const ret = aP[i].localeCompare(bP[i]);
      if (ret !== 0) return ret;
    }
    if (!isNaN(aN) && !isNaN(bN) && aN - bN !== 0) return aN - bN;
  }
  return a.localeCompare(b);
}

export function hexadecimalSort(a: string, b: string): number {
  const mapFn = (v: string) => {
    const t = parseInt(v, 16);
    return isNaN(t) ? v : (t as unknown as string);
  };
  const aP = a.split(/([^\da-f]+)/i).map(mapFn);
  const bP = b.split(/([^\da-f]+)/i).map(mapFn);

  for (let i = 0; i < aP.length && i < bP.length; i++) {
    const aN = parseFloat(aP[i]);
    const bN = parseFloat(bP[i]);
    if (isNaN(aN) && !isNaN(bN)) return 1;
    if (!isNaN(aN) && isNaN(bN)) return -1;
    if (isNaN(aN) && isNaN(bN)) {
      const ret = aP[i].localeCompare(bP[i]);
      if (ret !== 0) return ret;
    }
    if (!isNaN(aN) && !isNaN(bN) && aN - bN !== 0) return aN - bN;
  }
  return a.localeCompare(b);
}

export function lengthSort(a: string, b: string): number {
  return a.length - b.length;
}
