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

import { OperationError } from "../errors/OperationError";
import { Utils } from "../Utils";
import { Rotor, Plugboard, Reflector, a2i, i2a } from "./Enigma";

class CopyRotor extends Rotor {
  copy(): Rotor {
    const clone = Object.create(Rotor.prototype);
    clone.map = this.map;
    clone.revMap = this.revMap;
    clone.pos = this.pos;
    clone.steps = this.steps;
    clone.step = this.step.bind(clone);
    clone.transform = this.transform.bind(clone);
    clone.revTransform = this.revTransform.bind(clone);
    return clone as Rotor;
  }
}

class Node {
  letter: string;
  edges: Set<Edge>;
  visited: boolean;

  constructor(letter: string) {
    this.letter = letter;
    this.edges = new Set();
    this.visited = false;
  }
}

class Edge {
  pos: number;
  node1: Node;
  node2: Node;
  visited: boolean;

  constructor(pos: number, node1: Node, node2: Node) {
    this.pos = pos;
    this.node1 = node1;
    this.node2 = node2;
    node1.edges.add(this);
    node2.edges.add(this);
    this.visited = false;
  }

  getOther(node: Node): Node {
    return this.node1 === node ? this.node2 : this.node1;
  }
}

/**
 * Shared scrambler logic used across multiple scrambler units in the Bombe.
 *
 * Manages the common rotor state and caching for performance.
 */
class SharedScrambler {
  lowerCache: (number | undefined)[];
  higherCache: (number | undefined)[][];
  rotors: Rotor[] = [];
  rotorsRev: Rotor[] = [];
  reflector!: Reflector;

  constructor(rotors: Rotor[], reflector: Reflector) {
    this.lowerCache = new Array(26);
    this.higherCache = new Array(26);
    for (let i = 0; i < 26; i++) {
      this.higherCache[i] = new Array(26);
    }
    this.changeRotors(rotors, reflector);
  }

  /**
   * Updates the rotors and reflector used by the scrambler.
   */
  changeRotors(rotors: Rotor[], reflector: Reflector) {
    this.reflector = reflector;
    this.rotors = rotors;
    this.rotorsRev = [...rotors].reverse();
    this.cacheGen();
  }

  /**
   * Steps the rotors by a given number of positions.
   */
  step(n: number) {
    for (let i = 0; i < n - 1; i++) {
      this.rotors[i].step();
    }
    this.cacheGen();
  }

  /**
   * Rebuilds the transformation cache.
   */
  cacheGen() {
    for (let i = 0; i < 26; i++) {
      this.lowerCache[i] = undefined;
      for (let j = 0; j < 26; j++) {
        this.higherCache[i][j] = undefined;
      }
    }
    for (let i = 0; i < 26; i++) {
      if (this.lowerCache[i] !== undefined) {
        continue;
      }
      let letter = i;
      for (const rotor of this.rotors) {
        letter = rotor.transform(letter);
      }
      letter = this.reflector.transform(letter);
      for (const rotor of this.rotorsRev) {
        letter = rotor.revTransform(letter);
      }
      this.lowerCache[i] = letter;
      this.lowerCache[letter] = i;
    }
  }

  /**
   * Transforms a character index through the scrambler.
   */
  transform(i: number): number {
    return this.lowerCache[i] as number;
  }
}

/**
 * Represents a single scrambler unit in the Bombe machine.
 */
class Scrambler {
  baseScrambler: SharedScrambler;
  initialPos: number;
  rotor!: Rotor;
  end1?: number;
  end2?: number;
  cache!: (number | undefined)[];

  constructor(
    base: SharedScrambler,
    rotor: Rotor,
    pos: number,
    end1?: number,
    end2?: number,
  ) {
    this.baseScrambler = base;
    this.initialPos = pos;
    this.changeRotor(rotor);
    this.end1 = end1;
    this.end2 = end2;
    this.cache = this.baseScrambler.higherCache[pos];
  }

  /**
   * Updates the rotor used by this unit.
   */
  changeRotor(rotor: Rotor) {
    this.rotor = rotor;
    this.rotor.pos = Utils.mod(this.rotor.pos + this.initialPos, 26);
  }

