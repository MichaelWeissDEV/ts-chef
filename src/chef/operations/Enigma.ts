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

import { Operation, ArgConfig } from "../Operation";
import { OperationError } from "../errors/OperationError";
import { Utils, LETTERS } from "../Utils";

/**
 * Enigma rotor configuration
 */
interface RotorConfig {
  name: string;
  value: string;
}

/**
 * Reflector configuration
 */
interface ReflectorConfig {
  name: string;
  value: string;
}

/**
 * Enigma plugboard configuration
 */
interface PlugboardConfig {
  name: string;
  value: string;
}

/**
 * Rotor state
 */
class Rotor {
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
    const uniq: Record<number, boolean> = {};

    for (let i = 0; i < 26; i++) {
      const a = Utils.a2i(LETTERS[i]);
      const b = Utils.a2i(wiring[i]);
      this.map[a] = b;
      this.revMap[b] = a;
      uniq[b] = true;
    }

    if (Object.keys(uniq).length !== 26) {
      throw new OperationError(
        "Rotor wiring must have each letter exactly once",
      );
    }

    const rs = Utils.a2i(ringSetting);
    this.steps = new Set<number>();
    for (const x of steps) {
      this.steps.add(Utils.mod(Utils.a2i(x) - rs, 26));
    }

    if (this.steps.size !== steps.length) {
      throw new OperationError("Rotor steps must be unique");
    }

    this.pos = Utils.mod(Utils.a2i(initialPosition) - rs, 26);
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

/**
 * Base class for plugboard and reflector
 */
class PairMapBase {
  pairs: string;
  map: Record<number, number>;

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
      const a = Utils.a2i(pair[0]);
      const b = Utils.a2i(pair[1]);
      if (a === b) {
        return;
      }
      if (this.map.hasOwnProperty(a)) {
        throw new OperationError(`${name} connects ${pair[0]} more than once`);
      }
      if (this.map.hasOwnProperty(b)) {
        throw new OperationError(`${name} connects ${pair[1]} more than once`);
      }
      this.map[a] = b;
      this.map[b] = a;
    });
  }

  transform(c: number): number {
    if (!this.map.hasOwnProperty(c)) {
      return c;
    }
    return this.map[c];
  }

  revTransform(c: number): number {
    return this.transform(c);
  }
}

/**
 * Reflector class
 */
class Reflector extends PairMapBase {
  constructor(pairs: string) {
    super(pairs, "Reflector");
    const s = Object.keys(this.map).length;
    if (s !== 26) {
      throw new OperationError(
        "Reflector must have exactly 13 pairs covering every letter",
      );
    }
    const optMap: number[] = new Array(26);
    for (const xStr of Object.keys(this.map)) {
      const x = Number(xStr);
      optMap[x] = this.map[x];
    }
    this.map = optMap;
  }

  transform(c: number): number {
    return this.map[c];
  }
}

/**
 * Plugboard class
 */
class Plugboard extends PairMapBase {
  constructor(pairs: string) {
    super(pairs, "Plugboard");
  }
}

/**
 * Enigma machine base class
 */
class EnigmaBase {
  rotors: Rotor[];
  rotorsRev: Rotor[] = [];
  reflector: Reflector;
  plugboard: Plugboard;

  constructor(rotors: Rotor[], reflector: Reflector, plugboard: Plugboard) {
    this.rotors = rotors;
    this.rotorsRev = rotors.slice().reverse();
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
        r2.step();
      }
    }
  }

  crypt(input: string): string {
    let result = "";
    for (const c of input) {
      let letter = Utils.a2i(c, true);
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
      result += Utils.i2a(letter);
    }
    return result;
  }
}

/**
 * Enigma machine with 3 or 4 rotors
 */
class EnigmaMachine extends EnigmaBase {
  constructor(rotors: Rotor[], reflector: Reflector, plugboard: Plugboard) {
    super(rotors, reflector, plugboard);
    if (rotors.length !== 3 && rotors.length !== 4) {
      throw new OperationError("Enigma must have 3 or 4 rotors");
    }
  }
}

/**
 * Enigma operation
 */
