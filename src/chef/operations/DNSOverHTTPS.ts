/*
 * -----------------------------------------------------------------------------
 * Project:     ts-chef
 * Model:       Qwen 3.5 Coder Next (Local)
 * Version:     1.0.0
 * Author:      Michael Weiss
 * Source:      Ported from GCHQ's CyberChef (JavaScript)
 * License:     Apache License 2.0
 * Description: TypeScript implementation of CyberChef modules.
 * Note:        First Port done by Author
 * -----------------------------------------------------------------------------
 */

import { Operation } from "../Operation";
import { OperationError } from "../errors/OperationError";

/**
 * DNS over HTTPS operation
 */
export class DNSOverHTTPS extends Operation {
  /**
   * DNSOverHTTPS constructor
   */
  constructor() {
    super();

    this.name = "DNS over HTTPS";
    this.module = "Default";
    this.description = [
      "Takes a single domain name and performs a DNS lookup using DNS over HTTPS.",
      "<br><br>",
      "By default, <a href='https://developers.cloudflare.com/1.1.1.1/dns-over-https/'>Cloudflare</a> and <a href='https://developers.google.com/speed/public-dns/docs/dns-over-https'>Google</a> DNS over HTTPS services are supported.",
      "<br><br>",
      "Can be used with any service that supports the GET parameters <code>name</code> and <code>type</code>.",
    ].join("\n");
    this.infoURL = "https://wikipedia.org/wiki/DNS_over_HTTPS";
    this.inputType = "string";
    this.outputType = "JSON";
    this.manualBake = true;
    this.args = [
      {
        name: "Resolver",
        type: "editableOption",
        value: [
          {
            name: "Google",
            value: "https://dns.google.com/resolve",
          },
          {
            name: "Cloudflare",
            value: "https://cloudflare-dns.com/dns-query",
          },
        ],
      },
      {
        name: "Request Type",
        type: "option",
        value: [
          "A",
          "AAAA",
          "ANAME",
          "CERT",
          "CNAME",
          "DNSKEY",
          "HTTPS",
          "IPSECKEY",
          "LOC",
          "MX",
          "NS",
          "OPENPGPKEY",
          "PTR",
          "RRSIG",
          "SIG",
          "SOA",
          "SPF",
          "SRV",
          "SSHFP",
          "TA",
          "TXT",
          "URI",
          "ANY",
        ],
      },
      {
        name: "Answer Data Only",
        type: "boolean",
        value: false,
      },
      {
        name: "Disable DNSSEC validation",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {any[]} args
   * @returns {Promise<any>}
   */
  async run(input: string, args: any[]): Promise<any> {
    const [resolver, requestType, justAnswer, DNSSEC] = args;
    let url: URL;
    try {
      url = new URL(resolver);
    } catch (error: any) {
      throw new OperationError(
        error.toString() +
          "\n\nThis error could be caused by one of the following:\n" +
          " - An invalid Resolver URL\n",
      );
    }
    const params: Record<string, string> = {
      name: input,
      type: requestType,
      cd: DNSSEC.toString(),
    };

    url.search = new URLSearchParams(params).toString();

    try {
      const response = await fetch(url.toString(), {
        headers: { accept: "application/dns-json" },
      });
      const data = await response.json();
      if (justAnswer) {
        return extractData(data.Answer);
      }
      return data;
    } catch (e: any) {
      throw new OperationError(
        `Error making request to ${url.toString()}\n${e.toString()}`,
      );
    }
  }
}

/**
 * Construct an array of just data from a DNS Answer section
 *
 * @private
 * @param {any} data
 * @returns {any[]}
 */
function extractData(data: any): any[] {
  if (typeof data === "undefined") {
    return [];
  } else {
    const dataValues: any[] = [];
    data.forEach((element: any) => {
      dataValues.push(element.data);
    });
    return dataValues;
  }
}

export default DNSOverHTTPS;
