/**
 * @fileoverview Operation registry managing all available ts-chef operations
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import * as path from "node:path";
import type { Operation } from "./chef/Operation";
import operationChunkPlan from "./operationChunkPlan.json";
import operationChunkOverrides from "./operationChunkOverrides.json";

const OPERATION_CHUNK_SHARDS: Readonly<Record<string, number>> =
  operationChunkPlan;

function stableOperationHash(value: string): number {
  let hash = 0x811c9dc5;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function safeModuleName(moduleName: string): string {
  return moduleName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/** Stable build/runtime mapping for an operation implementation chunk. */
export function operationChunkId(moduleName: string, opName: string): string {
  const override = (operationChunkOverrides as Record<string, string>)[opName];
  if (override) return override;
  const shards = OPERATION_CHUNK_SHARDS[moduleName] ?? 1;
  const shard = stableOperationHash(opName) % shards;
  return `${safeModuleName(moduleName)}-${String(shard).padStart(2, "0")}`;
}

type OperationModule = Record<string, unknown>;
type OperationChunk = {
  operationModules?: Record<string, OperationModule>;
};

const operationChunkCache = new Map<string, OperationChunk>();

function productionChunkDirectory(): string | undefined {
  const directory = path.basename(__dirname);
  if (directory === "operation-chunks") return __dirname;
  if (directory === "dist") return path.join(__dirname, "operation-chunks");
  return undefined;
}

function operationModule(opName: string, moduleName: string): OperationModule {
  const chunkDirectory = productionChunkDirectory();
  if (!chunkDirectory) {
    // Jest/ts-node execute the TypeScript sources directly. Keeping this path
    // lazy means catalog tests exercise the same factory boundary without
    // requiring a production build first.
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- source-mode lazy loader
    return require(
      path.join(__dirname, "chef", "operations", opName),
    ) as OperationModule;
  }

  const id = operationChunkId(moduleName, opName);
  let chunk = operationChunkCache.get(id);
  if (!chunk) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- synchronous production chunk boundary
    chunk = require(path.join(chunkDirectory, `${id}.js`)) as OperationChunk;
    operationChunkCache.set(id, chunk);
  }
  const loaded = chunk.operationModules?.[opName];
  if (!loaded) {
    throw new Error(`Operation chunk "${id}" does not contain "${opName}".`);
  }
  return loaded;
}

function lazyFactory(
  opName: string,
  moduleName: string,
  constructorName: string,
): () => Operation {
  return () => {
    const loaded = operationModule(opName, moduleName);
    const candidate = loaded[constructorName] ?? loaded.default;
    if (typeof candidate !== "function") {
      throw new Error(
        `Operation module "${opName}" does not export constructor "${constructorName}".`,
      );
    }
    const Constructor = candidate as new () => Operation;
    return new Constructor();
  };
}

/** Loaded production chunks, exposed for diagnostics and regression tests. */
export function loadedOperationChunkIds(): string[] {
  return [...operationChunkCache.keys()].sort();
}

export interface OpMeta {
  opName: string;
  displayName: string;
  module: string;
  factory: () => Operation;
}

