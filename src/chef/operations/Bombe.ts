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
import { BombeMachine } from "../lib/Bombe";
import { ROTORS, ROTORS_FOURTH, REFLECTORS, Reflector } from "../lib/Enigma";

export class Bombe extends Operation {
  name = "Bombe";
  module = "Bletchley";
  description =
    "Emulation of the Bombe machine used at Bletchley Park to attack Enigma, based on work by Polish and British cryptanalysts.<br><br>To run this you need to have a 'crib', which is some known plaintext for a chunk of the target ciphertext, and know the rotors used. (See the 'Bombe (multiple runs)' operation if you don't know the rotors.) The machine will suggest possible configurations of the Enigma. Each suggestion has the rotor start positions (left to right) and known plugboard pairs.<br><br>Choosing a crib: First, note that Enigma cannot encrypt a letter to itself, which allows you to rule out some positions for possible cribs. Secondly, the Bombe does not simulate the Enigma's middle rotor stepping. The longer your crib, the more likely a step happened within it, which will prevent the attack working. However, other than that, longer cribs are generally better. The attack produces a 'menu' which maps ciphertext letters to plaintext, and the goal is to produce 'loops': for example, with ciphertext ABC and crib CAB, we have the mappings A&lt;-&gt;C, B&lt;-&gt;A, and C&lt;-&gt;B, which produces a loop A-B-C-A. The more loops, the better the crib. The operation will output this: if your menu has too few loops or is too short, a large number of incorrect outputs will usually be produced. Try a different crib. If the menu seems good but the right answer isn't produced, your crib may be wrong, or you may have overlapped the middle rotor stepping - try a different crib.<br><br>Output is not sufficient to fully decrypt the data. You will have to recover the rest of the plugboard settings by inspection. And the ring position is not taken into account: this affects when the middle rotor steps. If your output is correct for a bit, and then goes wrong, adjust the ring and start position on the right-hand rotor together until the output improves. If necessary, repeat for the middle rotor.<br><br>By default this operation runs the checking machine, a separate device used to rule out ambiguous stops and determine the rest of the plugboard settings from the stop. This means it will only output stops where the checking machine successfully recovered the plugboard settings without contradiction. In very rare circumstances this might reject a valid stop (e.g. if the plugboard was very lightly used), so if you are confident in your crib but nothing is being found, try disabling it.";
  infoURL = "https://wikipedia.org/wiki/Bombe";
  inputType = "string";
  outputType = "JSON";
  presentType = "html";
  args: ArgConfig[] = [
    {
      name: "Model",
      type: "argSelector",
      value: [
        {
          name: "3-rotor",
          off: [1],
        },
        {
          name: "4-rotor",
          on: [1],
        },
      ],
    },
    {
      name: "Left-most (4th) rotor",
      type: "editableOption",
      value: ROTORS_FOURTH,
      defaultIndex: 0,
    },
    {
      name: "Left-hand rotor",
      type: "editableOption",
      value: ROTORS,
      defaultIndex: 0,
    },
    {
      name: "Middle rotor",
      type: "editableOption",
      value: ROTORS,
      defaultIndex: 1,
    },
    {
      name: "Right-hand rotor",
      type: "editableOption",
      value: ROTORS,
      defaultIndex: 2,
    },
    {
      name: "Reflector",
      type: "editableOption",
      value: REFLECTORS,
    },
    {
      name: "Crib",
      type: "string",
      value: "",
    },
    {
      name: "Crib offset",
      type: "number",
      value: 0,
    },
    {
      name: "Use checking machine",
      type: "boolean",
      value: true,
    },
  ];

  run(input: string, args: any[]): any {
    const model = args[0];
    const reflectorstr = args[5];
    let crib = args[6];
    const offset = args[7];
    const check = args[8];
    const rotors: string[] = [];
    for (let i = 0; i < 4; i++) {
      if (i === 0 && model === "3-rotor") {
        continue;
      }
      let rstr = args[i + 1];
      if (rstr.includes("<")) {
        rstr = rstr.split("<", 2)[0];
      }
      rotors.push(rstr);
    }
    rotors.reverse();
    if (crib.length === 0) {
      throw new OperationError("Crib cannot be empty");
    }
    if (offset < 0) {
      throw new OperationError("Offset cannot be negative");
    }
    input = input.replace(/[^A-Za-z]/g, "").toUpperCase();
    crib = crib.replace(/[^A-Za-z]/g, "").toUpperCase();
    const ciphertext = input.slice(offset);
    const reflector = new Reflector(reflectorstr);
    const update = undefined; // Removed worker update function
    const bombe = new BombeMachine(
      rotors,
      reflector,
      ciphertext,
      crib,
      check,
      update,
    );
    const result = bombe.run();
    return {
      nLoops: bombe.nLoops,
      result: result,
    };
  }

  present(output: any, _args: any[]): string {
    let html = `Bombe run on menu with ${output.nLoops} loop${output.nLoops === 1 ? "" : "s"} (2+ desirable). Note: Rotor positions are listed left to right and start at the beginning of the crib, and ignore stepping and the ring setting. Some plugboard settings are determined. A decryption preview starting at the beginning of the crib and ignoring stepping is also provided.\n\n`;
    html +=
      "<table class='table table-hover table-sm table-bordered table-nonfluid'><tr><th>Rotor stops</th>  <th>Partial plugboard</th>  <th>Decryption preview</th></tr>\n";
    for (const [setting, stecker, decrypt] of output.result) {
      html += `<tr><td>${setting}</td>  <td>${stecker}</td>  <td>${decrypt}</td></tr>\n`;
    }
    html += "</table>";
    return html;
  }
}

export default Bombe;
