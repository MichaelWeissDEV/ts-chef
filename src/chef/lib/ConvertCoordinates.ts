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
import * as geohash from "ngeohash";
import LatLonEllipsoidal from "geodesy/latlon-ellipsoidal.js";
import Mgrs, { LatLon as LatLonMgrs } from "geodesy/mgrs.js";
import OsGridRef, { LatLon as LatLonOs } from "geodesy/osgridref.js";
import Utm, { LatLon as LatLonUtm } from "geodesy/utm.js";

export const FORMATS = [
  "Degrees Minutes Seconds",
  "Degrees Decimal Minutes",
  "Decimal Degrees",
  "Geohash",
  "Military Grid Reference System",
  "Ordnance Survey National Grid",
  "Universal Transverse Mercator",
];

const NO_CHANGE = [
  "Geohash",
  "Military Grid Reference System",
  "Ordnance Survey National Grid",
  "Universal Transverse Mercator",
];

export function convertCoordinates(
  input: string,
  inFormat: string,
  inDelim: string,
  outFormat: string,
  outDelim: string,
  includeDir: string,
  precision: number,
): string {
  let isPair = false,
    split: string[] = [],
    latlon: any,
    convLat: string | undefined,
    convLon: string | undefined,
    conv: string,
    hash: any,
    utm: any,
    mgrs: any,
    osng: any,
    splitLat: number[],
    splitLong: number[],
    lat: any,
    lon: any;

  if (precision < 0) {
    precision = 0;
  }

  if (inDelim === "Auto") {
    const detectedDelim = findDelim(input);
    if (detectedDelim === null) {
      throw new OperationError(
        "Unable to detect the input delimiter automatically.",
      );
    }
    inDelim = detectedDelim;
  } else if (!inDelim.includes("Direction")) {
    inDelim = realDelim(inDelim);
  }

  if (inFormat === "Auto") {
    const detectedFormat = findFormat(input, inDelim);
    if (detectedFormat === null) {
      throw new OperationError(
        "Unable to detect the input format automatically.",
      );
    }
    inFormat = detectedFormat;
  }

  outDelim = realDelim(outDelim);

  if (!NO_CHANGE.includes(inFormat)) {
    if (inDelim.includes("Direction")) {
      split = input.split(/[NnEeSsWw]/g);
      if (split[0] === "") {
        split = split.slice(1);
      }
    } else {
      split = input.split(inDelim);
    }
    for (let i = 0; i < split.length; i++) {
      split[i] = split[i].replace(/[°˝´'"]/g, " ");
    }
    if (split.length > 1) {
      isPair = true;
    }
  } else {
    input = input.replace(inDelim, "");
    isPair = true;
  }

  switch (inFormat) {
    case "Geohash":
      hash = geohash.decode(input.replace(/[^A-Za-z0-9]/g, ""));
      latlon = new LatLonEllipsoidal(hash.latitude, hash.longitude);
      break;
    case "Military Grid Reference System":
      utm = Mgrs.parse(input.replace(/[^A-Za-z0-9]/g, "")).toUtm();
      latlon = utm.toLatLonE();
      break;
    case "Ordnance Survey National Grid":
      osng = OsGridRef.parse(input.replace(/[^A-Za-z0-9]/g, ""));
      latlon = osng.toLatLon();
      break;
    case "Universal Transverse Mercator":
      if (/^[\d]{2}[A-Za-z]/.test(input)) {
        input = input.slice(0, 2) + " " + input.slice(2);
      }
      utm = Utm.parse(input);
      latlon = utm.toLatLonE();
      break;
    case "Degrees Minutes Seconds":
      if (isPair) {
        splitLat = splitInput(split[0]);
        splitLong = splitInput(split[1]);
        if (splitLat.length >= 3 && splitLong.length >= 3) {
          lat = convDMSToDD(splitLat[0], splitLat[1], splitLat[2], 10);
          lon = convDMSToDD(splitLong[0], splitLong[1], splitLong[2], 10);
          latlon = new LatLonEllipsoidal(lat.degrees, lon.degrees);
        } else {
          throw new OperationError(
            "Invalid co-ordinate format for Degrees Minutes Seconds",
          );
        }
      } else {
        splitLat = splitInput(split[0]);
        if (splitLat.length >= 3) {
          lat = convDMSToDD(splitLat[0], splitLat[1], splitLat[2], 10);
          latlon = new LatLonEllipsoidal(lat.degrees, lat.degrees);
        } else {
          throw new OperationError(
            "Invalid co-ordinate format for Degrees Minutes Seconds",
          );
        }
      }
      break;
    case "Degrees Decimal Minutes":
      if (isPair) {
        splitLat = splitInput(split[0]);
        splitLong = splitInput(split[1]);
        if (splitLat.length !== 2 || splitLong.length !== 2) {
          throw new OperationError(
            "Invalid co-ordinate format for Degrees Decimal Minutes.",
          );
        }
        lat = convDDMToDD(splitLat[0], splitLat[1], 10);
        lon = convDDMToDD(splitLong[0], splitLong[1], 10);
        latlon = new LatLonEllipsoidal(lat.degrees, lon.degrees);
      } else {
        splitLat = splitInput(input);
        if (splitLat.length !== 2) {
          throw new OperationError(
            "Invalid co-ordinate format for Degrees Decimal Minutes.",
          );
        }
        lat = convDDMToDD(splitLat[0], splitLat[1], 10);
        latlon = new LatLonEllipsoidal(lat.degrees, lat.degrees);
      }
      break;
    case "Decimal Degrees":
      if (isPair) {
        splitLat = splitInput(split[0]);
        splitLong = splitInput(split[1]);
        if (splitLat.length !== 1 || splitLong.length !== 1) {
          throw new OperationError(
            "Invalid co-ordinate format for Decimal Degrees.",
          );
        }
        latlon = new LatLonEllipsoidal(splitLat[0], splitLong[0]);
      } else {
        splitLat = splitInput(split[0]);
        if (splitLat.length !== 1) {
          throw new OperationError(
            "Invalid co-ordinate format for Decimal Degrees.",
          );
        }
        latlon = new LatLonEllipsoidal(splitLat[0], splitLat[0]);
      }
      break;
    default:
      throw new OperationError(`Unknown input format '${inFormat}'`);
  }

  if (inFormat.includes("Degrees")) {
    const dirs = input.toUpperCase().match(/[NESW]/g);
    if (dirs && dirs.length >= 1) {
      if (dirs[0] === "S" || (dirs[0] === "W" && latlon.lat > 0)) {
        latlon.lat = -latlon.lat;
      }
      if (dirs.length >= 2) {
        if (dirs[1] === "S" || (dirs[1] === "W" && latlon.lon > 0)) {
          latlon.lon = -latlon.lon;
        }
      }
    }
  }

  const [latDir, longDir] = findDirs(latlon.lat + "," + latlon.lon, ",");

  switch (outFormat) {
    case "Decimal Degrees":
      lat = convDDToDD(latlon.lat, precision);
      lon = convDDToDD(latlon.lon, precision);
      convLat = lat.string;
      convLon = lon.string;
      break;
    case "Degrees Decimal Minutes":
      lat = convDDToDDM(latlon.lat, precision);
      lon = convDDToDDM(latlon.lon, precision);
      convLat = lat.string;
      convLon = lon.string;
      break;
    case "Degrees Minutes Seconds":
      lat = convDDToDMS(latlon.lat, precision);
      lon = convDDToDMS(latlon.lon, precision);
      convLat = lat.string;
      convLon = lon.string;
      break;
    case "Geohash":
      convLat = geohash.encode(latlon.lat, latlon.lon, precision);
      break;
    case "Military Grid Reference System":
      utm = new (LatLonMgrs as any)(latlon.lat, latlon.lon).toUtm();
      mgrs = utm.toMgrs();
      if (precision % 2 !== 0) {
        precision = precision + 1;
      }
      if (precision > 10) {
        precision = 10;
      }
      convLat = mgrs.toString(precision);
      break;
    case "Ordnance Survey National Grid":
      osng = new (LatLonOs as any)(latlon.lat, latlon.lon).toOsGrid();
      if (osng.toString() === "") {
        throw new OperationError(
          "Could not convert co-ordinates to OS National Grid. Are the co-ordinates in range?",
        );
      }
      if (precision % 2 !== 0) {
        precision = precision + 1;
      }
      if (precision > 10) {
        precision = 10;
      }
      convLat = osng.toString(precision);
      break;
    case "Universal Transverse Mercator":
      utm = new (LatLonUtm as any)(latlon.lat, latlon.lon).toUtm();
      convLat = utm.toString(precision);
      break;
  }

  if (convLat === undefined) {
    throw new OperationError("Error converting co-ordinates.");
  }

  if (outFormat.includes("Degrees")) {
    if (convLon === undefined) convLon = "";
    if (latDir === "S" && includeDir !== "None") {
      convLat = convLat.replace("-", "");
    }
    if (longDir === "W" && includeDir !== "None") {
      convLon = convLon.replace("-", "");
    }

    let outConv = "";
    if (includeDir === "Before") {
      outConv += latDir + " ";
    }

    outConv += convLat;
    if (includeDir === "After") {
      outConv += " " + latDir;
    }
    outConv += outDelim;
    if (isPair) {
      if (includeDir === "Before") {
        outConv += longDir + " ";
      }
      outConv += convLon;
      if (includeDir === "After") {
        outConv += " " + longDir;
      }
      outConv += outDelim;
    }
    conv = outConv;
  } else {
    conv = convLat + outDelim;
  }

  return conv;
}

function splitInput(input: string): number[] {
  const split: number[] = [];
  input.split(/\s+/).forEach((item) => {
    item = item.replace(/[^0-9.-]/g, "");
    if (item.length > 0) {
      split.push(parseFloat(item));
    }
  });
  return split;
}

function convDMSToDD(
  degrees: number,
  minutes: number,
  seconds: number,
  precision: number,
): { string: string; degrees: number } {
  const absDegrees = Math.abs(degrees);
  let conv = absDegrees + minutes / 60 + seconds / 3600;
  let outString = round(conv, precision) + "°";
  if (isNegativeZero(degrees) || degrees < 0) {
    conv = -conv;
    outString = "-" + outString;
  }
  return {
    degrees: conv,
    string: outString,
  };
}

function convDDMToDD(
  degrees: number,
  minutes: number,
  precision: number,
): { string: string; degrees: number } {
  const absDegrees = Math.abs(degrees);
  let conv = absDegrees + minutes / 60;
  let outString = round(conv, precision) + "°";
  if (isNegativeZero(degrees) || degrees < 0) {
    conv = -conv;
    outString = "-" + outString;
  }
  return {
    degrees: conv,
    string: outString,
  };
}

function convDDToDD(
  degrees: number,
  precision: number,
): { string: string; degrees: number } {
  return {
    degrees: degrees,
    string: round(degrees, precision) + "°",
  };
}

function convDDToDMS(
  decDegrees: number,
  precision: number,
): { string: string; degrees: number; minutes: number; seconds: number } {
  const absDegrees = Math.abs(decDegrees);
  let degrees = Math.floor(absDegrees);
  const minutes = Math.floor(60 * (absDegrees - degrees)),
    seconds = round(3600 * (absDegrees - degrees) - 60 * minutes, precision);
  let outString = degrees + "° " + minutes + "' " + seconds + '"';
  if (isNegativeZero(decDegrees) || decDegrees < 0) {
    degrees = -degrees;
    outString = "-" + outString;
  }
  return {
    degrees: degrees,
    minutes: minutes,
    seconds: seconds,
    string: outString,
  };
}

function convDDToDDM(
  decDegrees: number,
  precision: number,
): { string: string; degrees: number; minutes: number } {
  const absDegrees = Math.abs(decDegrees);
  let degrees = Math.floor(absDegrees);
  const minutes = absDegrees - degrees,
    decMinutes = round(minutes * 60, precision);
  let outString = degrees + "° " + decMinutes + "'";
  if (decDegrees < 0 || isNegativeZero(decDegrees)) {
    degrees = -degrees;
    outString = "-" + outString;
  }

  return {
    degrees: degrees,
    minutes: decMinutes,
    string: outString,
  };
}

export function findDirs(input: string, delim: string): string[] {
  const upperInput = input.toUpperCase();
  const dirExp = new RegExp(/[NESW]/g);

  const dirs = upperInput.match(dirExp);

  if (dirs) {
    if (dirs.length <= 2 && dirs.length >= 1) {
      return dirs.length === 2 ? [dirs[0], dirs[1]] : [dirs[0], ""];
    }
  }

  let lat: any = upperInput,
    long: any,
    latDir = "",
    longDir = "";
  if (!delim.includes("Direction")) {
    if (upperInput.includes(delim)) {
      const split = upperInput.split(delim);
      if (split.length >= 1) {
        if (split[0] !== "") {
          lat = split[0];
        }
        if (split.length >= 2 && split[1] !== "") {
          long = split[1];
        }
      }
    }
  } else {
    const split = upperInput.split(dirExp);
    if (split.length > 1) {
      lat = split[0] === "" ? split[1] : split[0];
      if (split.length > 2 && split[2] !== "") {
        long = split[2];
      }
    }
  }

  if (lat) {
    lat = parseFloat(lat);
    latDir = lat < 0 ? "S" : "N";
  }

  if (long) {
    long = parseFloat(long);
    longDir = long < 0 ? "W" : "E";
  }

  return [latDir, longDir];
}

export function findFormat(input: string, delim: string): string | null {
  let testData;
  const mgrsPattern = new RegExp(
      /^[0-9]{2}\s?[C-HJ-NP-X]{1}\s?[A-HJ-NP-Z][A-HJ-NP-V]\s?[0-9\s]+/,
    ),
    osngPattern = new RegExp(/^[A-HJ-Z]{2}\s+[0-9\s]+$/),
    geohashPattern = new RegExp(/^[0123456789BCDEFGHJKMNPQRSTUVWXYZ]+$/),
    utmPattern = new RegExp(/^[0-9]{2}\s?[C-HJ-NP-X]\s[0-9.]+\s?[0-9.]+$/),
    degPattern = new RegExp(/[°'"]/g);

  input = input.trim();

  if (delim !== null && delim.includes("Direction")) {
    const split = input.split(/[NnEeSsWw]/);
    if (split.length > 1) {
      testData = split[0] === "" ? split[1] : split[0];
    }
  } else if (delim !== null && delim !== "") {
    if (input.includes(delim)) {
      const split = input.split(delim);
      if (split.length > 1) {
        testData = split[0] === "" ? split[1] : split[0];
      }
    } else {
      testData = input;
    }
  }

  if (!degPattern.test(input)) {
    const filteredInput = input.toUpperCase().replace(delim, "");

    if (utmPattern.test(filteredInput)) {
      return "Universal Transverse Mercator";
    }
    if (mgrsPattern.test(filteredInput)) {
      return "Military Grid Reference System";
    }
    if (osngPattern.test(filteredInput)) {
      return "Ordnance Survey National Grid";
    }
    if (geohashPattern.test(filteredInput)) {
      return "Geohash";
    }
  }

  if (testData !== undefined) {
    const split = splitInput(testData);
    switch (split.length) {
      case 3:
        return "Degrees Minutes Seconds";
      case 2:
        return "Degrees Decimal Minutes";
      case 1:
        return "Decimal Degrees";
    }
  }
  return null;
}

export function findDelim(input: string): string | null {
  input = input.trim();
  const delims = [",", ";", ":"];
  const testDir = input.match(/[NnEeSsWw]/g);
  if (testDir !== null && testDir.length > 0 && testDir.length < 3) {
    const splitInput = input.split(/[NnEeSsWw]/);
    if (splitInput.length <= 3 && splitInput.length > 0) {
      if (splitInput[0] === "") {
        return "Direction Preceding";
      } else if (splitInput[splitInput.length - 1] === "") {
        return "Direction Following";
      }
    }
  }

  for (let i = 0; i < delims.length; i++) {
    const delim = delims[i];
    if (input.includes(delim)) {
      const splitInput = input.split(delim);
      if (splitInput.length <= 3 && splitInput.length > 0) {
        return delim;
      }
    }
  }
  return null;
}

export function realDelim(delim: string): string {
  return (
    {
      Auto: "Auto",
      Space: " ",
      "\\n": "\n",
      Comma: ",",
      "Semi-colon": ";",
      Colon: ":",
    }[delim] || delim
  );
}

function isNegativeZero(zero: number): boolean {
  return zero === 0 && 1 / zero < 0;
}

function round(input: number, precision: number): number {
  const p = Math.pow(10, precision);
  return Math.round(input * p) / p;
}
