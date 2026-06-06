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
import { ColossusComputer } from "../lib/Colossus";
import { SWITCHES, VALID_ITA2, ROTOR_SIZES } from "../lib/Lorenz";

/**
 * Colossus operation
 *
 * @category Bletchley
 * @see https://wikipedia.org/wiki/Colossus_computer
 * @see https://virtualcolossus.co.uk
 * @see https://github.com/gchq/CyberChef/wiki/Colossus
 */
export class Colossus extends Operation {
  name = "Colossus";
  module = "Bletchley";
  description =
    "Colossus is the name of the world's first electronic computer. Ten Colossi were designed by Tommy Flowers and built at the Post Office Research Labs at Dollis Hill in 1943 during World War 2. They assisted with the breaking of the German Lorenz cipher attachment, a machine created to encipher communications between Hitler and his generals on the front lines.<br><br>To learn more, Virtual Colossus, an online, browser based simulation of a Colossus computer is available at <a href='https://virtualcolossus.co.uk' target='_blank'>virtualcolossus.co.uk</a>.<br><br>A more detailed description of this operation can be found <a href='https://github.com/gchq/CyberChef/wiki/Colossus' target='_blank'>here</a>.";
  infoURL = "https://wikipedia.org/wiki/Colossus_computer";
  inputType = "string";
  outputType = "JSON";
  presentType = "html";
  args: ArgConfig[] = [
    {
      name: "Input",
      type: "label",
      value: "",
    },
    {
      name: "Pattern",
      type: "option",
      value: ["KH Pattern", "ZMUG Pattern", "BREAM Pattern"],
    },
    {
      name: "QBusZ",
      type: "option",
      value: ["", "Z", "ΔZ"],
    },
    {
      name: "QBusΧ",
      type: "option",
      value: ["", "Χ", "ΔΧ"],
    },
    {
      name: "QBusΨ",
      type: "option",
      value: ["", "Ψ", "ΔΨ"],
    },
    {
      name: "Limitation",
      type: "option",
      value: ["None", "Χ2", "Χ2 + P5", "X2 + Ψ1", "X2 + Ψ1 + P5"],
    },
    {
      name: "K Rack Option",
      type: "argSelector",
      value: [
        {
          name: "Select Program",
          on: [7],
          off: [
            8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
            25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
          ],
        },
        {
          name: "Top Section - Conditional",
          on: [
            8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
            25, 26, 27, 28, 29, 30,
          ],
          off: [7, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
        },
        {
          name: "Bottom Section - Addition",
          on: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
          off: [
            7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
            25, 26, 27, 28, 29, 30,
          ],
        },
        {
          name: "Advanced",
          on: [
            8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
            25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
          ],
          off: [7],
        },
      ],
    },
    {
      name: "Program to run",
      type: "option",
      value: [
        "",
        "Letter Count",
        "1+2=. (1+2 Break In, Find X1,X2)",
        "4=5=/1=2 (Given X1,X2 find X4,X5)",
        "/,5,U (Count chars to find X3)",
      ],
    },
    {
      name: "K Rack: Conditional",
      type: "label",
      value: "",
    },
    {
      name: "R1-Q1",
      type: "editableOptionShort",
      value: SWITCHES,
      defaultIndex: 1,
    },
    {
      name: "R1-Q2",
      type: "editableOptionShort",
      value: SWITCHES,
      defaultIndex: 1,
    },
    {
      name: "R1-Q3",
      type: "editableOptionShort",
      value: SWITCHES,
      defaultIndex: 1,
    },
    {
      name: "R1-Q4",
      type: "editableOptionShort",
      value: SWITCHES,
      defaultIndex: 1,
    },
    {
      name: "R1-Q5",
      type: "editableOptionShort",
      value: SWITCHES,
      defaultIndex: 1,
    },
    {
      name: "R1-Negate",
      type: "boolean",
      value: false,
    },
    {
      name: "R1-Counter",
      type: "option",
      value: ["", "1", "2", "3", "4", "5"],
    },
    {
      name: "R2-Q1",
      type: "editableOptionShort",
      value: SWITCHES,
      defaultIndex: 1,
    },
    {
      name: "R2-Q2",
      type: "editableOptionShort",
      value: SWITCHES,
      defaultIndex: 1,
    },
    {
      name: "R2-Q3",
      type: "editableOptionShort",
      value: SWITCHES,
      defaultIndex: 1,
    },
    {
      name: "R2-Q4",
      type: "editableOptionShort",
      value: SWITCHES,
      defaultIndex: 1,
    },
    {
      name: "R2-Q5",
      type: "editableOptionShort",
      value: SWITCHES,
      defaultIndex: 1,
    },
    {
      name: "R2-Negate",
      type: "boolean",
      value: false,
    },
    {
      name: "R2-Counter",
      type: "option",
      value: ["", "1", "2", "3", "4", "5"],
    },
    {
      name: "R3-Q1",
      type: "editableOptionShort",
      value: SWITCHES,
      defaultIndex: 1,
    },
    {
      name: "R3-Q2",
      type: "editableOptionShort",
      value: SWITCHES,
      defaultIndex: 1,
    },
    {
      name: "R3-Q3",
      type: "editableOptionShort",
      value: SWITCHES,
      defaultIndex: 1,
    },
    {
      name: "R3-Q4",
      type: "editableOptionShort",
      value: SWITCHES,
      defaultIndex: 1,
    },
    {
      name: "R3-Q5",
      type: "editableOptionShort",
      value: SWITCHES,
      defaultIndex: 1,
    },
    {
      name: "R3-Negate",
      type: "boolean",
      value: false,
    },
    {
      name: "R3-Counter",
      type: "option",
      value: ["", "1", "2", "3", "4", "5"],
    },
    {
      name: "Negate All",
      type: "boolean",
      value: false,
    },
    {
      name: "K Rack: Addition",
      type: "label",
      value: "",
    },
    {
      name: "Add-Q1",
      type: "boolean",
      value: false,
    },
    {
      name: "Add-Q2",
      type: "boolean",
      value: false,
    },
    {
      name: "Add-Q3",
      type: "boolean",
      value: false,
    },
    {
      name: "Add-Q4",
      type: "boolean",
      value: false,
    },
    {
      name: "Add-Q5",
      type: "boolean",
      value: false,
    },
    {
      name: "Add-Equals",
      type: "editableOptionShort",
      value: SWITCHES,
      defaultIndex: 1,
    },
    {
      name: "Add-Counter1",
      type: "boolean",
      value: false,
    },
    {
      name: "Add Negate All",
      type: "boolean",
      value: false,
    },
    {
      name: "Total Motor",
      type: "editableOptionShort",
      value: SWITCHES,
      defaultIndex: 1,
    },
    {
      name: "Master Control Panel",
      type: "label",
      value: "",
    },
    {
      name: "Set Total",
      type: "number",
      value: 0,
    },
    {
      name: "Fast Step",
      type: "option",
      value: [
        "",
        "X1",
        "X2",
        "X3",
        "X4",
        "X5",
        "M37",
        "M61",
        "S1",
        "S2",
        "S3",
        "S4",
        "S5",
      ],
    },
    {
      name: "Slow Step",
      type: "option",
      value: [
        "",
        "X1",
        "X2",
        "X3",
        "X4",
        "X5",
        "M37",
        "M61",
        "S1",
        "S2",
        "S3",
        "S4",
        "S5",
      ],
    },
    {
      name: "Start Χ1",
      type: "number",
      value: 1,
    },
    {
      name: "Start Χ2",
      type: "number",
      value: 1,
    },
    {
      name: "Start Χ3",
      type: "number",
      value: 1,
    },
    {
      name: "Start Χ4",
      type: "number",
      value: 1,
    },
    {
      name: "Start Χ5",
      type: "number",
      value: 1,
    },
    {
      name: "Start M61",
      type: "number",
      value: 1,
    },
    {
      name: "Start M37",
      type: "number",
      value: 1,
    },
    {
      name: "Start Ψ1",
      type: "number",
      value: 1,
    },
    {
      name: "Start Ψ2",
      type: "number",
      value: 1,
    },
    {
      name: "Start Ψ3",
      type: "number",
      value: 1,
    },
    {
      name: "Start Ψ4",
      type: "number",
      value: 1,
    },
    {
      name: "Start Ψ5",
      type: "number",
      value: 1,
    },
  ];

  /**
   * Runs the operation.
   *
   * @param {string} input
   * @param {any[]} args
   * @returns {any}
   */
  run(input: string, args: any[]): any {
    input = input.toUpperCase();
    for (const character of input) {
      if (VALID_ITA2.indexOf(character) === -1) {
        let errltr = character;
        if (errltr === "\n") errltr = "Carriage Return";
        if (errltr === " ") errltr = "Space";
        throw new OperationError("Invalid ITA2 character : " + errltr);
      }
    }

    const pattern = args[1];
    const qbusin = {
      Z: args[2],
      Chi: args[3],
      Psi: args[4],
    };

    const limitation = args[5];
    const lm = [false, false, false];
    if (limitation.includes("Χ2")) lm[0] = true;
    if (limitation.includes("Ψ1")) lm[1] = true;
    if (limitation.includes("P5")) lm[2] = true;
    const limit = {
      X2: lm[0],
      S1: lm[1],
      P5: lm[2],
    };

    const KRackOpt = args[6];
    const setProgram = args[7];

    if (KRackOpt === "Select Program" && setProgram !== "") {
      args = this.selectProgram(setProgram, args);
    }

    const re = new RegExp("^$|^[.x]$");
    for (let qr = 0; qr < 3; qr++) {
      for (let a = 0; a < 5; a++) {
        if (!re.test(args[qr * 7 + a + 9]))
          throw new OperationError(
            "Switch R" +
              (qr + 1) +
              "-Q" +
              (a + 1) +
              " can only be set to blank, . or x",
          );
      }
    }

    if (!re.test(args[37]))
      throw new OperationError(
        "Switch Add-Equals can only be set to blank, . or x",
      );
    if (!re.test(args[40]))
      throw new OperationError(
        "Switch Total Motor can only be set to blank, . or x",
      );

    const qbusswitches = {
      condition: [
        {
          Qswitches: [args[9], args[10], args[11], args[12], args[13]],
          Negate: args[14],
          Counter: args[15],
        },
        {
          Qswitches: [args[16], args[17], args[18], args[19], args[20]],
          Negate: args[21],
          Counter: args[22],
        },
        {
          Qswitches: [args[23], args[24], args[25], args[26], args[27]],
          Negate: args[28],
          Counter: args[29],
        },
      ],
      condNegateAll: args[30],
      addition: [
        {
          Qswitches: [args[32], args[33], args[34], args[35], args[36]],
          Equals: args[37],
          C1: args[38],
        },
      ],
      addNegateAll: args[39],
      totalMotor: args[40],
    };

    const settotal = parseInt(args[42], 10);
    if (settotal < 0 || settotal > 9999)
      throw new OperationError("Set Total must be between 0000 and 9999");

    const control = {
      fast: args[43],
      slow: args[44],
    };

    const rotorNames = [
      "X1",
      "X2",
      "X3",
      "X4",
      "X5",
      "M61",
      "M37",
      "S1",
      "S2",
      "S3",
      "S4",
      "S5",
    ];
    const rotorStartIndices = [45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56];

    for (let i = 0; i < rotorNames.length; i++) {
      const name = rotorNames[i];
      const start = args[rotorStartIndices[i]];
      if (start < 1 || start > ROTOR_SIZES[name]) {
        throw new OperationError(
          `${name} start must be between 1 and ${ROTOR_SIZES[name]}`,
        );
      }
    }

    const starts = {
      X1: args[45],
      X2: args[46],
      X3: args[47],
      X4: args[48],
      X5: args[49],
      M61: args[50],
      M37: args[51],
      S1: args[52],
      S2: args[53],
      S3: args[54],
      S4: args[55],
      S5: args[56],
    };

    const colossus = new ColossusComputer(
      input,
      pattern,
      qbusin,
      qbusswitches,
      control,
      starts,
      settotal,
      limit,
    );
    return colossus.run();
  }

  selectProgram(progname: string, args: any[]): any[] {
    if (progname === "Letter Count") {
      args[9] = "";
      args[10] = "";
      args[11] = "";
      args[12] = "";
      args[13] = "";
      args[14] = false;
      args[15] = "1";
      args[22] = "";
      args[29] = "";
      args[30] = false;
      args[38] = false;
    }

    if (progname === "1+2=. (1+2 Break In, Find X1,X2)") {
      args[15] = "";
      args[22] = "";
      args[29] = "";
      args[32] = true;
      args[33] = true;
      args[34] = false;
      args[35] = false;
      args[36] = false;
      args[37] = ".";
      args[38] = true;
    }

    if (progname === "4=5=/1=2 (Given X1,X2 find X4,X5)") {
      args[9] = ".";
      args[10] = ".";
      args[11] = "";
      args[12] = ".";
      args[13] = ".";
      args[14] = true;
      args[15] = "1";
      args[16] = "x";
      args[17] = "x";
      args[18] = "";
      args[19] = "x";
      args[20] = "x";
      args[21] = true;
      args[22] = "1";
      args[29] = "";
      args[30] = true;
      args[38] = false;
    }

    if (progname === "/,5,U (Count chars to find X3)") {
      args[9] = ".";
      args[10] = ".";
      args[11] = ".";
      args[12] = ".";
      args[13] = ".";
      args[14] = false;
      args[15] = "1";
      args[16] = "x";
      args[17] = "x";
      args[18] = ".";
      args[19] = "x";
      args[20] = "x";
      args[21] = false;
      args[22] = "2";
      args[23] = "x";
      args[24] = "x";
      args[25] = "x";
      args[26] = ".";
      args[27] = ".";
      args[28] = false;
      args[29] = "3";
      args[30] = false;
      args[38] = false;
    }

    return args;
  }

  present(output: any): string {
    let html = "Colossus Printer\n\n";
    html += output.printout + "\n\n";
    html += "Colossus Counters\n\n";
    html +=
      "<table class='table table-hover table-sm table-bordered table-nonfluid'><tr><th>C1</th>  <th>C2</th>  <th>C3</th>  <th>C4</th>  <th>C5</th></tr>\n";
    html += "<tr>";
    for (const ct of output.counters) {
      html += `<td>${ct}</td>\n`;
    }
    html += "</tr>";
    html += "</table>";
    return html;
  }
}

export default Colossus;
