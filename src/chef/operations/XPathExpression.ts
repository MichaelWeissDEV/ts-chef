/**
 * @fileoverview XPathExpression operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation } from "../Operation";
import { OperationError } from "../errors/OperationError";
import { DOMParser } from "@xmldom/xmldom";
import * as xpath from "xpath";

export class XPathExpression extends TypedOperation<string, string, unknown[]> {
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

    let doc;
    try {
      doc = new DOMParser().parseFromString(input, "text/xml");
    } catch {
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
