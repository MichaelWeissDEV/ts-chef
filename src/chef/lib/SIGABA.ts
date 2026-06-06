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

/**
 * Emulation of the SIGABA machine
 *
 * @author hettysymes
 * @copyright hettysymes 2020
 * @license Apache-2.0
 */

/**
 * A set of randomised example SIGABA cipher/control rotors (these rotors are interchangeable). Cipher and control rotors can be referred to as C and R rotors respectively.
 */
export const CR_ROTORS = [
  { name: "Example 1", value: "SRGWANHPJZFXVIDQCEUKBYOLMT" },
  { name: "Example 2", value: "THQEFSAZVKJYULBODCPXNIMWRG" },
  { name: "Example 3", value: "XDTUYLEVFNQZBPOGIRCSMHWKAJ" },
  { name: "Example 4", value: "LOHDMCWUPSTNGVXYFJREQIKBZA" },
  { name: "Example 5", value: "ERXWNZQIJYLVOFUMSGHTCKPBDA" },
  { name: "Example 6", value: "FQECYHJIOUMDZVPSLKRTGWXBAN" },
  { name: "Example 7", value: "TBYIUMKZDJSOPEWXVANHLCFQGR" },
  { name: "Example 8", value: "QZUPDTFNYIAOMLEBWJXCGHKRSV" },
  { name: "Example 9", value: "CZWNHEMPOVXLKRSIDGJFYBTQAU" },
  { name: "Example 10", value: "ENPXJVKYQBFZTICAGMOHWRLDUS" },
];

/**
 * A set of randomised example SIGABA index rotors (may be referred to as I rotors).
 */
export const I_ROTORS = [
  { name: "Example 1", value: "6201348957" },
  { name: "Example 2", value: "6147253089" },
  { name: "Example 3", value: "8239647510" },
  { name: "Example 4", value: "7194835260" },
  { name: "Example 5", value: "4873205916" },
];

export const NUMBERS = "0123456789".split("");

/**
 * Converts a letter to uppercase (if it already isn't)
 *
 * @param {string} letter - letter to convert to uppercase
 * @returns {string}
 */
export function convToUpperCase(letter: string): string {
  const charCode = letter.charCodeAt(0);
  if (97 <= charCode && charCode <= 122) {
    return String.fromCharCode(charCode - 32);
  }
  return letter;
}

/**
 * The SIGABA machine consisting of the 3 rotor banks: cipher, control and index banks.
 */
export class SigabaMachine {
  cipherBank: CipherBank;
  controlBank: ControlBank;
  indexBank: IndexBank;

  /**
   * SigabaMachine constructor
   *
   * @param {CRRotor[]} cipherRotors - list of CRRotors
   * @param {CRRotor[]} controlRotors - list of CRRotors
   * @param {IRotor[]} indexRotors - list of IRotors
   */
  constructor(
    cipherRotors: CRRotor[],
    controlRotors: CRRotor[],
    indexRotors: IRotor[],
  ) {
    this.cipherBank = new CipherBank(cipherRotors);
    this.controlBank = new ControlBank(controlRotors);
    this.indexBank = new IndexBank(indexRotors);
  }

  /**
   * Steps all the correct rotors in the machine.
   */
  step(): void {
    const controlOut = this.controlBank.goThroughControl();
    const indexOut = this.indexBank.goThroughIndex(controlOut);
    this.cipherBank.step(indexOut);
  }

  /**
   * Encrypts a letter. A space is converted to a "Z" before encryption, and a "Z" is converted to an "X". This allows spaces to be encrypted.
   *
   * @param {string} letter - letter to encrypt
   * @returns {string}
   */
  encryptLetter(letter: string): string {
    letter = convToUpperCase(letter);
    if (letter === " ") {
      letter = "Z";
    } else if (letter === "Z") {
      letter = "X";
    }
    const encryptedLetter = this.cipherBank.encrypt(letter);
    this.step();
    return encryptedLetter;
  }

