import { AESEncrypt } from "../src/chef/operations/AESEncrypt";
import { AESDecrypt } from "../src/chef/operations/AESDecrypt";
import { DESEncrypt } from "../src/chef/operations/DESEncrypt";
import { DESDecrypt } from "../src/chef/operations/DESDecrypt";
import { TripleDESEncrypt } from "../src/chef/operations/TripleDESEncrypt";
import { TripleDESDecrypt } from "../src/chef/operations/TripleDESDecrypt";
import { BlowfishEncrypt } from "../src/chef/operations/BlowfishEncrypt";
import { BlowfishDecrypt } from "../src/chef/operations/BlowfishDecrypt";

const PLAINTEXT = "hello world";

// AESEncrypt args: Key(0) IV(1) Mode(2) Input(3) Output(4) AAD(5)
// AESDecrypt args: Key(0) IV(1) Mode(2) Input(3) Output(4) GCMTag(5) AAD(6)
function aesEncArgs(
  keyHex: string,
  ivHex: string,
  mode = "CBC",
  inputType = "Raw",
  outputType = "Hex",
): any[] {
  return [
    { string: keyHex, option: "Hex" },
    { string: ivHex, option: "Hex" },
    mode,
    inputType,
    outputType,
    { string: "", option: "Hex" }, // AAD
  ];
}
function aesDecArgs(
  keyHex: string,
  ivHex: string,
  mode = "CBC",
  inputType = "Hex",
  outputType = "Raw",
): any[] {
  return [
    { string: keyHex, option: "Hex" },
    { string: ivHex, option: "Hex" },
    mode,
    inputType,
    outputType,
    { string: "", option: "Hex" }, // GCM Tag
    { string: "", option: "Hex" }, // AAD
  ];
}

// DES / 3DES / Blowfish share the same 5-arg shape
function symArgs(
  keyHex: string,
  ivHex: string,
  mode = "CBC",
  inputType = "Raw",
  outputType = "Hex",
): any[] {
  return [
    { string: keyHex, option: "Hex" },
    { string: ivHex, option: "Hex" },
    mode,
    inputType,
    outputType,
  ];
}
function symDecArgs(keyHex: string, ivHex: string, mode = "CBC"): any[] {
  return symArgs(keyHex, ivHex, mode, "Hex", "Raw");
}

function abToStr(ab: ArrayBuffer): string {
  return Buffer.from(new Uint8Array(ab)).toString("utf-8");
}

// ── AES ───────────────────────────────────────────────────────────────────────
describe("AES Encrypt / Decrypt", () => {
  const KEY128 = "0123456789abcdef0123456789abcdef"; // 16 bytes
  const KEY256 =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"; // 32 bytes
  const IV = "00000000000000000000000000000000"; // 16 bytes

  test("AES-128 CBC round-trip", () => {
    const enc = new AESEncrypt().run(PLAINTEXT, aesEncArgs(KEY128, IV, "CBC"));
    const dec = new AESDecrypt().run(
      enc as string,
      aesDecArgs(KEY128, IV, "CBC"),
    );
    expect((dec as string).trim()).toBe(PLAINTEXT);
  });

  test("AES-256 CBC round-trip", () => {
    const enc = new AESEncrypt().run(PLAINTEXT, aesEncArgs(KEY256, IV, "CBC"));
    const dec = new AESDecrypt().run(
      enc as string,
      aesDecArgs(KEY256, IV, "CBC"),
    );
    expect((dec as string).trim()).toBe(PLAINTEXT);
  });

  test("AES-128 ECB round-trip", () => {
    const enc = new AESEncrypt().run(PLAINTEXT, aesEncArgs(KEY128, IV, "ECB"));
    const dec = new AESDecrypt().run(
      enc as string,
      aesDecArgs(KEY128, IV, "ECB"),
    );
    expect((dec as string).trim()).toBe(PLAINTEXT);
  });

  test("AES-128 CTR round-trip", () => {
    const enc = new AESEncrypt().run(PLAINTEXT, aesEncArgs(KEY128, IV, "CTR"));
    const dec = new AESDecrypt().run(
      enc as string,
      aesDecArgs(KEY128, IV, "CTR"),
    );
    expect((dec as string).trim()).toBe(PLAINTEXT);
  });

  test("different keys produce different ciphertext", () => {
    const KEY2 = "fedcba9876543210fedcba9876543210";
    const enc1 = new AESEncrypt().run(PLAINTEXT, aesEncArgs(KEY128, IV));
    const enc2 = new AESEncrypt().run(PLAINTEXT, aesEncArgs(KEY2, IV));
    expect(enc1).not.toBe(enc2);
  });

  test("AES-128 ECB/NoPadding known vector (NIST)", () => {
    const zeroKey = "00000000000000000000000000000000";
    const zeroIV = "00000000000000000000000000000000";
    const zeroText =
      "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00";
    const enc = new AESEncrypt().run(
      zeroText,
      aesEncArgs(zeroKey, zeroIV, "ECB/NoPadding"),
    );
    expect((enc as string).toLowerCase()).toBe(
      "66e94bd4ef8a2c3b884cfa59ca342b2e",
    );
  });

  test("throws on invalid key length", () => {
    expect(() => {
      new AESEncrypt().run(PLAINTEXT, aesEncArgs("0102", IV));
    }).toThrow(/key/i);
  });
});

