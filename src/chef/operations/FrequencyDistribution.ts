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

import { Operation } from "../Operation";
import Utils from "../Utils";
import OperationError from "../errors/OperationError";

/**
 * Frequency distribution operation
 */
export class FrequencyDistribution extends Operation {
  /**
   * FrequencyDistribution constructor
   */
  constructor() {
    super();

    this.name = "Frequency distribution";
    this.module = "Default";
    this.description =
      "Displays the distribution of bytes in the data as a graph.";
    this.infoURL = "https://wikipedia.org/wiki/Frequency_distribution";
    this.inputType = "ArrayBuffer";
    this.outputType = "json";
    this.presentType = "html";
    this.args = [
      {
        name: "Show 0%s",
        type: "boolean",
        value: true,
      },
      {
        name: "Show ASCII",
        type: "boolean",
        value: true,
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {Object[]} args
   * @returns {json}
   */
  run(input: any, args: any[]): any {
    const data = new Uint8Array(input);
    if (!data.length) throw new OperationError("No data");

    const distrib = new Array(256).fill(0),
      percentages = new Array(256),
      len = data.length;
    let i;

    // Count bytes
    for (i = 0; i < len; i++) {
      distrib[data[i]]++;
    }

    // Calculate percentages
    let repr = 0;
    for (i = 0; i < 256; i++) {
      if (distrib[i] > 0) repr++;
      percentages[i] = (distrib[i] / len) * 100;
    }

    return {
      dataLength: len,
      percentages: percentages,
      distribution: distrib,
      bytesRepresented: repr,
    };
  }

  /**
   * Displays the frequency distribution as a bar chart for web apps.
   *
   * @param {json} freq
   * @returns {html}
   */
  present(freq: any, args: any[]) {
    const [showZeroes, showAscii] = args;

    // Print
    let output = `<canvas id='chart-area'></canvas><br>
Total data length: ${freq.dataLength}
Number of bytes represented: ${freq.bytesRepresented}
Number of bytes not represented: ${256 - freq.bytesRepresented}

<script>
    var canvas = document.getElementById("chart-area"),
        parentRect = canvas.closest(".cm-scroller").getBoundingClientRect(),
        scores = ${JSON.stringify(freq.percentages)};

    canvas.width = parentRect.width * 0.95;
    canvas.height = parentRect.height * 0.9;

    CanvasComponents.drawBarChart(canvas, scores, "Byte", "Frequency %", 16, 6);
</script>
<table class="table table-hover table-sm">
    <tr><th>Byte</th>${showAscii ? "<th>ASCII</th>" : ""}<th>Percentage</th><th></th></tr>`;

    for (let i = 0; i < 256; i++) {
      if (freq.distribution[i] || showZeroes) {
        let c = "";
        if (showAscii) {
          if (i <= 32) {
            c = String.fromCharCode(0x2400 + i);
          } else if (i === 127) {
            c = String.fromCharCode(0x2421);
          } else {
            c = String.fromCharCode(i);
          }
        }
        const bite = `<td>${Utils.hex(i, 2)}</td>`,
          ascii = showAscii ? `<td>${c}</td>` : "",
          percentage = `<td>${(freq.percentages[i].toFixed(2).replace(".00", "") + "%").padEnd(8, " ")}</td>`,
          bars = `<td>${Array(Math.ceil(freq.percentages[i]) + 1).join("|")}</td>`;

        output += `<tr>${bite}${ascii}${percentage}${bars}</tr>`;
      }
    }

    output += "</table>";
    return output;
  }
}

export default FrequencyDistribution;
