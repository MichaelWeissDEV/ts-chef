// Ambient module declarations for npm packages without @types

declare module "jsqr" {
  interface QRCode {
    data: string;
    binaryData: number[];
    chunks: unknown[];
    location: {
      topRightCorner: { x: number; y: number };
      topLeftCorner: { x: number; y: number };
      bottomRightCorner: { x: number; y: number };
      bottomLeftCorner: { x: number; y: number };
    };
  }
  export default function jsQR(
    data: Uint8ClampedArray | Uint8Array,
    width: number,
    height: number,
    options?: { inversionAttempts?: string },
  ): QRCode | null;
}

declare module "qr-image" {
  interface QRImageOptions {
    type?: "png" | "svg" | "eps" | "pdf";
    size?: number;
    margin?: number;
    ec_level?: "L" | "M" | "Q" | "H";
    customize?: (canvas: unknown) => void;
  }
  export function image(
    text: string,
    options?: QRImageOptions,
  ): NodeJS.ReadableStream;
  export function imageSync(text: string, options?: QRImageOptions): Buffer;
  export function svgObject(
    text: string,
    options?: QRImageOptions,
  ): { size: number; path: string };
  export function matrix(text: string, ec_level?: string): boolean[][];
}

declare module "protobufjs" {
  export interface ParseResult {
    root: Root;
    package?: string;
    imports?: string[];
    weakImports?: string[];
    syntax?: string;
  }
  export class Root {
    static fromDescriptor(descriptor: unknown): Root;
    lookup(path: string): unknown;
    lookupType(path: string): Type;
    nestedArray: Array<Type | Enum | Namespace | unknown>;
    nested: Record<string, Root | Type | Enum | Namespace | unknown>;
    add(obj: unknown): Root;
  }
  export class Namespace extends Root {
    name: string;
  }
  export class Type extends Namespace {
    name: string;
    fields: Record<string, Field>;
    fieldsArray: Field[];
    decode(data: Uint8Array | number[]): Message;
    encode(message: Record<string, unknown>): Writer;
    fromObject(obj: Record<string, unknown>): Message;
    toObject(msg: Message, opts?: unknown): Record<string, unknown>;
  }
  export class Enum extends Namespace {
    name: string;
    values: Record<string, number>;
  }
  export class Field {
    constructor(
      name: string,
      id: number,
      type: string,
      rule?: string,
      extend?: string,
      options?: Record<string, unknown>,
    );
    name: string;
    id: number;
    type: string;
    rule?: string;
    resolve(): Field;
  }
  export class Writer {
    finish(): Uint8Array;
  }
  export class Message {
    toJSON(): Record<string, unknown>;
    [key: string]: unknown;
  }
  export function parse(
    protoSource: string,
    root?: Root,
    options?: unknown,
  ): ParseResult;
  export function load(
    filename: string,
    callback: (err: Error | null, root: Root) => void,
  ): void;
  export function loadSync(filename: string): Root;
  export namespace util {
    const base64: {
      decode(str: string, buffer: Uint8Array, offset: number): number;
      encode(buffer: Uint8Array | number[], start: number, end: number): string;
      length(str: string): number;
    };
  }
}

declare module "jsesc" {
  interface JsescOptions {
    quotes?: "single" | "double" | "backtick";
    wrap?: boolean;
    es6?: boolean;
    escapeEverything?: boolean;
    compact?: boolean;
    lowercaseHex?: boolean;
    base?: 2 | 8 | 10 | 16;
    numbers?: "binary" | "octal" | "decimal" | "hexadecimal";
    indent?: string;
    indentLevel?: number;
    json?: boolean;
    isScriptContext?: boolean;
  }
  function jsesc(
    input: string | number | Record<string, unknown> | unknown[],
    options?: JsescOptions,
  ): string;
  export = jsesc;
}