// ── DES ───────────────────────────────────────────────────────────────────────
describe("DES Encrypt / Decrypt", () => {
  const KEY = "0123456789abcdef"; // 8 bytes
  const IV = "0000000000000000"; // 8 bytes

  test("DES CBC round-trip", () => {
    const enc = new DESEncrypt().run(PLAINTEXT, symArgs(KEY, IV, "CBC"));
    const dec = new DESDecrypt().run(enc as any, symDecArgs(KEY, IV, "CBC"));
    if ((dec as any) instanceof ArrayBuffer) {
      expect(abToStr(dec as any).trim()).toBe(PLAINTEXT);
    } else {
      expect((dec as string).trim()).toBe(PLAINTEXT);
    }
  });

  test("DES ECB round-trip", () => {
    const enc = new DESEncrypt().run(PLAINTEXT, symArgs(KEY, IV, "ECB"));
    const dec = new DESDecrypt().run(enc as any, symDecArgs(KEY, IV, "ECB"));
    if ((dec as any) instanceof ArrayBuffer) {
      expect(abToStr(dec as any).trim()).toBe(PLAINTEXT);
    } else {
      expect((dec as string).trim()).toBe(PLAINTEXT);
    }
  });

  test("throws on invalid DES key length", () => {
    expect(() => {
      new DESEncrypt().run(PLAINTEXT, symArgs("0102", IV));
    }).toThrow();
  });
});

// ── Triple DES ────────────────────────────────────────────────────────────────
describe("Triple DES Encrypt / Decrypt", () => {
  const KEY = "0123456789abcdef0123456789abcdef0123456789abcdef"; // 24 bytes
  const IV = "0000000000000000"; // 8 bytes

  test("3DES CBC round-trip", () => {
    const enc = new TripleDESEncrypt().run(PLAINTEXT, symArgs(KEY, IV, "CBC"));
    const dec = new TripleDESDecrypt().run(
      enc as any,
      symDecArgs(KEY, IV, "CBC"),
    );
    expect(abToStr(dec as ArrayBuffer).trim()).toBe(PLAINTEXT);
  });

  test("3DES ECB round-trip", () => {
    const enc = new TripleDESEncrypt().run(PLAINTEXT, symArgs(KEY, IV, "ECB"));
    const dec = new TripleDESDecrypt().run(
      enc as any,
      symDecArgs(KEY, IV, "ECB"),
    );
    expect(abToStr(dec as ArrayBuffer).trim()).toBe(PLAINTEXT);
  });
});

// ── Blowfish ──────────────────────────────────────────────────────────────────
describe("Blowfish Encrypt / Decrypt", () => {
  const KEY = "0123456789abcdef"; // 8 bytes
  const IV = "0000000000000000"; // 8 bytes

  test("Blowfish CBC round-trip", () => {
    const enc = new BlowfishEncrypt().run(PLAINTEXT, symArgs(KEY, IV, "CBC"));
    const dec = new BlowfishDecrypt().run(
      enc as any,
      symDecArgs(KEY, IV, "CBC"),
    );
    if ((dec as any) instanceof ArrayBuffer) {
      expect(abToStr(dec as any).trim()).toBe(PLAINTEXT);
    } else {
      expect((dec as string).trim()).toBe(PLAINTEXT);
    }
  });

  test("Blowfish ECB round-trip", () => {
    const enc = new BlowfishEncrypt().run(PLAINTEXT, symArgs(KEY, IV, "ECB"));
    const dec = new BlowfishDecrypt().run(
      enc as any,
      symDecArgs(KEY, IV, "ECB"),
    );
    if ((dec as any) instanceof ArrayBuffer) {
      expect(abToStr(dec as any).trim()).toBe(PLAINTEXT);
    } else {
      expect((dec as string).trim()).toBe(PLAINTEXT);
    }
  });

  test("different keys produce different ciphertext", () => {
    const KEY2 = "fedcba9876543210";
    const enc1 = new BlowfishEncrypt().run(PLAINTEXT, symArgs(KEY, IV));
    const enc2 = new BlowfishEncrypt().run(PLAINTEXT, symArgs(KEY2, IV));
    expect(enc1).not.toBe(enc2);
  });
});
