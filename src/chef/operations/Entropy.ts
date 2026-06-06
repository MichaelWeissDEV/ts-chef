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

import * as d3temp from "d3";
import * as nodomtemp from "nodom";

import { Operation } from "../Operation";

const d3 = (d3temp as any).default ? (d3temp as any).default : d3temp;
const nodom = (nodomtemp as any).default
  ? (nodomtemp as any).default
  : nodomtemp;

/**
 * Entropy operation
 */
export class Entropy extends Operation {
  /**
   * Entropy constructor
   */
  constructor() {
    super();

    this.name = "Entropy";
    this.module = "Charts";
    this.description =
      "Shannon Entropy, in the context of information theory, is a measure of the rate at which information is produced by a source of data. It can be used, in a broad sense, to detect whether data is likely to be structured or unstructured. 8 is the maximum, representing highly unstructured, 'random' data. English language text usually falls somewhere between 3.5 and 5. Properly encrypted or compressed data should have an entropy of over 7.5.";
    this.infoURL = "https://wikipedia.org/wiki/Entropy_(information_theory)";
    this.inputType = "ArrayBuffer";
    this.outputType = "json";
    this.presentType = "html";
    this.args = [
      {
        name: "Visualisation",
        type: "option",
        value: [
          "Shannon scale",
          "Histogram (Bar)",
          "Histogram (Line)",
          "Curve",
          "Image",
        ],
      },
    ];
  }

  /**
   * Calculates the Shannon entropy of the input.
   *
   * @param {Uint8Array} input
   * @returns {number}
   */
  calculateShannonEntropy(input: Uint8Array): number {
    const prob: number[] = [],
      occurrences = new Array(256).fill(0);

    // Count occurrences of each byte in the input
    for (let i = 0; i < input.length; i++) {
      occurrences[input[i]]++;
    }

    // Store probability list
    for (let i = 0; i < occurrences.length; i++) {
      if (occurrences[i] > 0) {
        prob.push(occurrences[i] / input.length);
      }
    }

    // Calculate Shannon entropy
    let entropy = 0;

    for (let i = 0; i < prob.length; i++) {
      const p = prob[i];
      entropy += (p * Math.log(p)) / Math.log(2);
    }

    return -entropy;
  }

  /**
   * Calculates the scanning entropy of the input
   *
   * @param {Uint8Array} inputBytes
   * @returns {any}
   */
  calculateScanningEntropy(inputBytes: Uint8Array): any {
    const entropyData: number[] = [];
    const binWidth = inputBytes.length < 256 ? 8 : 256;

    for (let bytePos = 0; bytePos < inputBytes.length; bytePos += binWidth) {
      const block = inputBytes.slice(bytePos, bytePos + binWidth);
      entropyData.push(this.calculateShannonEntropy(block));
    }

    return { entropyData, binWidth };
  }