declare module "exif-parser" {
  interface ExifResult {
    tags: Record<string, unknown>;
    imageSize?: { width: number; height: number };
    hasThumbnail?: boolean;
  }
  interface ExifParser {
    parse(): ExifResult;
    enableSimpleValues(enabled: boolean): ExifParser;
    enableTagNames(enabled: boolean): ExifParser;
    enableImageSize(enabled: boolean): ExifParser;
    enableBinaryFields(enabled: boolean): ExifParser;
    enableReturnTags(enabled: boolean): ExifParser;
    enablePointers(enabled: boolean): ExifParser;
    enableExtractThumbnail(enabled: boolean): ExifParser;
  }
  function create(buffer: Buffer | ArrayBuffer): ExifParser;
  export = { create };
}

declare module "punycode.js" {
  export function decode(string: string): string;
  export function encode(string: string): string;
  export function toUnicode(input: string): string;
  export function toASCII(input: string): string;
  export const ucs2: {
    decode(string: string): number[];
    encode(codePoints: number[]): string;
  };
}

declare module "zlibjs/bin/gzip.min.js" {
  interface GzipOptions {
    deflateOptions?: { compressionType?: number };
    flags?: {
      fhcrc?: boolean;
      fname?: boolean;
      comment?: boolean;
      fextra?: boolean;
    };
    filename?: string;
    comment?: string;
  }
  class Gzip {
    constructor(data: Uint8Array, options?: GzipOptions);
    compress(): Uint8Array;
    onend: ((data: Uint8Array) => void) | null;
  }
  const Zlib: { Gzip: typeof Gzip };
  export { Gzip, Zlib };
  const _default: { Zlib: { Gzip: typeof Gzip } };
  export default _default;
}

declare module "zlibjs/bin/rawdeflate.min.js" {
  interface RawDeflateOptions {
    compressionType?: number;
  }
  class RawDeflate {
    constructor(data: Uint8Array, options?: RawDeflateOptions);
    compress(): Uint8Array;
    static CompressionType: { FIXED: number; DYNAMIC: number; NONE: number };
  }
  namespace Zlib {
    class RawDeflate {
      constructor(data: Uint8Array, options?: RawDeflateOptions);
      compress(): Uint8Array;
      static CompressionType: { FIXED: number; DYNAMIC: number; NONE: number };
    }
  }
  const _default: { Zlib: typeof Zlib };
  export { RawDeflate, Zlib };
  export default _default;
}

declare module "zlibjs/bin/rawinflate.min.js" {
  interface RawInflateOptions {
    index?: number;
    bufferSize?: number;
    bufferType?: number;
    resize?: boolean;
    verify?: boolean;
  }
  class RawInflate {
    constructor(data: Uint8Array, options?: RawInflateOptions);
    decompress(): Uint8Array;
    static BufferType: { ADAPTIVE: number; BLOCK: number };
  }
  namespace Zlib {
    class RawInflate {
      constructor(data: Uint8Array, options?: RawInflateOptions);
      decompress(): Uint8Array;
      static BufferType: { ADAPTIVE: number; BLOCK: number };
    }
  }
  const _default: { Zlib: typeof Zlib };
  export { RawInflate, Zlib };
  export default _default;
}

declare module "ntlm" {
  export function lmhash(password: string): Buffer;
  export function nthash(password: string): Buffer;
  export function createMessage1(options: Record<string, unknown>): Buffer;
  export function createMessage3(options: Record<string, unknown>): Buffer;
  export function parseMessage2(buffer: Buffer): Record<string, unknown>;
}

declare module "lz4js" {
  export function compress(
    src: Uint8Array | Buffer,
    maxSize?: number,
  ): Uint8Array;
  export function decompress(
    src: Uint8Array | Buffer,
    maxSize?: number,
  ): Uint8Array;
  export const tableSize: number;
  export const bufferSize: number;
}

declare module "fernet" {
  class Secret {
    constructor(key: string);
    signingKey: Buffer;
    encryptionKey: Buffer;
  }
  interface TokenOptions {
    secret?: Secret;
    token?: string;
    time?: Date;
    iv?: Buffer;
    message?: string;
  }
  class Token {
    constructor(options: TokenOptions);
    encode(message: string): string;
    decode(): string;
    secret: Secret;
    time: Date;
  }
  export { Secret, Token };
}