export class Enigma extends Operation {
  args: ArgConfig[] = [
    {
      name: "Model",
      type: "option",
      value: ["3-rotor", "4-rotor"],
    },
    {
      name: "Left-most (4th) rotor",
      type: "option",
      value: [
        "Beta:LEYJVCNIXWPBQMDRTAKZGFUHOS",
        "Gamma:FSOKANUERHMBTIYCWLQPZXVGJD",
      ],
    },
    {
      name: "Left-most rotor ring setting",
      type: "option",
      value: LETTERS,
    },
    {
      name: "Left-most rotor initial value",
      type: "option",
      value: LETTERS,
    },
    {
      name: "Left-hand rotor",
      type: "option",
      value: [
        "I:EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
        "II:AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
        "III:BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
        "IV:ESOVPZJAYQUIRHXLNFTGKDCMWB<K",
        "V:VZBRGITYUPSDNHLXAWMJQOFECK<A",
        "VI:JPGVOUMFYQBENHZRDKASXLICTW<AN",
        "VII:NZJHGRCXMYSWBOUFAIVLPEKQDT<AN",
        "VIII:FKQHTLXOCBJSPDZRAMEWNIUYGV<AN",
      ],
      defaultIndex: 0,
    },
    {
      name: "Left-hand rotor ring setting",
      type: "option",
      value: LETTERS,
    },
    {
      name: "Left-hand rotor initial value",
      type: "option",
      value: LETTERS,
    },
    {
      name: "Middle rotor",
      type: "option",
      value: [
        "I:EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
        "II:AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
        "III:BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
        "IV:ESOVPZJAYQUIRHXLNFTGKDCMWB<K",
        "V:VZBRGITYUPSDNHLXAWMJQOFECK<A",
        "VI:JPGVOUMFYQBENHZRDKASXLICTW<AN",
        "VII:NZJHGRCXMYSWBOUFAIVLPEKQDT<AN",
        "VIII:FKQHTLXOCBJSPDZRAMEWNIUYGV<AN",
      ],
      defaultIndex: 1,
    },
    {
      name: "Middle rotor ring setting",
      type: "option",
      value: LETTERS,
    },
    {
      name: "Middle rotor initial value",
      type: "option",
      value: LETTERS,
    },
    {
      name: "Right-hand rotor",
      type: "option",
      value: [
        "I:EKMFLGDQVZNTOWYHXUSPAIBRCJ<R",
        "II:AJDKSIRUXBLHWTMCQGZNPYFVOE<F",
        "III:BDFHJLCPRTXVZNYEIWGAKMUSQO<W",
        "IV:ESOVPZJAYQUIRHXLNFTGKDCMWB<K",
        "V:VZBRGITYUPSDNHLXAWMJQOFECK<A",
        "VI:JPGVOUMFYQBENHZRDKASXLICTW<AN",
        "VII:NZJHGRCXMYSWBOUFAIVLPEKQDT<AN",
        "VIII:FKQHTLXOCBJSPDZRAMEWNIUYGV<AN",
      ],
      defaultIndex: 2,
    },
    {
      name: "Right-hand rotor ring setting",
      type: "option",
      value: LETTERS,
    },
    {
      name: "Right-hand rotor initial value",
      type: "option",
      value: LETTERS,
    },
    {
      name: "Reflector",
      type: "option",
      value: [
        "B:AY BR CU DH EQ FS GL IP JX KN MO TZ VW",
        "C:AF BV CP DJ EI GO HY KR LZ MX NW TQ SU",
        "B Thin:AE BN CK DQ FU GY HW IJ LO MP RX SZ TV",
        "C Thin:AR BD CO EJ FN GT HK IV LM PW QZ SX UY",
      ],
    },
    {
      name: "Plugboard",
      type: "string",
      value: "",
    },
    {
      name: "Strict output",
      type: "boolean",
      value: true,
    },
  ];

  constructor() {
    super();
    this.name = "Enigma";
    this.module = "Bletchley";
    this.description =
      "Encipher/decipher with the WW2 Enigma machine.<br><br>Enigma was used by the German military, among others, around the WW2 era as a portable cipher machine to protect sensitive military, diplomatic and commercial communications.";
    this.infoURL = "https://wikipedia.org/wiki/Enigma_machine";
    this.inputType = "string";
    this.outputType = "string";
  }

  /**
   * Parse rotor string into wiring and steps parts.
   */
  parseRotorStr(rotor: string, i: number): [string, string] {
    if (rotor === "") {
      throw new OperationError(`Rotor ${i} must be provided.`);
    }
    if (!rotor.includes("<")) {
      return [rotor, ""];
    }
    const parts = rotor.split("<", 2);
    return [parts[0], parts[1] || ""];
  }

  run(input: string, args: unknown[]): string {
    const model = args[0] as string;
    const reflectorConfig = args[13] as string;
    const plugboardConfig = args[14] as string;
    const removeOther = args[15] as boolean;

    const rotors: Rotor[] = [];
    let argIndex = 1;

    for (let i = 0; i < 4; i++) {
      if (i === 0 && model === "3-rotor") {
        continue;
      }
      const rotorConfig = args[argIndex++] as string;
      const [rotorWiring, rotorSteps] = this.parseRotorStr(rotorConfig, i + 1);
      const ringSetting = args[argIndex++] as string;
      const initialPosition = args[argIndex++] as string;
      rotors.push(
        new Rotor(rotorWiring, rotorSteps, ringSetting, initialPosition),
      );
    }

    // Rotors are handled in reverse
    rotors.reverse();

    const reflectorStr = reflectorConfig.split(":")[1];
    const reflector = new Reflector(reflectorStr);

    const plugboardStr = plugboardConfig.split(":")[1] || plugboardConfig;
    const plugboard = new Plugboard(plugboardStr);

    if (removeOther) {
      input = input.replace(/[^A-Za-z]/g, "");
    }

    const enigma = new EnigmaMachine(rotors, reflector, plugboard);
    let result = enigma.crypt(input);

    if (removeOther) {
      result = result.replace(/([A-Z]{5})(?!$)/g, "$1 ");
    }

    return result;
  }
}

export default Enigma;
