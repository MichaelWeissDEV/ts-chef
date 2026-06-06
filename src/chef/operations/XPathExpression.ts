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
import { OperationError } from "../errors/OperationError";

export class XPathExpression extends Operation {
  constructor() {
    super();
    this.name = "XPath expression";
    this.module = "Code";
    this.description =
      "Evaluates an XPath expression against an XML document and returns the results.";
    this.infoURL = "https://wikipedia.org/wiki/XPath";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      { name: "XPath", type: "string", value: "//@href" },
      { name: "Result delimiter", type: "binaryShortString", value: "\\n" },
    ];
  }

  run(input: string, args: unknown[]): string {
    const [query, delimiter] = args;

    const { DOMParser } = require("@xmldom/xmldom");
    const xpath = require("xpath");

    let doc;
    try {
      doc = new DOMParser().parseFromString(input, "text/xml");
    } catch (err: any) {
      throw new OperationError("Invalid input XML.");
    }

    let nodes;
    try {
      nodes = xpath
        .parse(query)
        .select({ node: doc, allowAnyNamespaceForNoPrefix: true });
    } catch (err: any) {
      throw new OperationError(`Invalid XPath. Details:\n${err.message}.`);
    }

    const nodeToString = function (node: any): string {
      return node.textContent || node.nodeValue || "";
    };

    return nodes.map(nodeToString).join(delimiter);
  }
}

export default XPathExpression;
