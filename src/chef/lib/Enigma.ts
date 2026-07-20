/**
 * @fileoverview Enigma module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { OperationError } from "../errors/OperationError";
import { Utils } from "../Utils";

export const ROTORS = [
  { name: "I", value: "EKMFLGDQVZNTOWYHXUSPAIBRCJ<R" },
  { name: "II", value: "AJDKSIRUXBLHWTMCQGZNPYFVOE<F" },
  { name: "III", value: "BDFHJLCPRTXVZNYEIWGAKMUSQO<W" },
  { name: "IV", value: "ESOVPZJAYQUIRHXLNFTGKDCMWB<K" },
  { name: "V", value: "VZBRGITYUPSDNHLXAWMJQOFECK<A" },
  { name: "VI", value: "JPGVOUMFYQBENHZRDKASXLICTW<AN" },
  { name: "VII", value: "NZJHGRCXMYSWBOUFAIVLPEKQDT<AN" },
  { name: "VIII", value: "FKQHTLXOCBJSPDZRAMEWNIUYGV<AN" },
];

export const ROTORS_FOURTH = [
  { name: "Beta", value: "LEYJVCNIXWPBQMDRTAKZGFUHOS" },
  { name: "Gamma", value: "FSOKANUERHMBTIYCWLQPZXVGJD" },
];

export const REFLECTORS = [
  { name: "B", value: "AY BR CU DH EQ FS GL IP JX KN MO TZ VW" },
  { name: "C", value: "AF BV CP DJ EI GO HY KR LZ MX NW TQ SU" },
  { name: "B Thin", value: "AE BN CK DQ FU GY HW IJ LO MP RX SZ TV" },
  { name: "C Thin", value: "AR BD CO EJ FN GT HK IV LM PW QZ SX UY" },
];

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * Converts an uppercase ASCII letter to its 0-based alphabetical index.
 *
 * @param c - The character to convert (must be A–Z, or a–z when permissive)
 * @param permissive - If true, lowercase letters are accepted and unknown chars return -1 instead of throwing
 * @returns The 0-based index (0 for A, 25 for Z), or -1 if permissive and the character is not a letter
 */
export function a2i(c: string, permissive: boolean = false): number {
  const i = Utils.ord(c);
  if (i >= 65 && i <= 90) {
    return i - 65;
  }
  if (permissive) {
    if (i >= 97 && i <= 122) {
      return i - 97;
    }
    return -1;
  }
  throw new OperationError("a2i called on non-uppercase ASCII character");
}

/**
 * Converts a 0-based alphabetical index back to its uppercase ASCII letter.
 *
 * @param i - Index in the range 0–25
 * @returns The corresponding uppercase letter (A–Z)
 */
export function i2a(i: number): string {
  if (i >= 0 && i < 26) {
    return Utils.chr(i + 65);
  }
  throw new OperationError("i2a called on value outside 0..25");
}

/**
 * Represents a single Enigma rotor with a wiring permutation, step notches, ring setting, and initial position.
 */
export class Rotor {
  map: number[];
  revMap: number[];
  steps: Set<number>;
  pos: number;

  constructor(
    wiring: string,
    steps: string,
    ringSetting: string,
    initialPosition: string,
  ) {
    if (!/^[A-Z]{26}$/.test(wiring)) {
      throw new OperationError(
        "Rotor wiring must be 26 unique uppercase letters",
      );
    }
    if (!/^[A-Z]{0,26}$/.test(steps)) {
      throw new OperationError(
        "Rotor steps must be 0-26 unique uppercase letters",
      );
    }
    if (!/^[A-Z]$/.test(ringSetting)) {
      throw new OperationError(
        "Rotor ring setting must be exactly one uppercase letter",
      );
    }
    if (!/^[A-Z]$/.test(initialPosition)) {
      throw new OperationError(
        "Rotor initial position must be exactly one uppercase letter",
      );
    }
    this.map = new Array(26);
    this.revMap = new Array(26);
    const uniq: { [key: number]: boolean } = {};
    for (let i = 0; i < LETTERS.length; i++) {
      const a = a2i(LETTERS[i]);
      const b = a2i(wiring[i]);
      this.map[a] = b;
      this.revMap[b] = a;
      uniq[b] = true;
    }
    if (Object.keys(uniq).length !== LETTERS.length) {
      throw new OperationError(
        "Rotor wiring must have each letter exactly once",
      );
    }
    const rs = a2i(ringSetting);
    this.steps = new Set();
    for (const x of steps) {
      this.steps.add(Utils.mod(a2i(x) - rs, 26));
    }
    if (this.steps.size !== steps.length) {
      throw new OperationError("Rotor steps must be unique");
    }
    this.pos = Utils.mod(a2i(initialPosition) - rs, 26);
  }

