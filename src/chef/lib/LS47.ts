/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError";

const letters = "_abcdefghijklmnopqrstuvwxyz.0123456789,-+*/:?!'()";
const tiles: any[] = [];

/**
 * Initialises the tiles with values and positions.
 */
export function initTiles() {
  tiles.length = 0;
  for (let i = 0; i < 49; i++)
    tiles.push([letters.charAt(i), [Math.floor(i / 7), i % 7]]);
}

/**
 * Rotates the key "down".
 *
 * @param {string} key
 * @param {number} col
 * @param {number} n
 * @returns {string}
 */
function rotateDown(key: string, col: number, n: number) {
  const lines = [];
  for (let i = 0; i < 7; i++) lines.push(key.slice(i * 7, (i + 1) * 7));
  const lefts: any[] = [];
  let mids: any[] = [];
  const rights: any[] = [];
  lines.forEach((element) => {
    lefts.push(element.slice(0, col));
    mids.push(element.charAt(col));
    rights.push(element.slice(col + 1));
  });
  n = (7 - (n % 7)) % 7;
  mids = mids.slice(n).concat(mids.slice(0, n));
  let result = "";
  for (let i = 0; i < 7; i++) result += lefts[i] + mids[i] + rights[i];
  return result;
}

/**
 * Rotates the key "right".
 *
 * @param {string} key
 * @param {number} row
 * @param {number} n
 * @returns {string}
 */
function rotateRight(key: string, row: number, n: number) {
  const mid = key.slice(row * 7, (row + 1) * 7);
  n = (7 - (n % 7)) % 7;
  return (
    key.slice(0, 7 * row) +
    mid.slice(n) +
    mid.slice(0, n) +
    key.slice(7 * (row + 1))
  );
}

/**
 * Finds the position of a letter in the tiles.
 *
 * @param {string} letter
 * @returns {any}
 */
function findIx(letter: string) {
  for (let i = 0; i < tiles.length; i++)
    if (tiles[i][0] === letter) return tiles[i][1];
  throw new OperationError("Letter " + letter + " is not included in LS47");
}

/**
 * Derives key from the input password.
 *
 * @param {string} password
 * @returns {string}
 */
export function deriveKey(password: string) {
  let i = 0;
  let k = letters;
  for (const c of password) {
    const [row, col] = findIx(c);
    k = rotateDown(rotateRight(k, i, col), i, row);
    i = (i + 1) % 7;
  }
  return k;
}

/**
 * Checks the key is a valid key.
 *
 * @param {string} key
 */
function checkKey(key: string) {
  if (key.length !== letters.length) throw new OperationError("Wrong key size");
  const counts: any = new Array();
  for (let i = 0; i < letters.length; i++) counts[letters.charAt(i)] = 0;
  for (const elem of letters) {
    if (letters.indexOf(elem) === -1)
      throw new OperationError("Letter " + elem + " not in LS47");
    counts[elem]++;
    if (counts[elem] > 1)
      throw new OperationError("Letter duplicated in the key");
  }
}

/**
 * Finds the position of a letter in they key.
 *
 * @param {string} key
 * @param {string} letter
 * @returns {any}
 */
function findPos(key: string, letter: string) {
  const index = key.indexOf(letter);
  if (index >= 0 && index < 49) return [Math.floor(index / 7), index % 7];
  throw new OperationError("Letter " + letter + " is not in the key");
}

/**
 * Returns the character at the position on the tiles.
 *
 * @param {string} key
 * @param {any} coord
 * @returns {string}
 */
function findAtPos(key: string, coord: any) {
  return key.charAt(coord[1] + coord[0] * 7);
}

/**
 * Returns new position by adding two positions.
 *
 * @param {any} a
 * @param {any} b
 * @returns {any}
 */
function addPos(a: any, b: any) {
  return [(a[0] + b[0]) % 7, (a[1] + b[1]) % 7];
}

/**
 * Returns new position by subtracting two positions.
 *
 * @param {any} a
 * @param {any} b
 * @returns {any}
 */
function subPos(a: any, b: any) {
  const asub = a[0] - b[0];
  const bsub = a[1] - b[1];
  return [asub - Math.floor(asub / 7) * 7, bsub - Math.floor(bsub / 7) * 7];
}

/**
 * Encrypts the plaintext string.
 *
 * @param {string} key
 * @param {string} plaintext
 * @returns {string}
 */
function encrypt(key: string, plaintext: string) {
  checkKey(key);
  let mp = [0, 0];
  let ciphertext = "";
  for (const p of plaintext) {
    const pp = findPos(key, p);
    const mix = findIx(findAtPos(key, mp));
    let cp = addPos(pp, mix);
    const c = findAtPos(key, cp);
    ciphertext += c;
    key = rotateRight(key, pp[0], 1);
    cp = findPos(key, c);
    key = rotateDown(key, cp[1], 1);
    mp = addPos(mp, findIx(c));
  }
  return ciphertext;
}

/**
 * Decrypts the ciphertext string.
 *
 * @param {string} key
 * @param {string} ciphertext
 * @returns {string}
 */
function decrypt(key: string, ciphertext: string) {
  checkKey(key);
  let mp = [0, 0];
  let plaintext = "";
  for (const c of ciphertext) {
    let cp = findPos(key, c);
    const mix = findIx(findAtPos(key, mp));
    const pp = subPos(cp, mix);
    const p = findAtPos(key, pp);
    plaintext += p;
    key = rotateRight(key, pp[0], 1);
    cp = findPos(key, c);
    key = rotateDown(key, cp[1], 1);
    mp = addPos(mp, findIx(c));
  }
  return plaintext;
}

/**
 * Adds padding to the input.
 *
 * @param {string} key
 * @param {string} plaintext
 * @param {string} signature
 * @param {number} paddingSize
 * @returns {string}
 */
export function encryptPad(
  key: string,
  plaintext: string,
  signature: string,
  paddingSize: number,
) {
  initTiles();
  checkKey(key);
  let padding = "";
  for (let i = 0; i < paddingSize; i++) {
    padding += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return encrypt(key, padding + plaintext + "---" + signature);
}

/**
 * Removes padding from the ouput.
 *
 * @param {string} key
 * @param {string} ciphertext
 * @param {number} paddingSize
 * @returns {string}
 */
export function decryptPad(
  key: string,
  ciphertext: string,
  paddingSize: number,
) {
  initTiles();
  checkKey(key);
  return decrypt(key, ciphertext).slice(paddingSize);
}
