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
import { FORMATS, convertCoordinates } from "../lib/ConvertCoordinates";
import OperationError from "../errors/OperationError";

/**
 * Show on map operation
 */
export class ShowOnMap extends Operation {
  /**
   * ShowOnMap constructor
   */
  constructor() {
    super();

    this.name = "Show on map";
    this.module = "Hashing";
    this.description =
      "Displays co-ordinates on a slippy map.<br><br>Co-ordinates will be converted to decimal degrees before being shown on the map.<br><br>Supported formats:<ul><li>Degrees Minutes Seconds (DMS)</li><li>Degrees Decimal Minutes (DDM)</li><li>Decimal Degrees (DD)</li><li>Geohash</li><li>Military Grid Reference System (MGRS)</li><li>Ordnance Survey National Grid (OSNG)</li><li>Universal Transverse Mercator (UTM)</li></ul><br>This operation will not work offline.";
    this.infoURL = "https://osmfoundation.org/wiki/Terms_of_Use";
    this.inputType = "string";
    this.outputType = "string";
    this.presentType = "html";
    this.args = [
      {
        name: "Zoom Level",
        type: "number",
        value: 13,
      },
      {
        name: "Input Format",
        type: "option",
        value: ["Auto"].concat(FORMATS),
      },
      {
        name: "Input Delimiter",
        type: "option",
        value: [
          "Auto",
          "Direction Preceding",
          "Direction Following",
          "\\n",
          "Comma",
          "Semi-colon",
          "Colon",
        ],
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    if (input.replace(/\s+/g, "") !== "") {
      const inFormat = args[1],
        inDelim = args[2];
      let latLong;
      try {
        latLong = convertCoordinates(
          input,
          inFormat,
          inDelim,
          "Decimal Degrees",
          "Comma",
          "None",
          5,
        );
      } catch (error) {
        throw new OperationError(error);
      }
      latLong = latLong.replace(/[,]$/, "");
      latLong = latLong.replace(/°/g, "");
      return latLong;
    }
    return input;
  }

  /**
   * @param {string} data
   * @param {Object[]} args
   * @returns {string}
   */
  async present(data: any, args: any[]) {
    if (data.replace(/\s+/g, "") === "") {
      data = "0, 0";
    }
    const zoomLevel = args[0];
    const tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      tileAttribution =
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      leafletUrl = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
      leafletCssUrl = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    return `<link rel="stylesheet" href="${leafletCssUrl}" crossorigin=""/>
<style>
    #output-text .cm-content,
    #output-text .cm-line,
    #output-html {
        padding: 0;
        white-space: normal;
    }
</style>
<div id="presentedMap" style="width: 100%; height: 100%;"></div>
<script type="text/javascript">
var mapscript = document.createElement('script');
document.body.appendChild(mapscript);
mapscript.onload = function() {
    var presentMap = L.map('presentedMap').setView([${data}], ${zoomLevel});
    L.tileLayer('${tileUrl}', {
        attribution: '${tileAttribution}'
    }).addTo(presentMap);

    L.marker([${data}]).addTo(presentMap)
        .bindPopup('${data}')
        .openPopup();
};
mapscript.src = "${leafletUrl}";
</script>`;
  }
}

export default ShowOnMap;
