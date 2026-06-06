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
import Stream from "../lib/Stream";

/**
 * TLS Record interface
 */
export interface TLSRecord {
  contentType: TLSField<number>;
  version: TLSField<number>;
  length: TLSField<number>;
  handshake: TLSField<any>;
}

/**
 * TLS Field interface
 */
export interface TLSField<T> {
  description: string;
  length: number;
  data: Uint8Array;
  value: T;
}

/**
 * Parse a TLS Record
 */
export function parseTLSRecord(bytes: Uint8Array): TLSRecord {
  const s = new Stream(bytes);
  const b = s.clone();
  const r: any = {};

  // Content type
  r.contentType = {
    description: "Content Type",
    length: 1,
    data: b.getBytes(1)!,
    value: s.readInt(1)!,
  };
  if (r.contentType.value !== 0x16)
    throw new OperationError("Not handshake data.");

  // Version
  r.version = {
    description: "Protocol Version",
    length: 2,
    data: b.getBytes(2)!,
    value: s.readInt(2)!,
  };

  // Length
  r.length = {
    description: "Record Length",
    length: 2,
    data: b.getBytes(2)!,
    value: s.readInt(2)!,
  };
  if (s.length !== r.length.value + 5)
    throw new OperationError("Incorrect handshake length.");

  // Handshake
  r.handshake = {
    description: "Handshake",
    length: r.length.value,
    data: b.getBytes(r.length.value)!,
    value: parseHandshake(s.getBytes(r.length.value)!),
  };

  return r as TLSRecord;
}

/**
 * Parse a TLS Handshake
 */
export function parseHandshake(bytes: Uint8Array): any {
  const s = new Stream(bytes);
  const b = s.clone();
  const h: any = {};

  // Handshake type
  h.handshakeType = {
    description: "Handshake Type",
    length: 1,
    data: b.getBytes(1)!,
    value: s.readInt(1)!,
  };

  // Handshake length
  h.handshakeLength = {
    description: "Handshake Length",
    length: 3,
    data: b.getBytes(3)!,
    value: s.readInt(3)!,
  };
  if (s.length !== h.handshakeLength.value + 4)
    throw new OperationError("Not enough data in Handshake message.");

  switch (h.handshakeType.value) {
    case 0x01:
      h.handshakeType.description = "Client Hello";
      parseClientHello(s, b, h);
      break;
    case 0x02:
      h.handshakeType.description = "Server Hello";
      parseServerHello(s, b, h);
      break;
    default:
      throw new OperationError("Not a known handshake message.");
  }

  return h;
}

/**
 * Parse a TLS Client Hello
 */
function parseClientHello(s: Stream, b: Stream, h: any): any {
  // Hello version
  h.helloVersion = {
    description: "Client Hello Version",
    length: 2,
    data: b.getBytes(2)!,
    value: s.readInt(2)!,
  };

  // Random
  h.random = {
    description: "Client Random",
    length: 32,
    data: b.getBytes(32)!,
    value: s.getBytes(32)!,
  };

  // Session ID Length
  h.sessionIDLength = {
    description: "Session ID Length",
    length: 1,
    data: b.getBytes(1)!,
    value: s.readInt(1)!,
  };

  // Session ID
  h.sessionID = {
    description: "Session ID",
    length: h.sessionIDLength.value,
    data: b.getBytes(h.sessionIDLength.value)!,
    value: s.getBytes(h.sessionIDLength.value)!,
  };

  // Cipher Suites Length
  h.cipherSuitesLength = {
    description: "Cipher Suites Length",
    length: 2,
    data: b.getBytes(2)!,
    value: s.readInt(2)!,
  };

  // Cipher Suites
  h.cipherSuites = {
    description: "Cipher Suites",
    length: h.cipherSuitesLength.value,
    data: b.getBytes(h.cipherSuitesLength.value)!,
    value: parseCipherSuites(s.getBytes(h.cipherSuitesLength.value)!),
  };

  // Compression Methods Length
  h.compressionMethodsLength = {
    description: "Compression Methods Length",
    length: 1,
    data: b.getBytes(1)!,
    value: s.readInt(1)!,
  };

  // Compression Methods
  h.compressionMethods = {
    description: "Compression Methods",
    length: h.compressionMethodsLength.value,
    data: b.getBytes(h.compressionMethodsLength.value)!,
    value: parseCompressionMethods(
      s.getBytes(h.compressionMethodsLength.value)!,
    ),
  };

  // Extensions Length
  h.extensionsLength = {
    description: "Extensions Length",
    length: 2,
    data: b.getBytes(2)!,
    value: s.readInt(2)!,
  };

  // Extensions
  h.extensions = {
    description: "Extensions",
    length: h.extensionsLength.value,
    data: b.getBytes(h.extensionsLength.value)!,
    value: parseExtensions(s.getBytes(h.extensionsLength.value)!),
  };

  return h;
}

