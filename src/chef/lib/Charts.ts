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

import OperationError from "../errors/OperationError";
import Utils from "../Utils";

/**
 * Available options for record delimiters in chart data.
 */
export const RECORD_DELIMITER_OPTIONS: string[] = ["Line feed", "CRLF"];

/**
 * Available options for field delimiters in chart data.
 */
export const FIELD_DELIMITER_OPTIONS: string[] = [
  "Space",
  "Comma",
  "Semi-colon",
  "Colon",
  "Tab",
];

/**
 * Default color range for charts.
 */
export const COLOURS: { min: string; max: string } = {
  min: "white",
  max: "black",
};

/**
 * Parses input string into headings and a 2D array of values.
 *
 * @param input - The raw chart data string.
 * @param recordDelimiter - String used to separate records (rows).
 * @param fieldDelimiter - String used to separate fields (columns).
 * @param columnHeadingsAreIncluded - Whether the first row contains headings.
 * @param length - The expected number of fields per record.
 * @returns An object containing optional headings and the 2D array of values.
 * @throws {OperationError} If a row does not match the expected length.
 */
export function getValues(
  input: string,
  recordDelimiter: string,
  fieldDelimiter: string,
  columnHeadingsAreIncluded: boolean,
  length: number,
): { headings?: string[]; values: string[][] } {
  let headings: string[] | undefined;
  const values: string[][] = [];

  input.split(recordDelimiter).forEach((row, rowIndex) => {
    if (row === "") return;
    const split = row.split(fieldDelimiter);
    if (split.length !== length)
      throw new OperationError(`Each row must have length ${length}.`);

    if (columnHeadingsAreIncluded && rowIndex === 0) {
      headings = split;
    } else {
      values.push(split);
    }
  });
  return { headings, values };
}

/**
 * Parses input string for a scatter plot (X and Y values).
 *
 * @param input - The raw chart data string.
 * @param recordDelimiter - Record separator.
 * @param fieldDelimiter - Field separator.
 * @param columnHeadingsAreIncluded - Whether headings are present.
 * @returns Object with optional typed headings and numeric value pairs.
 * @throws {OperationError} If values are not valid numbers.
 */
export function getScatterValues(
  input: string,
  recordDelimiter: string,
  fieldDelimiter: string,
  columnHeadingsAreIncluded: boolean,
): { headings?: { x: string; y: string }; values: number[][] } {
  let { headings, values } = getValues(
    input,
    recordDelimiter,
    fieldDelimiter,
    columnHeadingsAreIncluded,
    2,
  );

  let typedHeadings: { x: string; y: string } | undefined;
  if (headings) {
    typedHeadings = { x: headings[0], y: headings[1] };
  }

  const typedValues = values.map((row) => {
    const x = parseFloat(row[0]),
      y = parseFloat(row[1]);

    if (Number.isNaN(x))
      throw new OperationError("Values must be numbers in base 10.");
    if (Number.isNaN(y))
      throw new OperationError("Values must be numbers in base 10.");

    return [x, y];
  });

  return { headings: typedHeadings, values: typedValues };
}

/**
 * Parses input string for a scatter plot with an additional color column.
 *
 * @param input - The raw chart data string.
 * @param recordDelimiter - Record separator.
 * @param fieldDelimiter - Field separator.
 * @param columnHeadingsAreIncluded - Whether headings are present.
 * @returns Object with optional typed headings and (number|string) value triples.
 * @throws {OperationError} If X or Y values are not valid numbers.
 */
export function getScatterValuesWithColour(
  input: string,
  recordDelimiter: string,
  fieldDelimiter: string,
  columnHeadingsAreIncluded: boolean,
): { headings?: { x: string; y: string }; values: (number | string)[][] } {
  let { headings, values } = getValues(
    input,
    recordDelimiter,
    fieldDelimiter,
    columnHeadingsAreIncluded,
    3,
  );

  let typedHeadings: { x: string; y: string } | undefined;
  if (headings) {
    typedHeadings = { x: headings[0], y: headings[1] };
  }

  const typedValues = values.map((row) => {
    const x = parseFloat(row[0]),
      y = parseFloat(row[1]),
      colour = row[2];

    if (Number.isNaN(x))
      throw new OperationError("Values must be numbers in base 10.");
    if (Number.isNaN(y))
      throw new OperationError("Values must be numbers in base 10.");

    return [x, y, Utils.escapeHtml(colour)];
  });

  return { headings: typedHeadings, values: typedValues };
}

/**
 * Parses input string for a time series plot with multiple series.
 *
 * @param input - The raw chart data string.
 * @param recordDelimiter - Record separator.
 * @param fieldDelimiter - Field separator.
 * @param columnHeadingsAreIncluded - Whether headings are present.
 * @returns Object containing X values and the series data.
 * @throws {OperationError} If data values are not valid numbers.
 */
export function getSeriesValues(
  input: string,
  recordDelimiter: string,
  fieldDelimiter: string,
  columnHeadingsAreIncluded: boolean,
): {
  xValues: string[];
  series: { name: string; data: { [key: string]: number } }[];
} {
  const { values } = getValues(
    input,
    recordDelimiter,
    fieldDelimiter,
    false,
    3,
  );

  let xValuesSet = new Set<string>();
  const series: { [serie: string]: { [xVal: string]: number } } = {};

  values.forEach((row) => {
    const serie = row[0],
      xVal = row[1],
      val = parseFloat(row[2]);

    if (Number.isNaN(val))
      throw new OperationError("Values must be numbers in base 10.");

    xValuesSet.add(xVal);
    if (typeof series[serie] === "undefined") series[serie] = {};
    series[serie][xVal] = val;
  });

  const xValues = Array.from(xValuesSet);

  const seriesList: { name: string; data: { [key: string]: number } }[] = [];
  for (const seriesName in series) {
    const serie = series[seriesName];
    seriesList.push({ name: seriesName, data: serie });
  }

  return { xValues, series: seriesList };
}
