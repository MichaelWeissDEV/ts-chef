import { createCipheriv, createDecipheriv, getCiphers } from "node:crypto";
import forge from "node-forge";

/** BoringSSL omits the ECB alias and CFB/OFB/CTR native 3DES modes. */
export function transformTripleDES(data: Buffer, key: Buffer, iv: Buffer, mode: string, decrypt: boolean): Buffer {
  const supportedModes = new Set(["cbc", "cfb", "ofb", "ctr", "ecb"]);
  const selectedMode = supportedModes.has(mode) ? mode : "cbc";
  const algorithm = selectedMode === "ecb" ? "des-ede3" : `des-ede3-${selectedMode}`;
  if (getCiphers().includes(algorithm)) {
    const cipher = decrypt ? createDecipheriv(algorithm, key, selectedMode === "ecb" ? null : iv) : createCipheriv(algorithm, key, selectedMode === "ecb" ? null : iv);
    return Buffer.concat([cipher.update(data), cipher.final()]);
  }
  const forgeAlgorithm = `3DES-${selectedMode.toUpperCase()}` as forge.cipher.Algorithm;
  const cipher = decrypt ? forge.cipher.createDecipher(forgeAlgorithm, key.toString("latin1")) : forge.cipher.createCipher(forgeAlgorithm, key.toString("latin1"));
  cipher.start({ iv: selectedMode === "ecb" ? undefined : iv.toString("latin1") });
  cipher.update(forge.util.createBuffer(data.toString("latin1")));
  if (!cipher.finish()) throw new Error("Invalid Triple DES padding");
  return Buffer.from(cipher.output.getBytes(), "latin1");
}
