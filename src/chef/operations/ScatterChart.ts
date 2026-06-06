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
import {
  getScatterValues,
  getScatterValuesWithColour,
  RECORD_DELIMITER_OPTIONS,
  COLOURS,
  FIELD_DELIMITER_OPTIONS,
} from "../lib/Charts";

import { Operation } from "../Operation";
import { Utils } from "../Utils";

const d3 = (d3temp as any).default ? (d3temp as any).default : d3temp;
const nodom = (nodomtemp as any).default
  ? (nodomtemp as any).default
  : nodomtemp;

/**
 * Scatter chart operation
 */
export class ScatterChart extends Operation {
  /**
   * ScatterChart constructor
   */
  constructor() {
    super();

    this.name = "Scatter chart";
    this.module = "Charts";
    this.description = "Plots two-variable data as single points on a graph.";
    this.infoURL = "https://wikipedia.org/wiki/Scatter_plot";
    this.inputType = "string";
    this.outputType = "html";
    this.args = [
      {
        name: "Record delimiter",
        type: "option",
        value: RECORD_DELIMITER_OPTIONS,
      },
      {
        name: "Field delimiter",
        type: "option",
        value: FIELD_DELIMITER_OPTIONS,
      },
      {
        name: "Use column headers as labels",
        type: "boolean",
        value: true,
      },
      {
        name: "X label",
        type: "string",
        value: "",
      },
      {
        name: "Y label",
        type: "string",
        value: "",
      },
      {
        name: "Colour",
        type: "string",
        value: COLOURS.max,
      },
      {
        name: "Point radius",
        type: "number",
        value: 10,
      },
      {
        name: "Use colour from third column",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * Scatter chart operation.
   *
   * @param {string} input
   * @param {any[]} args
   * @returns {string}
   */
  run(input: string, args: any[]): string {
    const recordDelimiter = Utils.charRep(args[0]),
      fieldDelimiter = Utils.charRep(args[1]),
      columnHeadingsAreIncluded = args[2],
      fillColour = Utils.escapeHtml(args[5]),
      radius = args[6],
      colourInInput = args[7],
      dimension = 500;

    let xLabel = args[3],
      yLabel = args[4];

    const dataFunction = colourInInput
      ? getScatterValuesWithColour
      : getScatterValues;
    const { headings, values } = dataFunction(
      input,
      recordDelimiter,
      fieldDelimiter,
      columnHeadingsAreIncluded,
    );

    if (headings) {
      xLabel = headings.x;
      yLabel = headings.y;
    }

    const document = new nodom.Document();
    let svg = document.createElement("svg");
    svg = d3
      .select(svg)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${dimension} ${dimension}`);

    const margin = {
        top: 10,
        right: 0,
        bottom: 40,
        left: 30,
      },
      width = dimension - margin.left - margin.right,
      height = dimension - margin.top - margin.bottom,
      marginedSpace = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const xExtent: [any, any] = d3.extent(values, (d: any[]) => d[0]),
      xDelta = (xExtent[1] || 0) - (xExtent[0] || 0),
      yExtent: [any, any] = d3.extent(values, (d: any[]) => d[1]),
      yDelta = (yExtent[1] || 0) - (yExtent[0] || 0),
      xAxis = d3
        .scaleLinear()
        .domain([
          (xExtent[0] || 0) - 0.1 * xDelta,
          (xExtent[1] || 0) + 0.1 * xDelta,
        ])
        .range([0, width]),
      yAxis = d3
        .scaleLinear()
        .domain([
          (yExtent[0] || 0) - 0.1 * yDelta,
          (yExtent[1] || 0) + 0.1 * yDelta,
        ])
        .range([height, 0]);

    marginedSpace
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    marginedSpace
      .append("g")
      .attr("class", "points")
      .attr("clip-path", "url(#clip)")
      .selectAll("circle")
      .data(values)
      .enter()
      .append("circle")
      .attr("cx", (d: any[]) => xAxis(d[0]))
      .attr("cy", (d: any[]) => yAxis(d[1]))
      .attr("r", (d: any[]) => radius)
      .attr("fill", (d: any[]) => {
        return colourInInput ? d[2] : fillColour;
      })
      .attr("stroke", "rgba(0, 0, 0, 0.5)")
      .attr("stroke-width", "0.5")
      .append("title")
      .text((d: any[]) => {
        const x = d[0],
          y = d[1],
          tooltip = `X: ${x}\n
                               Y: ${y}\n
                    `.replace(/\s{2,}/g, "\n");
        return tooltip;
      });

    marginedSpace
      .append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(yAxis).tickSizeOuter(-width));

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left)
      .attr("x", -(height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(yLabel);

    marginedSpace
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xAxis).tickSizeOuter(-height));

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", dimension)
      .style("text-anchor", "middle")
      .text(xLabel);

    return (svg as any)._groups[0][0].outerHTML;
  }
}

export default ScatterChart;