  /**
   * Creates axes for the SVG.
   *
   * @param {any} svg
   * @param {any} xScale
   * @param {any} yScale
   * @param {number} svgHeight
   * @param {number} svgWidth
   * @param {any} margins
   * @param {string} title
   * @param {string} xTitle
   * @param {string} yTitle
   */
  createAxes(
    svg: any,
    xScale: any,
    yScale: any,
    svgHeight: number,
    svgWidth: number,
    margins: any,
    title: string,
    xTitle: string,
    yTitle: string,
  ): void {
    // Axes
    const yAxis = d3.axisLeft().scale(yScale);

    const xAxis = d3.axisBottom().scale(xScale);

    svg
      .append("g")
      .attr("transform", `translate(0, ${svgHeight - margins.bottom})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("transform", `translate(${margins.left},0)`)
      .call(yAxis);

    // Axes labels
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margins.left)
      .attr("x", 0 - svgHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(yTitle);

    svg
      .append("text")
      .attr(
        "transform",
        `translate(${svgWidth / 2}, ${svgHeight - margins.bottom + 40})`,
      )
      .style("text-anchor", "middle")
      .text(xTitle);

    // Add title
    svg
      .append("text")
      .attr("transform", `translate(${svgWidth / 2}, ${margins.top - 10})`)
      .style("text-anchor", "middle")
      .text(title);
  }

  /**
   * Calculates the frequency of bytes in the input.
   *
   * @param {Uint8Array} inputBytes
   * @returns {number[]}
   */
  calculateByteFrequency(inputBytes: Uint8Array): number[] {
    const freq = new Array(256).fill(0);
    if (inputBytes.length === 0) return freq;

    // Count occurrences of each byte in the input
    for (let i = 0; i < inputBytes.length; i++) {
      freq[inputBytes[i]]++;
    }

    for (let i = 0; i < freq.length; i++) {
      freq[i] = freq[i] / inputBytes.length;
    }

    return freq;
  }

  /**
   * Creates a byte frequency line histogram
   *
   * @param {number[]} byteFrequency
   * @returns {string}
   */
  createByteFrequencyLineHistogram(byteFrequency: number[]): string {
    const margins = { top: 30, right: 20, bottom: 50, left: 30 };

    const svgWidth = 500,
      svgHeight = 500;

    const document = new nodom.Document();
    const svgElement = document.createElement("svg");

    const svg = d3
      .select(svgElement)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

    const maxFreq = d3.max(byteFrequency, (d: number) => d) ?? 0;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxFreq])
      .range([svgHeight - margins.bottom, margins.top]);

    const xScale = d3
      .scaleLinear()
      .domain([0, byteFrequency.length - 1])
      .range([margins.left, svgWidth - margins.right]);

    const line = d3
      .line()
      .x((_: any, i: number) => xScale(i))
      .y((d: any) => yScale(d))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(byteFrequency)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("d", line);

    this.createAxes(
      svg,
      xScale,
      yScale,
      svgHeight,
      svgWidth,
      margins,
      "",
      "Byte",
      "Byte Frequency",
    );

    return (svg.node() as any).outerHTML;
  }

  /**
   * Creates a byte frequency bar histogram
   *
   * @param {number[]} byteFrequency
   * @returns {string}
   */
  createByteFrequencyBarHistogram(byteFrequency: number[]): string {
    const margins = { top: 30, right: 20, bottom: 50, left: 30 };

    const svgWidth = 500,
      svgHeight = 500,
      binWidth = 1;

    const document = new nodom.Document();
    const svgElement = document.createElement("svg");
    const svg = d3
      .select(svgElement)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

    const yExtent = d3.extent(byteFrequency, (d: number) => d) as [
      number,
      number,
    ];
    const yScale = d3
      .scaleLinear()
      .domain(yExtent)
      .range([svgHeight - margins.bottom, margins.top]);

    const xScale = d3
      .scaleLinear()
      .domain([0, byteFrequency.length - 1])
      .range([margins.left - binWidth, svgWidth - margins.right]);

    svg
      .selectAll("rect")
      .data(byteFrequency)
      .enter()
      .append("rect")
      .attr("x", (_: any, i: number) => xScale(i) + binWidth)
      .attr("y", (dataPoint: number) => yScale(dataPoint))
      .attr("width", binWidth)
      .attr(
        "height",
        (dataPoint: number) => yScale(yExtent[0]) - yScale(dataPoint),
      )
      .attr("fill", "blue");

    this.createAxes(
      svg,
      xScale,
      yScale,
      svgHeight,
      svgWidth,
      margins,
      "",
      "Byte",
      "Byte Frequency",
    );

    return (svg.node() as any).outerHTML;
  }

  /**
   * Creates an entropy curve
   *
   * @param {number[]} entropyData
   * @returns {string}
   */
  createEntropyCurve(entropyData: number[]): string {
    const margins = { top: 30, right: 20, bottom: 50, left: 30 };

    const svgWidth = 500,
      svgHeight = 500;

    const document = new nodom.Document();
    const svgElement = document.createElement("svg");
    const svg = d3
      .select(svgElement)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

    const maxEntropy = d3.max(entropyData, (d: number) => d) ?? 0;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxEntropy])
      .range([svgHeight - margins.bottom, margins.top]);

    const xScale = d3
      .scaleLinear()
      .domain([0, entropyData.length])
      .range([margins.left, svgWidth - margins.right]);

    const line = d3
      .line()
      .x((_: any, i: number) => xScale(i))
      .y((d: any) => yScale(d))
      .curve(d3.curveMonotoneX);

    if (entropyData.length > 0) {
      svg.append("path").datum(entropyData).attr("d", line);

      svg.selectAll("path").attr("fill", "none").attr("stroke", "steelblue");
    }

    this.createAxes(
      svg,
      xScale,
      yScale,
      svgHeight,
      svgWidth,
      margins,
      "Scanning Entropy",
      "Block",
      "Entropy",
    );

    return (svg.node() as any).outerHTML;
  }

  /**
   * Creates an image representation of the entropy
   *
   * @param {number[]} entropyData
   * @returns {string}
   */
  createEntropyImage(entropyData: number[]): string {
    const svgHeight = 100,
      svgWidth = 100,
      cellSize = 1,
      nodes = [];

    for (let i = 0; i < entropyData.length; i++) {
      nodes.push({
        x: i % svgWidth,
        y: Math.floor(i / svgWidth),
        entropy: entropyData[i],
      });
    }

    const document = new nodom.Document();
    const svgElement = document.createElement("svg");
    const svg = d3
      .select(svgElement)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

    const maxEntropy = d3.max(entropyData, (d: number) => d) ?? 0;
    const greyScale = d3
      .scaleLinear()
      .domain([0, maxEntropy])
      .range(["#000000", "#FFFFFF"])
      .interpolate(d3.interpolateRgb);

    svg
      .selectAll("rect")
      .data(nodes)
      .enter()
      .append("rect")
      .attr("x", (d: any) => d.x * cellSize)
      .attr("y", (d: any) => d.y * cellSize)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .style("fill", (d: any) => greyScale(d.entropy));

    return (svg.node() as any).outerHTML;
  }

  /**
   * Displays the entropy as a scale bar for web apps.
   *
   * @param {number} entropy
   * @returns {string}
   */
  createShannonEntropyVisualization(entropy: number): string {
    return `Shannon entropy: ${entropy}
        <br><canvas id='chart-area'></canvas><br>
        - 0 represents no randomness (i.e. all the bytes in the data have the same value) whereas 8, the maximum, represents a completely random string.
        - Standard English text usually falls somewhere between 3.5 and 5.
        - Properly encrypted or compressed data of a reasonable length should have an entropy of over 7.5.

        The following results show the entropy of chunks of the input data. Chunks with particularly high entropy could suggest encrypted or compressed sections.

        <br><script>
            var canvas = document.getElementById("chart-area"),
                parentRect = canvas.closest(".cm-scroller").getBoundingClientRect(),
                entropy = ${entropy},
                height = parentRect.height * 0.25;

            canvas.width = parentRect.width * 0.95;
            canvas.height = height > 150 ? 150 : height;

            CanvasComponents.drawScaleBar(canvas, entropy, 8, [
                {
                    label: "English text",
                    min: 3.5,
                    max: 5
                },{
                    label: "Encrypted/compressed",
                    min: 7.5,
                    max: 8
                }
            ]);
        </script>`;
  }

  /**
   * @param {ArrayBuffer} input
   * @param {any[]} args
   * @returns {any}
   */
  run(input: ArrayBuffer, args: any[]): any {
    const visualizationType = args[0];
    const inputBytes = new Uint8Array(input);

    switch (visualizationType) {
      case "Histogram (Bar)":
      case "Histogram (Line)":
        return this.calculateByteFrequency(inputBytes);
      case "Curve":
      case "Image":
        return this.calculateScanningEntropy(inputBytes).entropyData;
      case "Shannon scale":
      default:
        return this.calculateShannonEntropy(inputBytes);
    }
  }

  /**
   * Displays the entropy in a visualisation for web apps.
   *
   * @param {any} entropyData
   * @param {any[]} args
   * @returns {string}
   */
  present(entropyData: any, args: any[]): string {
    const visualizationType = args[0];

    switch (visualizationType) {
      case "Histogram (Bar)":
        return this.createByteFrequencyBarHistogram(entropyData);
      case "Histogram (Line)":
        return this.createByteFrequencyLineHistogram(entropyData);
      case "Curve":
        return this.createEntropyCurve(entropyData);
      case "Image":
        return this.createEntropyImage(entropyData);
      case "Shannon scale":
      default:
        return this.createShannonEntropyVisualization(entropyData);
    }
  }
}

export default Entropy;