/**
 * Parse a TLS Server Hello
 */
function parseServerHello(s: Stream, b: Stream, h: any): void {
  // Hello version
  h.helloVersion = {
    description: "Server Hello Version",
    length: 2,
    data: b.getBytes(2)!,
    value: s.readInt(2)!,
  };

  // Random
  h.random = {
    description: "Server Random",
    length: 32,
    data: b.getBytes(32)!,
    value: s.getBytes(32)!,
  };

  // Session ID Length
  h.sessionIDLength = {
    description: "Session ID Length",
    length: 1,
    data: b.getBytes(1)!,
    value: s.readInt(1)!,
  };

  // Session ID
  h.sessionID = {
    description: "Session ID",
    length: h.sessionIDLength.value,
    data: b.getBytes(h.sessionIDLength.value)!,
    value: s.getBytes(h.sessionIDLength.value)!,
  };

  // Cipher Suite
  h.cipherSuite = {
    description: "Selected Cipher Suite",
    length: 2,
    data: b.getBytes(2)!,
    value: CIPHER_SUITES_LOOKUP[s.readInt(2)!] || "Unknown",
  };

  // Compression Method
  h.compressionMethod = {
    description: "Selected Compression Method",
    length: 1,
    data: b.getBytes(1)!,
    value: s.readInt(1)!, // TODO: Compression method name here
  };

  // Extensions Length
  h.extensionsLength = {
    description: "Extensions Length",
    length: 2,
    data: b.getBytes(2)!,
    value: s.readInt(2)!,
  };

  // Extensions
  h.extensions = {
    description: "Extensions",
    length: h.extensionsLength.value,
    data: b.getBytes(h.extensionsLength.value)!,
    value: parseExtensions(s.getBytes(h.extensionsLength.value)!),
  };
}

/**
 * Parse Cipher Suites
 */
function parseCipherSuites(bytes: Uint8Array): any[] {
  const s = new Stream(bytes);
  const b = s.clone();
  const cs: any[] = [];

  while (s.hasMore()) {
    cs.push({
      description: "Cipher Suite",
      length: 2,
      data: b.getBytes(2)!,
      value: CIPHER_SUITES_LOOKUP[s.readInt(2)!] || "Unknown",
    });
  }
  return cs;
}

/**
 * Parse Compression Methods
 */
function parseCompressionMethods(bytes: Uint8Array): any[] {
  const s = new Stream(bytes);
  const b = s.clone();
  const cm: any[] = [];

  while (s.hasMore()) {
    cm.push({
      description: "Compression Method",
      length: 1,
      data: b.getBytes(1)!,
      value: s.readInt(1)!, // TODO: Compression method name here
    });
  }
  return cm;
}

/**
 * Parse Extensions
 */
function parseExtensions(bytes: Uint8Array): any[] {
  const s = new Stream(bytes);
  const b = s.clone();

  const exts: any[] = [];
  while (s.hasMore()) {
    const ext: any = {};

    // Type
    ext.type = {
      description: "Extension Type",
      length: 2,
      data: b.getBytes(2)!,
      value: EXTENSION_LOOKUP[s.readInt(2)!] || "unknown",
    };

    // Length
    ext.length = {
      description: "Extension Length",
      length: 2,
      data: b.getBytes(2)!,
      value: s.readInt(2)!,
    };

    // Value
    ext.value = {
      description: "Extension Value",
      length: ext.length.value,
      data: b.getBytes(ext.length.value)!,
      value: s.getBytes(ext.length.value)!,
    };

    exts.push(ext);
  }

  return exts;
}

/**
 * Extension type lookup table
 */