  step(): number {
    this.pos = Utils.mod(this.pos + 1, 26);
    return this.pos;
  }

  transform(c: number): number {
    return Utils.mod(this.map[Utils.mod(c + this.pos, 26)] - this.pos, 26);
  }

  revTransform(c: number): number {
    return Utils.mod(this.revMap[Utils.mod(c + this.pos, 26)] - this.pos, 26);
  }
}

class PairMapBase {
  pairs: string;
  map: { [key: number]: number };

  constructor(pairs: string, name: string = "PairMapBase") {
    this.pairs = pairs;
    this.map = {};
    if (pairs === "") {
      return;
    }
    pairs.split(/\s+/).forEach((pair) => {
      if (!/^[A-Z]{2}$/.test(pair)) {
        throw new OperationError(
          name +
            " must be a whitespace-separated list of uppercase letter pairs",
        );
      }
      const a = a2i(pair[0]);
      const b = a2i(pair[1]);
      if (a === b) {
        return;
      }
      if (Object.prototype.hasOwnProperty.call(this.map, a)) {
        throw new OperationError(`${name} connects ${pair[0]} more than once`);
      }
      if (Object.prototype.hasOwnProperty.call(this.map, b)) {
        throw new OperationError(`${name} connects ${pair[1]} more than once`);
      }
      this.map[a] = b;
      this.map[b] = a;
    });
  }

  transform(c: number): number {
    if (!Object.prototype.hasOwnProperty.call(this.map, c)) {
      return c;
    }
    return this.map[c];
  }

  revTransform(c: number): number {
    return this.transform(c);
  }
}

/**
 * Represents an Enigma reflector, which maps every letter to a unique partner via exactly 13 pairs.
 */
export class Reflector extends PairMapBase {
  constructor(pairs: string) {
    super(pairs, "Reflector");
    const s = Object.keys(this.map).length;
    if (s !== 26) {
      throw new OperationError(
        "Reflector must have exactly 13 pairs covering every letter",
      );
    }
    const optMap: number[] = new Array(26);
    for (const x of Object.keys(this.map)) {
      optMap[Number(x)] = this.map[Number(x)];
    }
    this.map = optMap; // Use the array as an optimized numeric mapping
  }

  transform(c: number): number {
    return (this.map as unknown as number[])[c];
  }
}

/**
 * Represents an Enigma plugboard (Steckerbrett) that swaps pairs of letters before and after rotor traversal.
 */
export class Plugboard extends PairMapBase {
  constructor(pairs: string) {
    super(pairs, "Plugboard");
  }
}

interface CharacterTransformer {
  transform(c: number): number;
  revTransform(c: number): number;
}

/**
 * Base class implementing the Enigma cipher mechanism: rotor stepping and symmetric letter encryption/decryption.
 */
export class EnigmaBase {
  rotors: Rotor[];
  rotorsRev: Rotor[];
  reflector: Reflector;
  plugboard: CharacterTransformer;

  constructor(
    rotors: Rotor[],
    reflector: Reflector,
    plugboard: CharacterTransformer,
  ) {
    this.rotors = rotors;
    this.rotorsRev = [...rotors].reverse();
    this.reflector = reflector;
    this.plugboard = plugboard;
  }

  step(): void {
    const r0 = this.rotors[0];
    const r1 = this.rotors[1];
    r0.step();
    if (r0.steps.has(r0.pos) || r1.steps.has(Utils.mod(r1.pos + 1, 26))) {
      r1.step();
      if (r1.steps.has(r1.pos)) {
        const r2 = this.rotors[2];
        if (r2) r2.step();
      }
    }
  }

  crypt(input: string): string {
    let result = "";
    for (const c of input) {
      let letter = a2i(c, true);
      if (letter === -1) {
        result += c;
        continue;
      }
      this.step();
      letter = this.plugboard.transform(letter);
      for (const rotor of this.rotors) {
        letter = rotor.transform(letter);
      }
      letter = this.reflector.transform(letter);
      for (const rotor of this.rotorsRev) {
        letter = rotor.revTransform(letter);
      }
      letter = this.plugboard.revTransform(letter);
      result += i2a(letter);
    }
    return result;
  }
}

/**
 * A concrete Enigma machine that enforces exactly 3 or 4 rotors, matching the historical Wehrmacht/Kriegsmarine variants.
 */
export class EnigmaMachine extends EnigmaBase {
  constructor(rotors: Rotor[], reflector: Reflector, plugboard: Plugboard) {
    super(rotors, reflector, plugboard);
    if (rotors.length !== 3 && rotors.length !== 4) {
      throw new OperationError("Enigma must have 3 or 4 rotors");
    }
  }
}
