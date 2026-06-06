export function rot(
  data: number[],
  amount: number,
  algo: (b: number) => number,
): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    let b = data[i];
    for (let j = 0; j < amount; j++) {
      b = algo(b);
    }
    result.push(b);
  }
  return result;
}

export function rotr(b: number): number {
  const bit = (b & 1) << 7;
  return (b >> 1) | bit;
}

export function rotl(b: number): number {
  const bit = (b >> 7) & 1;
  return ((b << 1) | bit) & 0xff;
}

export function rotrCarry(data: number[], amount: number): number[] {
  const result: number[] = [];
  let carryBits = 0,
    newByte: number;

  amount = amount % 8;
  for (let i = 0; i < data.length; i++) {
    const oldByte = data[i] >>> 0;
    newByte = (oldByte >> amount) | carryBits;
    carryBits = (oldByte & (Math.pow(2, amount) - 1)) << (8 - amount);
    result.push(newByte);
  }
  result[0] |= carryBits;
  return result;
}

export function rotlCarry(data: number[], amount: number): number[] {
  const result: number[] = new Array(data.length);
  let carryBits = 0,
    newByte: number;

  amount = amount % 8;
  for (let i = data.length - 1; i >= 0; i--) {
    const oldByte = data[i];
    newByte = ((oldByte << amount) | carryBits) & 0xff;
    carryBits = (oldByte >> (8 - amount)) & (Math.pow(2, amount) - 1);
    result[i] = newByte;
  }
  result[data.length - 1] = result[data.length - 1] | carryBits;
  return result;
}