export const EXTENSION_LOOKUP: { [key: number]: string } = {
  0: "server_name",
  1: "max_fragment_length",
  2: "client_certificate_url",
  3: "trusted_ca_keys",
  4: "truncated_hmac",
  5: "status_request",
  6: "user_mapping",
  7: "client_authz",
  8: "server_authz",
  9: "cert_type",
  10: "supported_groups",
  11: "ec_point_formats",
  12: "srp",
  13: "signature_algorithms",
  14: "use_srtp",
  15: "heartbeat",
  16: "application_layer_protocol_negotiation",
  17: "status_request_v2",
  18: "signed_certificate_timestamp",
  19: "client_certificate_type",
  20: "server_certificate_type",
  21: "padding",
  22: "encrypt_then_mac",
  23: "extended_master_secret",
  24: "token_binding",
  25: "cached_info",
  26: "tls_lts",
  27: "compress_certificate",
  28: "record_size_limit",
  29: "pwd_protect",
  30: "pwd_clear",
  31: "password_salt",
  32: "ticket_pinning",
  33: "tls_cert_with_extern_psk",
  34: "delegated_credential",
  35: "session_ticket",
  36: "TLMSP",
  37: "TLMSP_proxying",
  38: "TLMSP_delegate",
  39: "supported_ekt_ciphers",
  40: "Reserved",
  41: "pre_shared_key",
  42: "early_data",
  43: "supported_versions",
  44: "cookie",
  45: "psk_key_exchange_modes",
  46: "Reserved",
  47: "certificate_authorities",
  48: "oid_filters",
  49: "post_handshake_auth",
  50: "signature_algorithms_cert",
  51: "key_share",
  52: "transparency_info",
  53: "connection_id (deprecated)",
  54: "connection_id",
  55: "external_id_hash",
  56: "external_session_id",
  57: "quic_transport_parameters",
  58: "ticket_request",
  59: "dnssec_chain",
  60: "sequence_number_encryption_algorithms",
  61: "rrc",
  2570: "GREASE",
  6682: "GREASE",
  10794: "GREASE",
  14906: "GREASE",
  17513: "application_settings",
  19018: "GREASE",
  23130: "GREASE",
  27242: "GREASE",
  31354: "GREASE",
  35466: "GREASE",
  39578: "GREASE",
  43690: "GREASE",
  47802: "GREASE",
  51914: "GREASE",
  56026: "GREASE",
  60138: "GREASE",
  64250: "GREASE",
  64768: "ech_outer_extensions",
  65037: "encrypted_client_hello",
  65281: "renegotiation_info",
};

/**
 * Cipher suites lookup table
 */
