# Complete operation catalog

This page lists all **479 operations** registered by ts-chef. It is generated from `src/opsRegistry.ts`; run `npm run docs:catalog` after changing the registry. Operation display names are the names used in pipeline expressions and search.

```{admonition} Arguments and defaults
:class: tip
Open an operation in the Operations view or Pipeline Editor to see its current argument controls, allowed values, descriptions, and defaults. The source link is provided for implementation-level detail.
```

## Category summary

| Category | Operations |
| --- | ---: |
| [Arithmetic](#arithmetic) | 1 |
| [Bletchley](#bletchley) | 7 |
| [Charts](#charts) | 5 |
| [Ciphers](#ciphers) | 57 |
| [Code](#code) | 18 |
| [Compression](#compression) | 19 |
| [Crypto](#crypto) | 57 |
| [Default](#default) | 216 |
| [Diff](#diff) | 1 |
| [Encodings](#encodings) | 12 |
| [Handlebars](#handlebars) | 1 |
| [Hashing](#hashing) | 10 |
| [Image](#image) | 28 |
| [Jq](#jq) | 1 |
| [OCR](#ocr) | 1 |
| [PGP](#pgp) | 6 |
| [Protobuf](#protobuf) | 2 |
| [PublicKey](#publickey) | 11 |
| [Regex](#regex) | 13 |
| [Serialise](#serialise) | 6 |
| [Shellcode](#shellcode) | 2 |
| [URL](#url) | 3 |
| [UserAgent](#useragent) | 1 |
| [Yara](#yara) | 1 |

## Arithmetic

| Display name | Internal ID | Source |
| --- | --- | --- |
| `ADD` | `ADD` | [`ADD.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ADD.ts) |

## Bletchley

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Bombe` | `Bombe` | [`Bombe.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Bombe.ts) |
| `Colossus` | `Colossus` | [`Colossus.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Colossus.ts) |
| `Enigma` | `Enigma` | [`Enigma.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Enigma.ts) |
| `Lorenz` | `Lorenz` | [`Lorenz.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Lorenz.ts) |
| `Multiple Bombe` | `MultipleBombe` | [`MultipleBombe.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/MultipleBombe.ts) |
| `SIGABA` | `SIGABA` | [`SIGABA.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SIGABA.ts) |
| `Typex` | `Typex` | [`Typex.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Typex.ts) |

## Charts

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Entropy` | `Entropy` | [`Entropy.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Entropy.ts) |
| `Heatmap chart` | `HeatmapChart` | [`HeatmapChart.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/HeatmapChart.ts) |
| `Hex Density chart` | `HexDensityChart` | [`HexDensityChart.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/HexDensityChart.ts) |
| `Scatter chart` | `ScatterChart` | [`ScatterChart.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ScatterChart.ts) |
| `Series chart` | `SeriesChart` | [`SeriesChart.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SeriesChart.ts) |

## Ciphers

| Display name | Internal ID | Source |
| --- | --- | --- |
| `A1Z26 Cipher Decode` | `A1Z26CipherDecode` | [`A1Z26CipherDecode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/A1Z26CipherDecode.ts) |
| `A1Z26 Cipher Encode` | `A1Z26CipherEncode` | [`A1Z26CipherEncode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/A1Z26CipherEncode.ts) |
| `AES Decrypt` | `AESDecrypt` | [`AESDecrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/AESDecrypt.ts) |
| `AES Encrypt` | `AESEncrypt` | [`AESEncrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/AESEncrypt.ts) |
| `AES Key Unwrap` | `AESKeyUnwrap` | [`AESKeyUnwrap.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/AESKeyUnwrap.ts) |
| `AES Key Wrap` | `AESKeyWrap` | [`AESKeyWrap.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/AESKeyWrap.ts) |
| `Affine Cipher Decode` | `AffineCipherDecode` | [`AffineCipherDecode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/AffineCipherDecode.ts) |
| `Affine Cipher Encode` | `AffineCipherEncode` | [`AffineCipherEncode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/AffineCipherEncode.ts) |
| `Atbash Cipher` | `AtbashCipher` | [`AtbashCipher.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/AtbashCipher.ts) |
| `Bifid Cipher Decode` | `BifidCipherDecode` | [`BifidCipherDecode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/BifidCipherDecode.ts) |
| `Bifid Cipher Encode` | `BifidCipherEncode` | [`BifidCipherEncode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/BifidCipherEncode.ts) |
| `Blowfish Decrypt` | `BlowfishDecrypt` | [`BlowfishDecrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/BlowfishDecrypt.ts) |
| `Blowfish Encrypt` | `BlowfishEncrypt` | [`BlowfishEncrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/BlowfishEncrypt.ts) |
| `Caesar Box Cipher` | `CaesarBoxCipher` | [`CaesarBoxCipher.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CaesarBoxCipher.ts) |
| `Cetacean Cipher Decode` | `CetaceanCipherDecode` | [`CetaceanCipherDecode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CetaceanCipherDecode.ts) |
| `Cetacean Cipher Encode` | `CetaceanCipherEncode` | [`CetaceanCipherEncode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CetaceanCipherEncode.ts) |
| `ChaCha` | `ChaCha` | [`ChaCha.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ChaCha.ts) |
| `Derive EVP key` | `DeriveEVPKey` | [`DeriveEVPKey.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DeriveEVPKey.ts) |
| `Derive PBKDF2 key` | `DerivePBKDF2Key` | [`DerivePBKDF2Key.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DerivePBKDF2Key.ts) |
| `DES Decrypt` | `DESDecrypt` | [`DESDecrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DESDecrypt.ts) |
| `DES Encrypt` | `DESEncrypt` | [`DESEncrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DESEncrypt.ts) |
| `ECDSA Sign` | `ECDSASign` | [`ECDSASign.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ECDSASign.ts) |
| `ECDSA Signature Conversion` | `ECDSASignatureConversion` | [`ECDSASignatureConversion.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ECDSASignatureConversion.ts) |
| `ECDSA Verify` | `ECDSAVerify` | [`ECDSAVerify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ECDSAVerify.ts) |
| `Generate ECDSA Key Pair` | `GenerateECDSAKeyPair` | [`GenerateECDSAKeyPair.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GenerateECDSAKeyPair.ts) |
| `Generate RSA Key Pair` | `GenerateRSAKeyPair` | [`GenerateRSAKeyPair.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GenerateRSAKeyPair.ts) |
| `GOST Decrypt` | `GOSTDecrypt` | [`GOSTDecrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GOSTDecrypt.ts) |
| `GOST Encrypt` | `GOSTEncrypt` | [`GOSTEncrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GOSTEncrypt.ts) |
| `GOST Key Unwrap` | `GOSTKeyUnwrap` | [`GOSTKeyUnwrap.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GOSTKeyUnwrap.ts) |
| `GOST Key Wrap` | `GOSTKeyWrap` | [`GOSTKeyWrap.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GOSTKeyWrap.ts) |
| `GOST Sign` | `GOSTSign` | [`GOSTSign.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GOSTSign.ts) |
| `GOST Verify` | `GOSTVerify` | [`GOSTVerify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GOSTVerify.ts) |
| `Pseudo-Random Integer Generator` | `PseudoRandomIntegerGenerator` | [`PseudoRandomIntegerGenerator.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/PseudoRandomIntegerGenerator.ts) |
| `Pseudo-Random Number Generator` | `PseudoRandomNumberGenerator` | [`PseudoRandomNumberGenerator.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/PseudoRandomNumberGenerator.ts) |
| `Rabbit` | `Rabbit` | [`Rabbit.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Rabbit.ts) |
| `Rail Fence Cipher Decode` | `RailFenceCipherDecode` | [`RailFenceCipherDecode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RailFenceCipherDecode.ts) |
| `Rail Fence Cipher Encode` | `RailFenceCipherEncode` | [`RailFenceCipherEncode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RailFenceCipherEncode.ts) |
| `RC2 Decrypt` | `RC2Decrypt` | [`RC2Decrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RC2Decrypt.ts) |
| `RC2 Encrypt` | `RC2Encrypt` | [`RC2Encrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RC2Encrypt.ts) |
| `RC4` | `RC4` | [`RC4.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RC4.ts) |
| `RC4 Drop` | `RC4Drop` | [`RC4Drop.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RC4Drop.ts) |
| `RC6 Decrypt` | `RC6Decrypt` | [`RC6Decrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RC6Decrypt.ts) |
| `RC6 Encrypt` | `RC6Encrypt` | [`RC6Encrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RC6Encrypt.ts) |
| `RSA Decrypt` | `RSADecrypt` | [`RSADecrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RSADecrypt.ts) |
| `RSA Encrypt` | `RSAEncrypt` | [`RSAEncrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RSAEncrypt.ts) |
| `RSA Sign` | `RSASign` | [`RSASign.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RSASign.ts) |
| `RSA Verify` | `RSAVerify` | [`RSAVerify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RSAVerify.ts) |
| `Salsa20` | `Salsa20` | [`Salsa20.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Salsa20.ts) |
| `SM4 Decrypt` | `SM4Decrypt` | [`SM4Decrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SM4Decrypt.ts) |
| `SM4 Encrypt` | `SM4Encrypt` | [`SM4Encrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SM4Encrypt.ts) |
| `Triple DES Decrypt` | `TripleDESDecrypt` | [`TripleDESDecrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/TripleDESDecrypt.ts) |
| `Triple DES Encrypt` | `TripleDESEncrypt` | [`TripleDESEncrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/TripleDESEncrypt.ts) |
| `Vigenère Decode` | `VigenèreDecode` | [`VigenèreDecode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Vigen%C3%A8reDecode.ts) |
| `Vigenère Encode` | `VigenèreEncode` | [`VigenèreEncode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Vigen%C3%A8reEncode.ts) |
| `XSalsa20` | `XSalsa20` | [`XSalsa20.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/XSalsa20.ts) |
| `XXTEA Decrypt` | `XXTEADecrypt` | [`XXTEADecrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/XXTEADecrypt.ts) |
| `XXTEA Encrypt` | `XXTEAEncrypt` | [`XXTEAEncrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/XXTEAEncrypt.ts) |

## Code

| Display name | Internal ID | Source |
| --- | --- | --- |
| `CSS Beautify` | `CSSBeautify` | [`CSSBeautify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CSSBeautify.ts) |
| `CSS Minify` | `CSSMinify` | [`CSSMinify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CSSMinify.ts) |
| `CSS selector` | `CSSSelector` | [`CSSSelector.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CSSSelector.ts) |
| `From MessagePack` | `FromMessagePack` | [`FromMessagePack.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromMessagePack.ts) |
| `Generic Code Beautify` | `GenericCodeBeautify` | [`GenericCodeBeautify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GenericCodeBeautify.ts) |
| `JavaScript Beautify` | `JavaScriptBeautify` | [`JavaScriptBeautify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/JavaScriptBeautify.ts) |
| `JavaScript Minify` | `JavaScriptMinify` | [`JavaScriptMinify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/JavaScriptMinify.ts) |
| `JavaScript Parser` | `JavaScriptParser` | [`JavaScriptParser.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/JavaScriptParser.ts) |
| `JPath expression` | `JPathExpression` | [`JPathExpression.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/JPathExpression.ts) |
| `JSON Beautify` | `JSONBeautify` | [`JSONBeautify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/JSONBeautify.ts) |
| `JSON Minify` | `JSONMinify` | [`JSONMinify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/JSONMinify.ts) |
| `Jsonata Query` | `Jsonata` | [`Jsonata.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Jsonata.ts) |
| `Render Markdown` | `RenderMarkdown` | [`RenderMarkdown.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RenderMarkdown.ts) |
| `SQL Beautify` | `SQLBeautify` | [`SQLBeautify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SQLBeautify.ts) |
| `SQL Minify` | `SQLMinify` | [`SQLMinify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SQLMinify.ts) |
| `Syntax highlighter` | `SyntaxHighlighter` | [`SyntaxHighlighter.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SyntaxHighlighter.ts) |
| `To MessagePack` | `ToMessagePack` | [`ToMessagePack.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToMessagePack.ts) |
| `XPath expression` | `XPathExpression` | [`XPathExpression.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/XPathExpression.ts) |

## Compression

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Bzip2 Compress` | `Bzip2Compress` | [`Bzip2Compress.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Bzip2Compress.ts) |
| `Bzip2 Decompress` | `Bzip2Decompress` | [`Bzip2Decompress.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Bzip2Decompress.ts) |
| `Gunzip` | `Gunzip` | [`Gunzip.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Gunzip.ts) |
| `Gzip` | `Gzip` | [`Gzip.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Gzip.ts) |
| `LZ4 Compress` | `LZ4Compress` | [`LZ4Compress.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/LZ4Compress.ts) |
| `LZ4 Decompress` | `LZ4Decompress` | [`LZ4Decompress.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/LZ4Decompress.ts) |
| `LZMA Compress` | `LZMACompress` | [`LZMACompress.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/LZMACompress.ts) |
| `LZMA Decompress` | `LZMADecompress` | [`LZMADecompress.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/LZMADecompress.ts) |
| `LZNT1 Decompress` | `LZNT1Decompress` | [`LZNT1Decompress.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/LZNT1Decompress.ts) |
| `LZString Compress` | `LZStringCompress` | [`LZStringCompress.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/LZStringCompress.ts) |
| `LZString Decompress` | `LZStringDecompress` | [`LZStringDecompress.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/LZStringDecompress.ts) |
| `Raw Deflate` | `RawDeflate` | [`RawDeflate.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RawDeflate.ts) |
| `Raw Inflate` | `RawInflate` | [`RawInflate.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RawInflate.ts) |
| `Tar` | `Tar` | [`Tar.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Tar.ts) |
| `Untar` | `Untar` | [`Untar.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Untar.ts) |
| `Unzip` | `Unzip` | [`Unzip.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Unzip.ts) |
| `Zip` | `Zip` | [`Zip.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Zip.ts) |
| `Zlib deflate` | `ZlibDeflate` | [`ZlibDeflate.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ZlibDeflate.ts) |
| `Zlib inflate` | `ZlibInflate` | [`ZlibInflate.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ZlibInflate.ts) |

## Crypto

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Adler-32 Checksum` | `Adler32Checksum` | [`Adler32Checksum.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Adler32Checksum.ts) |
| `Analyse hash` | `AnalyseHash` | [`AnalyseHash.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/AnalyseHash.ts) |
| `Analyse UUID` | `AnalyseUUID` | [`AnalyseUUID.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/AnalyseUUID.ts) |
| `Argon2` | `Argon2` | [`Argon2.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Argon2.ts) |
| `Argon2 compare` | `Argon2Compare` | [`Argon2Compare.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Argon2Compare.ts) |
| `Bcrypt` | `Bcrypt` | [`Bcrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Bcrypt.ts) |
| `Bcrypt compare` | `BcryptCompare` | [`BcryptCompare.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/BcryptCompare.ts) |
| `Bcrypt parse` | `BcryptParse` | [`BcryptParse.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/BcryptParse.ts) |
| `CipherSaber2 Decrypt` | `CipherSaber2Decrypt` | [`CipherSaber2Decrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CipherSaber2Decrypt.ts) |
| `CipherSaber2 Encrypt` | `CipherSaber2Encrypt` | [`CipherSaber2Encrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CipherSaber2Encrypt.ts) |
| `CMAC` | `CMAC` | [`CMAC.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CMAC.ts) |
| `Compare CTPH hashes` | `CompareCTPHHashes` | [`CompareCTPHHashes.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CompareCTPHHashes.ts) |
| `Compare SSDEEP hashes` | `CompareSSDEEPHashes` | [`CompareSSDEEPHashes.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CompareSSDEEPHashes.ts) |
| `CTPH` | `CTPH` | [`CTPH.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CTPH.ts) |
| `Derive HKDF key` | `DeriveHKDFKey` | [`DeriveHKDFKey.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DeriveHKDFKey.ts) |
| `Flask Session Decode` | `FlaskSessionDecode` | [`FlaskSessionDecode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FlaskSessionDecode.ts) |
| `Flask Session Sign` | `FlaskSessionSign` | [`FlaskSessionSign.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FlaskSessionSign.ts) |
| `Flask Session Verify` | `FlaskSessionVerify` | [`FlaskSessionVerify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FlaskSessionVerify.ts) |
| `Fletcher-16 Checksum` | `Fletcher16Checksum` | [`Fletcher16Checksum.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Fletcher16Checksum.ts) |
| `Fletcher-32 Checksum` | `Fletcher32Checksum` | [`Fletcher32Checksum.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Fletcher32Checksum.ts) |
| `Fletcher-64 Checksum` | `Fletcher64Checksum` | [`Fletcher64Checksum.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Fletcher64Checksum.ts) |
| `Fletcher-8 Checksum` | `Fletcher8Checksum` | [`Fletcher8Checksum.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Fletcher8Checksum.ts) |
| `Generate all checksums` | `GenerateAllChecksums` | [`GenerateAllChecksums.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GenerateAllChecksums.ts) |
| `Generate all hashes` | `GenerateAllHashes` | [`GenerateAllHashes.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GenerateAllHashes.ts) |
| `Generate UUID` | `GenerateUUID` | [`GenerateUUID.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GenerateUUID.ts) |
| `HAS-160` | `HAS160` | [`HAS160.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/HAS160.ts) |
| `HASSH Client Fingerprint` | `HASSHClientFingerprint` | [`HASSHClientFingerprint.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/HASSHClientFingerprint.ts) |
| `HASSH Server Fingerprint` | `HASSHServerFingerprint` | [`HASSHServerFingerprint.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/HASSHServerFingerprint.ts) |
| `HMAC` | `HMAC` | [`HMAC.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/HMAC.ts) |
| `JA3 Fingerprint` | `JA3Fingerprint` | [`JA3Fingerprint.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/JA3Fingerprint.ts) |
| `JA3S Fingerprint` | `JA3SFingerprint` | [`JA3SFingerprint.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/JA3SFingerprint.ts) |
| `JA4 Fingerprint` | `JA4Fingerprint` | [`JA4Fingerprint.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/JA4Fingerprint.ts) |
| `JA4Server Fingerprint` | `JA4ServerFingerprint` | [`JA4ServerFingerprint.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/JA4ServerFingerprint.ts) |
| `JWT Decode` | `JWTDecode` | [`JWTDecode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/JWTDecode.ts) |
| `JWT Sign` | `JWTSign` | [`JWTSign.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/JWTSign.ts) |
| `JWT Verify` | `JWTVerify` | [`JWTVerify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/JWTVerify.ts) |
| `Keccak` | `Keccak` | [`Keccak.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Keccak.ts) |
| `LM Hash` | `LMHash` | [`LMHash.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/LMHash.ts) |
| `LS47 Decrypt` | `LS47Decrypt` | [`LS47Decrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/LS47Decrypt.ts) |
| `LS47 Encrypt` | `LS47Encrypt` | [`LS47Encrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/LS47Encrypt.ts) |
| `MD2` | `MD2` | [`MD2.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/MD2.ts) |
| `MD4` | `MD4` | [`MD4.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/MD4.ts) |
| `MD5` | `MD5` | [`MD5.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/MD5.ts) |
| `MD6` | `MD6` | [`MD6.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/MD6.ts) |
| `NT Hash` | `NTHash` | [`NTHash.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/NTHash.ts) |
| `RIPEMD` | `RIPEMD` | [`RIPEMD.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RIPEMD.ts) |
| `Scrypt` | `Scrypt` | [`Scrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Scrypt.ts) |
| `SHA0` | `SHA0` | [`SHA0.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SHA0.ts) |
| `SHA1` | `SHA1` | [`SHA1.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SHA1.ts) |
| `SHA2` | `SHA2` | [`SHA2.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SHA2.ts) |
| `SHA3` | `SHA3` | [`SHA3.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SHA3.ts) |
| `Shake` | `Shake` | [`Shake.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Shake.ts) |
| `SM2 Decrypt` | `SM2Decrypt` | [`SM2Decrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SM2Decrypt.ts) |
| `SM2 Encrypt` | `SM2Encrypt` | [`SM2Encrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SM2Encrypt.ts) |
| `SM3` | `SM3` | [`SM3.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SM3.ts) |
| `SSDEEP` | `SSDEEP` | [`SSDEEP.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SSDEEP.ts) |
| `TCP/IP Checksum` | `TCPIPChecksum` | [`TCPIPChecksum.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/TCPIPChecksum.ts) |

## Default

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Add line numbers` | `AddLineNumbers` | [`AddLineNumbers.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/AddLineNumbers.ts) |
| `Alternating Caps` | `AlternatingCaps` | [`AlternatingCaps.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/AlternatingCaps.ts) |
| `AND` | `AND` | [`AND.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/AND.ts) |
| `Bacon Cipher Decode` | `BaconCipherDecode` | [`BaconCipherDecode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/BaconCipherDecode.ts) |
| `Bacon Cipher Encode` | `BaconCipherEncode` | [`BaconCipherEncode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/BaconCipherEncode.ts) |
| `Bit shift left` | `BitShiftLeft` | [`BitShiftLeft.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/BitShiftLeft.ts) |
| `Bit shift right` | `BitShiftRight` | [`BitShiftRight.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/BitShiftRight.ts) |
| `Caret/M-decode` | `CaretMdecode` | [`CaretMdecode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CaretMdecode.ts) |
| `Cartesian Product` | `CartesianProduct` | [`CartesianProduct.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CartesianProduct.ts) |
| `Change IP format` | `ChangeIPFormat` | [`ChangeIPFormat.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ChangeIPFormat.ts) |
| `Chi Square` | `ChiSquare` | [`ChiSquare.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ChiSquare.ts) |
| `Comment` | `Comment` | [`Comment.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Comment.ts) |
| `Conditional Jump` | `ConditionalJump` | [`ConditionalJump.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ConditionalJump.ts) |
| `Convert area` | `ConvertArea` | [`ConvertArea.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ConvertArea.ts) |
| `Convert data units` | `ConvertDataUnits` | [`ConvertDataUnits.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ConvertDataUnits.ts) |
| `Convert distance` | `ConvertDistance` | [`ConvertDistance.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ConvertDistance.ts) |
| `Convert Leet Speak` | `ConvertLeetSpeak` | [`ConvertLeetSpeak.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ConvertLeetSpeak.ts) |
| `Convert mass` | `ConvertMass` | [`ConvertMass.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ConvertMass.ts) |
| `Convert speed` | `ConvertSpeed` | [`ConvertSpeed.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ConvertSpeed.ts) |
| `Convert to NATO alphabet` | `ConvertToNATOAlphabet` | [`ConvertToNATOAlphabet.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ConvertToNATOAlphabet.ts) |
| `Count occurrences` | `CountOccurrences` | [`CountOccurrences.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CountOccurrences.ts) |
| `CRC Checksum` | `CRCChecksum` | [`CRCChecksum.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CRCChecksum.ts) |
| `CSV to JSON` | `CSVToJSON` | [`CSVToJSON.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CSVToJSON.ts) |
| `DateTime Delta` | `DateTimeDelta` | [`DateTimeDelta.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DateTimeDelta.ts) |
| `Dechunk HTTP response` | `DechunkHTTPResponse` | [`DechunkHTTPResponse.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DechunkHTTPResponse.ts) |
| `Decode NetBIOS Name` | `DecodeNetBIOSName` | [`DecodeNetBIOSName.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DecodeNetBIOSName.ts) |
| `Defang IP Addresses` | `DefangIPAddresses` | [`DefangIPAddresses.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DefangIPAddresses.ts) |
| `Defang URL` | `DefangURL` | [`DefangURL.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DefangURL.ts) |
| `Detect File Type` | `DetectFileType` | [`DetectFileType.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DetectFileType.ts) |
| `Divide` | `Divide` | [`Divide.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Divide.ts) |
| `DNS over HTTPS` | `DNSOverHTTPS` | [`DNSOverHTTPS.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DNSOverHTTPS.ts) |
| `Drop bytes` | `DropBytes` | [`DropBytes.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DropBytes.ts) |
| `Drop nth bytes` | `DropNthBytes` | [`DropNthBytes.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DropNthBytes.ts) |
| `ELF Info` | `ELFInfo` | [`ELFInfo.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ELFInfo.ts) |
| `Encode NetBIOS Name` | `EncodeNetBIOSName` | [`EncodeNetBIOSName.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/EncodeNetBIOSName.ts) |
| `Escape string` | `EscapeString` | [`EscapeString.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/EscapeString.ts) |
| `Escape Unicode Characters` | `EscapeUnicodeCharacters` | [`EscapeUnicodeCharacters.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/EscapeUnicodeCharacters.ts) |
| `Expand alphabet range` | `ExpandAlphabetRange` | [`ExpandAlphabetRange.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ExpandAlphabetRange.ts) |
| `Extract Audio Metadata` | `ExtractAudioMetadata` | [`ExtractAudioMetadata.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ExtractAudioMetadata.ts) |
| `Extract Files` | `ExtractFiles` | [`ExtractFiles.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ExtractFiles.ts) |
| `Extract ID3` | `ExtractID3` | [`ExtractID3.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ExtractID3.ts) |
| `Fang URL` | `FangURL` | [`FangURL.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FangURL.ts) |
| `Fernet Decrypt` | `FernetDecrypt` | [`FernetDecrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FernetDecrypt.ts) |
| `Fernet Encrypt` | `FernetEncrypt` | [`FernetEncrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FernetEncrypt.ts) |
| `File Tree` | `FileTree` | [`FileTree.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FileTree.ts) |
| `Fork` | `Fork` | [`Fork.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Fork.ts) |
| `Format MAC addresses` | `FormatMACAddresses` | [`FormatMACAddresses.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FormatMACAddresses.ts) |
| `Frequency distribution` | `FrequencyDistribution` | [`FrequencyDistribution.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FrequencyDistribution.ts) |
| `From Base` | `FromBase` | [`FromBase.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromBase.ts) |
| `From Base32` | `FromBase32` | [`FromBase32.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromBase32.ts) |
| `From Base45` | `FromBase45` | [`FromBase45.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromBase45.ts) |
| `From Base58` | `FromBase58` | [`FromBase58.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromBase58.ts) |
| `From Base62` | `FromBase62` | [`FromBase62.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromBase62.ts) |
| `From Base64` | `FromBase64` | [`FromBase64.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromBase64.ts) |
| `From Base85` | `FromBase85` | [`FromBase85.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromBase85.ts) |
| `From Base92` | `FromBase92` | [`FromBase92.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromBase92.ts) |
| `From BCD` | `FromBCD` | [`FromBCD.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromBCD.ts) |
| `From Bech32` | `FromBech32` | [`FromBech32.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromBech32.ts) |
| `From Binary` | `FromBinary` | [`FromBinary.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromBinary.ts) |
| `From Braille` | `FromBraille` | [`FromBraille.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromBraille.ts) |
| `From Case Insensitive Regex` | `FromCaseInsensitiveRegex` | [`FromCaseInsensitiveRegex.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromCaseInsensitiveRegex.ts) |
| `From Charcode` | `FromCharcode` | [`FromCharcode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromCharcode.ts) |
| `From Decimal` | `FromDecimal` | [`FromDecimal.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromDecimal.ts) |
| `From Float` | `FromFloat` | [`FromFloat.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromFloat.ts) |
| `From Hex` | `FromHex` | [`FromHex.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromHex.ts) |
| `From Hex Content` | `FromHexContent` | [`FromHexContent.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromHexContent.ts) |
| `From Hexdump` | `FromHexdump` | [`FromHexdump.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromHexdump.ts) |
| `From Modhex` | `FromModhex` | [`FromModhex.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromModhex.ts) |
| `From Morse Code` | `FromMorseCode` | [`FromMorseCode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromMorseCode.ts) |
| `From Octal` | `FromOctal` | [`FromOctal.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromOctal.ts) |
| `From Quoted Printable` | `FromQuotedPrintable` | [`FromQuotedPrintable.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromQuotedPrintable.ts) |
| `From Radix` | `FromRadix` | [`FromRadix.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromRadix.ts) |
| `From UNIX Timestamp` | `FromUNIXTimestamp` | [`FromUNIXTimestamp.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromUNIXTimestamp.ts) |
| `Fuzzy Match` | `FuzzyMatch` | [`FuzzyMatch.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FuzzyMatch.ts) |
| `Generate De Bruijn Sequence` | `GenerateDeBruijnSequence` | [`GenerateDeBruijnSequence.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GenerateDeBruijnSequence.ts) |
| `Generate HOTP` | `GenerateHOTP` | [`GenerateHOTP.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GenerateHOTP.ts) |
| `Generate Lorem Ipsum` | `GenerateLoremIpsum` | [`GenerateLoremIpsum.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GenerateLoremIpsum.ts) |
| `Generate TOTP` | `GenerateTOTP` | [`GenerateTOTP.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GenerateTOTP.ts) |
| `Get All Casings` | `GetAllCasings` | [`GetAllCasings.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GetAllCasings.ts) |
| `Get Time` | `GetTime` | [`GetTime.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GetTime.ts) |
| `Group IP addresses` | `GroupIPAddresses` | [`GroupIPAddresses.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GroupIPAddresses.ts) |
| `Hamming Distance` | `HammingDistance` | [`HammingDistance.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/HammingDistance.ts) |
| `Haversine distance` | `HaversineDistance` | [`HaversineDistance.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/HaversineDistance.ts) |
| `Head` | `Head` | [`Head.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Head.ts) |
| `HTML To Text` | `HTMLToText` | [`HTMLToText.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/HTMLToText.ts) |
| `HTTP request` | `HTTPRequest` | [`HTTPRequest.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/HTTPRequest.ts) |
| `Index of Coincidence` | `IndexOfCoincidence` | [`IndexOfCoincidence.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/IndexOfCoincidence.ts) |
| `IPv6 Transition Addresses` | `IPv6TransitionAddresses` | [`IPv6TransitionAddresses.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/IPv6TransitionAddresses.ts) |
| `JSON to CSV` | `JSONToCSV` | [`JSONToCSV.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/JSONToCSV.ts) |
| `JSON to YAML` | `JSONtoYAML` | [`JSONtoYAML.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/JSONtoYAML.ts) |
| `Jump` | `Jump` | [`Jump.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Jump.ts) |
| `Label` | `Label` | [`Label.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Label.ts) |
| `Levenshtein Distance` | `LevenshteinDistance` | [`LevenshteinDistance.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/LevenshteinDistance.ts) |
| `Luhn Checksum` | `LuhnChecksum` | [`LuhnChecksum.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/LuhnChecksum.ts) |
| `Magic` | `Magic` | [`Magic.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Magic.ts) |
| `Mean` | `Mean` | [`Mean.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Mean.ts) |
| `Median` | `Median` | [`Median.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Median.ts) |
| `Merge` | `Merge` | [`Merge.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Merge.ts) |
| `Microsoft Script Decoder` | `MicrosoftScriptDecoder` | [`MicrosoftScriptDecoder.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/MicrosoftScriptDecoder.ts) |
| `MIME Decoding` | `MIMEDecoding` | [`MIMEDecoding.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/MIMEDecoding.ts) |
| `Multiply` | `Multiply` | [`Multiply.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Multiply.ts) |
| `NOT` | `NOT` | [`NOT.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/NOT.ts) |
| `Numberwang` | `Numberwang` | [`Numberwang.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Numberwang.ts) |
| `Offset checker` | `OffsetChecker` | [`OffsetChecker.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/OffsetChecker.ts) |
| `OR` | `OR` | [`OR.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/OR.ts) |
| `P-list Viewer` | `PLISTViewer` | [`PLISTViewer.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/PLISTViewer.ts) |
| `Pad lines` | `PadLines` | [`PadLines.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/PadLines.ts) |
| `Parity Bit` | `ParityBit` | [`ParityBit.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParityBit.ts) |
| `Parse colour code` | `ParseColourCode` | [`ParseColourCode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseColourCode.ts) |
| `Parse DateTime` | `ParseDateTime` | [`ParseDateTime.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseDateTime.ts) |
| `Parse Ethernet frame` | `ParseEthernetFrame` | [`ParseEthernetFrame.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseEthernetFrame.ts) |
| `Parse IP range` | `ParseIPRange` | [`ParseIPRange.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseIPRange.ts) |
| `Parse IPv4 header` | `ParseIPv4Header` | [`ParseIPv4Header.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseIPv4Header.ts) |
| `Parse IPv6 address` | `ParseIPv6Address` | [`ParseIPv6Address.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseIPv6Address.ts) |
| `Parse SSH Host Key` | `ParseSSHHostKey` | [`ParseSSHHostKey.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseSSHHostKey.ts) |
| `Parse TCP` | `ParseTCP` | [`ParseTCP.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseTCP.ts) |
| `Parse TLS record` | `ParseTLSRecord` | [`ParseTLSRecord.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseTLSRecord.ts) |
| `Parse TLV` | `ParseTLV` | [`ParseTLV.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseTLV.ts) |
| `Parse UDP` | `ParseUDP` | [`ParseUDP.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseUDP.ts) |
| `Parse UNIX file permissions` | `ParseUNIXFilePermissions` | [`ParseUNIXFilePermissions.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseUNIXFilePermissions.ts) |
| `PEM to Hex` | `PEMToHex` | [`PEMToHex.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/PEMToHex.ts) |
| `PHP Deserialize` | `PHPDeserialize` | [`PHPDeserialize.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/PHPDeserialize.ts) |
| `PHP Serialize` | `PHPSerialize` | [`PHPSerialize.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/PHPSerialize.ts) |
| `Play Media` | `PlayMedia` | [`PlayMedia.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/PlayMedia.ts) |
| `Power Set` | `PowerSet` | [`PowerSet.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/PowerSet.ts) |
| `RAKE` | `RAKE` | [`RAKE.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RAKE.ts) |
| `Remove Diacritics` | `RemoveDiacritics` | [`RemoveDiacritics.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RemoveDiacritics.ts) |
| `Remove line numbers` | `RemoveLineNumbers` | [`RemoveLineNumbers.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RemoveLineNumbers.ts) |
| `Remove null bytes` | `RemoveNullBytes` | [`RemoveNullBytes.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RemoveNullBytes.ts) |
| `Remove whitespace` | `RemoveWhitespace` | [`RemoveWhitespace.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RemoveWhitespace.ts) |
| `Return` | `Return` | [`Return.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Return.ts) |
| `Reverse` | `Reverse` | [`Reverse.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Reverse.ts) |
| `ROT13` | `ROT13` | [`ROT13.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ROT13.ts) |
| `ROT13 Brute Force` | `ROT13BruteForce` | [`ROT13BruteForce.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ROT13BruteForce.ts) |
| `ROT47` | `ROT47` | [`ROT47.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ROT47.ts) |
| `ROT47 Brute Force` | `ROT47BruteForce` | [`ROT47BruteForce.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ROT47BruteForce.ts) |
| `ROT8000` | `ROT8000` | [`ROT8000.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ROT8000.ts) |
| `Rotate left` | `RotateLeft` | [`RotateLeft.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RotateLeft.ts) |
| `Rotate right` | `RotateRight` | [`RotateRight.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RotateRight.ts) |
| `Scan for Embedded Files` | `ScanForEmbeddedFiles` | [`ScanForEmbeddedFiles.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ScanForEmbeddedFiles.ts) |
| `Set Difference` | `SetDifference` | [`SetDifference.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SetDifference.ts) |
| `Set Intersection` | `SetIntersection` | [`SetIntersection.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SetIntersection.ts) |
| `Set Union` | `SetUnion` | [`SetUnion.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SetUnion.ts) |
| `Show Base64 offsets` | `ShowBase64Offsets` | [`ShowBase64Offsets.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ShowBase64Offsets.ts) |
| `Shuffle` | `Shuffle` | [`Shuffle.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Shuffle.ts) |
| `Sleep` | `Sleep` | [`Sleep.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Sleep.ts) |
| `Sort` | `Sort` | [`Sort.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Sort.ts) |
| `Split` | `Split` | [`Split.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Split.ts) |
| `Standard Deviation` | `StandardDeviation` | [`StandardDeviation.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/StandardDeviation.ts) |
| `Strip HTML tags` | `StripHTMLTags` | [`StripHTMLTags.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/StripHTMLTags.ts) |
| `Strip HTTP headers` | `StripHTTPHeaders` | [`StripHTTPHeaders.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/StripHTTPHeaders.ts) |
| `Strip IPv4 header` | `StripIPv4Header` | [`StripIPv4Header.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/StripIPv4Header.ts) |
| `Strip TCP header` | `StripTCPHeader` | [`StripTCPHeader.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/StripTCPHeader.ts) |
| `Strip UDP header` | `StripUDPHeader` | [`StripUDPHeader.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/StripUDPHeader.ts) |
| `SUB` | `SUB` | [`SUB.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SUB.ts) |
| `Subsection` | `Subsection` | [`Subsection.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Subsection.ts) |
| `Substitute` | `Substitute` | [`Substitute.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Substitute.ts) |
| `Subtract` | `Subtract` | [`Subtract.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Subtract.ts) |
| `Sum` | `Sum` | [`Sum.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Sum.ts) |
| `Swap case` | `SwapCase` | [`SwapCase.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SwapCase.ts) |
| `Swap endianness` | `SwapEndianness` | [`SwapEndianness.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SwapEndianness.ts) |
| `Symmetric Difference` | `SymmetricDifference` | [`SymmetricDifference.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SymmetricDifference.ts) |
| `Tail` | `Tail` | [`Tail.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Tail.ts) |
| `Take bytes` | `TakeBytes` | [`TakeBytes.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/TakeBytes.ts) |
| `Take nth bytes` | `TakeNthBytes` | [`TakeNthBytes.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/TakeNthBytes.ts) |
| `Text-Integer Conversion` | `TextIntegerConverter` | [`TextIntegerConverter.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/TextIntegerConverter.ts) |
| `To Base` | `ToBase` | [`ToBase.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToBase.ts) |
| `To Base32` | `ToBase32` | [`ToBase32.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToBase32.ts) |
| `To Base45` | `ToBase45` | [`ToBase45.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToBase45.ts) |
| `To Base58` | `ToBase58` | [`ToBase58.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToBase58.ts) |
| `To Base62` | `ToBase62` | [`ToBase62.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToBase62.ts) |
| `To Base64` | `ToBase64` | [`ToBase64.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToBase64.ts) |
| `To Base85` | `ToBase85` | [`ToBase85.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToBase85.ts) |
| `To Base92` | `ToBase92` | [`ToBase92.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToBase92.ts) |
| `To BCD` | `ToBCD` | [`ToBCD.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToBCD.ts) |
| `To Bech32` | `ToBech32` | [`ToBech32.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToBech32.ts) |
| `To binary` | `ToBinary` | [`ToBinary.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToBinary.ts) |
| `To Braille` | `ToBraille` | [`ToBraille.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToBraille.ts) |
| `To camel case` | `ToCamelCase` | [`ToCamelCase.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToCamelCase.ts) |
| `To case insensitive regex` | `ToCaseInsensitiveRegex` | [`ToCaseInsensitiveRegex.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToCaseInsensitiveRegex.ts) |
| `To charcode` | `ToCharcode` | [`ToCharcode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToCharcode.ts) |
| `To decimal` | `ToDecimal` | [`ToDecimal.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToDecimal.ts) |
| `To float` | `ToFloat` | [`ToFloat.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToFloat.ts) |
| `To hex` | `ToHex` | [`ToHex.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToHex.ts) |
| `To hex content` | `ToHexContent` | [`ToHexContent.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToHexContent.ts) |
| `To hexdump` | `ToHexdump` | [`ToHexdump.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToHexdump.ts) |
| `To HTML entity` | `ToHTMLEntity` | [`ToHTMLEntity.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToHTMLEntity.ts) |
| `To kebab case` | `ToKebabCase` | [`ToKebabCase.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToKebabCase.ts) |
| `To lower case` | `ToLowerCase` | [`ToLowerCase.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToLowerCase.ts) |
| `To Modhex` | `ToModhex` | [`ToModhex.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToModhex.ts) |
| `To Morse Code` | `ToMorseCode` | [`ToMorseCode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToMorseCode.ts) |
| `To octal` | `ToOctal` | [`ToOctal.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToOctal.ts) |
| `To Punycode` | `ToPunycode` | [`ToPunycode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToPunycode.ts) |
| `To quoted-printable` | `ToQuotedPrintable` | [`ToQuotedPrintable.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToQuotedPrintable.ts) |
| `To Radix` | `ToRadix` | [`ToRadix.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToRadix.ts) |
| `To snake case` | `ToSnakeCase` | [`ToSnakeCase.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToSnakeCase.ts) |
| `To table` | `ToTable` | [`ToTable.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToTable.ts) |
| `To UNIX Timestamp` | `ToUNIXTimestamp` | [`ToUNIXTimestamp.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToUNIXTimestamp.ts) |
| `To upper case` | `ToUpperCase` | [`ToUpperCase.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ToUpperCase.ts) |
| `Translate DateTime format` | `TranslateDateTimeFormat` | [`TranslateDateTimeFormat.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/TranslateDateTimeFormat.ts) |
| `Unescape string` | `UnescapeString` | [`UnescapeString.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/UnescapeString.ts) |
| `Unescape Unicode Characters` | `UnescapeUnicodeCharacters` | [`UnescapeUnicodeCharacters.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/UnescapeUnicodeCharacters.ts) |
| `Unicode Text Format` | `UnicodeTextFormat` | [`UnicodeTextFormat.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/UnicodeTextFormat.ts) |
| `Unique` | `Unique` | [`Unique.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Unique.ts) |
| `UNIX Timestamp to Windows Filetime` | `UNIXTimestampToWindowsFiletime` | [`UNIXTimestampToWindowsFiletime.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/UNIXTimestampToWindowsFiletime.ts) |
| `VarInt Decode` | `VarIntDecode` | [`VarIntDecode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/VarIntDecode.ts) |
| `VarInt Encode` | `VarIntEncode` | [`VarIntEncode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/VarIntEncode.ts) |
| `Windows Filetime to UNIX Timestamp` | `WindowsFiletimeToUNIXTimestamp` | [`WindowsFiletimeToUNIXTimestamp.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/WindowsFiletimeToUNIXTimestamp.ts) |
| `Wrap` | `Wrap` | [`Wrap.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Wrap.ts) |
| `XKCD Random Number` | `XKCDRandomNumber` | [`XKCDRandomNumber.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/XKCDRandomNumber.ts) |
| `XML Beautify` | `XMLBeautify` | [`XMLBeautify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/XMLBeautify.ts) |
| `XML Minify` | `XMLMinify` | [`XMLMinify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/XMLMinify.ts) |
| `XOR` | `XOR` | [`XOR.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/XOR.ts) |
| `XOR brute force` | `XORBruteForce` | [`XORBruteForce.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/XORBruteForce.ts) |
| `XOR checksum` | `XORChecksum` | [`XORChecksum.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/XORChecksum.ts) |
| `YAML to JSON` | `YAMLToJSON` | [`YAMLToJSON.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/YAMLToJSON.ts) |

## Diff

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Diff` | `Diff` | [`Diff.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Diff.ts) |

## Encodings

| Display name | Internal ID | Source |
| --- | --- | --- |
| `AMF Decode` | `AMFDecode` | [`AMFDecode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/AMFDecode.ts) |
| `AMF Encode` | `AMFEncode` | [`AMFEncode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/AMFEncode.ts) |
| `Citrix CTX1 Decode` | `CitrixCTX1Decode` | [`CitrixCTX1Decode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CitrixCTX1Decode.ts) |
| `Citrix CTX1 Encode` | `CitrixCTX1Encode` | [`CitrixCTX1Encode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CitrixCTX1Encode.ts) |
| `Decode text` | `DecodeText` | [`DecodeText.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DecodeText.ts) |
| `Encode text` | `EncodeText` | [`EncodeText.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/EncodeText.ts) |
| `From HTML Entity` | `FromHTMLEntity` | [`FromHTMLEntity.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromHTMLEntity.ts) |
| `From Punycode` | `FromPunycode` | [`FromPunycode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FromPunycode.ts) |
| `Normalise Unicode` | `NormaliseUnicode` | [`NormaliseUnicode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/NormaliseUnicode.ts) |
| `Rison Decode` | `RisonDecode` | [`RisonDecode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RisonDecode.ts) |
| `Rison Encode` | `RisonEncode` | [`RisonEncode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RisonEncode.ts) |
| `Text Encoding Brute Force` | `TextEncodingBruteForce` | [`TextEncodingBruteForce.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/TextEncodingBruteForce.ts) |

## Handlebars

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Template` | `Template` | [`Template.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Template.ts) |

## Hashing

| Display name | Internal ID | Source |
| --- | --- | --- |
| `BLAKE2b` | `BLAKE2b` | [`BLAKE2b.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/BLAKE2b.ts) |
| `BLAKE2s` | `BLAKE2s` | [`BLAKE2s.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/BLAKE2s.ts) |
| `BLAKE3` | `BLAKE3` | [`BLAKE3.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/BLAKE3.ts) |
| `Convert co-ordinate format` | `ConvertCoordinateFormat` | [`ConvertCoordinateFormat.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ConvertCoordinateFormat.ts) |
| `GOST Hash` | `GOSTHash` | [`GOSTHash.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GOSTHash.ts) |
| `MurmurHash3` | `MurmurHash3` | [`MurmurHash3.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/MurmurHash3.ts) |
| `Show on map` | `ShowOnMap` | [`ShowOnMap.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ShowOnMap.ts) |
| `Snefru` | `Snefru` | [`Snefru.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Snefru.ts) |
| `Streebog` | `Streebog` | [`Streebog.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Streebog.ts) |
| `Whirlpool` | `Whirlpool` | [`Whirlpool.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Whirlpool.ts) |

## Image

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Add Text To Image` | `AddTextToImage` | [`AddTextToImage.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/AddTextToImage.ts) |
| `Blur Image` | `BlurImage` | [`BlurImage.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/BlurImage.ts) |
| `Contain Image` | `ContainImage` | [`ContainImage.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ContainImage.ts) |
| `Convert Image Format` | `ConvertImageFormat` | [`ConvertImageFormat.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ConvertImageFormat.ts) |
| `Cover Image` | `CoverImage` | [`CoverImage.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CoverImage.ts) |
| `Crop Image` | `CropImage` | [`CropImage.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CropImage.ts) |
| `Dither Image` | `DitherImage` | [`DitherImage.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DitherImage.ts) |
| `Extract EXIF` | `ExtractEXIF` | [`ExtractEXIF.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ExtractEXIF.ts) |
| `Extract LSB` | `ExtractLSB` | [`ExtractLSB.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ExtractLSB.ts) |
| `Extract RGBA` | `ExtractRGBA` | [`ExtractRGBA.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ExtractRGBA.ts) |
| `Flip Image` | `FlipImage` | [`FlipImage.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FlipImage.ts) |
| `Generate Image` | `GenerateImage` | [`GenerateImage.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GenerateImage.ts) |
| `Generate QR Code` | `GenerateQRCode` | [`GenerateQRCode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GenerateQRCode.ts) |
| `Image Brightness / Contrast` | `ImageBrightnessContrast` | [`ImageBrightnessContrast.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ImageBrightnessContrast.ts) |
| `Image Filter` | `ImageFilter` | [`ImageFilter.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ImageFilter.ts) |
| `Image Hue/Saturation/Lightness` | `ImageHueSaturationLightness` | [`ImageHueSaturationLightness.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ImageHueSaturationLightness.ts) |
| `Image Opacity` | `ImageOpacity` | [`ImageOpacity.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ImageOpacity.ts) |
| `Invert Image` | `InvertImage` | [`InvertImage.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/InvertImage.ts) |
| `Normalise Image` | `NormaliseImage` | [`NormaliseImage.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/NormaliseImage.ts) |
| `Parse QR Code` | `ParseQRCode` | [`ParseQRCode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseQRCode.ts) |
| `Randomize Colour Palette` | `RandomizeColourPalette` | [`RandomizeColourPalette.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RandomizeColourPalette.ts) |
| `Remove EXIF` | `RemoveEXIF` | [`RemoveEXIF.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RemoveEXIF.ts) |
| `Render Image` | `RenderImage` | [`RenderImage.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RenderImage.ts) |
| `Resize Image` | `ResizeImage` | [`ResizeImage.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ResizeImage.ts) |
| `Rotate Image` | `RotateImage` | [`RotateImage.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RotateImage.ts) |
| `Sharpen Image` | `SharpenImage` | [`SharpenImage.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SharpenImage.ts) |
| `Split Colour Channels` | `SplitColourChannels` | [`SplitColourChannels.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/SplitColourChannels.ts) |
| `View Bit Plane` | `ViewBitPlane` | [`ViewBitPlane.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ViewBitPlane.ts) |

## Jq

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Jq` | `Jq` | [`Jq.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Jq.ts) |

## OCR

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Optical Character Recognition` | `OpticalCharacterRecognition` | [`OpticalCharacterRecognition.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/OpticalCharacterRecognition.ts) |

## PGP

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Generate PGP Key Pair` | `GeneratePGPKeyPair` | [`GeneratePGPKeyPair.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/GeneratePGPKeyPair.ts) |
| `PGP Decrypt` | `PGPDecrypt` | [`PGPDecrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/PGPDecrypt.ts) |
| `PGP Decrypt and Verify` | `PGPDecryptAndVerify` | [`PGPDecryptAndVerify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/PGPDecryptAndVerify.ts) |
| `PGP Encrypt` | `PGPEncrypt` | [`PGPEncrypt.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/PGPEncrypt.ts) |
| `PGP Encrypt and Sign` | `PGPEncryptAndSign` | [`PGPEncryptAndSign.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/PGPEncryptAndSign.ts) |
| `PGP Verify` | `PGPVerify` | [`PGPVerify.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/PGPVerify.ts) |

## Protobuf

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Protobuf Decode` | `ProtobufDecode` | [`ProtobufDecode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ProtobufDecode.ts) |
| `Protobuf Encode` | `ProtobufEncode` | [`ProtobufEncode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ProtobufEncode.ts) |

## PublicKey

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Hex to Object Identifier` | `HexToObjectIdentifier` | [`HexToObjectIdentifier.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/HexToObjectIdentifier.ts) |
| `Hex to PEM` | `HexToPEM` | [`HexToPEM.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/HexToPEM.ts) |
| `JWK to PEM` | `JWKToPem` | [`JWKToPem.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/JWKToPem.ts) |
| `Object Identifier to Hex` | `ObjectIdentifierToHex` | [`ObjectIdentifierToHex.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ObjectIdentifierToHex.ts) |
| `Parse ASN.1 hex string` | `ParseASN1HexString` | [`ParseASN1HexString.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseASN1HexString.ts) |
| `Parse CSR` | `ParseCSR` | [`ParseCSR.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseCSR.ts) |
| `Parse X.509 certificate` | `ParseX509Certificate` | [`ParseX509Certificate.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseX509Certificate.ts) |
| `Parse X.509 CRL` | `ParseX509CRL` | [`ParseX509CRL.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseX509CRL.ts) |
| `PEM to JWK` | `PEMToJWK` | [`PEMToJWK.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/PEMToJWK.ts) |
| `Public Key from Certificate` | `PubKeyFromCert` | [`PubKeyFromCert.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/PubKeyFromCert.ts) |
| `Public Key from Private Key` | `PubKeyFromPrivKey` | [`PubKeyFromPrivKey.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/PubKeyFromPrivKey.ts) |

## Regex

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Extract dates` | `ExtractDates` | [`ExtractDates.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ExtractDates.ts) |
| `Extract domains` | `ExtractDomains` | [`ExtractDomains.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ExtractDomains.ts) |
| `Extract email addresses` | `ExtractEmailAddresses` | [`ExtractEmailAddresses.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ExtractEmailAddresses.ts) |
| `Extract file paths` | `ExtractFilePaths` | [`ExtractFilePaths.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ExtractFilePaths.ts) |
| `Extract hashes` | `ExtractHashes` | [`ExtractHashes.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ExtractHashes.ts) |
| `Extract IP addresses` | `ExtractIPAddresses` | [`ExtractIPAddresses.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ExtractIPAddresses.ts) |
| `Extract MAC addresses` | `ExtractMACAddresses` | [`ExtractMACAddresses.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ExtractMACAddresses.ts) |
| `Extract URLs` | `ExtractURLs` | [`ExtractURLs.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ExtractURLs.ts) |
| `Filter` | `Filter` | [`Filter.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Filter.ts) |
| `Find / Replace` | `FindReplace` | [`FindReplace.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/FindReplace.ts) |
| `Register` | `Register` | [`Register.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Register.ts) |
| `Regular expression` | `RegularExpression` | [`RegularExpression.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/RegularExpression.ts) |
| `Strings` | `Strings` | [`Strings.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/Strings.ts) |

## Serialise

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Avro to JSON` | `AvroToJSON` | [`AvroToJSON.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/AvroToJSON.ts) |
| `BSON deserialise` | `BSONDeserialise` | [`BSONDeserialise.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/BSONDeserialise.ts) |
| `BSON serialise` | `BSONSerialise` | [`BSONSerialise.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/BSONSerialise.ts) |
| `CBOR Decode` | `CBORDecode` | [`CBORDecode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CBORDecode.ts) |
| `CBOR Encode` | `CBOREncode` | [`CBOREncode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/CBOREncode.ts) |
| `Parse ObjectID timestamp` | `ParseObjectIDTimestamp` | [`ParseObjectIDTimestamp.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseObjectIDTimestamp.ts) |

## Shellcode

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Disassemble ARM` | `DisassembleARM` | [`DisassembleARM.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DisassembleARM.ts) |
| `Disassemble x86` | `DisassembleX86` | [`DisassembleX86.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/DisassembleX86.ts) |

## URL

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Parse URI` | `ParseURI` | [`ParseURI.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseURI.ts) |
| `URL decode` | `URLDecode` | [`URLDecode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/URLDecode.ts) |
| `URL encode` | `URLEncode` | [`URLEncode.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/URLEncode.ts) |

## UserAgent

| Display name | Internal ID | Source |
| --- | --- | --- |
| `Parse User Agent` | `ParseUserAgent` | [`ParseUserAgent.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/ParseUserAgent.ts) |

## Yara

| Display name | Internal ID | Source |
| --- | --- | --- |
| `YARA Rules` | `YARARules` | [`YARARules.ts`](https://github.com/MichaelWeissDEV/ts-chef/blob/master/src/chef/operations/YARARules.ts) |

## Search tips

- Search by the visible display name, for example `From Base64`, `AES Decrypt`, or `JSON Beautify`.
- Use the Operations view to filter the same catalog interactively and configure arguments.
- Pipeline expressions are case-insensitive during lookup, but using the documented spelling makes shared definitions easier to read.
- An implementation is loaded lazily only when its arguments or execution code is needed.

