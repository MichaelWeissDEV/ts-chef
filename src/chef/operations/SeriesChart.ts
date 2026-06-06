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
  getSeriesValues,
  RECORD_DELIMITER_OPTIONS,
  FIELD_DELIMITER_OPTIONS,
} from "../lib/Charts";

import { Operation, ArgConfig } from "../Operation";
import Utils from "../Utils";

const d3 = (d3temp as any).default ? (d3temp as any).default : d3temp;
const nodom = (nodomtemp as any).default
  ? (nodomtemp as any).default
  : nodomtemp;

/**
 * Series chart operation
 */
export class SeriesChart extends Operation {
  /**
   * SeriesChart constructor
   */
  constructor() {
    super();

    this.name = "Series chart";
    this.module = "Charts";
    this.description =
      "A time series graph is a line graph of repeated measurements taken over regular time intervals.";
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
        name: "X label",
        type: "string",
        value: "",
      },
      {
        name: "Point radius",
        type: "number",
        value: 1,
      },
      {
        name: "Series colours",
        type: "string",
        value: "mediumseagreen, dodgerblue, tomato",
      },
    ];
  }

  /**
   * Series chart operation.
   *
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, args: any[]): string {
    const recordDelimiter = Utils.charRep(args[0]),
      fieldDelimiter = Utils.charRep(args[1]),
      xLabel = args[2] as string,
      pipRadius = args[3] as number,
      // Escape HTML from all colours to prevent reflected XSS. See https://github.com/gchq/CyberChef/issues/1265
      seriesColours = (args[4] as string).split(",").map((colour) => {
        return Utils.escapeHtml(colour);
      }),
      svgWidth = 500,
      interSeriesPadding = 20,
      xAxisHeight = 50,
      seriesLabelWidth = 50,
      seriesHeight = 100,
      seriesWidth = svgWidth - seriesLabelWidth - interSeriesPadding;

    const { xValues, series } = getSeriesValues(
        input,
        recordDelimiter,
        fieldDelimiter,
        true,
      ),
      allSeriesHeight = series.length * (interSeriesPadding + seriesHeight),
      svgHeight = allSeriesHeight + xAxisHeight + interSeriesPadding;

    const document = new nodom.Document();
    let svg: any = document.createElement("svg");
    svg = d3
      .select(svg)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

    const xAxis = d3.scalePoint().domain(xValues).range([0, seriesWidth]);

    svg
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(${seriesLabelWidth}, ${xAxisHeight})`)
      .call(
        d3.axisTop(xAxis).tickValues(
          xValues.filter((x, i) => {
            return (
              [0, Math.round(xValues.length / 2), xValues.length - 1].indexOf(
                i,
              ) >= 0
            );
          }),
        ),
      );

    svg
      .append("text")
      .attr("x", svgWidth / 2)
      .attr("y", xAxisHeight / 2)
      .style("text-anchor", "middle")
      .text(xLabel);

    const tooltipText: { [key: string]: string } = {},
      tooltipAreaWidth = seriesWidth / xValues.length;

    xValues.forEach((x) => {
      const tooltip: string[] = [];

      series.forEach((serie: any) => {
        const y = serie.data[x];
        if (typeof y === "undefined") return;

        tooltip.push(`${serie.name}: ${y}`);
      });

      tooltipText[x] = tooltip.join("\n");
    });

    const chartArea = svg
      .append("g")
      .attr("transform", `translate(${seriesLabelWidth}, ${xAxisHeight})`);

    chartArea
      .append("g")
      .selectAll("rect")
      .data(xValues)
      .enter()
      .append("rect")
      .attr("x", (x: string) => {
        const val = xAxis(x);
        return (val !== undefined ? val : 0) - tooltipAreaWidth / 2;
      })
      .attr("y", 0)
      .attr("width", tooltipAreaWidth)
      .attr("height", allSeriesHeight)
      .attr("stroke", "none")
      .attr("fill", "transparent")
      .append("title")
      .text((x: string) => {
        return `${x}\n
                    --\n
                    ${tooltipText[x]}\n
                `.replace(/\s{2,}/g, "\n");
      });

    const yAxesArea = svg
      .append("g")
      .attr("transform", `translate(0, ${xAxisHeight})`);

    series.forEach((serie: any, seriesIndex: number) => {
      const yExtent = d3.extent(Object.values(serie.data) as number[]) as [
          number,
          number,
        ],
        yAxis = d3.scaleLinear().domain(yExtent).range([seriesHeight, 0]);

      const seriesGroup = chartArea
        .append("g")
        .attr(
          "transform",
          `translate(0, ${seriesHeight * seriesIndex + interSeriesPadding * (seriesIndex + 1)})`,
        );

      let path = "";
      xValues.forEach((x, xIndex) => {
        const nextXStr = xValues[xIndex + 1];
        const yVal = serie.data[x];
        const nextYVal = serie.data[nextXStr];

        if (typeof yVal === "undefined" || typeof nextYVal === "undefined")
          return;

        const xCoord = xAxis(x);
        const nextXCoord = xAxis(nextXStr);
        const yCoord = yAxis(yVal);
        const nextYCoord = yAxis(nextYVal);

        path += `M ${xCoord} ${yCoord} L ${nextXCoord} ${nextYCoord} z `;
      });

      seriesGroup
        .append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", seriesColours[seriesIndex % seriesColours.length])
        .attr("stroke-width", "1");

      xValues.forEach((x) => {
        const yVal = serie.data[x];
        if (typeof yVal === "undefined") return;

        seriesGroup
          .append("circle")
          .attr("cx", xAxis(x))
          .attr("cy", yAxis(yVal))
          .attr("r", pipRadius)
          .attr("fill", seriesColours[seriesIndex % seriesColours.length])
          .append("title")
          .text(() => {
            return `${x}\n
                            --\n
                            ${tooltipText[x]}\n
                        `.replace(/\s{2,}/g, "\n");
          });
      });

      yAxesArea
        .append("g")
        .attr(
          "transform",
          `translate(${seriesLabelWidth - interSeriesPadding}, ${seriesHeight * seriesIndex + interSeriesPadding * (seriesIndex + 1)})`,
        )
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(yAxis).ticks(5));

      yAxesArea
        .append("g")
        .attr(
          "transform",
          `translate(0, ${seriesHeight / 2 + seriesHeight * seriesIndex + interSeriesPadding * (seriesIndex + 1)})`,
        )
        .append("text")
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text(serie.name);
    });

    return (svg.node() as HTMLElement).outerHTML;
  }
}

export default SeriesChart;