  /**
   * Decrypts a letter. A letter decrypted as a "Z" is converted to a space before it is output, since spaces are converted to "Z"s before encryption.
   *
   * @param {string} letter - letter to decrypt
   * @returns {string}
   */
  decryptLetter(letter: string): string {
    letter = convToUpperCase(letter);
    let decryptedLetter = this.cipherBank.decrypt(letter);
    if (decryptedLetter === "Z") {
      decryptedLetter = " ";
    }
    this.step();
    return decryptedLetter;
  }

  /**
   * Encrypts a message of one or more letters
   *
   * @param {string} msg - message to encrypt
   * @returns {string}
   */
  encrypt(msg: string): string {
    let ciphertext = "";
    for (const letter of msg) {
      ciphertext = ciphertext.concat(this.encryptLetter(letter));
    }
    return ciphertext;
  }

  /**
   * Decrypts a message of one or more letters
   *
   * @param {string} msg - message to decrypt
   * @returns {string}
   */
  decrypt(msg: string): string {
    let plaintext = "";
    for (const letter of msg) {
      plaintext = plaintext.concat(this.decryptLetter(letter));
    }
    return plaintext;
  }
}

/**
 * The cipher rotor bank consists of 5 cipher rotors in either a forward or reversed orientation.
 */
export class CipherBank {
  rotors: CRRotor[];

  /**
   * CipherBank constructor
   *
   * @param {CRRotor[]} rotors - list of CRRotors
   */
  constructor(rotors: CRRotor[]) {
    this.rotors = rotors;
  }

  /**
   * Encrypts a letter through the cipher rotors (signal goes from left-to-right)
   *
   * @param {string} inputPos - the input position of the signal (letter to be encrypted)
   * @returns {string}
   */
  encrypt(inputPos: string): string {
    for (const rotor of this.rotors) {
      inputPos = rotor.crypt(inputPos, "leftToRight");
    }
    return inputPos;
  }

  /**
   * Decrypts a letter through the cipher rotors (signal goes from right-to-left)
   *
   * @param {string} inputPos - the input position of the signal (letter to be decrypted)
   * @returns {string}
   */
  decrypt(inputPos: string): string {
    const revOrderedRotors = [...this.rotors].reverse();
    for (const rotor of revOrderedRotors) {
      inputPos = rotor.crypt(inputPos, "rightToLeft");
    }
    return inputPos;
  }

  /**
   * Step the cipher rotors forward according to the inputs from the index rotors
   *
   * @param {number[]} indexInputs - the inputs from the index rotors
   */
  step(indexInputs: number[]): void {
    const logicDict: { [key: number]: number[] } = {
      0: [0, 9],
      1: [7, 8],
      2: [5, 6],
      3: [3, 4],
      4: [1, 2],
    };
    const rotorsToMove: CRRotor[] = [];
    for (const key in logicDict) {
      const k = parseInt(key);
      const item = logicDict[k];
      for (const i of indexInputs) {
        if (item.includes(i)) {
          rotorsToMove.push(this.rotors[k]);
          break;
        }
      }
    }
    for (const rotor of rotorsToMove) {
      rotor.step();
    }
  }
}

/**
 * The control rotor bank consists of 5 control rotors in either a forward or reversed orientation. Signals to the control rotor bank always go from right-to-left.
 */
export class ControlBank {
  rotors: CRRotor[];

  /**
   * ControlBank constructor. The rotors have been reversed as signals go from right-to-left through the control rotors.
   *
   * @param {CRRotor[]} rotors - list of CRRotors
   */
  constructor(rotors: CRRotor[]) {
    this.rotors = [...rotors].reverse();
  }

  /**
   * Encrypts a letter.
   *
   * @param {string} inputPos - the input position of the signal
   * @returns {string}
   */
  crypt(inputPos: string): string {
    for (const rotor of this.rotors) {
      inputPos = rotor.crypt(inputPos, "rightToLeft");
    }
    return inputPos;
  }

