/**
 * @fileoverview HexDensityChart operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as d3temp from "d3";
import * as d3hexbintemp from "d3-hexbin";
import * as nodomtemp from "nodom";
import type { HexbinBin } from "d3-hexbin";
import {
  getScatterValues,
  RECORD_DELIMITER_OPTIONS,
  COLOURS,
  FIELD_DELIMITER_OPTIONS,
} from "../lib/Charts";

import { TypedOperation } from "../Operation";
import Utils from "../Utils";

const d3 = d3temp;
const d3HexbinModule = d3hexbintemp as typeof d3hexbintemp & {
  default?: typeof d3hexbintemp;
};
const d3hexbin = d3HexbinModule.default ?? d3hexbintemp;
const nodomModule = nodomtemp as typeof nodomtemp & {
  default?: typeof nodomtemp;
};
const nodom = nodomModule.default ?? nodomtemp;

type Point = [number, number];
type HexBin = HexbinBin<Point>;
interface HexCenter {
  x: number;
  y: number;
}

/**
 * Hex Density chart operation
 */
export class HexDensityChart extends TypedOperation<string, string, unknown[]> {
  /**
   * HexDensityChart constructor
   */
  constructor() {
    super();

    this.name = "Hex Density chart";
    this.module = "Charts";
    this.description =
      "Hex density charts are used in a similar way to scatter charts, however rather than rendering tens of thousands of points, it groups the points into a few hundred hexagons to show the distribution.";
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
        name: "Pack radius",
        type: "number",
        value: 25,
      },
      {
        name: "Draw radius",
        type: "number",
        value: 15,
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
        name: "Draw hexagon edges",
        type: "boolean",
        value: false,
      },
      {
        name: "Min colour value",
        type: "string",
        value: COLOURS.min,
      },
      {
        name: "Max colour value",
        type: "string",
        value: COLOURS.max,
      },
      {
        name: "Draw empty hexagons within data boundaries",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * Hex Bin chart operation.
   *
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, args: unknown[]): string {
    const [
      recordDelimArg,
      fieldDelimArg,
      packRadius,
      drawRadius,
      columnHeadingsAreIncluded,
      xLabelArg,
      yLabelArg,
      drawEdges,
      minColour,
      maxColour,
      drawEmptyHexagons,
    ] = args as [
      string,
      string,
      number,
      number,
      boolean,
      string,
      string,
      boolean,
      string,
      string,
      boolean,
    ];
    const recordDelimiter = Utils.charRep(recordDelimArg),
      fieldDelimiter = Utils.charRep(fieldDelimArg),
      dimension = 500;

    let xLabel = xLabelArg,
      yLabel = yLabelArg;
    const { headings, values } = getScatterValues(
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
    const svgElement = document.createElement("svg");
    const svg = d3
      .select(svgElement as unknown as SVGSVGElement)
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

    const hexbin = d3hexbin
      .hexbin<Point>()
      .radius(packRadius)
      .extent([
        [0, 0],
        [width, height],
      ]);

    const hexPoints = hexbin(values),
      maxCount = Math.max(...hexPoints.map((bin) => bin.length));

    const measuredXExtent = d3.extent(hexPoints, (bin) => bin.x),
      measuredYExtent = d3.extent(hexPoints, (bin) => bin.y),
      xExtent: [number, number] = [
        measuredXExtent[0] ?? 0,
        measuredXExtent[1] ?? width,
      ],
      yExtent: [number, number] = [
        measuredYExtent[0] ?? 0,
        measuredYExtent[1] ?? height,
      ];

    if (hexPoints.length > 0) {
      xExtent[0] -= 2 * packRadius;
      xExtent[1] += 3 * packRadius;
      yExtent[0] -= 2 * packRadius;
      yExtent[1] += 2 * packRadius;
    }

    const xAxis = d3.scaleLinear().domain(xExtent).range([0, width]);
    const yAxis = d3.scaleLinear().domain(yExtent).range([height, 0]);

    const colour = d3
      .scaleSequential(d3.interpolateLab(minColour, maxColour))
      .domain([0, maxCount]);

    marginedSpace
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    if (drawEmptyHexagons) {
      marginedSpace
        .append("g")
        .attr("class", "empty-hexagon")
        .selectAll("path")
        .data(this.getEmptyHexagons(hexPoints, packRadius))
        .enter()
        .append("path")
        .attr("d", (center) => {
          return `M${xAxis(center.x)},${yAxis(center.y)} ${hexbin.hexagon(drawRadius)}`;
        })
        .attr("fill", () => colour(0))
        .attr("stroke", drawEdges ? "black" : "none")
        .attr("stroke-width", drawEdges ? "0.5" : "none")
        .append("title")
        .text((center) => {
          const count = 0,
            perc = 0,
            tooltip = `Count: ${count}\n
                                Percentage: ${perc.toFixed(2)}%\n
                                Center: ${center.x.toFixed(2)}, ${center.y.toFixed(2)}\n
                        `.replace(/\s{2,}/g, "\n");
          return tooltip;
        });
    }

    marginedSpace
      .append("g")
      .attr("class", "hexagon")
      .attr("clip-path", "url(#clip)")
      .selectAll("path")
      .data(hexPoints)
      .enter()
      .append("path")
      .attr("d", (bin) => {
        return `M${xAxis(bin.x)},${yAxis(bin.y)} ${hexbin.hexagon(drawRadius)}`;
      })
      .attr("fill", (bin) => colour(bin.length))
      .attr("stroke", drawEdges ? "black" : "none")
      .attr("stroke-width", drawEdges ? "0.5" : "none")
      .append("title")
      .text((bin) => {
        const count = bin.length,
          perc = (100.0 * bin.length) / values.length,
          CX = bin.x,
          CY = bin.y,
          xMin = Math.min(...bin.map((point) => point[0])),
          xMax = Math.max(...bin.map((point) => point[0])),
          yMin = Math.min(...bin.map((point) => point[1])),
          yMax = Math.max(...bin.map((point) => point[1])),
          tooltip = `Count: ${count}\n
                               Percentage: ${perc.toFixed(2)}%\n
                               Center: ${CX.toFixed(2)}, ${CY.toFixed(2)}\n
                               Min X: ${xMin.toFixed(2)}\n
                               Max X: ${xMax.toFixed(2)}\n
                               Min Y: ${yMin.toFixed(2)}\n
                               Max Y: ${yMax.toFixed(2)}
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

    return svg.node()?.outerHTML ?? "";
  }

  /**
   * Hex Bin chart operation.
   *
   * @param {Object[]} centres
   * @param {number} radius
   * @returns {Object[]}
   */
  getEmptyHexagons(centres: HexBin[], radius: number): HexCenter[] {
    const emptyCentres: HexCenter[] = [],
      boundingRect = [
        d3.extent(centres, (bin) => bin.x),
        d3.extent(centres, (bin) => bin.y),
      ],
      hexagonCenterToEdge = Math.cos((2 * Math.PI) / 12) * radius,
      hexagonEdgeLength = Math.sin((2 * Math.PI) / 12) * radius;
    let indent = false;

    if (boundingRect[0][0] === undefined || boundingRect[1][0] === undefined) {
      return [];
    }

    for (
      let y = boundingRect[1][0];
      y <= boundingRect[1][1] + radius;
      y += hexagonEdgeLength + radius
    ) {
      for (
        let x = boundingRect[0][0];
        x <= boundingRect[0][1] + radius;
        x += 2 * hexagonCenterToEdge
      ) {
        let cx = x;
        const cy = y;

        if (indent && x >= boundingRect[0][1]) break;
        if (indent) cx += hexagonCenterToEdge;

        emptyCentres.push({ x: cx, y: cy });
      }
      indent = !indent;
    }

    return emptyCentres;
  }
}

export default HexDensityChart;
