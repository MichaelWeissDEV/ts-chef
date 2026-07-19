/**
 * @fileoverview Semantic tests for query, parser, fingerprint and image operations.
 * @package test/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

import forge from "node-forge";
import { CSSSelector } from "../../src/chef/operations/CSSSelector";
import { GenerateQRCode } from "../../src/chef/operations/GenerateQRCode";
import { HASSHClientFingerprint } from "../../src/chef/operations/HASSHClientFingerprint";
import { HASSHServerFingerprint } from "../../src/chef/operations/HASSHServerFingerprint";
import { JA3Fingerprint } from "../../src/chef/operations/JA3Fingerprint";
import { JA3SFingerprint } from "../../src/chef/operations/JA3SFingerprint";
import { JA4Fingerprint } from "../../src/chef/operations/JA4Fingerprint";
import { JA4ServerFingerprint } from "../../src/chef/operations/JA4ServerFingerprint";
import { JavaScriptBeautify } from "../../src/chef/operations/JavaScriptBeautify";
import { JavaScriptMinify } from "../../src/chef/operations/JavaScriptMinify";
import { JPathExpression } from "../../src/chef/operations/JPathExpression";
import { Jq } from "../../src/chef/operations/Jq";
import { JsonataQuery } from "../../src/chef/operations/Jsonata";
import { ParseX509Certificate } from "../../src/chef/operations/ParseX509Certificate";
import { RandomizeColourPalette } from "../../src/chef/operations/RandomizeColourPalette";

const TLS_CLIENT_HELLO =
  "16030100430100003f0303" +
  "00".repeat(32) +
  "00000213010100001400000000002b0003020304001000050003026832";

const TLS_SERVER_HELLO =
  "160303003b020000370303" +
  "00".repeat(32) +
  "00130100000f002b00020304001000050003026832";

function sshNameList(value: string): string {
  const hex = Buffer.from(value).toString("hex");
  return (hex.length / 2).toString(16).padStart(8, "0") + hex;
}

function sshKexInit(): string {
  const lists = [
    "curve25519-sha256",
    "ssh-ed25519",
    "aes128-ctr",
    "aes128-ctr",
    "hmac-sha2-256",
    "hmac-sha2-256",
    "none",
    "none",
    "",
    "",
  ];
  const payload =
    "04" +
    "14" +
    "00".repeat(16) +
    lists.map(sshNameList).join("") +
    "00" +
    "00000000" +
    "00".repeat(4);
  return (payload.length / 2).toString(16).padStart(8, "0") + payload;
}

describe("query and source-code operations", () => {
  test("CSS selector extracts all matching elements with the chosen delimiter", () => {
    const html = '<main><a href="/one">One</a><a href="/two">Two</a></main>';
    expect(new CSSSelector().run(html, ["main > a", "|"])).toBe(
      '<a href="/one">One</a>|<a href="/two">Two</a>',
    );
  });

  test("JPath, jq and Jsonata return equivalent selected data", async () => {
    const json = '{"items":[{"score":1},{"score":3}]}';
    expect(new JPathExpression().run(json, ["$.items[*].score", ","])).toBe(
      "1,3",
    );
    await expect(
      new Jq().run(JSON.parse(json), [".items | map(.score) | add", false]),
    ).resolves.toBe("4");
    await expect(
      new JsonataQuery().run(json, ["$sum(items.score)"]),
    ).resolves.toBe("4");
  });

  test("JavaScript beautify and minify produce parseable inverse forms", async () => {
    const source = "function add(a,b){return a+b;}";
    const beautified = new JavaScriptBeautify().run(source, [
      "  ",
      "Auto",
      true,
      true,
    ]);
    expect(beautified).toContain("return a + b;");
    const minified = String(await new JavaScriptMinify().run(beautified, []));
    expect(minified.length).toBeLessThan(beautified.length);
    expect(new JavaScriptBeautify().run(minified, ["  ", "Auto", true, true])).toContain(
      "function add",
    );
  });
});

describe("network fingerprint operations", () => {
  test("JA3 and JA4 match the independently constructed ClientHello", () => {
    expect(
      new JA3Fingerprint().run(TLS_CLIENT_HELLO, ["Hex", "JA3 string"]),
    ).toBe("771,4865,0-43-16,,");
    expect(
      new JA3Fingerprint().run(TLS_CLIENT_HELLO, ["Hex", "Hash digest"]),
    ).toBe("4b555d773580e975627b952305d9f7f1");
    expect(new JA4Fingerprint().run(TLS_CLIENT_HELLO, ["Hex", "JA4"])).toBe(
      "t13d0103h2_0f2cb44170f4_9b00d4eb1ff0",
    );
  });

  test("JA3S and JA4S match the independently constructed ServerHello", () => {
    expect(
      new JA3SFingerprint().run(TLS_SERVER_HELLO, ["Hex", "JA3S string"]),
    ).toBe("771,4865,43-16");
    expect(
      new JA4ServerFingerprint().run(TLS_SERVER_HELLO, ["Hex", "JA4S"]),
    ).toBe("t1302h2_1301_14e9539264dc");
  });

  test("HASSH client and server derive the expected algorithm string and digest", () => {
    const packet = sshKexInit();
    const expected = "curve25519-sha256;aes128-ctr;hmac-sha2-256;none";
    expect(
      new HASSHClientFingerprint().run(packet, [
        "Hex",
        "HASSH algorithms string",
      ]),
    ).toBe(expected);
    expect(
      new HASSHServerFingerprint().run(packet, ["Hex", "Hash digest"]),
    ).toBe("e97d07603350d1111ec2b64bf25413c9");
  });
});

describe("certificate and image operations", () => {
  test("X.509 parser reports identity, validity, key and fingerprints", () => {
    const keys = forge.pki.rsa.generateKeyPair(1024);
    const certificate = forge.pki.createCertificate();
    certificate.publicKey = keys.publicKey;
    certificate.serialNumber = "01";
    certificate.validity.notBefore = new Date("2024-01-01T00:00:00Z");
    certificate.validity.notAfter = new Date("2030-01-01T00:00:00Z");
    const identity = [{ name: "commonName", value: "analysis.example" }];
    certificate.setSubject(identity);
    certificate.setIssuer(identity);
    certificate.sign(keys.privateKey, forge.md.sha256.create());

    const output = new ParseX509Certificate().run(
      forge.pki.certificateToPem(certificate),
      ["PEM"],
    );
    expect(output).toContain("CN = analysis.example");
    expect(output).toContain("Algorithm ID:     SHA256withRSA");
    expect(output).toContain("Length:         1024 bits");
    expect(output).toMatch(/SHA256:\s+[0-9a-f]{64}/);
  });

  test("colour palette randomization is seeded and changes image bytes", async () => {
    const input = new GenerateQRCode().run("palette-test", [
      "PNG",
      5,
      4,
      "Medium",
    ]) as ArrayBuffer;
    const operation = new RandomizeColourPalette();
    const first = await operation.run(input, ["fixed-seed"]);
    const repeated = await operation.run(input, ["fixed-seed"]);

    expect(Buffer.from(first)).toEqual(Buffer.from(repeated));
    expect(Buffer.from(first)).not.toEqual(Buffer.from(input));
  });
});