export const CIPHER_SUITES_LOOKUP: { [key: number]: string } = {
  0x0000: "TLS_NULL_WITH_NULL_NULL",
  0x0001: "TLS_RSA_WITH_NULL_MD5",
  0x0002: "TLS_RSA_WITH_NULL_SHA",
  0x0003: "TLS_RSA_EXPORT_WITH_RC4_40_MD5",
  0x0004: "TLS_RSA_WITH_RC4_128_MD5",
  0x0005: "TLS_RSA_WITH_RC4_128_SHA",
  0x0006: "TLS_RSA_EXPORT_WITH_RC2_CBC_40_MD5",
  0x0007: "TLS_RSA_WITH_IDEA_CBC_SHA",
  0x0008: "TLS_RSA_EXPORT_WITH_DES40_CBC_SHA",
  0x0009: "TLS_RSA_WITH_DES_CBC_SHA",
  0x000a: "TLS_RSA_WITH_3DES_EDE_CBC_SHA",
  0x000b: "TLS_DH_DSS_EXPORT_WITH_DES40_CBC_SHA",
  0x000c: "TLS_DH_DSS_WITH_DES_CBC_SHA",
  0x000d: "TLS_DH_DSS_WITH_3DES_EDE_CBC_SHA",
  0x000e: "TLS_DH_RSA_EXPORT_WITH_DES40_CBC_SHA",
  0x000f: "TLS_DH_RSA_WITH_DES_CBC_SHA",
  0x0010: "TLS_DH_RSA_WITH_3DES_EDE_CBC_SHA",
  0x0011: "TLS_DHE_DSS_EXPORT_WITH_DES40_CBC_SHA",
  0x0012: "TLS_DHE_DSS_WITH_DES_CBC_SHA",
  0x0013: "TLS_DHE_DSS_WITH_3DES_EDE_CBC_SHA",
  0x0014: "TLS_DHE_RSA_EXPORT_WITH_DES40_CBC_SHA",
  0x0015: "TLS_DHE_RSA_WITH_DES_CBC_SHA",
  0x0016: "TLS_DHE_RSA_WITH_3DES_EDE_CBC_SHA",
  0x0017: "TLS_DH_anon_EXPORT_WITH_RC4_40_MD5",
  0x0018: "TLS_DH_anon_WITH_RC4_128_MD5",
  0x0019: "TLS_DH_anon_EXPORT_WITH_DES40_CBC_SHA",
  0x001a: "TLS_DH_anon_WITH_DES_CBC_SHA",
  0x001b: "TLS_DH_anon_WITH_3DES_EDE_CBC_SHA",
  0x001e: "TLS_KRB5_WITH_DES_CBC_SHA",
  0x001f: "TLS_KRB5_WITH_3DES_EDE_CBC_SHA",
  0x0020: "TLS_KRB5_WITH_RC4_128_SHA",
  0x0021: "TLS_KRB5_WITH_IDEA_CBC_SHA",
  0x0022: "TLS_KRB5_WITH_DES_CBC_MD5",
  0x0023: "TLS_KRB5_WITH_3DES_EDE_CBC_MD5",
  0x0024: "TLS_KRB5_WITH_RC4_128_MD5",
  0x0025: "TLS_KRB5_WITH_IDEA_CBC_MD5",
  0x0026: "TLS_KRB5_EXPORT_WITH_DES_CBC_40_SHA",
  0x0027: "TLS_KRB5_EXPORT_WITH_RC2_CBC_40_SHA",
  0x0028: "TLS_KRB5_EXPORT_WITH_RC4_40_SHA",
  0x0029: "TLS_KRB5_EXPORT_WITH_DES_CBC_40_MD5",
  0x002a: "TLS_KRB5_EXPORT_WITH_RC2_CBC_40_MD5",
  0x002b: "TLS_KRB5_EXPORT_WITH_RC4_40_MD5",
  0x002c: "TLS_PSK_WITH_NULL_SHA",
  0x002d: "TLS_DHE_PSK_WITH_NULL_SHA",
  0x002e: "TLS_RSA_PSK_WITH_NULL_SHA",
  0x002f: "TLS_RSA_WITH_AES_128_CBC_SHA",
  0x0030: "TLS_DH_DSS_WITH_AES_128_CBC_SHA",
  0x0031: "TLS_DH_RSA_WITH_AES_128_CBC_SHA",
  0x0032: "TLS_DHE_DSS_WITH_AES_128_CBC_SHA",
  0x0033: "TLS_DHE_RSA_WITH_AES_128_CBC_SHA",
  0x0034: "TLS_DH_anon_WITH_AES_128_CBC_SHA",
  0x0035: "TLS_RSA_WITH_AES_256_CBC_SHA",
  0x0036: "TLS_DH_DSS_WITH_AES_256_CBC_SHA",
  0x0037: "TLS_DH_RSA_WITH_AES_256_CBC_SHA",
  0x0038: "TLS_DHE_DSS_WITH_AES_256_CBC_SHA",
  0x0039: "TLS_DHE_RSA_WITH_AES_256_CBC_SHA",
  0x003a: "TLS_DH_anon_WITH_AES_256_CBC_SHA",
  0x003b: "TLS_RSA_WITH_NULL_SHA256",
  0x003c: "TLS_RSA_WITH_AES_128_CBC_SHA256",
  0x003d: "TLS_RSA_WITH_AES_256_CBC_SHA256",
  0x003e: "TLS_DH_DSS_WITH_AES_128_CBC_SHA256",
  0x003f: "TLS_DH_RSA_WITH_AES_128_CBC_SHA256",
  0x0040: "TLS_DHE_DSS_WITH_AES_128_CBC_SHA256",
  0x0041: "TLS_RSA_WITH_CAMELLIA_128_CBC_SHA",
  0x0042: "TLS_DH_DSS_WITH_CAMELLIA_128_CBC_SHA",
  0x0043: "TLS_DH_RSA_WITH_CAMELLIA_128_CBC_SHA",
  0x0044: "TLS_DHE_DSS_WITH_CAMELLIA_128_CBC_SHA",
  0x0045: "TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA",
  0x0046: "TLS_DH_anon_WITH_CAMELLIA_128_CBC_SHA",
  0x0067: "TLS_DHE_RSA_WITH_AES_128_CBC_SHA256",
  0x0068: "TLS_DH_DSS_WITH_AES_256_CBC_SHA256",
  0x0069: "TLS_DH_RSA_WITH_AES_256_CBC_SHA256",
  0x006a: "TLS_DHE_DSS_WITH_AES_256_CBC_SHA256",
  0x006b: "TLS_DHE_RSA_WITH_AES_256_CBC_SHA256",
  0x006c: "TLS_DH_anon_WITH_AES_128_CBC_SHA256",
  0x006d: "TLS_DH_anon_WITH_AES_256_CBC_SHA256",
  0x0084: "TLS_RSA_WITH_CAMELLIA_256_CBC_SHA",
  0x0085: "TLS_DH_DSS_WITH_CAMELLIA_256_CBC_SHA",
  0x0086: "TLS_DH_RSA_WITH_CAMELLIA_256_CBC_SHA",
  0x0087: "TLS_DHE_DSS_WITH_CAMELLIA_256_CBC_SHA",
  0x0088: "TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA",
  0x0089: "TLS_DH_anon_WITH_CAMELLIA_256_CBC_SHA",
  0x008a: "TLS_PSK_WITH_RC4_128_SHA",
  0x008b: "TLS_PSK_WITH_3DES_EDE_CBC_SHA",
  0x008c: "TLS_PSK_WITH_AES_128_CBC_SHA",
  0x008d: "TLS_PSK_WITH_AES_256_CBC_SHA",
  0x008e: "TLS_DHE_PSK_WITH_RC4_128_SHA",
  0x008f: "TLS_DHE_PSK_WITH_3DES_EDE_CBC_SHA",
  0x0090: "TLS_DHE_PSK_WITH_AES_128_CBC_SHA",
  0x0091: "TLS_DHE_PSK_WITH_AES_256_CBC_SHA",
  0x0092: "TLS_RSA_PSK_WITH_RC4_128_SHA",
  0x0093: "TLS_RSA_PSK_WITH_3DES_EDE_CBC_SHA",
  0x0094: "TLS_RSA_PSK_WITH_AES_128_CBC_SHA",
  0x0095: "TLS_RSA_PSK_WITH_AES_256_CBC_SHA",
  0x0096: "TLS_RSA_WITH_SEED_CBC_SHA",
  0x0097: "TLS_DH_DSS_WITH_SEED_CBC_SHA",
  0x0098: "TLS_DH_RSA_WITH_SEED_CBC_SHA",
  0x0099: "TLS_DHE_DSS_WITH_SEED_CBC_SHA",
  0x009a: "TLS_DHE_RSA_WITH_SEED_CBC_SHA",
  0x009b: "TLS_DH_anon_WITH_SEED_CBC_SHA",
  0x009c: "TLS_RSA_WITH_AES_128_GCM_SHA256",
  0x009d: "TLS_RSA_WITH_AES_256_GCM_SHA384",
  0x009e: "TLS_DHE_RSA_WITH_AES_128_GCM_SHA256",
  0x009f: "TLS_DHE_RSA_WITH_AES_256_GCM_SHA384",
  0x00a0: "TLS_DH_RSA_WITH_AES_128_GCM_SHA256",
  0x00a1: "TLS_DH_RSA_WITH_AES_256_GCM_SHA384",
  0x00a2: "TLS_DHE_DSS_WITH_AES_128_GCM_SHA256",
  0x00a3: "TLS_DHE_DSS_WITH_AES_256_GCM_SHA384",
  0x00a4: "TLS_DH_DSS_WITH_AES_128_GCM_SHA256",
  0x00a5: "TLS_DH_DSS_WITH_AES_256_GCM_SHA384",
  0x00a6: "TLS_DH_anon_WITH_AES_128_GCM_SHA256",
  0x00a7: "TLS_DH_anon_WITH_AES_256_GCM_SHA384",
  0x00a8: "TLS_PSK_WITH_AES_128_GCM_SHA256",
  0x00a9: "TLS_PSK_WITH_AES_256_GCM_SHA384",
  0x00aa: "TLS_DHE_PSK_WITH_AES_128_GCM_SHA256",
  0x00ab: "TLS_DHE_PSK_WITH_AES_256_GCM_SHA384",
  0x00ac: "TLS_RSA_PSK_WITH_AES_128_GCM_SHA256",
  0x00ad: "TLS_RSA_PSK_WITH_AES_256_GCM_SHA384",
  0x00ae: "TLS_PSK_WITH_AES_128_CBC_SHA256",
  0x00af: "TLS_PSK_WITH_AES_256_CBC_SHA384",
  0x00b0: "TLS_PSK_WITH_NULL_SHA256",
  0x00b1: "TLS_PSK_WITH_NULL_SHA384",
  0x00b2: "TLS_DHE_PSK_WITH_AES_128_CBC_SHA256",
  0x00b3: "TLS_DHE_PSK_WITH_AES_256_CBC_SHA384",
  0x00b4: "TLS_DHE_PSK_WITH_NULL_SHA256",
  0x00b5: "TLS_DHE_PSK_WITH_NULL_SHA384",
  0x00b6: "TLS_RSA_PSK_WITH_AES_128_CBC_SHA256",
  0x00b7: "TLS_RSA_PSK_WITH_AES_256_CBC_SHA384",
  0x00b8: "TLS_RSA_PSK_WITH_NULL_SHA256",
  0x00b9: "TLS_RSA_PSK_WITH_NULL_SHA384",
  0x00ba: "TLS_RSA_WITH_CAMELLIA_128_CBC_SHA256",
  0x00bb: "TLS_DH_DSS_WITH_CAMELLIA_128_CBC_SHA256",
  0x00bc: "TLS_DH_RSA_WITH_CAMELLIA_128_CBC_SHA256",
  0x00bd: "TLS_DHE_DSS_WITH_CAMELLIA_128_CBC_SHA256",
  0x00be: "TLS_DHE_RSA_WITH_CAMELLIA_128_CBC_SHA256",
  0x00bf: "TLS_DH_anon_WITH_CAMELLIA_128_CBC_SHA256",
  0x00c0: "TLS_RSA_WITH_CAMELLIA_256_CBC_SHA256",
  0x00c1: "TLS_DH_DSS_WITH_CAMELLIA_256_CBC_SHA256",
  0x00c2: "TLS_DH_RSA_WITH_CAMELLIA_256_CBC_SHA256",
  0x00c3: "TLS_DHE_DSS_WITH_CAMELLIA_256_CBC_SHA256",
  0x00c4: "TLS_DHE_RSA_WITH_CAMELLIA_256_CBC_SHA256",
  0x00c5: "TLS_DH_anon_WITH_CAMELLIA_256_CBC_SHA256",
  0x00c6: "TLS_SM4_GCM_SM3",
  0x00c7: "TLS_SM4_CCM_SM3",
  0x00ff: "TLS_EMPTY_RENEGOTIATION_INFO_SCSV",
  0x0a0a: "GREASE",
  0x1301: "TLS_AES_128_GCM_SHA256",
  0x1302: "TLS_AES_256_GCM_SHA384",
  0x1303: "TLS_CHACHA20_POLY1305_SHA256",
  0x1304: "TLS_AES_128_CCM_SHA256",
  0x1305: "TLS_AES_128_CCM_8_SHA256",
  0x1306: "TLS_AEGIS_256_SHA512",
  0x1307: "TLS_AEGIS_128L_SHA256",
  0x1a1a: "GREASE",
  0x2a2a: "GREASE",
  0x3a3a: "GREASE",
  0x4a4a: "GREASE",
  0x5600: "TLS_FALLBACK_SCSV",
  0x5a5a: "GREASE",
  0x6a6a: "GREASE",
  0x7a7a: "GREASE",
  0x8a8a: "GREASE",
  0x9a9a: "GREASE",
  0xaaaa: "GREASE",
  0xbaba: "GREASE",
  0xc001: "TLS_ECDH_ECDSA_WITH_NULL_SHA",
  0xc002: "TLS_ECDH_ECDSA_WITH_RC4_128_SHA",
  0xc003: "TLS_ECDH_ECDSA_WITH_3DES_EDE_CBC_SHA",
  0xc004: "TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA",
  0xc005: "TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA",
  0xc006: "TLS_ECDHE_ECDSA_WITH_NULL_SHA",
  0xc007: "TLS_ECDHE_ECDSA_WITH_RC4_128_SHA",
  0xc008: "TLS_ECDHE_ECDSA_WITH_3DES_EDE_CBC_SHA",
  0xc009: "TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA",
  0xc00a: "TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA",
  0xc00b: "TLS_ECDH_RSA_WITH_NULL_SHA",
  0xc00c: "TLS_ECDH_RSA_WITH_RC4_128_SHA",
  0xc00d: "TLS_ECDH_RSA_WITH_3DES_EDE_CBC_SHA",
  0xc00e: "TLS_ECDH_RSA_WITH_AES_128_CBC_SHA",
  0xc00f: "TLS_ECDH_RSA_WITH_AES_256_CBC_SHA",
  0xc010: "TLS_ECDHE_RSA_WITH_NULL_SHA",
  0xc011: "TLS_ECDHE_RSA_WITH_RC4_128_SHA",
  0xc012: "TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA",
  0xc013: "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA",
  0xc014: "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA",
  0xc015: "TLS_ECDH_anon_WITH_NULL_SHA",
  0xc016: "TLS_ECDH_anon_WITH_RC4_128_SHA",
  0xc017: "TLS_ECDH_anon_WITH_3DES_EDE_CBC_SHA",
  0xc018: "TLS_ECDH_anon_WITH_AES_128_CBC_SHA",
  0xc019: "TLS_ECDH_anon_WITH_AES_256_CBC_SHA",
  0xc01a: "TLS_SRP_SHA_WITH_3DES_EDE_CBC_SHA",
  0xc01b: "TLS_SRP_SHA_RSA_WITH_3DES_EDE_CBC_SHA",
  0xc01c: "TLS_SRP_SHA_DSS_WITH_3DES_EDE_CBC_SHA",
  0xc01d: "TLS_SRP_SHA_WITH_AES_128_CBC_SHA",
  0xc01e: "TLS_SRP_SHA_RSA_WITH_AES_128_CBC_SHA",
  0xc01f: "TLS_SRP_SHA_DSS_WITH_AES_128_CBC_SHA",
  0xc020: "TLS_SRP_SHA_WITH_AES_256_CBC_SHA",
  0xc021: "TLS_SRP_SHA_RSA_WITH_AES_256_CBC_SHA",
  0xc022: "TLS_SRP_SHA_DSS_WITH_AES_256_CBC_SHA",
  0xc023: "TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256",
  0xc024: "TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA384",
  0xc025: "TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA256",
  0xc026: "TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA384",
  0xc027: "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256",
  0xc028: "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384",
  0xc029: "TLS_ECDH_RSA_WITH_AES_128_CBC_SHA256",
  0xc02a: "TLS_ECDH_RSA_WITH_AES_256_CBC_SHA384",
  0xc02b: "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256",
  0xc02c: "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384",
  0xc02d: "TLS_ECDH_ECDSA_WITH_AES_128_GCM_SHA256",
  0xc02e: "TLS_ECDH_ECDSA_WITH_AES_256_GCM_SHA384",
  0xc02f: "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
  0xc030: "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
  0xc031: "TLS_ECDH_RSA_WITH_AES_128_GCM_SHA256",
  0xc032: "TLS_ECDH_RSA_WITH_AES_256_GCM_SHA384",
  0xc033: "TLS_ECDHE_PSK_WITH_RC4_128_SHA",
  0xc034: "TLS_ECDHE_PSK_WITH_3DES_EDE_CBC_SHA",
  0xc035: "TLS_ECDHE_PSK_WITH_AES_128_CBC_SHA",
  0xc036: "TLS_ECDHE_PSK_WITH_AES_256_CBC_SHA",
  0xc037: "TLS_ECDHE_PSK_WITH_AES_128_CBC_SHA256",
  0xc038: "TLS_ECDHE_PSK_WITH_AES_256_CBC_SHA384",
  0xc039: "TLS_ECDHE_PSK_WITH_NULL_SHA",
  0xc03a: "TLS_ECDHE_PSK_WITH_NULL_SHA256",
  0xc03b: "TLS_ECDHE_PSK_WITH_NULL_SHA384",
  0xc03c: "TLS_RSA_WITH_ARIA_128_CBC_SHA256",
  0xc03d: "TLS_RSA_WITH_ARIA_256_CBC_SHA384",
  0xc03e: "TLS_DH_DSS_WITH_ARIA_128_CBC_SHA256",
  0xc03f: "TLS_DH_DSS_WITH_ARIA_256_CBC_SHA384",
  0xc040: "TLS_DH_RSA_WITH_ARIA_128_CBC_SHA256",
  0xc041: "TLS_DH_RSA_WITH_ARIA_256_CBC_SHA384",
  0xc042: "TLS_DHE_DSS_WITH_ARIA_128_CBC_SHA256",
  0xc043: "TLS_DHE_DSS_WITH_ARIA_256_CBC_SHA384",
  0xc044: "TLS_DHE_RSA_WITH_ARIA_128_CBC_SHA256",
  0xc045: "TLS_DHE_RSA_WITH_ARIA_256_CBC_SHA384",
  0xc046: "TLS_DH_anon_WITH_ARIA_128_CBC_SHA256",
  0xc047: "TLS_DH_anon_WITH_ARIA_256_CBC_SHA384",
  0xc048: "TLS_ECDHE_ECDSA_WITH_ARIA_128_CBC_SHA256",
  0xc049: "TLS_ECDHE_ECDSA_WITH_ARIA_256_CBC_SHA384",
  0xc04a: "TLS_ECDH_ECDSA_WITH_ARIA_128_CBC_SHA256",
  0xc04b: "TLS_ECDH_ECDSA_WITH_ARIA_256_CBC_SHA384",
  0xc04c: "TLS_ECDHE_RSA_WITH_ARIA_128_CBC_SHA256",
  0xc04d: "TLS_ECDHE_RSA_WITH_ARIA_256_CBC_SHA384",
  0xc04e: "TLS_ECDH_RSA_WITH_ARIA_128_CBC_SHA256",
  0xc04f: "TLS_ECDH_RSA_WITH_ARIA_256_CBC_SHA384",
  0xcca8: "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256",
  0xcca9: "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256",
  0xccaa: "TLS_DHE_RSA_WITH_CHACHA20_POLY1305_SHA256",
  0xccab: "TLS_PSK_WITH_CHACHA20_POLY1305_SHA256",
  0xccac: "TLS_ECDHE_PSK_WITH_CHACHA20_POLY1305_SHA256",
  0xccad: "TLS_DHE_PSK_WITH_CHACHA20_POLY1305_SHA256",
  0xccae: "TLS_RSA_PSK_WITH_CHACHA20_POLY1305_SHA256",
  0xd001: "TLS_ECDHE_PSK_WITH_AES_128_GCM_SHA256",
  0xd002: "TLS_ECDHE_PSK_WITH_AES_256_GCM_SHA384",
  0xd003: "TLS_ECDHE_PSK_WITH_AES_128_CCM_8_SHA256",
  0xd005: "TLS_ECDHE_PSK_WITH_AES_128_CCM_SHA256",
};