  /**
   * Gets the outputs of the control rotors. The inputs to the control rotors are always "F", "G", "H" and "I".
   *
   * @returns {number[]}
   */
  getOutputs(): number[] {
    const outputs = [
      this.crypt("F"),
      this.crypt("G"),
      this.crypt("H"),
      this.crypt("I"),
    ];
    const logicDict: { [key: number]: string } = {
      1: "B",
      2: "C",
      3: "DE",
      4: "FGH",
      5: "IJK",
      6: "LMNO",
      7: "PQRST",
      8: "UVWXYZ",
      9: "A",
    };
    const numberOutputs: number[] = [];
    for (const key in logicDict) {
      const k = parseInt(key);
      const item = logicDict[k];
      for (const output of outputs) {
        if (item.includes(output)) {
          numberOutputs.push(k);
          break;
        }
      }
    }
    return numberOutputs;
  }

  /**
   * Steps the control rotors. Only 3 of the control rotors step: one after every encryption, one after every 26, and one after every 26 squared.
   */
  step(): void {
    const MRotor = this.rotors[1],
      FRotor = this.rotors[2],
      SRotor = this.rotors[3];
    // 14 is the offset of "O" from "A" - the next rotor steps once the previous rotor reaches "O"
    if (FRotor.state === 14) {
      if (MRotor.state === 14) {
        SRotor.step();
      }
      MRotor.step();
    }
    FRotor.step();
  }

  /**
   * The goThroughControl function combines getting the outputs from the control rotor bank and then stepping them.
   *
   * @returns {number[]}
   */
  goThroughControl(): number[] {
    const outputs = this.getOutputs();
    this.step();
    return outputs;
  }
}

/**
 * The index rotor bank consists of 5 index rotors all placed in the forwards orientation.
 */
export class IndexBank {
  rotors: IRotor[];

  /**
   * IndexBank constructor
   *
   * @param {IRotor[]} rotors - list of IRotors
   */
  constructor(rotors: IRotor[]) {
    this.rotors = rotors;
  }

  /**
   * Encrypts a number.
   *
   * @param {number} inputPos - the input position of the signal
   * @returns {number}
   */
  crypt(inputPos: number): number {
    for (const rotor of this.rotors) {
      inputPos = rotor.crypt(inputPos);
    }
    return inputPos;
  }

  /**
   * The goThroughIndex function takes the inputs from the control rotor bank and returns the list of outputs after encryption through the index rotors.
   *
   * @param {number[]} controlInputs - inputs from the control rotors
   * @returns {number[]}
   */
  goThroughIndex(controlInputs: number[]): number[] {
    const outputs: number[] = [];
    for (const inp of controlInputs) {
      outputs.push(this.crypt(inp));
    }
    return outputs;
  }
}

/**
 * Rotor class
 */
export class Rotor {
  state: number;
  numMapping: number[];
  posMapping: number[];

  /**
   * Rotor constructor
   *
   * @param {number[]} wireSetting - the wirings within the rotor: mapping from left-to-right, the index of the number in the list maps onto the number at that index
   * @param {boolean} rev - true if the rotor is reversed, false if it isn't
   * @param {number} key - the starting position or state of the rotor
   */
  constructor(wireSetting: number[], key: number, rev: boolean) {
    this.state = key;
    this.numMapping = this.getNumMapping(wireSetting, rev);
    this.posMapping = this.getPosMapping(rev);
  }

  /**
   * Get the number mapping from the wireSetting (only different from wireSetting if rotor is reversed)
   *
   * @param {number[]} wireSetting - the wirings within the rotors
   * @param {boolean} rev - true if reversed, false if not
   * @returns {number[]}
   */
  getNumMapping(wireSetting: number[], rev: boolean): number[] {
    if (rev === false) {
      return wireSetting;
    } else {
      const length = wireSetting.length;
      const tempMapping = new Array(length);
      for (let i = 0; i < length; i++) {
        tempMapping[wireSetting[i]] = i;
      }
      return tempMapping;
    }
  }