declare module "jsonpath-plus" {
  interface JSONPathOptions {
    path: string;
    json: unknown;
    resultType?: "value" | "pointer" | "parent" | "path" | "all";
    flatten?: boolean;
    preventEval?: boolean;
    wrap?: boolean;
    sandbox?: Record<string, unknown>;
    callback?: (payload: unknown) => void;
  }
  export function JSONPath(options: JSONPathOptions): unknown[];
  export function JSONPath(path: string, json: unknown): unknown[];
}

declare module "jsonata" {
  interface JSONataExpression {
    evaluate(
      data: unknown,
      bindings?: Record<string, unknown>,
    ): Promise<unknown>;
    assign(name: string, value: unknown): void;
    registerFunction(
      name: string,
      implementation: (...args: unknown[]) => unknown,
      signature?: string,
    ): void;
  }
  function jsonata(expression: string): JSONataExpression;
  export = jsonata;
}

declare module "yaml" {
  export function parse(
    str: string,
    options?: Record<string, unknown>,
  ): unknown;
  export function stringify(
    value: unknown,
    options?: Record<string, unknown>,
  ): string;
  export function parseDocument(
    str: string,
    options?: Record<string, unknown>,
  ): unknown;
  export function parseAllDocuments(
    str: string,
    options?: Record<string, unknown>,
  ): unknown[];
}

declare module "otpauth" {
  interface TOTPOptions {
    issuer?: string;
    label?: string;
    algorithm?: string;
    digits?: number;
    period?: number;
    secret?: Secret;
  }
  interface HOTPOptions {
    issuer?: string;
    label?: string;
    algorithm?: string;
    digits?: number;
    counter?: number;
    secret?: Secret;
  }
  class Secret {
    constructor(options?: { size?: number });
    static fromBase32(str: string): Secret;
    static fromHex(str: string): Secret;
    base32: string;
    hex: string;
    buffer: ArrayBuffer;
  }
  class TOTP {
    constructor(options?: TOTPOptions);
    generate(options?: { timestamp?: number }): string;
    validate(options: {
      token: string;
      timestamp?: number;
      window?: number;
    }): number | null;
    readonly issuer: string;
    readonly label: string;
    readonly algorithm: string;
    readonly digits: number;
    readonly period: number;
    readonly secret: Secret;
  }
  class HOTP {
    constructor(options?: HOTPOptions);
    generate(options?: { counter?: number }): string;
    validate(options: {
      token: string;
      counter?: number;
      window?: number;
    }): number | null;
    readonly issuer: string;
    readonly label: string;
    readonly algorithm: string;
    readonly digits: number;
    readonly counter: number;
    readonly secret: Secret;
  }
  export { Secret, TOTP, HOTP };
}

declare module "node-md6" {
  function md6(
    input: string | Buffer,
    bits?: number,
    key?: string,
    levels?: number,
  ): string;
  export = md6;
}

declare module "tesseract.js" {
  interface Worker {
    loadLanguage(lang: string): Promise<void>;
    initialize(lang: string): Promise<void>;
    recognize(
      image: string | Buffer | HTMLImageElement,
    ): Promise<{ data: { text: string; hocr: string; confidence: number } }>;
    terminate(): Promise<void>;
    setParameters(params: Record<string, unknown>): Promise<void>;
  }
  export function createWorker(
    lang?: string,
    oem?: number,
    options?: Record<string, unknown>,
  ): Promise<Worker>;
  export const PSM: Record<string, number>;
  export const OEM: Record<string, number>;
}