/**
 * GREASE values
 */
export const GREASE_VALUES: number[] = [
  0x0a0a, 0x1a1a, 0x2a2a, 0x3a3a, 0x4a4a, 0x5a5a, 0x6a6a, 0x7a7a, 0x8a8a,
  0x9a9a, 0xaaaa, 0xbaba, 0xcaca, 0xdada, 0xeaea, 0xfafa,
];

/**
 * Parses the supported_versions extension and returns the highest supported version.
 */
export function parseHighestSupportedVersion(bytes: Uint8Array): number {
  const s = new Stream(bytes);

  // The Server Hello supported_versions extension simply contains the chosen version
  if (s.length === 2) {
    return s.readInt(2)!;
  }

  // Length
  let i = s.readInt(1)!;

  let highestVersion = 0;
  while (s.hasMore() && i > 0) {
    const v = s.readInt(2)!;
    i -= 2; // Each version is 2 bytes
    if (GREASE_VALUES.includes(v)) continue;
    if (v > highestVersion) highestVersion = v;
  }

  return highestVersion;
}

/**
 * Parses the application_layer_protocol_negotiation extension and returns the first value as raw bytes.
 */
export function parseFirstALPNValue(bytes: Uint8Array): Uint8Array | null {
  const s = new Stream(bytes);
  if (s.length < 2) return null;
  const alpnExtLen = s.readInt(2)!;
  if (alpnExtLen < 2) return null;
  if (!s.hasMore()) return null;
  const strLen = s.readInt(1)!;
  if (strLen < 1) return null;
  if (s.length < s.position + strLen) return null;
  return s.getBytes(strLen)!;
}