  /**
   * Get the position mapping (how the position numbers map onto the numbers of the rotor)
   *
   * @param {boolean} rev - true if reversed, false if not
   * @returns {number[]}
   */
  getPosMapping(rev: boolean): number[] {
    const length = this.numMapping.length;
    const posMapping: number[] = [];
    if (rev === false) {
      for (let i = this.state; i < this.state + length; i++) {
        let res = i % length;
        if (res < 0) {
          res += length;
        }
        posMapping.push(res);
      }
    } else {
      for (let i = this.state; i > this.state - length; i--) {
        let res = i % length;
        if (res < 0) {
          res += length;
        }
        posMapping.push(res);
      }
    }
    return posMapping;
  }

  /**
   * Encrypt/decrypt data. This process is identical to the rotors of cipher machines such as Enigma or Typex.
   *
   * @param {number} inputPos - the input position of the signal (the data to encrypt/decrypt)
   * @param {string} direction - one of "leftToRight" and "rightToLeft", states the direction in which the signal passes through the rotor
   * @returns {number}
   */
  cryptNum(inputPos: number, direction: string): number {
    const inpNum = this.posMapping[inputPos];
    let outNum: number = 0;
    if (direction === "leftToRight") {
      outNum = this.numMapping[inpNum];
    } else if (direction === "rightToLeft") {
      outNum = this.numMapping.indexOf(inpNum);
    }
    const outPos = this.posMapping.indexOf(outNum);
    return outPos;
  }

  /**
   * Steps the rotor. The number at position 0 will be moved to position 1 etc.
   */
  step(): void {
    const lastNum = this.posMapping.pop();
    if (lastNum !== undefined) {
      this.posMapping.splice(0, 0, lastNum);
    }
    this.state = this.posMapping[0];
  }
}

/**
 * A CRRotor is a cipher (C) or control (R) rotor. These rotors are identical and interchangeable. A C or R rotor consists of 26 contacts, one for each letter, and may be put into either a forwards of reversed orientation.
 */
export class CRRotor extends Rotor {
  /**
   * CRRotor constructor
   *
   * @param {string} wireSetting - the rotor wirings (string of letters)
   * @param {string} key - initial state of rotor
   * @param {boolean} rev - true if reversed, false if not
   */
  constructor(wireSetting: string, key: string, rev: boolean = false) {
    const wireNums = wireSetting.split("").map(CRRotor.letterToNum);
    super(wireNums, CRRotor.letterToNum(key), rev);
  }

  /**
   * Static function which converts a letter into its number i.e. its offset from the letter "A"
   *
   * @param {string} letter - letter to convert to number
   * @returns {number}
   */
  static letterToNum(letter: string): number {
    return letter.charCodeAt(0) - 65;
  }

  /**
   * Static function which converts a number (a letter's offset from "A") into its letter
   *
   * @param {number} num - number to convert to letter
   * @returns {string}
   */
  static numToLetter(num: number): string {
    return String.fromCharCode(num + 65);
  }

  /**
   * Encrypts/decrypts a letter.
   *
   * @param {string} inputPos - the input position of the signal ("A" refers to position 0 etc.)
   * @param {string} direction - one of "leftToRight" and "rightToLeft"
   * @returns {string}
   */
  crypt(inputPos: string, direction: string): string {
    const inputNum = CRRotor.letterToNum(inputPos);
    const outPos = this.cryptNum(inputNum, direction);
    return CRRotor.numToLetter(outPos);
  }
}

/**
 * An IRotor is an index rotor, which consists of 10 contacts each numbered from 0 to 9. Unlike C and R rotors, they cannot be put in the reversed orientation. The index rotors do not step at any point during encryption or decryption.
 */
export class IRotor extends Rotor {
  /**
   * IRotor constructor
   *
   * @param {string} wireSetting - the rotor wirings (string of numbers)
   * @param {string} key - initial state of rotor
   */
  constructor(wireSetting: string, key: string) {
    const wireNums = wireSetting.split("").map(Number);
    super(wireNums, Number(key), false);
  }

  /**
   * Encrypts a number
   *
   * @param {number} inputPos - the input position of the signal
   * @returns {number}
   */
  crypt(inputPos: number): number {
    return this.cryptNum(inputPos, "leftToRight");
  }
}