declare module "ua-parser-js" {
  interface UAParserResult {
    ua: string;
    browser: { name?: string; version?: string; major?: string };
    engine: { name?: string; version?: string };
    os: { name?: string; version?: string };
    device: { model?: string; type?: string; vendor?: string };
    cpu: { architecture?: string };
  }
  class UAParser {
    constructor(ua?: string, extensions?: Record<string, unknown>);
    setUA(ua: string): UAParser;
    getResult(): UAParserResult;
    getBrowser(): { name?: string; version?: string; major?: string };
    getOS(): { name?: string; version?: string };
    getDevice(): { model?: string; type?: string; vendor?: string };
    getEngine(): { name?: string; version?: string };
    getCPU(): { architecture?: string };
  }
  export = UAParser;
}

declare module "es6-promisify" {
  function promisify<T = unknown>(
    fn: (...args: unknown[]) => void,
  ): (...args: unknown[]) => Promise<T>;
  export = promisify;
}

declare module "@alexaltea/capstone-js/dist/capstone.min.js" {
  const ARCH_ARM: number;
  const ARCH_ARM64: number;
  const ARCH_X86: number;
  const ARCH_MIPS: number;
  const ARCH_PPC: number;
  const ARCH_SPARC: number;
  const MODE_ARM: number;
  const MODE_THUMB: number;
  const MODE_16: number;
  const MODE_32: number;
  const MODE_64: number;
  const MODE_BIG_ENDIAN: number;
  const MODE_LITTLE_ENDIAN: number;
  const MODE_MCLASS: number;
  const MODE_V8: number;
  interface Instruction {
    id: number;
    address: number;
    size: number;
    mnemonic: string;
    op_str: string;
    bytes: number[];
  }
  class Capstone {
    constructor(arch: number, mode: number);
    disasm(
      buffer: Uint8Array | number[],
      addr: number,
      max?: number,
    ): Instruction[];
    disasm_lite(
      buffer: Uint8Array | number[],
      addr: number,
      max?: number,
    ): [number, number, string, string][];
    close(): void;
  }
  const cs: {
    ARCH_ARM: number;
    ARCH_X86: number;
    MODE_ARM: number;
    MODE_64: number;
  };
  export {
    ARCH_ARM,
    ARCH_ARM64,
    ARCH_X86,
    ARCH_MIPS,
    ARCH_PPC,
    ARCH_SPARC,
    MODE_ARM,
    MODE_THUMB,
    MODE_16,
    MODE_32,
    MODE_64,
    MODE_BIG_ENDIAN,
    MODE_LITTLE_ENDIAN,
    MODE_MCLASS,
    MODE_V8,
    Capstone,
    cs,
  };
}

declare module "@blu3r4y/lzma" {
  export function compress(
    data: string | Uint8Array | number[],
    mode: number,
    on_finish: (result: number[] | false, error: unknown) => void,
    on_progress?: (percent: number) => void,
  ): void;
  export function decompress(
    data: Uint8Array | number[],
    on_finish: (result: string | Uint8Array | false, error: unknown) => void,
    on_progress?: (percent: number) => void,
  ): void;
}

declare module "escodegen" {
  interface EscodegenOptions {
    format?: {
      indent?: { style?: string; base?: number };
      quotes?: "single" | "double" | "auto";
      semicolons?: boolean;
      parentheses?: boolean;
      space?: boolean;
    };
    comment?: boolean;
    verbatim?: string;
  }
  export function generate(ast: unknown, options?: EscodegenOptions): string;
  export function attachComments(
    ast: unknown,
    comments: unknown[],
    tokens: unknown[],
  ): unknown;
}

declare module "terser" {
  interface MinifyOptions {
    compress?: boolean | Record<string, unknown>;
    mangle?: boolean | Record<string, unknown>;
    output?: Record<string, unknown>;
    parse?: Record<string, unknown>;
    sourceMap?: boolean | Record<string, unknown>;
    module?: boolean;
    toplevel?: boolean;
    ie8?: boolean;
    keep_classnames?: boolean;
    keep_fnames?: boolean;
  }
  interface MinifyOutput {
    [x: string]: any;
    code?: string;
    map?: string;
    decoded_map?: unknown;
  }
  export function minify(
    code: string | Record<string, string>,
    options?: MinifyOptions,
  ): Promise<MinifyOutput>;
}