const registry: OpMeta[] = [
  {
    opName: "A1Z26CipherDecode",
    displayName: "A1Z26 Cipher Decode",
    module: "Ciphers",
    factory: lazyFactory("A1Z26CipherDecode", "Ciphers", "A1Z26CipherDecode"),
  },
  {
    opName: "A1Z26CipherEncode",
    displayName: "A1Z26 Cipher Encode",
    module: "Ciphers",
    factory: lazyFactory("A1Z26CipherEncode", "Ciphers", "A1Z26CipherEncode"),
  },
  {
    opName: "ADD",
    displayName: "ADD",
    module: "Arithmetic",
    factory: lazyFactory("ADD", "Arithmetic", "ADD"),
  },
  {
    opName: "AddLineNumbers",
    displayName: "Add line numbers",
    module: "Default",
    factory: lazyFactory("AddLineNumbers", "Default", "AddLineNumbers"),
  },
  {
    opName: "AddTextToImage",
    displayName: "Add Text To Image",
    module: "Image",
    factory: lazyFactory("AddTextToImage", "Image", "AddTextToImage"),
  },
  {
    opName: "Adler32Checksum",
    displayName: "Adler-32 Checksum",
    module: "Crypto",
    factory: lazyFactory("Adler32Checksum", "Crypto", "Adler32Checksum"),
  },
  {
    opName: "AESDecrypt",
    displayName: "AES Decrypt",
    module: "Ciphers",
    factory: lazyFactory("AESDecrypt", "Ciphers", "AESDecrypt"),
  },
  {
    opName: "AESEncrypt",
    displayName: "AES Encrypt",
    module: "Ciphers",
    factory: lazyFactory("AESEncrypt", "Ciphers", "AESEncrypt"),
  },
  {
    opName: "AESKeyUnwrap",
    displayName: "AES Key Unwrap",
    module: "Ciphers",
    factory: lazyFactory("AESKeyUnwrap", "Ciphers", "AESKeyUnwrap"),
  },
  {
    opName: "AESKeyWrap",
    displayName: "AES Key Wrap",
    module: "Ciphers",
    factory: lazyFactory("AESKeyWrap", "Ciphers", "AESKeyWrap"),
  },
  {
    opName: "AffineCipherDecode",
    displayName: "Affine Cipher Decode",
    module: "Ciphers",
    factory: lazyFactory("AffineCipherDecode", "Ciphers", "AffineCipherDecode"),
  },
  {
    opName: "AffineCipherEncode",
    displayName: "Affine Cipher Encode",
    module: "Ciphers",
    factory: lazyFactory("AffineCipherEncode", "Ciphers", "AffineCipherEncode"),
  },
  {
    opName: "AlternatingCaps",
    displayName: "Alternating Caps",
    module: "Default",
    factory: lazyFactory("AlternatingCaps", "Default", "AlternatingCaps"),
  },
  {
    opName: "AMFDecode",
    displayName: "AMF Decode",
    module: "Encodings",
    factory: lazyFactory("AMFDecode", "Encodings", "AMFDecode"),
  },
  {
    opName: "AMFEncode",
    displayName: "AMF Encode",
    module: "Encodings",
    factory: lazyFactory("AMFEncode", "Encodings", "AMFEncode"),
  },
  {
    opName: "AnalyseHash",
    displayName: "Analyse hash",
    module: "Crypto",
    factory: lazyFactory("AnalyseHash", "Crypto", "AnalyseHash"),
  },
  {
    opName: "AnalyseUUID",
    displayName: "Analyse UUID",
    module: "Crypto",
    factory: lazyFactory("AnalyseUUID", "Crypto", "AnalyseUUID"),
  },
  {
    opName: "AND",
    displayName: "AND",
    module: "Default",
    factory: lazyFactory("AND", "Default", "AND"),
  },
  {
    opName: "AtbashCipher",
    displayName: "Atbash Cipher",
    module: "Ciphers",
    factory: lazyFactory("AtbashCipher", "Ciphers", "AtbashCipher"),
  },
  {
    opName: "AvroToJSON",
    displayName: "Avro to JSON",
    module: "Serialise",
    factory: lazyFactory("AvroToJSON", "Serialise", "AvroToJSON"),
  },
  {
    opName: "BaconCipherDecode",
    displayName: "Bacon Cipher Decode",
    module: "Default",
    factory: lazyFactory("BaconCipherDecode", "Default", "BaconCipherDecode"),
  },
  {
    opName: "BaconCipherEncode",
    displayName: "Bacon Cipher Encode",
    module: "Default",
    factory: lazyFactory("BaconCipherEncode", "Default", "BaconCipherEncode"),
  },
  {
    opName: "Bcrypt",
    displayName: "Bcrypt",
    module: "Crypto",
    factory: lazyFactory("Bcrypt", "Crypto", "Bcrypt"),
  },
  {
    opName: "BcryptCompare",
    displayName: "Bcrypt compare",
    module: "Crypto",
    factory: lazyFactory("BcryptCompare", "Crypto", "BcryptCompare"),
  },
  {
    opName: "BcryptParse",
    displayName: "Bcrypt parse",
    module: "Crypto",
    factory: lazyFactory("BcryptParse", "Crypto", "BcryptParse"),
  },
  {
    opName: "BifidCipherDecode",
    displayName: "Bifid Cipher Decode",
    module: "Ciphers",
    factory: lazyFactory("BifidCipherDecode", "Ciphers", "BifidCipherDecode"),
  },
  {
    opName: "BifidCipherEncode",
    displayName: "Bifid Cipher Encode",
    module: "Ciphers",
    factory: lazyFactory("BifidCipherEncode", "Ciphers", "BifidCipherEncode"),
  },
  {
    opName: "BitShiftLeft",
    displayName: "Bit shift left",
    module: "Default",
    factory: lazyFactory("BitShiftLeft", "Default", "BitShiftLeft"),
  },
  {
    opName: "BitShiftRight",
    displayName: "Bit shift right",
    module: "Default",
    factory: lazyFactory("BitShiftRight", "Default", "BitShiftRight"),
  },
  {
    opName: "BLAKE2b",
    displayName: "BLAKE2b",
    module: "Hashing",
    factory: lazyFactory("BLAKE2b", "Hashing", "BLAKE2b"),
  },
  {
    opName: "BLAKE2s",
    displayName: "BLAKE2s",
    module: "Hashing",
    factory: lazyFactory("BLAKE2s", "Hashing", "BLAKE2s"),
  },
  {
    opName: "BLAKE3",
    displayName: "BLAKE3",
    module: "Hashing",
    factory: lazyFactory("BLAKE3", "Hashing", "BLAKE3"),
  },
  {
    opName: "BlowfishDecrypt",
    displayName: "Blowfish Decrypt",
    module: "Ciphers",
    factory: lazyFactory("BlowfishDecrypt", "Ciphers", "BlowfishDecrypt"),
  },
  {
    opName: "BlowfishEncrypt",
    displayName: "Blowfish Encrypt",
    module: "Ciphers",
    factory: lazyFactory("BlowfishEncrypt", "Ciphers", "BlowfishEncrypt"),
  },
  {
    opName: "BlurImage",
    displayName: "Blur Image",
    module: "Image",
    factory: lazyFactory("BlurImage", "Image", "BlurImage"),
  },
  {
    opName: "Bombe",
    displayName: "Bombe",
    module: "Bletchley",
    factory: lazyFactory("Bombe", "Bletchley", "Bombe"),
  },
  {
    opName: "BSONDeserialise",
    displayName: "BSON deserialise",
    module: "Serialise",
    factory: lazyFactory("BSONDeserialise", "Serialise", "BSONDeserialise"),
  },
  {
    opName: "BSONSerialise",
    displayName: "BSON serialise",
    module: "Serialise",
    factory: lazyFactory("BSONSerialise", "Serialise", "BSONSerialise"),
  },
  {
    opName: "CaesarBoxCipher",
    displayName: "Caesar Box Cipher",
    module: "Ciphers",
    factory: lazyFactory("CaesarBoxCipher", "Ciphers", "CaesarBoxCipher"),
  },
  {
    opName: "CaretMdecode",
    displayName: "Caret/M-decode",
    module: "Default",
    factory: lazyFactory("CaretMdecode", "Default", "CaretMdecode"),
  },
  {
    opName: "CartesianProduct",
    displayName: "Cartesian Product",
    module: "Default",
    factory: lazyFactory("CartesianProduct", "Default", "CartesianProduct"),
  },
  {
    opName: "CBORDecode",
    displayName: "CBOR Decode",
    module: "Serialise",
    factory: lazyFactory("CBORDecode", "Serialise", "CBORDecode"),
  },
  {
    opName: "CBOREncode",
    displayName: "CBOR Encode",
    module: "Serialise",
    factory: lazyFactory("CBOREncode", "Serialise", "CBOREncode"),
  },
  {
    opName: "CetaceanCipherDecode",
    displayName: "Cetacean Cipher Decode",
    module: "Ciphers",
    factory: lazyFactory(
      "CetaceanCipherDecode",
      "Ciphers",
      "CetaceanCipherDecode",
    ),
  },
  {
    opName: "CetaceanCipherEncode",
    displayName: "Cetacean Cipher Encode",
    module: "Ciphers",
    factory: lazyFactory(
      "CetaceanCipherEncode",
      "Ciphers",
      "CetaceanCipherEncode",
    ),
  },
  {
    opName: "ChaCha",
    displayName: "ChaCha",
    module: "Ciphers",
    factory: lazyFactory("ChaCha", "Ciphers", "ChaCha"),
  },
  {
    opName: "ChangeIPFormat",
    displayName: "Change IP format",
    module: "Default",
    factory: lazyFactory("ChangeIPFormat", "Default", "ChangeIPFormat"),
  },
  {
    opName: "ChiSquare",
    displayName: "Chi Square",
    module: "Default",
    factory: lazyFactory("ChiSquare", "Default", "ChiSquare"),
  },
  {
    opName: "CipherSaber2Decrypt",
    displayName: "CipherSaber2 Decrypt",
    module: "Crypto",
    factory: lazyFactory(
      "CipherSaber2Decrypt",
      "Crypto",
      "CipherSaber2Decrypt",
    ),
  },
  {
    opName: "CipherSaber2Encrypt",
    displayName: "CipherSaber2 Encrypt",
    module: "Crypto",
    factory: lazyFactory(
      "CipherSaber2Encrypt",
      "Crypto",
      "CipherSaber2Encrypt",
    ),
  },
  {
    opName: "CitrixCTX1Decode",
    displayName: "Citrix CTX1 Decode",
    module: "Encodings",
    factory: lazyFactory("CitrixCTX1Decode", "Encodings", "CitrixCTX1Decode"),
  },
  {
    opName: "CitrixCTX1Encode",
    displayName: "Citrix CTX1 Encode",
    module: "Encodings",
    factory: lazyFactory("CitrixCTX1Encode", "Encodings", "CitrixCTX1Encode"),
  },
  {
    opName: "CMAC",
    displayName: "CMAC",
    module: "Crypto",
    factory: lazyFactory("CMAC", "Crypto", "CMAC"),
  },
  {
    opName: "Colossus",
    displayName: "Colossus",
    module: "Bletchley",
    factory: lazyFactory("Colossus", "Bletchley", "Colossus"),
  },
  {
    opName: "Comment",
    displayName: "Comment",
    module: "Default",
    factory: lazyFactory("Comment", "Default", "Comment"),
  },
  {
    opName: "CompareCTPHHashes",
    displayName: "Compare CTPH hashes",
    module: "Crypto",
    factory: lazyFactory("CompareCTPHHashes", "Crypto", "CompareCTPHHashes"),
  },
  {
    opName: "CompareSSDEEPHashes",
    displayName: "Compare SSDEEP hashes",
    module: "Crypto",
    factory: lazyFactory(
      "CompareSSDEEPHashes",
      "Crypto",
      "CompareSSDEEPHashes",
    ),
  },
  {
    opName: "ConditionalJump",
    displayName: "Conditional Jump",
    module: "Default",
    factory: lazyFactory("ConditionalJump", "Default", "ConditionalJump"),
  },
  {
    opName: "ContainImage",
    displayName: "Contain Image",
    module: "Image",
    factory: lazyFactory("ContainImage", "Image", "ContainImage"),
  },
  {
    opName: "ConvertArea",
    displayName: "Convert area",
    module: "Default",
    factory: lazyFactory("ConvertArea", "Default", "ConvertArea"),
  },
  {
    opName: "ConvertCoordinateFormat",
    displayName: "Convert co-ordinate format",
    module: "Hashing",
    factory: lazyFactory(
      "ConvertCoordinateFormat",
      "Hashing",
      "ConvertCoordinateFormat",
    ),
  },
  {
    opName: "ConvertDataUnits",
    displayName: "Convert data units",
    module: "Default",
    factory: lazyFactory("ConvertDataUnits", "Default", "ConvertDataUnits"),
  },
  {
    opName: "ConvertDistance",
    displayName: "Convert distance",
    module: "Default",
    factory: lazyFactory("ConvertDistance", "Default", "ConvertDistance"),
  },
  {
    opName: "ConvertImageFormat",
    displayName: "Convert Image Format",
    module: "Image",
    factory: lazyFactory("ConvertImageFormat", "Image", "ConvertImageFormat"),
  },
  {
    opName: "ConvertLeetSpeak",
    displayName: "Convert Leet Speak",
    module: "Default",
    factory: lazyFactory("ConvertLeetSpeak", "Default", "ConvertLeetSpeak"),
  },
  {
    opName: "ConvertMass",
    displayName: "Convert mass",
    module: "Default",
    factory: lazyFactory("ConvertMass", "Default", "ConvertMass"),
  },
  {
    opName: "ConvertSpeed",
    displayName: "Convert speed",
    module: "Default",
    factory: lazyFactory("ConvertSpeed", "Default", "ConvertSpeed"),
  },
  {
    opName: "ConvertToNATOAlphabet",
    displayName: "Convert to NATO alphabet",
    module: "Default",
    factory: lazyFactory(
      "ConvertToNATOAlphabet",
      "Default",
      "ConvertToNATOAlphabet",
    ),
  },
  {
    opName: "CountOccurrences",
    displayName: "Count occurrences",
    module: "Default",
    factory: lazyFactory("CountOccurrences", "Default", "CountOccurrences"),
  },
  {
    opName: "CoverImage",
    displayName: "Cover Image",
    module: "Image",
    factory: lazyFactory("CoverImage", "Image", "CoverImage"),
  },
  {
    opName: "CRCChecksum",
    displayName: "CRC Checksum",
    module: "Default",
    factory: lazyFactory("CRCChecksum", "Default", "CRCChecksum"),
  },
  {
    opName: "CropImage",
    displayName: "Crop Image",
    module: "Image",
    factory: lazyFactory("CropImage", "Image", "CropImage"),
  },
  {
    opName: "CSSBeautify",
    displayName: "CSS Beautify",
    module: "Code",
    factory: lazyFactory("CSSBeautify", "Code", "CSSBeautify"),
  },
  {
    opName: "CSSMinify",
    displayName: "CSS Minify",
    module: "Code",
    factory: lazyFactory("CSSMinify", "Code", "CSSMinify"),
  },
  {
    opName: "CSVToJSON",
    displayName: "CSV to JSON",
    module: "Default",
    factory: lazyFactory("CSVToJSON", "Default", "CSVToJSON"),
  },
  {
    opName: "CTPH",
    displayName: "CTPH",
    module: "Crypto",
    factory: lazyFactory("CTPH", "Crypto", "CTPH"),
  },
  {
    opName: "DateTimeDelta",
    displayName: "DateTime Delta",
    module: "Default",
    factory: lazyFactory("DateTimeDelta", "Default", "DateTimeDelta"),
  },
  {
    opName: "DechunkHTTPResponse",
    displayName: "Dechunk HTTP response",
    module: "Default",
    factory: lazyFactory(
      "DechunkHTTPResponse",
      "Default",
      "DechunkHTTPResponse",
    ),
  },
  {
    opName: "DecodeNetBIOSName",
    displayName: "Decode NetBIOS Name",
    module: "Default",
    factory: lazyFactory("DecodeNetBIOSName", "Default", "DecodeNetBIOSName"),
  },
  {
    opName: "DecodeText",
    displayName: "Decode text",
    module: "Encodings",
    factory: lazyFactory("DecodeText", "Encodings", "DecodeText"),
  },
  {
    opName: "DefangIPAddresses",
    displayName: "Defang IP Addresses",
    module: "Default",
    factory: lazyFactory("DefangIPAddresses", "Default", "DefangIPAddresses"),
  },
  {
    opName: "DefangURL",
    displayName: "Defang URL",
    module: "Default",
    factory: lazyFactory("DefangURL", "Default", "DefangURL"),
  },
  {
    opName: "DeriveEVPKey",
    displayName: "Derive EVP key",
    module: "Ciphers",
    factory: lazyFactory("DeriveEVPKey", "Ciphers", "DeriveEVPKey"),
  },
  {
    opName: "DerivePBKDF2Key",
    displayName: "Derive PBKDF2 key",
    module: "Ciphers",
    factory: lazyFactory("DerivePBKDF2Key", "Ciphers", "DerivePBKDF2Key"),
  },
  {
    opName: "DESDecrypt",
    displayName: "DES Decrypt",
    module: "Ciphers",
    factory: lazyFactory("DESDecrypt", "Ciphers", "DESDecrypt"),
  },
  {
    opName: "DESEncrypt",
    displayName: "DES Encrypt",
    module: "Ciphers",
    factory: lazyFactory("DESEncrypt", "Ciphers", "DESEncrypt"),
  },
  {
    opName: "DetectFileType",
    displayName: "Detect File Type",
    module: "Default",
    factory: lazyFactory("DetectFileType", "Default", "DetectFileType"),
  },
  {
    opName: "Diff",
    displayName: "Diff",
    module: "Diff",
    factory: lazyFactory("Diff", "Diff", "Diff"),
  },
  {
    opName: "DitherImage",
    displayName: "Dither Image",
    module: "Image",
    factory: lazyFactory("DitherImage", "Image", "DitherImage"),
  },
  {
    opName: "Divide",
    displayName: "Divide",
    module: "Default",
    factory: lazyFactory("Divide", "Default", "Divide"),
  },
  {
    opName: "DNSOverHTTPS",
    displayName: "DNS over HTTPS",
    module: "Default",
    factory: lazyFactory("DNSOverHTTPS", "Default", "DNSOverHTTPS"),
  },
  {
    opName: "DropBytes",
    displayName: "Drop bytes",
    module: "Default",
    factory: lazyFactory("DropBytes", "Default", "DropBytes"),
  },
  {
    opName: "DropNthBytes",
    displayName: "Drop nth bytes",
    module: "Default",
    factory: lazyFactory("DropNthBytes", "Default", "DropNthBytes"),
  },
  {
    opName: "ECDSASign",
    displayName: "ECDSA Sign",
    module: "Ciphers",
    factory: lazyFactory("ECDSASign", "Ciphers", "ECDSASign"),
  },
  {
    opName: "ECDSASignatureConversion",
    displayName: "ECDSA Signature Conversion",
    module: "Ciphers",
    factory: lazyFactory(
      "ECDSASignatureConversion",
      "Ciphers",
      "ECDSASignatureConversion",
    ),
  },
  {
    opName: "ECDSAVerify",
    displayName: "ECDSA Verify",
    module: "Ciphers",
    factory: lazyFactory("ECDSAVerify", "Ciphers", "ECDSAVerify"),
  },
  {
    opName: "ELFInfo",
    displayName: "ELF Info",
    module: "Default",
    factory: lazyFactory("ELFInfo", "Default", "ELFInfo"),
  },
  {
    opName: "EncodeNetBIOSName",
    displayName: "Encode NetBIOS Name",
    module: "Default",
    factory: lazyFactory("EncodeNetBIOSName", "Default", "EncodeNetBIOSName"),
  },
  {
    opName: "EncodeText",
    displayName: "Encode text",
    module: "Encodings",
    factory: lazyFactory("EncodeText", "Encodings", "EncodeText"),
  },
  {
    opName: "Enigma",
    displayName: "Enigma",
    module: "Bletchley",
    factory: lazyFactory("Enigma", "Bletchley", "Enigma"),
  },
  {
    opName: "Entropy",
    displayName: "Entropy",
    module: "Charts",
    factory: lazyFactory("Entropy", "Charts", "Entropy"),
  },
  {
    opName: "EscapeString",
    displayName: "Escape string",
    module: "Default",
    factory: lazyFactory("EscapeString", "Default", "EscapeString"),
  },
  {
    opName: "EscapeUnicodeCharacters",
    displayName: "Escape Unicode Characters",
    module: "Default",
    factory: lazyFactory(
      "EscapeUnicodeCharacters",
      "Default",
      "EscapeUnicodeCharacters",
    ),
  },
  {
    opName: "ExpandAlphabetRange",
    displayName: "Expand alphabet range",
    module: "Default",
    factory: lazyFactory(
      "ExpandAlphabetRange",
      "Default",
      "ExpandAlphabetRange",
    ),
  },
  {
    opName: "ExtractAudioMetadata",
    displayName: "Extract Audio Metadata",
    module: "Default",
    factory: lazyFactory(
      "ExtractAudioMetadata",
      "Default",
      "ExtractAudioMetadata",
    ),
  },
  {
    opName: "ExtractDates",
    displayName: "Extract dates",
    module: "Regex",
    factory: lazyFactory("ExtractDates", "Regex", "ExtractDates"),
  },
  {
    opName: "ExtractDomains",
    displayName: "Extract domains",
    module: "Regex",
    factory: lazyFactory("ExtractDomains", "Regex", "ExtractDomains"),
  },
  {
    opName: "ExtractEmailAddresses",
    displayName: "Extract email addresses",
    module: "Regex",
    factory: lazyFactory(
      "ExtractEmailAddresses",
      "Regex",
      "ExtractEmailAddresses",
    ),
  },
  {
    opName: "ExtractEXIF",
    displayName: "Extract EXIF",
    module: "Image",
    factory: lazyFactory("ExtractEXIF", "Image", "ExtractEXIF"),
  },
  {
    opName: "ExtractFilePaths",
    displayName: "Extract file paths",
    module: "Regex",
    factory: lazyFactory("ExtractFilePaths", "Regex", "ExtractFilePaths"),
  },
  {
    opName: "ExtractFiles",
    displayName: "Extract Files",
    module: "Default",
    factory: lazyFactory("ExtractFiles", "Default", "ExtractFiles"),
  },
  {
    opName: "ExtractHashes",
    displayName: "Extract hashes",
    module: "Regex",
    factory: lazyFactory("ExtractHashes", "Regex", "ExtractHashes"),
  },
  {
    opName: "ExtractID3",
    displayName: "Extract ID3",
    module: "Default",
    factory: lazyFactory("ExtractID3", "Default", "ExtractID3"),
  },
  {
    opName: "ExtractIPAddresses",
    displayName: "Extract IP addresses",
    module: "Regex",
    factory: lazyFactory("ExtractIPAddresses", "Regex", "ExtractIPAddresses"),
  },
  {
    opName: "ExtractLSB",
    displayName: "Extract LSB",
    module: "Image",
    factory: lazyFactory("ExtractLSB", "Image", "ExtractLSB"),
  },
  {
    opName: "ExtractMACAddresses",
    displayName: "Extract MAC addresses",
    module: "Regex",
    factory: lazyFactory("ExtractMACAddresses", "Regex", "ExtractMACAddresses"),
  },
  {
    opName: "ExtractRGBA",
    displayName: "Extract RGBA",
    module: "Image",
    factory: lazyFactory("ExtractRGBA", "Image", "ExtractRGBA"),
  },
  {
    opName: "ExtractURLs",
    displayName: "Extract URLs",
    module: "Regex",
    factory: lazyFactory("ExtractURLs", "Regex", "ExtractURLs"),
  },
  {
    opName: "FangURL",
    displayName: "Fang URL",
    module: "Default",
    factory: lazyFactory("FangURL", "Default", "FangURL"),
  },
  {
    opName: "FileTree",
    displayName: "File Tree",
    module: "Default",
    factory: lazyFactory("FileTree", "Default", "FileTree"),
  },
  {
    opName: "Filter",
    displayName: "Filter",
    module: "Regex",
    factory: lazyFactory("Filter", "Regex", "Filter"),
  },
  {
    opName: "FindReplace",
    displayName: "Find / Replace",
    module: "Regex",
    factory: lazyFactory("FindReplace", "Regex", "FindReplace"),
  },
  {
    opName: "FlaskSessionDecode",
    displayName: "Flask Session Decode",
    module: "Crypto",
    factory: lazyFactory("FlaskSessionDecode", "Crypto", "FlaskSessionDecode"),
  },
  {
    opName: "Fletcher16Checksum",
    displayName: "Fletcher-16 Checksum",
    module: "Crypto",
    factory: lazyFactory("Fletcher16Checksum", "Crypto", "Fletcher16Checksum"),
  },
  {
    opName: "Fletcher32Checksum",
    displayName: "Fletcher-32 Checksum",
    module: "Crypto",
    factory: lazyFactory("Fletcher32Checksum", "Crypto", "Fletcher32Checksum"),
  },
  {
    opName: "Fletcher64Checksum",
    displayName: "Fletcher-64 Checksum",
    module: "Crypto",
    factory: lazyFactory("Fletcher64Checksum", "Crypto", "Fletcher64Checksum"),
  },
  {
    opName: "Fletcher8Checksum",
    displayName: "Fletcher-8 Checksum",
    module: "Crypto",
    factory: lazyFactory("Fletcher8Checksum", "Crypto", "Fletcher8Checksum"),
  },
  {
    opName: "FlipImage",
    displayName: "Flip Image",
    module: "Image",
    factory: lazyFactory("FlipImage", "Image", "FlipImage"),
  },
  {
    opName: "Fork",
    displayName: "Fork",
    module: "Default",
    factory: lazyFactory("Fork", "Default", "Fork"),
  },
  {
    opName: "FormatMACAddresses",
    displayName: "Format MAC addresses",
    module: "Default",
    factory: lazyFactory("FormatMACAddresses", "Default", "FormatMACAddresses"),
  },
  {
    opName: "FrequencyDistribution",
    displayName: "Frequency distribution",
    module: "Default",
    factory: lazyFactory(
      "FrequencyDistribution",
      "Default",
      "FrequencyDistribution",
    ),
  },
  {
    opName: "FromBase",
    displayName: "From Base",
    module: "Default",
    factory: lazyFactory("FromBase", "Default", "FromBase"),
  },
  {
    opName: "FromBase32",
    displayName: "From Base32",
    module: "Default",
    factory: lazyFactory("FromBase32", "Default", "FromBase32"),
  },
  {
    opName: "FromBase45",
    displayName: "From Base45",
    module: "Default",
    factory: lazyFactory("FromBase45", "Default", "FromBase45"),
  },
  {
    opName: "FromBase58",
    displayName: "From Base58",
    module: "Default",
    factory: lazyFactory("FromBase58", "Default", "FromBase58"),
  },
  {
    opName: "FromBase62",
    displayName: "From Base62",
    module: "Default",
    factory: lazyFactory("FromBase62", "Default", "FromBase62"),
  },
  {
    opName: "FromBase64",
    displayName: "From Base64",
    module: "Default",
    factory: lazyFactory("FromBase64", "Default", "FromBase64"),
  },
  {
    opName: "FromBase85",
    displayName: "From Base85",
    module: "Default",
    factory: lazyFactory("FromBase85", "Default", "FromBase85"),
  },
  {
    opName: "FromBase92",
    displayName: "From Base92",
    module: "Default",
    factory: lazyFactory("FromBase92", "Default", "FromBase92"),
  },
  {
    opName: "FromBCD",
    displayName: "From BCD",
    module: "Default",
    factory: lazyFactory("FromBCD", "Default", "FromBCD"),
  },
  {
    opName: "FromBech32",
    displayName: "From Bech32",
    module: "Default",
    factory: lazyFactory("FromBech32", "Default", "FromBech32"),
  },
  {
    opName: "FromBinary",
    displayName: "From Binary",
    module: "Default",
    factory: lazyFactory("FromBinary", "Default", "FromBinary"),
  },
  {
    opName: "FromBraille",
    displayName: "From Braille",
    module: "Default",
    factory: lazyFactory("FromBraille", "Default", "FromBraille"),
  },
  {
    opName: "FromCaseInsensitiveRegex",
    displayName: "From Case Insensitive Regex",
    module: "Default",
    factory: lazyFactory(
      "FromCaseInsensitiveRegex",
      "Default",
      "FromCaseInsensitiveRegex",
    ),
  },
  {
    opName: "FromCharcode",
    displayName: "From Charcode",
    module: "Default",
    factory: lazyFactory("FromCharcode", "Default", "FromCharcode"),
  },
  {
    opName: "FromDecimal",
    displayName: "From Decimal",
    module: "Default",
    factory: lazyFactory("FromDecimal", "Default", "FromDecimal"),
  },
  {
    opName: "FromFloat",
    displayName: "From Float",
    module: "Default",
    factory: lazyFactory("FromFloat", "Default", "FromFloat"),
  },
  {
    opName: "FromHex",
    displayName: "From Hex",
    module: "Default",
    factory: lazyFactory("FromHex", "Default", "FromHex"),
  },
  {
    opName: "FromHexContent",
    displayName: "From Hex Content",
    module: "Default",
    factory: lazyFactory("FromHexContent", "Default", "FromHexContent"),
  },
  {
    opName: "FromHexdump",
    displayName: "From Hexdump",
    module: "Default",
    factory: lazyFactory("FromHexdump", "Default", "FromHexdump"),
  },
  {
    opName: "FromHTMLEntity",
    displayName: "From HTML Entity",
    module: "Encodings",
    factory: lazyFactory("FromHTMLEntity", "Encodings", "FromHTMLEntity"),
  },
  {
    opName: "FromMessagePack",
    displayName: "From MessagePack",
    module: "Code",
    factory: lazyFactory("FromMessagePack", "Code", "FromMessagePack"),
  },
  {
    opName: "FromModhex",
    displayName: "From Modhex",
    module: "Default",
    factory: lazyFactory("FromModhex", "Default", "FromModhex"),
  },
  {
    opName: "FromMorseCode",
    displayName: "From Morse Code",
    module: "Default",
    factory: lazyFactory("FromMorseCode", "Default", "FromMorseCode"),
  },
  {
    opName: "FromOctal",
    displayName: "From Octal",
    module: "Default",
    factory: lazyFactory("FromOctal", "Default", "FromOctal"),
  },
  {
    opName: "FromPunycode",
    displayName: "From Punycode",
    module: "Encodings",
    factory: lazyFactory("FromPunycode", "Encodings", "FromPunycode"),
  },
  {
    opName: "FromQuotedPrintable",
    displayName: "From Quoted Printable",
    module: "Default",
    factory: lazyFactory(
      "FromQuotedPrintable",
      "Default",
      "FromQuotedPrintable",
    ),
  },
  {
    opName: "FromRadix",
    displayName: "From Radix",
    module: "Default",
    factory: lazyFactory("FromRadix", "Default", "FromRadix"),
  },
  {
    opName: "FromUNIXTimestamp",
    displayName: "From UNIX Timestamp",
    module: "Default",
    factory: lazyFactory("FromUNIXTimestamp", "Default", "FromUNIXTimestamp"),
  },
  {
    opName: "FuzzyMatch",
    displayName: "Fuzzy Match",
    module: "Default",
    factory: lazyFactory("FuzzyMatch", "Default", "FuzzyMatch"),
  },
  {
    opName: "GenerateAllChecksums",
    displayName: "Generate all checksums",
    module: "Crypto",
    factory: lazyFactory(
      "GenerateAllChecksums",
      "Crypto",
      "GenerateAllChecksums",
    ),
  },
  {
    opName: "GenerateDeBruijnSequence",
    displayName: "Generate De Bruijn Sequence",
    module: "Default",
    factory: lazyFactory(
      "GenerateDeBruijnSequence",
      "Default",
      "GenerateDeBruijnSequence",
    ),
  },
  {
    opName: "GenerateECDSAKeyPair",
    displayName: "Generate ECDSA Key Pair",
    module: "Ciphers",
    factory: lazyFactory(
      "GenerateECDSAKeyPair",
      "Ciphers",
      "GenerateECDSAKeyPair",
    ),
  },
  {
    opName: "GenerateImage",
    displayName: "Generate Image",
    module: "Image",
    factory: lazyFactory("GenerateImage", "Image", "GenerateImage"),
  },
  {
    opName: "GenerateLoremIpsum",
    displayName: "Generate Lorem Ipsum",
    module: "Default",
    factory: lazyFactory("GenerateLoremIpsum", "Default", "GenerateLoremIpsum"),
  },
  {
    opName: "GenerateRSAKeyPair",
    displayName: "Generate RSA Key Pair",
    module: "Ciphers",
    factory: lazyFactory("GenerateRSAKeyPair", "Ciphers", "GenerateRSAKeyPair"),
  },
  {
    opName: "GenerateUUID",
    displayName: "Generate UUID",
    module: "Crypto",
    factory: lazyFactory("GenerateUUID", "Crypto", "GenerateUUID"),
  },
  {
    opName: "GenericCodeBeautify",
    displayName: "Generic Code Beautify",
    module: "Code",
    factory: lazyFactory("GenericCodeBeautify", "Code", "GenericCodeBeautify"),
  },
  {
    opName: "GetAllCasings",
    displayName: "Get All Casings",
    module: "Default",
    factory: lazyFactory("GetAllCasings", "Default", "GetAllCasings"),
  },
  {
    opName: "GetTime",
    displayName: "Get Time",
    module: "Default",
    factory: lazyFactory("GetTime", "Default", "GetTime"),
  },
  {
    opName: "GOSTHash",
    displayName: "GOST Hash",
    module: "Hashing",
    factory: lazyFactory("GOSTHash", "Hashing", "GOSTHash"),
  },
  {
    opName: "GroupIPAddresses",
    displayName: "Group IP addresses",
    module: "Default",
    factory: lazyFactory("GroupIPAddresses", "Default", "GroupIPAddresses"),
  },
  {
    opName: "Gunzip",
    displayName: "Gunzip",
    module: "Compression",
    factory: lazyFactory("Gunzip", "Compression", "Gunzip"),
  },
  {
    opName: "Gzip",
    displayName: "Gzip",
    module: "Compression",
    factory: lazyFactory("Gzip", "Compression", "Gzip"),
  },
  {
    opName: "HammingDistance",
    displayName: "Hamming Distance",
    module: "Default",
    factory: lazyFactory("HammingDistance", "Default", "HammingDistance"),
  },
  {
    opName: "HaversineDistance",
    displayName: "Haversine distance",
    module: "Default",
    factory: lazyFactory("HaversineDistance", "Default", "HaversineDistance"),
  },
  {
    opName: "Head",
    displayName: "Head",
    module: "Default",
    factory: lazyFactory("Head", "Default", "Head"),
  },
  {
    opName: "HeatmapChart",
    displayName: "Heatmap chart",
    module: "Charts",
    factory: lazyFactory("HeatmapChart", "Charts", "HeatmapChart"),
  },
  {
    opName: "HexDensityChart",
    displayName: "Hex Density chart",
    module: "Charts",
    factory: lazyFactory("HexDensityChart", "Charts", "HexDensityChart"),
  },
  {
    opName: "HexToObjectIdentifier",
    displayName: "Hex to Object Identifier",
    module: "PublicKey",
    factory: lazyFactory(
      "HexToObjectIdentifier",
      "PublicKey",
      "HexToObjectIdentifier",
    ),
  },
  {
    opName: "HexToPEM",
    displayName: "Hex to PEM",
    module: "PublicKey",
    factory: lazyFactory("HexToPEM", "PublicKey", "HexToPEM"),
  },
  {
    opName: "HTMLToText",
    displayName: "HTML To Text",
    module: "Default",
    factory: lazyFactory("HTMLToText", "Default", "HTMLToText"),
  },
  {
    opName: "HTTPRequest",
    displayName: "HTTP request",
    module: "Default",
    factory: lazyFactory("HTTPRequest", "Default", "HTTPRequest"),
  },
  {
    opName: "ImageBrightnessContrast",
    displayName: "Image Brightness / Contrast",
    module: "Image",
    factory: lazyFactory(
      "ImageBrightnessContrast",
      "Image",
      "ImageBrightnessContrast",
    ),
  },
  {
    opName: "ImageFilter",
    displayName: "Image Filter",
    module: "Image",
    factory: lazyFactory("ImageFilter", "Image", "ImageFilter"),
  },
  {
    opName: "ImageHueSaturationLightness",
    displayName: "Image Hue/Saturation/Lightness",
    module: "Image",
    factory: lazyFactory(
      "ImageHueSaturationLightness",
      "Image",
      "ImageHueSaturationLightness",
    ),
  },
  {
    opName: "ImageOpacity",
    displayName: "Image Opacity",
    module: "Image",
    factory: lazyFactory("ImageOpacity", "Image", "ImageOpacity"),
  },
  {
    opName: "IndexOfCoincidence",
    displayName: "Index of Coincidence",
    module: "Default",
    factory: lazyFactory("IndexOfCoincidence", "Default", "IndexOfCoincidence"),
  },
  {
    opName: "InvertImage",
    displayName: "Invert Image",
    module: "Image",
    factory: lazyFactory("InvertImage", "Image", "InvertImage"),
  },
  {
    opName: "IPv6TransitionAddresses",
    displayName: "IPv6 Transition Addresses",
    module: "Default",
    factory: lazyFactory(
      "IPv6TransitionAddresses",
      "Default",
      "IPv6TransitionAddresses",
    ),
  },
  {
    opName: "JavaScriptParser",
    displayName: "JavaScript Parser",
    module: "Code",
    factory: lazyFactory("JavaScriptParser", "Code", "JavaScriptParser"),
  },
  {
    opName: "JSONBeautify",
    displayName: "JSON Beautify",
    module: "Code",
    factory: lazyFactory("JSONBeautify", "Code", "JSONBeautify"),
  },
  {
    opName: "JSONMinify",
    displayName: "JSON Minify",
    module: "Code",
    factory: lazyFactory("JSONMinify", "Code", "JSONMinify"),
  },
  {
    opName: "JSONToCSV",
    displayName: "JSON to CSV",
    module: "Default",
    factory: lazyFactory("JSONToCSV", "Default", "JSONToCSV"),
  },
  {
    opName: "JSONtoYAML",
    displayName: "JSON to YAML",
    module: "Default",
    factory: lazyFactory("JSONtoYAML", "Default", "JSONtoYAML"),
  },
  {
    opName: "Jump",
    displayName: "Jump",
    module: "Default",
    factory: lazyFactory("Jump", "Default", "Jump"),
  },
  {
    opName: "JWKToPem",
    displayName: "JWK to PEM",
    module: "PublicKey",
    factory: lazyFactory("JWKToPem", "PublicKey", "JWKToPem"),
  },
  {
    opName: "JWTDecode",
    displayName: "JWT Decode",
    module: "Crypto",
    factory: lazyFactory("JWTDecode", "Crypto", "JWTDecode"),
  },
  {
    opName: "JWTSign",
    displayName: "JWT Sign",
    module: "Crypto",
    factory: lazyFactory("JWTSign", "Crypto", "JWTSign"),
  },
  {
    opName: "JWTVerify",
    displayName: "JWT Verify",
    module: "Crypto",
    factory: lazyFactory("JWTVerify", "Crypto", "JWTVerify"),
  },
  {
    opName: "Keccak",
    displayName: "Keccak",
    module: "Crypto",
    factory: lazyFactory("Keccak", "Crypto", "Keccak"),
  },
  {
    opName: "Label",
    displayName: "Label",
    module: "Default",
    factory: lazyFactory("Label", "Default", "Label"),
  },
  {
    opName: "LevenshteinDistance",
    displayName: "Levenshtein Distance",
    module: "Default",
    factory: lazyFactory(
      "LevenshteinDistance",
      "Default",
      "LevenshteinDistance",
    ),
  },
  {
    opName: "LMHash",
    displayName: "LM Hash",
    module: "Crypto",
    factory: lazyFactory("LMHash", "Crypto", "LMHash"),
  },
  {
    opName: "Lorenz",
    displayName: "Lorenz",
    module: "Bletchley",
    factory: lazyFactory("Lorenz", "Bletchley", "Lorenz"),
  },
  {
    opName: "LS47Decrypt",
    displayName: "LS47 Decrypt",
    module: "Crypto",
    factory: lazyFactory("LS47Decrypt", "Crypto", "LS47Decrypt"),
  },
  {
    opName: "LS47Encrypt",
    displayName: "LS47 Encrypt",
    module: "Crypto",
    factory: lazyFactory("LS47Encrypt", "Crypto", "LS47Encrypt"),
  },
  {
    opName: "LuhnChecksum",
    displayName: "Luhn Checksum",
    module: "Default",
    factory: lazyFactory("LuhnChecksum", "Default", "LuhnChecksum"),
  },
  {
    opName: "LZ4Compress",
    displayName: "LZ4 Compress",
    module: "Compression",
    factory: lazyFactory("LZ4Compress", "Compression", "LZ4Compress"),
  },
  {
    opName: "LZ4Decompress",
    displayName: "LZ4 Decompress",
    module: "Compression",
    factory: lazyFactory("LZ4Decompress", "Compression", "LZ4Decompress"),
  },
  {
    opName: "LZNT1Decompress",
    displayName: "LZNT1 Decompress",
    module: "Compression",
    factory: lazyFactory("LZNT1Decompress", "Compression", "LZNT1Decompress"),
  },
  {
    opName: "LZStringCompress",
    displayName: "LZString Compress",
    module: "Compression",
    factory: lazyFactory("LZStringCompress", "Compression", "LZStringCompress"),
  },
  {
    opName: "LZStringDecompress",
    displayName: "LZString Decompress",
    module: "Compression",
    factory: lazyFactory(
      "LZStringDecompress",
      "Compression",
      "LZStringDecompress",
    ),
  },
  {
    opName: "Magic",
    displayName: "Magic",
    module: "Default",
    factory: lazyFactory("Magic", "Default", "Magic"),
  },
  {
    opName: "Mean",
    displayName: "Mean",
    module: "Default",
    factory: lazyFactory("Mean", "Default", "Mean"),
  },
  {
    opName: "Median",
    displayName: "Median",
    module: "Default",
    factory: lazyFactory("Median", "Default", "Median"),
  },
  {
    opName: "Merge",
    displayName: "Merge",
    module: "Default",
    factory: lazyFactory("Merge", "Default", "Merge"),
  },
  {
    opName: "MicrosoftScriptDecoder",
    displayName: "Microsoft Script Decoder",
    module: "Default",
    factory: lazyFactory(
      "MicrosoftScriptDecoder",
      "Default",
      "MicrosoftScriptDecoder",
    ),
  },
  {
    opName: "MIMEDecoding",
    displayName: "MIME Decoding",
    module: "Default",
    factory: lazyFactory("MIMEDecoding", "Default", "MIMEDecoding"),
  },
  {
    opName: "MultipleBombe",
    displayName: "Multiple Bombe",
    module: "Bletchley",
    factory: lazyFactory("MultipleBombe", "Bletchley", "MultipleBombe"),
  },
  {
    opName: "Multiply",
    displayName: "Multiply",
    module: "Default",
    factory: lazyFactory("Multiply", "Default", "Multiply"),
  },
  {
    opName: "MurmurHash3",
    displayName: "MurmurHash3",
    module: "Hashing",
    factory: lazyFactory("MurmurHash3", "Hashing", "MurmurHash3"),
  },
  {
    opName: "NormaliseImage",
    displayName: "Normalise Image",
    module: "Image",
    factory: lazyFactory("NormaliseImage", "Image", "NormaliseImage"),
  },
  {
    opName: "NormaliseUnicode",
    displayName: "Normalise Unicode",
    module: "Encodings",
    factory: lazyFactory("NormaliseUnicode", "Encodings", "NormaliseUnicode"),
  },
  {
    opName: "NOT",
    displayName: "NOT",
    module: "Default",
    factory: lazyFactory("NOT", "Default", "NOT"),
  },
  {
    opName: "Numberwang",
    displayName: "Numberwang",
    module: "Default",
    factory: lazyFactory("Numberwang", "Default", "Numberwang"),
  },
  {
    opName: "ObjectIdentifierToHex",
    displayName: "Object Identifier to Hex",
    module: "PublicKey",
    factory: lazyFactory(
      "ObjectIdentifierToHex",
      "PublicKey",
      "ObjectIdentifierToHex",
    ),
  },
  {
    opName: "OffsetChecker",
    displayName: "Offset checker",
    module: "Default",
    factory: lazyFactory("OffsetChecker", "Default", "OffsetChecker"),
  },
  {
    opName: "OR",
    displayName: "OR",
    module: "Default",
    factory: lazyFactory("OR", "Default", "OR"),
  },
  {
    opName: "PLISTViewer",
    displayName: "P-list Viewer",
    module: "Default",
    factory: lazyFactory("PLISTViewer", "Default", "PLISTViewer"),
  },
  {
    opName: "PadLines",
    displayName: "Pad lines",
    module: "Default",
    factory: lazyFactory("PadLines", "Default", "PadLines"),
  },
  {
    opName: "ParityBit",
    displayName: "Parity Bit",
    module: "Default",
    factory: lazyFactory("ParityBit", "Default", "ParityBit"),
  },
  {
    opName: "ParseASN1HexString",
    displayName: "Parse ASN.1 hex string",
    module: "PublicKey",
    factory: lazyFactory(
      "ParseASN1HexString",
      "PublicKey",
      "ParseASN1HexString",
    ),
  },
  {
    opName: "ParseColourCode",
    displayName: "Parse colour code",
    module: "Default",
    factory: lazyFactory("ParseColourCode", "Default", "ParseColourCode"),
  },
  {
    opName: "ParseCSR",
    displayName: "Parse CSR",
    module: "PublicKey",
    factory: lazyFactory("ParseCSR", "PublicKey", "ParseCSR"),
  },
  {
    opName: "ParseDateTime",
    displayName: "Parse DateTime",
    module: "Default",
    factory: lazyFactory("ParseDateTime", "Default", "ParseDateTime"),
  },
  {
    opName: "ParseEthernetFrame",
    displayName: "Parse Ethernet frame",
    module: "Default",
    factory: lazyFactory("ParseEthernetFrame", "Default", "ParseEthernetFrame"),
  },
  {
    opName: "ParseIPRange",
    displayName: "Parse IP range",
    module: "Default",
    factory: lazyFactory("ParseIPRange", "Default", "ParseIPRange"),
  },
  {
    opName: "ParseIPv4Header",
    displayName: "Parse IPv4 header",
    module: "Default",
    factory: lazyFactory("ParseIPv4Header", "Default", "ParseIPv4Header"),
  },
  {
    opName: "ParseIPv6Address",
    displayName: "Parse IPv6 address",
    module: "Default",
    factory: lazyFactory("ParseIPv6Address", "Default", "ParseIPv6Address"),
  },
  {
    opName: "ParseObjectIDTimestamp",
    displayName: "Parse ObjectID timestamp",
    module: "Serialise",
    factory: lazyFactory(
      "ParseObjectIDTimestamp",
      "Serialise",
      "ParseObjectIDTimestamp",
    ),
  },
  {
    opName: "ParseSSHHostKey",
    displayName: "Parse SSH Host Key",
    module: "Default",
    factory: lazyFactory("ParseSSHHostKey", "Default", "ParseSSHHostKey"),
  },
  {
    opName: "ParseTCP",
    displayName: "Parse TCP",
    module: "Default",
    factory: lazyFactory("ParseTCP", "Default", "ParseTCP"),
  },
  {
    opName: "ParseTLSRecord",
    displayName: "Parse TLS record",
    module: "Default",
    factory: lazyFactory("ParseTLSRecord", "Default", "ParseTLSRecord"),
  },
  {
    opName: "ParseTLV",
    displayName: "Parse TLV",
    module: "Default",
    factory: lazyFactory("ParseTLV", "Default", "ParseTLV"),
  },
  {
    opName: "ParseUDP",
    displayName: "Parse UDP",
    module: "Default",
    factory: lazyFactory("ParseUDP", "Default", "ParseUDP"),
  },
  {
    opName: "ParseUNIXFilePermissions",
    displayName: "Parse UNIX file permissions",
    module: "Default",
    factory: lazyFactory(
      "ParseUNIXFilePermissions",
      "Default",
      "ParseUNIXFilePermissions",
    ),
  },
  {
    opName: "ParseURI",
    displayName: "Parse URI",
    module: "URL",
    factory: lazyFactory("ParseURI", "URL", "ParseURI"),
  },
  {
    opName: "ParseX509CRL",
    displayName: "Parse X.509 CRL",
    module: "PublicKey",
    factory: lazyFactory("ParseX509CRL", "PublicKey", "ParseX509CRL"),
  },
  {
    opName: "PEMToHex",
    displayName: "PEM to Hex",
    module: "Default",
    factory: lazyFactory("PEMToHex", "Default", "PEMToHex"),
  },
  {
    opName: "PEMToJWK",
    displayName: "PEM to JWK",
    module: "PublicKey",
    factory: lazyFactory("PEMToJWK", "PublicKey", "PEMToJWK"),
  },
  {
    opName: "PHPDeserialize",
    displayName: "PHP Deserialize",
    module: "Default",
    factory: lazyFactory("PHPDeserialize", "Default", "PHPDeserialize"),
  },
  {
    opName: "PHPSerialize",
    displayName: "PHP Serialize",
    module: "Default",
    factory: lazyFactory("PHPSerialize", "Default", "PHPSerialize"),
  },
  {
    opName: "PlayMedia",
    displayName: "Play Media",
    module: "Default",
    factory: lazyFactory("PlayMedia", "Default", "PlayMedia"),
  },
  {
    opName: "PowerSet",
    displayName: "Power Set",
    module: "Default",
    factory: lazyFactory("PowerSet", "Default", "PowerSet"),
  },
  {
    opName: "PseudoRandomIntegerGenerator",
    displayName: "Pseudo-Random Integer Generator",
    module: "Ciphers",
    factory: lazyFactory(
      "PseudoRandomIntegerGenerator",
      "Ciphers",
      "PseudoRandomIntegerGenerator",
    ),
  },
  {
    opName: "PseudoRandomNumberGenerator",
    displayName: "Pseudo-Random Number Generator",
    module: "Ciphers",
    factory: lazyFactory(
      "PseudoRandomNumberGenerator",
      "Ciphers",
      "PseudoRandomNumberGenerator",
    ),
  },
  {
    opName: "PubKeyFromCert",
    displayName: "Public Key from Certificate",
    module: "PublicKey",
    factory: lazyFactory("PubKeyFromCert", "PublicKey", "PubKeyFromCert"),
  },
  {
    opName: "PubKeyFromPrivKey",
    displayName: "Public Key from Private Key",
    module: "PublicKey",
    factory: lazyFactory("PubKeyFromPrivKey", "PublicKey", "PubKeyFromPrivKey"),
  },
  {
    opName: "Rabbit",
    displayName: "Rabbit",
    module: "Ciphers",
    factory: lazyFactory("Rabbit", "Ciphers", "Rabbit"),
  },
  {
    opName: "RailFenceCipherDecode",
    displayName: "Rail Fence Cipher Decode",
    module: "Ciphers",
    factory: lazyFactory(
      "RailFenceCipherDecode",
      "Ciphers",
      "RailFenceCipherDecode",
    ),
  },
  {
    opName: "RailFenceCipherEncode",
    displayName: "Rail Fence Cipher Encode",
    module: "Ciphers",
    factory: lazyFactory(
      "RailFenceCipherEncode",
      "Ciphers",
      "RailFenceCipherEncode",
    ),
  },
  {
    opName: "RAKE",
    displayName: "RAKE",
    module: "Default",
    factory: lazyFactory("RAKE", "Default", "RAKE"),
  },
  {
    opName: "RawDeflate",
    displayName: "Raw Deflate",
    module: "Compression",
    factory: lazyFactory("RawDeflate", "Compression", "RawDeflate"),
  },
  {
    opName: "RawInflate",
    displayName: "Raw Inflate",
    module: "Compression",
    factory: lazyFactory("RawInflate", "Compression", "RawInflate"),
  },
  {
    opName: "RC2Decrypt",
    displayName: "RC2 Decrypt",
    module: "Ciphers",
    factory: lazyFactory("RC2Decrypt", "Ciphers", "RC2Decrypt"),
  },
  {
    opName: "RC2Encrypt",
    displayName: "RC2 Encrypt",
    module: "Ciphers",
    factory: lazyFactory("RC2Encrypt", "Ciphers", "RC2Encrypt"),
  },
  {
    opName: "RC4",
    displayName: "RC4",
    module: "Ciphers",
    factory: lazyFactory("RC4", "Ciphers", "RC4"),
  },
  {
    opName: "RC4Drop",
    displayName: "RC4 Drop",
    module: "Ciphers",
    factory: lazyFactory("RC4Drop", "Ciphers", "RC4Drop"),
  },
  {
    opName: "RC6Decrypt",
    displayName: "RC6 Decrypt",
    module: "Ciphers",
    factory: lazyFactory("RC6Decrypt", "Ciphers", "RC6Decrypt"),
  },
  {
    opName: "RC6Encrypt",
    displayName: "RC6 Encrypt",
    module: "Ciphers",
    factory: lazyFactory("RC6Encrypt", "Ciphers", "RC6Encrypt"),
  },
  {
    opName: "Register",
    displayName: "Register",
    module: "Regex",
    factory: lazyFactory("Register", "Regex", "Register"),
  },
  {
    opName: "RegularExpression",
    displayName: "Regular expression",
    module: "Regex",
    factory: lazyFactory("RegularExpression", "Regex", "RegularExpression"),
  },
  {
    opName: "RemoveDiacritics",
    displayName: "Remove Diacritics",
    module: "Default",
    factory: lazyFactory("RemoveDiacritics", "Default", "RemoveDiacritics"),
  },
  {
    opName: "RemoveEXIF",
    displayName: "Remove EXIF",
    module: "Image",
    factory: lazyFactory("RemoveEXIF", "Image", "RemoveEXIF"),
  },
  {
    opName: "RemoveLineNumbers",
    displayName: "Remove line numbers",
    module: "Default",
    factory: lazyFactory("RemoveLineNumbers", "Default", "RemoveLineNumbers"),
  },
  {
    opName: "RemoveNullBytes",
    displayName: "Remove null bytes",
    module: "Default",
    factory: lazyFactory("RemoveNullBytes", "Default", "RemoveNullBytes"),
  },
  {
    opName: "RemoveWhitespace",
    displayName: "Remove whitespace",
    module: "Default",
    factory: lazyFactory("RemoveWhitespace", "Default", "RemoveWhitespace"),
  },
  {
    opName: "RenderImage",
    displayName: "Render Image",
    module: "Image",
    factory: lazyFactory("RenderImage", "Image", "RenderImage"),
  },
  {
    opName: "RenderMarkdown",
    displayName: "Render Markdown",
    module: "Code",
    factory: lazyFactory("RenderMarkdown", "Code", "RenderMarkdown"),
  },
  {
    opName: "ResizeImage",
    displayName: "Resize Image",
    module: "Image",
    factory: lazyFactory("ResizeImage", "Image", "ResizeImage"),
  },
  {
    opName: "Return",
    displayName: "Return",
    module: "Default",
    factory: lazyFactory("Return", "Default", "Return"),
  },
  {
    opName: "Reverse",
    displayName: "Reverse",
    module: "Default",
    factory: lazyFactory("Reverse", "Default", "Reverse"),
  },
  {
    opName: "RisonDecode",
    displayName: "Rison Decode",
    module: "Encodings",
    factory: lazyFactory("RisonDecode", "Encodings", "RisonDecode"),
  },
  {
    opName: "RisonEncode",
    displayName: "Rison Encode",
    module: "Encodings",
    factory: lazyFactory("RisonEncode", "Encodings", "RisonEncode"),
  },
  {
    opName: "ROT13",
    displayName: "ROT13",
    module: "Default",
    factory: lazyFactory("ROT13", "Default", "ROT13"),
  },
  {
    opName: "ROT13BruteForce",
    displayName: "ROT13 Brute Force",
    module: "Default",
    factory: lazyFactory("ROT13BruteForce", "Default", "ROT13BruteForce"),
  },
  {
    opName: "ROT47",
    displayName: "ROT47",
    module: "Default",
    factory: lazyFactory("ROT47", "Default", "ROT47"),
  },
  {
    opName: "ROT47BruteForce",
    displayName: "ROT47 Brute Force",
    module: "Default",
    factory: lazyFactory("ROT47BruteForce", "Default", "ROT47BruteForce"),
  },
  {
    opName: "ROT8000",
    displayName: "ROT8000",
    module: "Default",
    factory: lazyFactory("ROT8000", "Default", "ROT8000"),
  },
  {
    opName: "RotateImage",
    displayName: "Rotate Image",
    module: "Image",
    factory: lazyFactory("RotateImage", "Image", "RotateImage"),
  },
  {
    opName: "RotateLeft",
    displayName: "Rotate left",
    module: "Default",
    factory: lazyFactory("RotateLeft", "Default", "RotateLeft"),
  },
  {
    opName: "RotateRight",
    displayName: "Rotate right",
    module: "Default",
    factory: lazyFactory("RotateRight", "Default", "RotateRight"),
  },
  {
    opName: "RSADecrypt",
    displayName: "RSA Decrypt",
    module: "Ciphers",
    factory: lazyFactory("RSADecrypt", "Ciphers", "RSADecrypt"),
  },
  {
    opName: "RSAEncrypt",
    displayName: "RSA Encrypt",
    module: "Ciphers",
    factory: lazyFactory("RSAEncrypt", "Ciphers", "RSAEncrypt"),
  },
  {
    opName: "RSASign",
    displayName: "RSA Sign",
    module: "Ciphers",
    factory: lazyFactory("RSASign", "Ciphers", "RSASign"),
  },
  {
    opName: "RSAVerify",
    displayName: "RSA Verify",
    module: "Ciphers",
    factory: lazyFactory("RSAVerify", "Ciphers", "RSAVerify"),
  },
  {
    opName: "Salsa20",
    displayName: "Salsa20",
    module: "Ciphers",
    factory: lazyFactory("Salsa20", "Ciphers", "Salsa20"),
  },
  {
    opName: "ScanForEmbeddedFiles",
    displayName: "Scan for Embedded Files",
    module: "Default",
    factory: lazyFactory(
      "ScanForEmbeddedFiles",
      "Default",
      "ScanForEmbeddedFiles",
    ),
  },
  {
    opName: "ScatterChart",
    displayName: "Scatter chart",
    module: "Charts",
    factory: lazyFactory("ScatterChart", "Charts", "ScatterChart"),
  },
  {
    opName: "Scrypt",
    displayName: "Scrypt",
    module: "Crypto",
    factory: lazyFactory("Scrypt", "Crypto", "Scrypt"),
  },
  {
    opName: "SeriesChart",
    displayName: "Series chart",
    module: "Charts",
    factory: lazyFactory("SeriesChart", "Charts", "SeriesChart"),
  },
  {
    opName: "SetDifference",
    displayName: "Set Difference",
    module: "Default",
    factory: lazyFactory("SetDifference", "Default", "SetDifference"),
  },
  {
    opName: "SetIntersection",
    displayName: "Set Intersection",
    module: "Default",
    factory: lazyFactory("SetIntersection", "Default", "SetIntersection"),
  },
  {
    opName: "SetUnion",
    displayName: "Set Union",
    module: "Default",
    factory: lazyFactory("SetUnion", "Default", "SetUnion"),
  },
  {
    opName: "SHA0",
    displayName: "SHA0",
    module: "Crypto",
    factory: lazyFactory("SHA0", "Crypto", "SHA0"),
  },
  {
    opName: "SHA1",
    displayName: "SHA1",
    module: "Crypto",
    factory: lazyFactory("SHA1", "Crypto", "SHA1"),
  },
  {
    opName: "SHA2",
    displayName: "SHA2",
    module: "Crypto",
    factory: lazyFactory("SHA2", "Crypto", "SHA2"),
  },
  {
    opName: "SHA3",
    displayName: "SHA3",
    module: "Crypto",
    factory: lazyFactory("SHA3", "Crypto", "SHA3"),
  },
  {
    opName: "Shake",
    displayName: "Shake",
    module: "Crypto",
    factory: lazyFactory("Shake", "Crypto", "Shake"),
  },
  {
    opName: "SharpenImage",
    displayName: "Sharpen Image",
    module: "Image",
    factory: lazyFactory("SharpenImage", "Image", "SharpenImage"),
  },
  {
    opName: "ShowBase64Offsets",
    displayName: "Show Base64 offsets",
    module: "Default",
    factory: lazyFactory("ShowBase64Offsets", "Default", "ShowBase64Offsets"),
  },
  {
    opName: "ShowOnMap",
    displayName: "Show on map",
    module: "Hashing",
    factory: lazyFactory("ShowOnMap", "Hashing", "ShowOnMap"),
  },
  {
    opName: "Shuffle",
    displayName: "Shuffle",
    module: "Default",
    factory: lazyFactory("Shuffle", "Default", "Shuffle"),
  },
  {
    opName: "SIGABA",
    displayName: "SIGABA",
    module: "Bletchley",
    factory: lazyFactory("SIGABA", "Bletchley", "SIGABA"),
  },
  {
    opName: "Sleep",
    displayName: "Sleep",
    module: "Default",
    factory: lazyFactory("Sleep", "Default", "Sleep"),
  },
  {
    opName: "SM2Decrypt",
    displayName: "SM2 Decrypt",
    module: "Crypto",
    factory: lazyFactory("SM2Decrypt", "Crypto", "SM2Decrypt"),
  },
  {
    opName: "SM2Encrypt",
    displayName: "SM2 Encrypt",
    module: "Crypto",
    factory: lazyFactory("SM2Encrypt", "Crypto", "SM2Encrypt"),
  },
  {
    opName: "SM3",
    displayName: "SM3",
    module: "Crypto",
    factory: lazyFactory("SM3", "Crypto", "SM3"),
  },
  {
    opName: "SM4Decrypt",
    displayName: "SM4 Decrypt",
    module: "Ciphers",
    factory: lazyFactory("SM4Decrypt", "Ciphers", "SM4Decrypt"),
  },
  {
    opName: "SM4Encrypt",
    displayName: "SM4 Encrypt",
    module: "Ciphers",
    factory: lazyFactory("SM4Encrypt", "Ciphers", "SM4Encrypt"),
  },
  {
    opName: "Snefru",
    displayName: "Snefru",
    module: "Hashing",
    factory: lazyFactory("Snefru", "Hashing", "Snefru"),
  },
  {
    opName: "Sort",
    displayName: "Sort",
    module: "Default",
    factory: lazyFactory("Sort", "Default", "Sort"),
  },
  {
    opName: "Split",
    displayName: "Split",
    module: "Default",
    factory: lazyFactory("Split", "Default", "Split"),
  },
  {
    opName: "SplitColourChannels",
    displayName: "Split Colour Channels",
    module: "Image",
    factory: lazyFactory("SplitColourChannels", "Image", "SplitColourChannels"),
  },
  {
    opName: "SQLBeautify",
    displayName: "SQL Beautify",
    module: "Code",
    factory: lazyFactory("SQLBeautify", "Code", "SQLBeautify"),
  },
  {
    opName: "SQLMinify",
    displayName: "SQL Minify",
    module: "Code",
    factory: lazyFactory("SQLMinify", "Code", "SQLMinify"),
  },
  {
    opName: "SSDEEP",
    displayName: "SSDEEP",
    module: "Crypto",
    factory: lazyFactory("SSDEEP", "Crypto", "SSDEEP"),
  },
  {
    opName: "StandardDeviation",
    displayName: "Standard Deviation",
    module: "Default",
    factory: lazyFactory("StandardDeviation", "Default", "StandardDeviation"),
  },
  {
    opName: "Streebog",
    displayName: "Streebog",
    module: "Hashing",
    factory: lazyFactory("Streebog", "Hashing", "Streebog"),
  },
  {
    opName: "Strings",
    displayName: "Strings",
    module: "Regex",
    factory: lazyFactory("Strings", "Regex", "Strings"),
  },
  {
    opName: "StripHTMLTags",
    displayName: "Strip HTML tags",
    module: "Default",
    factory: lazyFactory("StripHTMLTags", "Default", "StripHTMLTags"),
  },
  {
    opName: "StripHTTPHeaders",
    displayName: "Strip HTTP headers",
    module: "Default",
    factory: lazyFactory("StripHTTPHeaders", "Default", "StripHTTPHeaders"),
  },
  {
    opName: "StripIPv4Header",
    displayName: "Strip IPv4 header",
    module: "Default",
    factory: lazyFactory("StripIPv4Header", "Default", "StripIPv4Header"),
  },
  {
    opName: "StripTCPHeader",
    displayName: "Strip TCP header",
    module: "Default",
    factory: lazyFactory("StripTCPHeader", "Default", "StripTCPHeader"),
  },
  {
    opName: "StripUDPHeader",
    displayName: "Strip UDP header",
    module: "Default",
    factory: lazyFactory("StripUDPHeader", "Default", "StripUDPHeader"),
  },
  {
    opName: "SUB",
    displayName: "SUB",
    module: "Default",
    factory: lazyFactory("SUB", "Default", "SUB"),
  },
  {
    opName: "Subsection",
    displayName: "Subsection",
    module: "Default",
    factory: lazyFactory("Subsection", "Default", "Subsection"),
  },
  {
    opName: "Substitute",
    displayName: "Substitute",
    module: "Default",
    factory: lazyFactory("Substitute", "Default", "Substitute"),
  },
  {
    opName: "Subtract",
    displayName: "Subtract",
    module: "Default",
    factory: lazyFactory("Subtract", "Default", "Subtract"),
  },
  {
    opName: "Sum",
    displayName: "Sum",
    module: "Default",
    factory: lazyFactory("Sum", "Default", "Sum"),
  },
  {
    opName: "SwapCase",
    displayName: "Swap case",
    module: "Default",
    factory: lazyFactory("SwapCase", "Default", "SwapCase"),
  },
  {
    opName: "SwapEndianness",
    displayName: "Swap endianness",
    module: "Default",
    factory: lazyFactory("SwapEndianness", "Default", "SwapEndianness"),
  },
  {
    opName: "SymmetricDifference",
    displayName: "Symmetric Difference",
    module: "Default",
    factory: lazyFactory(
      "SymmetricDifference",
      "Default",
      "SymmetricDifference",
    ),
  },
  {
    opName: "SyntaxHighlighter",
    displayName: "Syntax highlighter",
    module: "Code",
    factory: lazyFactory("SyntaxHighlighter", "Code", "SyntaxHighlighter"),
  },
  {
    opName: "Tail",
    displayName: "Tail",
    module: "Default",
    factory: lazyFactory("Tail", "Default", "Tail"),
  },
  {
    opName: "TakeBytes",
    displayName: "Take bytes",
    module: "Default",
    factory: lazyFactory("TakeBytes", "Default", "TakeBytes"),
  },
  {
    opName: "TakeNthBytes",
    displayName: "Take nth bytes",
    module: "Default",
    factory: lazyFactory("TakeNthBytes", "Default", "TakeNthBytes"),
  },
  {
    opName: "Tar",
    displayName: "Tar",
    module: "Compression",
    factory: lazyFactory("Tar", "Compression", "Tar"),
  },
  {
    opName: "TCPIPChecksum",
    displayName: "TCP/IP Checksum",
    module: "Crypto",
    factory: lazyFactory("TCPIPChecksum", "Crypto", "TCPIPChecksum"),
  },
  {
    opName: "Template",
    displayName: "Template",
    module: "Handlebars",
    factory: lazyFactory("Template", "Handlebars", "Template"),
  },
  {
    opName: "TextEncodingBruteForce",
    displayName: "Text Encoding Brute Force",
    module: "Encodings",
    factory: lazyFactory(
      "TextEncodingBruteForce",
      "Encodings",
      "TextEncodingBruteForce",
    ),
  },
  {
    opName: "TextIntegerConverter",
    displayName: "Text-Integer Conversion",
    module: "Default",
    factory: lazyFactory(
      "TextIntegerConverter",
      "Default",
      "TextIntegerConverter",
    ),
  },
  {
    opName: "ToBase",
    displayName: "To Base",
    module: "Default",
    factory: lazyFactory("ToBase", "Default", "ToBase"),
  },
  {
    opName: "ToBase32",
    displayName: "To Base32",
    module: "Default",
    factory: lazyFactory("ToBase32", "Default", "ToBase32"),
  },
  {
    opName: "ToBase45",
    displayName: "To Base45",
    module: "Default",
    factory: lazyFactory("ToBase45", "Default", "ToBase45"),
  },
  {
    opName: "ToBase58",
    displayName: "To Base58",
    module: "Default",
    factory: lazyFactory("ToBase58", "Default", "ToBase58"),
  },
  {
    opName: "ToBase62",
    displayName: "To Base62",
    module: "Default",
    factory: lazyFactory("ToBase62", "Default", "ToBase62"),
  },
  {
    opName: "ToBase64",
    displayName: "To Base64",
    module: "Default",
    factory: lazyFactory("ToBase64", "Default", "ToBase64"),
  },
  {
    opName: "ToBase85",
    displayName: "To Base85",
    module: "Default",
    factory: lazyFactory("ToBase85", "Default", "ToBase85"),
  },
  {
    opName: "ToBase92",
    displayName: "To Base92",
    module: "Default",
    factory: lazyFactory("ToBase92", "Default", "ToBase92"),
  },
  {
    opName: "ToBCD",
    displayName: "To BCD",
    module: "Default",
    factory: lazyFactory("ToBCD", "Default", "ToBCD"),
  },
  {
    opName: "ToBech32",
    displayName: "To Bech32",
    module: "Default",
    factory: lazyFactory("ToBech32", "Default", "ToBech32"),
  },
  {
    opName: "ToBinary",
    displayName: "To binary",
    module: "Default",
    factory: lazyFactory("ToBinary", "Default", "ToBinary"),
  },
  {
    opName: "ToBraille",
    displayName: "To Braille",
    module: "Default",
    factory: lazyFactory("ToBraille", "Default", "ToBraille"),
  },
  {
    opName: "ToCamelCase",
    displayName: "To camel case",
    module: "Default",
    factory: lazyFactory("ToCamelCase", "Default", "ToCamelCase"),
  },
  {
    opName: "ToCaseInsensitiveRegex",
    displayName: "To case insensitive regex",
    module: "Default",
    factory: lazyFactory(
      "ToCaseInsensitiveRegex",
      "Default",
      "ToCaseInsensitiveRegex",
    ),
  },
  {
    opName: "ToCharcode",
    displayName: "To charcode",
    module: "Default",
    factory: lazyFactory("ToCharcode", "Default", "ToCharcode"),
  },
  {
    opName: "ToDecimal",
    displayName: "To decimal",
    module: "Default",
    factory: lazyFactory("ToDecimal", "Default", "ToDecimal"),
  },
  {
    opName: "ToFloat",
    displayName: "To float",
    module: "Default",
    factory: lazyFactory("ToFloat", "Default", "ToFloat"),
  },
  {
    opName: "ToHex",
    displayName: "To hex",
    module: "Default",
    factory: lazyFactory("ToHex", "Default", "ToHex"),
  },
  {
    opName: "ToHexContent",
    displayName: "To hex content",
    module: "Default",
    factory: lazyFactory("ToHexContent", "Default", "ToHexContent"),
  },
  {
    opName: "ToHexdump",
    displayName: "To hexdump",
    module: "Default",
    factory: lazyFactory("ToHexdump", "Default", "ToHexdump"),
  },
  {
    opName: "ToHTMLEntity",
    displayName: "To HTML entity",
    module: "Default",
    factory: lazyFactory("ToHTMLEntity", "Default", "ToHTMLEntity"),
  },
  {
    opName: "ToKebabCase",
    displayName: "To kebab case",
    module: "Default",
    factory: lazyFactory("ToKebabCase", "Default", "ToKebabCase"),
  },
  {
    opName: "ToLowerCase",
    displayName: "To lower case",
    module: "Default",
    factory: lazyFactory("ToLowerCase", "Default", "ToLowerCase"),
  },
  {
    opName: "ToMessagePack",
    displayName: "To MessagePack",
    module: "Code",
    factory: lazyFactory("ToMessagePack", "Code", "ToMessagePack"),
  },
  {
    opName: "ToModhex",
    displayName: "To Modhex",
    module: "Default",
    factory: lazyFactory("ToModhex", "Default", "ToModhex"),
  },
  {
    opName: "ToMorseCode",
    displayName: "To Morse Code",
    module: "Default",
    factory: lazyFactory("ToMorseCode", "Default", "ToMorseCode"),
  },
  {
    opName: "ToOctal",
    displayName: "To octal",
    module: "Default",
    factory: lazyFactory("ToOctal", "Default", "ToOctal"),
  },
  {
    opName: "ToPunycode",
    displayName: "To Punycode",
    module: "Default",
    factory: lazyFactory("ToPunycode", "Default", "ToPunycode"),
  },
  {
    opName: "ToQuotedPrintable",
    displayName: "To quoted-printable",
    module: "Default",
    factory: lazyFactory("ToQuotedPrintable", "Default", "ToQuotedPrintable"),
  },
  {
    opName: "ToRadix",
    displayName: "To Radix",
    module: "Default",
    factory: lazyFactory("ToRadix", "Default", "ToRadix"),
  },
  {
    opName: "ToSnakeCase",
    displayName: "To snake case",
    module: "Default",
    factory: lazyFactory("ToSnakeCase", "Default", "ToSnakeCase"),
  },
  {
    opName: "ToTable",
    displayName: "To table",
    module: "Default",
    factory: lazyFactory("ToTable", "Default", "ToTable"),
  },
  {
    opName: "ToUNIXTimestamp",
    displayName: "To UNIX Timestamp",
    module: "Default",
    factory: lazyFactory("ToUNIXTimestamp", "Default", "ToUNIXTimestamp"),
  },
  {
    opName: "ToUpperCase",
    displayName: "To upper case",
    module: "Default",
    factory: lazyFactory("ToUpperCase", "Default", "ToUpperCase"),
  },
  {
    opName: "TranslateDateTimeFormat",
    displayName: "Translate DateTime format",
    module: "Default",
    factory: lazyFactory(
      "TranslateDateTimeFormat",
      "Default",
      "TranslateDateTimeFormat",
    ),
  },
  {
    opName: "TripleDESDecrypt",
    displayName: "Triple DES Decrypt",
    module: "Ciphers",
    factory: lazyFactory("TripleDESDecrypt", "Ciphers", "TripleDESDecrypt"),
  },
  {
    opName: "TripleDESEncrypt",
    displayName: "Triple DES Encrypt",
    module: "Ciphers",
    factory: lazyFactory("TripleDESEncrypt", "Ciphers", "TripleDESEncrypt"),
  },
  {
    opName: "Typex",
    displayName: "Typex",
    module: "Bletchley",
    factory: lazyFactory("Typex", "Bletchley", "Typex"),
  },
  {
    opName: "UnescapeString",
    displayName: "Unescape string",
    module: "Default",
    factory: lazyFactory("UnescapeString", "Default", "UnescapeString"),
  },
  {
    opName: "UnescapeUnicodeCharacters",
    displayName: "Unescape Unicode Characters",
    module: "Default",
    factory: lazyFactory(
      "UnescapeUnicodeCharacters",
      "Default",
      "UnescapeUnicodeCharacters",
    ),
  },
  {
    opName: "UnicodeTextFormat",
    displayName: "Unicode Text Format",
    module: "Default",
    factory: lazyFactory("UnicodeTextFormat", "Default", "UnicodeTextFormat"),
  },
  {
    opName: "Unique",
    displayName: "Unique",
    module: "Default",
    factory: lazyFactory("Unique", "Default", "Unique"),
  },
  {
    opName: "UNIXTimestampToWindowsFiletime",
    displayName: "UNIX Timestamp to Windows Filetime",
    module: "Default",
    factory: lazyFactory(
      "UNIXTimestampToWindowsFiletime",
      "Default",
      "UNIXTimestampToWindowsFiletime",
    ),
  },
  {
    opName: "Untar",
    displayName: "Untar",
    module: "Compression",
    factory: lazyFactory("Untar", "Compression", "Untar"),
  },
  {
    opName: "Unzip",
    displayName: "Unzip",
    module: "Compression",
    factory: lazyFactory("Unzip", "Compression", "Unzip"),
  },
  {
    opName: "URLDecode",
    displayName: "URL decode",
    module: "URL",
    factory: lazyFactory("URLDecode", "URL", "URLDecode"),
  },
  {
    opName: "URLEncode",
    displayName: "URL encode",
    module: "URL",
    factory: lazyFactory("URLEncode", "URL", "URLEncode"),
  },
  {
    opName: "VarIntDecode",
    displayName: "VarInt Decode",
    module: "Default",
    factory: lazyFactory("VarIntDecode", "Default", "VarIntDecode"),
  },
  {
    opName: "VarIntEncode",
    displayName: "VarInt Encode",
    module: "Default",
    factory: lazyFactory("VarIntEncode", "Default", "VarIntEncode"),
  },
  {
    opName: "ViewBitPlane",
    displayName: "View Bit Plane",
    module: "Image",
    factory: lazyFactory("ViewBitPlane", "Image", "ViewBitPlane"),
  },
  {
    opName: "VigenèreDecode",
    displayName: "Vigenère Decode",
    module: "Ciphers",
    factory: lazyFactory("VigenèreDecode", "Ciphers", "VigenèreDecode"),
  },
  {
    opName: "VigenèreEncode",
    displayName: "Vigenère Encode",
    module: "Ciphers",
    factory: lazyFactory("VigenèreEncode", "Ciphers", "VigenèreEncode"),
  },
  {
    opName: "Whirlpool",
    displayName: "Whirlpool",
    module: "Hashing",
    factory: lazyFactory("Whirlpool", "Hashing", "Whirlpool"),
  },
  {
    opName: "WindowsFiletimeToUNIXTimestamp",
    displayName: "Windows Filetime to UNIX Timestamp",
    module: "Default",
    factory: lazyFactory(
      "WindowsFiletimeToUNIXTimestamp",
      "Default",
      "WindowsFiletimeToUNIXTimestamp",
    ),
  },
  {
    opName: "Wrap",
    displayName: "Wrap",
    module: "Default",
    factory: lazyFactory("Wrap", "Default", "Wrap"),
  },
  {
    opName: "XKCDRandomNumber",
    displayName: "XKCD Random Number",
    module: "Default",
    factory: lazyFactory("XKCDRandomNumber", "Default", "XKCDRandomNumber"),
  },
  {
    opName: "XMLBeautify",
    displayName: "XML Beautify",
    module: "Default",
    factory: lazyFactory("XMLBeautify", "Default", "XMLBeautify"),
  },
  {
    opName: "XMLMinify",
    displayName: "XML Minify",
    module: "Default",
    factory: lazyFactory("XMLMinify", "Default", "XMLMinify"),
  },
  {
    opName: "XOR",
    displayName: "XOR",
    module: "Default",
    factory: lazyFactory("XOR", "Default", "XOR"),
  },
  {
    opName: "XORBruteForce",
    displayName: "XOR brute force",
    module: "Default",
    factory: lazyFactory("XORBruteForce", "Default", "XORBruteForce"),
  },
  {
    opName: "XORChecksum",
    displayName: "XOR checksum",
    module: "Default",
    factory: lazyFactory("XORChecksum", "Default", "XORChecksum"),
  },
  {
    opName: "XPathExpression",
    displayName: "XPath expression",
    module: "Code",
    factory: lazyFactory("XPathExpression", "Code", "XPathExpression"),
  },
  {
    opName: "XSalsa20",
    displayName: "XSalsa20",
    module: "Ciphers",
    factory: lazyFactory("XSalsa20", "Ciphers", "XSalsa20"),
  },
  {
    opName: "XXTEADecrypt",
    displayName: "XXTEA Decrypt",
    module: "Ciphers",
    factory: lazyFactory("XXTEADecrypt", "Ciphers", "XXTEADecrypt"),
  },
  {
    opName: "XXTEAEncrypt",
    displayName: "XXTEA Encrypt",
    module: "Ciphers",
    factory: lazyFactory("XXTEAEncrypt", "Ciphers", "XXTEAEncrypt"),
  },
  {
    opName: "YAMLToJSON",
    displayName: "YAML to JSON",
    module: "Default",
    factory: lazyFactory("YAMLToJSON", "Default", "YAMLToJSON"),
  },
  {
    opName: "YARARules",
    displayName: "YARA Rules",
    module: "Yara",
    factory: lazyFactory("YARARules", "Yara", "YARARules"),
  },
  {
    opName: "Zip",
    displayName: "Zip",
    module: "Compression",
    factory: lazyFactory("Zip", "Compression", "Zip"),
  },
  {
    opName: "ZlibDeflate",
    displayName: "Zlib deflate",
    module: "Compression",
    factory: lazyFactory("ZlibDeflate", "Compression", "ZlibDeflate"),
  },
  {
    opName: "ZlibInflate",
    displayName: "Zlib inflate",
    module: "Compression",
    factory: lazyFactory("ZlibInflate", "Compression", "ZlibInflate"),
  },
  {
    opName: "Argon2",
    displayName: "Argon2",
    module: "Crypto",
    factory: lazyFactory("Argon2", "Crypto", "Argon2"),
  },
  {
    opName: "Argon2Compare",
    displayName: "Argon2 compare",
    module: "Crypto",
    factory: lazyFactory("Argon2Compare", "Crypto", "Argon2Compare"),
  },
  {
    opName: "Bzip2Compress",
    displayName: "Bzip2 Compress",
    module: "Compression",
    factory: lazyFactory("Bzip2Compress", "Compression", "Bzip2Compress"),
  },
  {
    opName: "Bzip2Decompress",
    displayName: "Bzip2 Decompress",
    module: "Compression",
    factory: lazyFactory("Bzip2Decompress", "Compression", "Bzip2Decompress"),
  },
  {
    opName: "CSSSelector",
    displayName: "CSS selector",
    module: "Code",
    factory: lazyFactory("CSSSelector", "Code", "CSSSelector"),
  },
  {
    opName: "DeriveHKDFKey",
    displayName: "Derive HKDF key",
    module: "Crypto",
    factory: lazyFactory("DeriveHKDFKey", "Crypto", "DeriveHKDFKey"),
  },
  {
    opName: "DisassembleARM",
    displayName: "Disassemble ARM",
    module: "Shellcode",
    factory: lazyFactory("DisassembleARM", "Shellcode", "DisassembleARM"),
  },
  {
    opName: "DisassembleX86",
    displayName: "Disassemble x86",
    module: "Shellcode",
    factory: lazyFactory("DisassembleX86", "Shellcode", "DisassembleX86"),
  },
  {
    opName: "FernetDecrypt",
    displayName: "Fernet Decrypt",
    module: "Default",
    factory: lazyFactory("FernetDecrypt", "Default", "FernetDecrypt"),
  },
  {
    opName: "FernetEncrypt",
    displayName: "Fernet Encrypt",
    module: "Default",
    factory: lazyFactory("FernetEncrypt", "Default", "FernetEncrypt"),
  },
  {
    opName: "FlaskSessionSign",
    displayName: "Flask Session Sign",
    module: "Crypto",
    factory: lazyFactory("FlaskSessionSign", "Crypto", "FlaskSessionSign"),
  },
  {
    opName: "FlaskSessionVerify",
    displayName: "Flask Session Verify",
    module: "Crypto",
    factory: lazyFactory("FlaskSessionVerify", "Crypto", "FlaskSessionVerify"),
  },
  {
    opName: "GOSTDecrypt",
    displayName: "GOST Decrypt",
    module: "Ciphers",
    factory: lazyFactory("GOSTDecrypt", "Ciphers", "GOSTDecrypt"),
  },
  {
    opName: "GOSTEncrypt",
    displayName: "GOST Encrypt",
    module: "Ciphers",
    factory: lazyFactory("GOSTEncrypt", "Ciphers", "GOSTEncrypt"),
  },
  {
    opName: "GOSTKeyUnwrap",
    displayName: "GOST Key Unwrap",
    module: "Ciphers",
    factory: lazyFactory("GOSTKeyUnwrap", "Ciphers", "GOSTKeyUnwrap"),
  },
  {
    opName: "GOSTKeyWrap",
    displayName: "GOST Key Wrap",
    module: "Ciphers",
    factory: lazyFactory("GOSTKeyWrap", "Ciphers", "GOSTKeyWrap"),
  },
  {
    opName: "GOSTSign",
    displayName: "GOST Sign",
    module: "Ciphers",
    factory: lazyFactory("GOSTSign", "Ciphers", "GOSTSign"),
  },
  {
    opName: "GOSTVerify",
    displayName: "GOST Verify",
    module: "Ciphers",
    factory: lazyFactory("GOSTVerify", "Ciphers", "GOSTVerify"),
  },
  {
    opName: "GenerateAllHashes",
    displayName: "Generate all hashes",
    module: "Crypto",
    factory: lazyFactory("GenerateAllHashes", "Crypto", "GenerateAllHashes"),
  },
  {
    opName: "GenerateHOTP",
    displayName: "Generate HOTP",
    module: "Default",
    factory: lazyFactory("GenerateHOTP", "Default", "GenerateHOTP"),
  },
  {
    opName: "GeneratePGPKeyPair",
    displayName: "Generate PGP Key Pair",
    module: "PGP",
    factory: lazyFactory("GeneratePGPKeyPair", "PGP", "GeneratePGPKeyPair"),
  },
  {
    opName: "GenerateQRCode",
    displayName: "Generate QR Code",
    module: "Image",
    factory: lazyFactory("GenerateQRCode", "Image", "GenerateQRCode"),
  },
  {
    opName: "GenerateTOTP",
    displayName: "Generate TOTP",
    module: "Default",
    factory: lazyFactory("GenerateTOTP", "Default", "GenerateTOTP"),
  },
  {
    opName: "HAS160",
    displayName: "HAS-160",
    module: "Crypto",
    factory: lazyFactory("HAS160", "Crypto", "HAS160"),
  },
  {
    opName: "HASSHClientFingerprint",
    displayName: "HASSH Client Fingerprint",
    module: "Crypto",
    factory: lazyFactory(
      "HASSHClientFingerprint",
      "Crypto",
      "HASSHClientFingerprint",
    ),
  },
  {
    opName: "HASSHServerFingerprint",
    displayName: "HASSH Server Fingerprint",
    module: "Crypto",
    factory: lazyFactory(
      "HASSHServerFingerprint",
      "Crypto",
      "HASSHServerFingerprint",
    ),
  },
  {
    opName: "HMAC",
    displayName: "HMAC",
    module: "Crypto",
    factory: lazyFactory("HMAC", "Crypto", "HMAC"),
  },
  {
    opName: "JA3Fingerprint",
    displayName: "JA3 Fingerprint",
    module: "Crypto",
    factory: lazyFactory("JA3Fingerprint", "Crypto", "JA3Fingerprint"),
  },
  {
    opName: "JA3SFingerprint",
    displayName: "JA3S Fingerprint",
    module: "Crypto",
    factory: lazyFactory("JA3SFingerprint", "Crypto", "JA3SFingerprint"),
  },
  {
    opName: "JA4Fingerprint",
    displayName: "JA4 Fingerprint",
    module: "Crypto",
    factory: lazyFactory("JA4Fingerprint", "Crypto", "JA4Fingerprint"),
  },
  {
    opName: "JA4ServerFingerprint",
    displayName: "JA4Server Fingerprint",
    module: "Crypto",
    factory: lazyFactory(
      "JA4ServerFingerprint",
      "Crypto",
      "JA4ServerFingerprint",
    ),
  },
  {
    opName: "JPathExpression",
    displayName: "JPath expression",
    module: "Code",
    factory: lazyFactory("JPathExpression", "Code", "JPathExpression"),
  },
  {
    opName: "JavaScriptBeautify",
    displayName: "JavaScript Beautify",
    module: "Code",
    factory: lazyFactory("JavaScriptBeautify", "Code", "JavaScriptBeautify"),
  },
  {
    opName: "JavaScriptMinify",
    displayName: "JavaScript Minify",
    module: "Code",
    factory: lazyFactory("JavaScriptMinify", "Code", "JavaScriptMinify"),
  },
  {
    opName: "Jq",
    displayName: "Jq",
    module: "Jq",
    factory: lazyFactory("Jq", "Jq", "Jq"),
  },
  {
    opName: "Jsonata",
    displayName: "Jsonata Query",
    module: "Code",
    factory: lazyFactory("Jsonata", "Code", "JsonataQuery"),
  },
  {
    opName: "LZMACompress",
    displayName: "LZMA Compress",
    module: "Compression",
    factory: lazyFactory("LZMACompress", "Compression", "LZMACompress"),
  },
  {
    opName: "LZMADecompress",
    displayName: "LZMA Decompress",
    module: "Compression",
    factory: lazyFactory("LZMADecompress", "Compression", "LZMADecompress"),
  },
  {
    opName: "MD2",
    displayName: "MD2",
    module: "Crypto",
    factory: lazyFactory("MD2", "Crypto", "MD2"),
  },
  {
    opName: "MD4",
    displayName: "MD4",
    module: "Crypto",
    factory: lazyFactory("MD4", "Crypto", "MD4"),
  },
  {
    opName: "MD5",
    displayName: "MD5",
    module: "Crypto",
    factory: lazyFactory("MD5", "Crypto", "MD5"),
  },
  {
    opName: "MD6",
    displayName: "MD6",
    module: "Crypto",
    factory: lazyFactory("MD6", "Crypto", "MD6"),
  },
  {
    opName: "NTHash",
    displayName: "NT Hash",
    module: "Crypto",
    factory: lazyFactory("NTHash", "Crypto", "NTHash"),
  },
  {
    opName: "OpticalCharacterRecognition",
    displayName: "Optical Character Recognition",
    module: "OCR",
    factory: lazyFactory(
      "OpticalCharacterRecognition",
      "OCR",
      "OpticalCharacterRecognition",
    ),
  },
  {
    opName: "PGPDecrypt",
    displayName: "PGP Decrypt",
    module: "PGP",
    factory: lazyFactory("PGPDecrypt", "PGP", "PGPDecrypt"),
  },
  {
    opName: "PGPDecryptAndVerify",
    displayName: "PGP Decrypt and Verify",
    module: "PGP",
    factory: lazyFactory("PGPDecryptAndVerify", "PGP", "PGPDecryptAndVerify"),
  },
  {
    opName: "PGPEncrypt",
    displayName: "PGP Encrypt",
    module: "PGP",
    factory: lazyFactory("PGPEncrypt", "PGP", "PGPEncrypt"),
  },
  {
    opName: "PGPEncryptAndSign",
    displayName: "PGP Encrypt and Sign",
    module: "PGP",
    factory: lazyFactory("PGPEncryptAndSign", "PGP", "PGPEncryptAndSign"),
  },
  {
    opName: "PGPVerify",
    displayName: "PGP Verify",
    module: "PGP",
    factory: lazyFactory("PGPVerify", "PGP", "PGPVerify"),
  },
  {
    opName: "ParseQRCode",
    displayName: "Parse QR Code",
    module: "Image",
    factory: lazyFactory("ParseQRCode", "Image", "ParseQRCode"),
  },
  {
    opName: "ParseUserAgent",
    displayName: "Parse User Agent",
    module: "UserAgent",
    factory: lazyFactory("ParseUserAgent", "UserAgent", "ParseUserAgent"),
  },
  {
    opName: "ParseX509Certificate",
    displayName: "Parse X.509 certificate",
    module: "PublicKey",
    factory: lazyFactory(
      "ParseX509Certificate",
      "PublicKey",
      "ParseX509Certificate",
    ),
  },
  {
    opName: "ProtobufDecode",
    displayName: "Protobuf Decode",
    module: "Protobuf",
    factory: lazyFactory("ProtobufDecode", "Protobuf", "ProtobufDecode"),
  },
  {
    opName: "ProtobufEncode",
    displayName: "Protobuf Encode",
    module: "Protobuf",
    factory: lazyFactory("ProtobufEncode", "Protobuf", "ProtobufEncode"),
  },
  {
    opName: "RIPEMD",
    displayName: "RIPEMD",
    module: "Crypto",
    factory: lazyFactory("RIPEMD", "Crypto", "RIPEMD"),
  },
  {
    opName: "RandomizeColourPalette",
    displayName: "Randomize Colour Palette",
    module: "Image",
    factory: lazyFactory(
      "RandomizeColourPalette",
      "Image",
      "RandomizeColourPalette",
    ),
  },
];

export default registry;

/** O(1) lookup maps by exact and case-insensitive internal/display name. */
const registryMap = new Map<string, (typeof registry)[number]>();
for (const entry of registry) {
  registryMap.set(entry.opName, entry);
  registryMap.set(entry.opName.toLowerCase(), entry);
  registryMap.set(entry.displayName.toLowerCase(), entry);
}

/**
 * Find an operation by opName or displayName.
 * Every supported spelling is resolved in O(1), including display names.
 */
export function findOp(name: string): (typeof registry)[number] | undefined {
  return registryMap.get(name) ?? registryMap.get(name.toLowerCase());
}

/**
 * Returns the full flat list of all registered operations.
 *
 * @returns Every {@link OpMeta} entry in the registry.
 */
export function allOps(): OpMeta[] {
  return registry;
}