  /**
   * Steps the unit's fast rotor.
   */
  step() {
    this.rotor.step();
    this.cache = this.baseScrambler.higherCache[this.rotor.pos];
  }

  /**
   * Transforms a character index through this scrambler unit.
   */
  transform(i: number): number {
    let letter = i;
    const cached = this.cache[i];
    if (cached !== undefined) {
      return cached;
    }
    letter = this.rotor.transform(letter);
    letter = this.baseScrambler.transform(letter);
    letter = this.rotor.revTransform(letter);
    this.cache[i] = letter;
    this.cache[letter] = i;
    return letter;
  }

  /**
   * Gets the other end of the connection if this scrambler corresponds to a crib pair.
   */
  getOtherEnd(end: number): number {
    return this.end1 === end ? (this.end2 as number) : (this.end1 as number);
  }

  /**
   * Returns the current rotor positions as a string.
   */
  getPos(): string {
    let result = "";
    let pos = Utils.mod(this.rotor.pos - 1, 26);
    result += i2a(pos);
    for (let i = 0; i < this.baseScrambler.rotors.length; i++) {
      pos = this.baseScrambler.rotors[i].pos;
      result += i2a(pos);
    }
    return result.split("").reverse().join("");
  }
}

/**
 * Implementation of the Turing-Welchman Bombe machine for Enigma cryptanalysis.
 */
export class BombeMachine {
  ciphertext: string;
  crib: string;
  check: boolean;
  updateFn?: (...msg: any[]) => void;
  baseRotors!: CopyRotor[];
  nLoops!: number;
  wires: boolean[];
  scramblers: Scrambler[][];
  sharedScrambler: SharedScrambler;
  allScramblers: Scrambler[];
  indicator!: Scrambler;
  testRegister!: number;
  testInput!: [number, number];
  energiseCount: number = 0;

  /**
   * Creates a new Bombe machine instance.
   *
   * @param rotors - Array of rotor IDs (e.g., ['I', 'II', 'III']).
   * @param reflector - The reflector to use.
   * @param ciphertext - The encrypted message.
   * @param crib - The suspected plaintext (crib).
   * @param check - Whether to perform additional checks on stops.
   * @param update - Optional callback for progress updates.
   */
  constructor(
    rotors: string[],
    reflector: Reflector,
    ciphertext: string,
    crib: string,
    check: boolean,
    update?: (...msg: any[]) => void,
  ) {
    if (ciphertext.length < crib.length) {
      throw new OperationError("Crib overruns supplied ciphertext");
    }
    if (crib.length < 2) {
      throw new OperationError("Crib is too short");
    }
    if (crib.length > 25) {
      throw new OperationError("Crib is too long");
    }
    for (let i = 0; i < crib.length; i++) {
      if (ciphertext[i] === crib[i]) {
        throw new OperationError(
          `Invalid crib: character ${ciphertext[i]} at pos ${i} in both ciphertext and crib`,
        );
      }
    }
    this.ciphertext = ciphertext;
    this.crib = crib;
    this.initRotors(rotors);
    this.check = check;
    this.updateFn = update;

    const [mostConnected, edges] = this.makeMenu();

    this.wires = new Array(26 * 26).fill(false);
    this.scramblers = new Array();
    for (let i = 0; i < 26; i++) {
      this.scramblers.push(new Array());
    }
    this.sharedScrambler = new SharedScrambler(
      this.baseRotors.slice(1),
      reflector,
    );
    this.allScramblers = new Array();
    let indicatorObj: Scrambler | undefined = undefined;
    for (const edge of edges as Edge[]) {
      const cRotor = this.baseRotors[0].copy();
      const end1 = a2i(edge.node1.letter);
      const end2 = a2i(edge.node2.letter);
      const scrambler = new Scrambler(
        this.sharedScrambler,
        cRotor,
        edge.pos,
        end1,
        end2,
      );
      if (edge.pos === 0) {
        indicatorObj = scrambler;
      }
      this.scramblers[end1].push(scrambler);
      this.scramblers[end2].push(scrambler);
      this.allScramblers.push(scrambler);
    }
    if (indicatorObj === undefined) {
      indicatorObj = new Scrambler(
        this.sharedScrambler,
        this.baseRotors[0].copy() as Rotor,
        0,
        undefined,
        undefined,
      );
      this.allScramblers.push(indicatorObj);
    }
    this.indicator = indicatorObj;

    this.testRegister = a2i((mostConnected as Node).letter);
    for (const edge of (mostConnected as Node).edges) {
      this.testInput = [
        this.testRegister,
        a2i(edge.getOther(mostConnected as Node).letter),
      ];
      break;
    }
  }

  initRotors(rotors: string[]) {
    this.baseRotors = [];
    for (const rstr of rotors) {
      const rotor = new CopyRotor(rstr, "", "A", "A");
      this.baseRotors.push(rotor);
    }
  }

  changeRotors(rotors: string[], reflector: Reflector) {
    this.initRotors(rotors);
    this.sharedScrambler.changeRotors(this.baseRotors.slice(1), reflector);
    for (const scrambler of this.allScramblers) {
      scrambler.changeRotor(this.baseRotors[0].copy());
    }
  }

  update(...msg: any[]) {
    if (this.updateFn !== undefined) {
      this.updateFn(...msg);
    }
  }

  dfs(node: Node): [number, number, Node, number, Set<Edge>] {
    let loops = 0;
    let nNodes = 1;
    let mostConnected = node;
    let nConnections = mostConnected.edges.size;
    let edges = new Set<Edge>();
    node.visited = true;
    for (const edge of node.edges) {
      if (edge.visited) {
        continue;
      }
      edge.visited = true;
      edges.add(edge);
      const other = edge.getOther(node);
      if (other.visited) {
        loops += 1;
        continue;
      }
      const [oLoops, oNNodes, oMostConnected, oNConnections, oEdges] =
        this.dfs(other);
      loops += oLoops;
      nNodes += oNNodes;
      edges = new Set([...edges, ...oEdges]);
      if (oNConnections > nConnections) {
        mostConnected = oMostConnected;
        nConnections = oNConnections;
      }
    }
    return [loops, nNodes, mostConnected, nConnections, edges];
  }

  makeMenu(): [Node, Edge[]] {
    const nodes = new Map<string, Node>();
    for (const c of this.ciphertext + this.crib) {
      if (!nodes.has(c)) {
        const node = new Node(c);
        nodes.set(c, node);
      }
    }
    for (let i = 0; i < this.crib.length; i++) {
      const a = this.crib[i];
      const b = this.ciphertext[i];
      new Edge(i, nodes.get(a)!, nodes.get(b)!);
    }
    const graphs: [number, number, Node, number, Set<Edge>][] = [];
    for (const start of nodes.keys()) {
      if (nodes.get(start)!.visited) {
        continue;
      }
      const subgraph = this.dfs(nodes.get(start)!);
      graphs.push(subgraph);
    }
    graphs.sort((a, b) => {
      let result = b[0] - a[0];
      if (result === 0) {
        result = b[1] - a[1];
      }
      return result;
    });
    this.nLoops = graphs[0][0];
    return [graphs[0][2], Array.from(graphs[0][4])];
  }

  energise(i: number, j: number) {
    const idx = 26 * i + j;
    if (this.wires[idx]) {
      return;
    }
    this.wires[idx] = true;
    const idxPair = 26 * j + i;
    this.wires[idxPair] = true;
    if (i === this.testRegister || j === this.testRegister) {
      this.energiseCount++;
      if (this.energiseCount === 26) {
        return;
      }
    }

    for (let k = 0; k < this.scramblers[i].length; k++) {
      const scrambler = this.scramblers[i][k];
      const out = scrambler.transform(j);
      const other = scrambler.getOtherEnd(i);
      const otherIdx = 26 * other + out;
      if (!this.wires[otherIdx]) {
        this.energise(other, out);
        if (this.energiseCount === 26) {
          return;
        }
      }
    }
    if (i === j) {
      return;
    }
    for (let k = 0; k < this.scramblers[j].length; k++) {
      const scrambler = this.scramblers[j][k];
      const out = scrambler.transform(i);
      const other = scrambler.getOtherEnd(j);
      const otherIdx = 26 * other + out;
      if (!this.wires[otherIdx]) {
        this.energise(other, out);
        if (this.energiseCount === 26) {
          return;
        }
      }
    }
  }

  tryDecrypt(stecker: string): string {
    const fastRotor = this.indicator.rotor;
    const initialPos = fastRotor.pos;
    const res = [];
    const plugboard = new Plugboard(stecker);
    for (let i = 0; i < Math.min(26, this.ciphertext.length); i++) {
      const t = this.indicator.transform(
        plugboard.transform(a2i(this.ciphertext[i])),
      );
      res.push(i2a(plugboard.transform(t)));
      this.indicator.step();
    }
    fastRotor.pos = initialPos;
    return res.join("");
  }

  formatPair(a: number, b: number): string {
    if (a < b) {
      return `${i2a(a)}${i2a(b)}`;
    }
    return `${i2a(b)}${i2a(a)}`;
  }

  checkingMachine(pair: number): string {
    if (pair !== this.testInput[1]) {
      for (let i = 0; i < this.wires.length; i++) {
        this.wires[i] = false;
      }
      this.energiseCount = 0;
      this.energise(this.testRegister, pair);
    }

    const results = new Set<string>();
    results.add(this.formatPair(this.testRegister, pair));
    for (let i = 0; i < 26; i++) {
      let count = 0;
      let other: number = -1;
      for (let j = 0; j < 26; j++) {
        if (this.wires[i * 26 + j]) {
          count++;
          other = j;
        }
      }
      if (count > 1) {
        return "";
      } else if (count === 0) {
        continue;
      }
      results.add(this.formatPair(i, other));
    }
    return [...results].join(" ");
  }

  checkStop(): [string, string, string] | undefined {
    const count = this.energiseCount;
    if (count === 26) {
      return undefined;
    }
    let steckerPair: number = -1;
    if (count === 25) {
      for (let j = 0; j < 26; j++) {
        if (!this.wires[26 * this.testRegister + j]) {
          steckerPair = j;
          break;
        }
      }
    } else if (count === 1) {
      steckerPair = this.testInput[1];
    } else {
      if (!this.check) {
        return [this.indicator.getPos(), "??", this.tryDecrypt("")];
      }
      let stecker: string | undefined = undefined;
      for (let i = 0; i < 26; i++) {
        const newStecker = this.checkingMachine(i);
        if (newStecker !== "") {
          if (stecker !== undefined) {
            return [this.indicator.getPos(), "??", this.tryDecrypt("")];
          }
          stecker = newStecker;
        }
      }
      if (stecker === undefined) {
        return undefined;
      }
      return [this.indicator.getPos(), stecker, this.tryDecrypt(stecker)];
    }
    let stecker: string;
    if (this.check) {
      stecker = this.checkingMachine(steckerPair);
      if (stecker === "") {
        return undefined;
      }
    } else {
      stecker = `${i2a(this.testRegister)}${i2a(steckerPair)}`;
    }
    const testDecrypt = this.tryDecrypt(stecker);
    return [this.indicator.getPos(), stecker, testDecrypt];
  }

  /**
   * Runs the Bombe machine through all possible rotor positions.
   *
   * @returns An array of "stops" found, where each stop is [rotor positions, stecker pairs, test decryption].
   */
  run(): [string, string, string][] {
    let stops = 0;
    const result: [string, string, string][] = [];
    const nChecks = Math.pow(26, this.baseRotors.length);
    for (let i = 1; i <= nChecks; i++) {
      for (let j = 0; j < this.wires.length; j++) {
        this.wires[j] = false;
      }
      this.energiseCount = 0;
      this.energise(this.testInput[0], this.testInput[1]);

      const stop = this.checkStop();
      if (stop !== undefined) {
        stops++;
        result.push(stop);
      }
      let n = 1;
      for (let j = 1; j < this.baseRotors.length; j++) {
        if (i % Math.pow(26, j) === 0) {
          n++;
        } else {
          break;
        }
      }
      if (n > 1) {
        this.sharedScrambler.step(n);
      }
      for (const scrambler of this.allScramblers) {
        scrambler.step();
      }
      if (n > 3) {
        this.update(this.nLoops, stops, i / nChecks);
      }
    }
    return result;
  }
}
