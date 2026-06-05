[**ts-chef API Documentation**](Home.md)

***

# Abstract Class: Operation

Defined in: [Operation.ts:71](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L71)

Abstract base class for all operations in ts-chef.

Each operation defines its metadata (name, description, arguments) 
and implements the `run` method to perform data transformation.

## Extended by

- [`A1Z26CipherDecode`](operations.Class.A1Z26CipherDecode.md)
- [`A1Z26CipherEncode`](operations.Class.A1Z26CipherEncode.md)
- [`ADD`](operations.Class.ADD.md)
- [`AddLineNumbers`](operations.Class.AddLineNumbers.md)
- [`Adler32Checksum`](operations.Class.Adler32Checksum.md)
- [`AESDecrypt`](operations.Class.AESDecrypt.md)
- [`AESEncrypt`](operations.Class.AESEncrypt.md)
- [`AESKeyUnwrap`](operations.Class.AESKeyUnwrap.md)
- [`AESKeyWrap`](operations.Class.AESKeyWrap.md)
- [`AffineCipherDecode`](operations.Class.AffineCipherDecode.md)
- [`AffineCipherEncode`](operations.Class.AffineCipherEncode.md)
- [`AlternatingCaps`](operations.Class.AlternatingCaps.md)
- [`AMFDecode`](operations.Class.AMFDecode.md)
- [`AMFEncode`](operations.Class.AMFEncode.md)
- [`AnalyseHash`](operations.Class.AnalyseHash.md)
- [`AnalyseUUID`](operations.Class.AnalyseUUID.md)
- [`AND`](operations.Class.AND.md)
- [`Argon2`](operations.Class.Argon2.md)
- [`Argon2Compare`](operations.Class.Argon2Compare.md)
- [`AtbashCipher`](operations.Class.AtbashCipher.md)
- [`AvroToJSON`](operations.Class.AvroToJSON.md)
- [`BaconCipherDecode`](operations.Class.BaconCipherDecode.md)
- [`BaconCipherEncode`](operations.Class.BaconCipherEncode.md)
- [`Bcrypt`](operations.Class.Bcrypt.md)
- [`BcryptCompare`](operations.Class.BcryptCompare.md)
- [`BcryptParse`](operations.Class.BcryptParse.md)
- [`BifidCipherDecode`](operations.Class.BifidCipherDecode.md)
- [`BifidCipherEncode`](operations.Class.BifidCipherEncode.md)
- [`BitShiftLeft`](operations.Class.BitShiftLeft.md)
- [`BitShiftRight`](operations.Class.BitShiftRight.md)
- [`BLAKE2b`](operations.Class.BLAKE2b.md)
- [`BLAKE2s`](operations.Class.BLAKE2s.md)
- [`BLAKE3`](operations.Class.BLAKE3.md)
- [`BlowfishDecrypt`](operations.Class.BlowfishDecrypt.md)
- [`BlowfishEncrypt`](operations.Class.BlowfishEncrypt.md)
- [`Bombe`](operations.Class.Bombe.md)
- [`BSONDeserialise`](operations.Class.BSONDeserialise.md)
- [`BSONSerialise`](operations.Class.BSONSerialise.md)
- [`Bzip2Compress`](operations.Class.Bzip2Compress.md)
- [`Bzip2Decompress`](operations.Class.Bzip2Decompress.md)
- [`CaesarBoxCipher`](operations.Class.CaesarBoxCipher.md)
- [`CBORDecode`](operations.Class.CBORDecode.md)
- [`CBOREncode`](operations.Class.CBOREncode.md)
- [`ChaCha`](operations.Class.ChaCha.md)
- [`ChangeIPFormat`](operations.Class.ChangeIPFormat.md)
- [`CaretMdecode`](operations.Class.CaretMdecode.md)
- [`CartesianProduct`](operations.Class.CartesianProduct.md)
- [`CetaceanCipherDecode`](operations.Class.CetaceanCipherDecode.md)
- [`CetaceanCipherEncode`](operations.Class.CetaceanCipherEncode.md)
- [`ChiSquare`](operations.Class.ChiSquare.md)
- [`CipherSaber2Decrypt`](operations.Class.CipherSaber2Decrypt.md)
- [`CipherSaber2Encrypt`](operations.Class.CipherSaber2Encrypt.md)
- [`CitrixCTX1Decode`](operations.Class.CitrixCTX1Decode.md)
- [`CitrixCTX1Encode`](operations.Class.CitrixCTX1Encode.md)
- [`CMAC`](operations.Class.CMAC.md)
- [`Colossus`](operations.Class.Colossus.md)
- [`Comment`](operations.Class.Comment.md)
- [`CSVToJSON`](operations.Class.CSVToJSON.md)
- [`CTPH`](operations.Class.CTPH.md)
- [`CompareCTPHHashes`](operations.Class.CompareCTPHHashes.md)
- [`CompareSSDEEPHashes`](operations.Class.CompareSSDEEPHashes.md)
- [`CSSSelector`](operations.Class.CSSSelector.md)
- [`ConditionalJump`](operations.Class.ConditionalJump.md)
- [`ConvertArea`](operations.Class.ConvertArea.md)
- [`ConvertCoordinateFormat`](operations.Class.ConvertCoordinateFormat.md)
- [`ConvertDataUnits`](operations.Class.ConvertDataUnits.md)
- [`ConvertDistance`](operations.Class.ConvertDistance.md)
- [`ConvertMass`](operations.Class.ConvertMass.md)
- [`ConvertSpeed`](operations.Class.ConvertSpeed.md)
- [`ConvertLeetSpeak`](operations.Class.ConvertLeetSpeak.md)
- [`ConvertToNATOAlphabet`](operations.Class.ConvertToNATOAlphabet.md)
- [`CountOccurrences`](operations.Class.CountOccurrences.md)
- [`CRCChecksum`](operations.Class.CRCChecksum.md)
- [`CSSBeautify`](operations.Class.CSSBeautify.md)
- [`CSSMinify`](operations.Class.CSSMinify.md)
- [`DropBytes`](operations.Class.DropBytes.md)
- [`DropNthBytes`](operations.Class.DropNthBytes.md)
- [`ExpandAlphabetRange`](operations.Class.ExpandAlphabetRange.md)
- [`Filter`](operations.Class.Filter.md)
- [`FindReplace`](operations.Class.FindReplace.md)
- [`FromBase64`](operations.Class.FromBase64.md)
- [`FromBinary`](operations.Class.FromBinary.md)
- [`FromCharcode`](operations.Class.FromCharcode.md)
- [`FromDecimal`](operations.Class.FromDecimal.md)
- [`FromFloat`](operations.Class.FromFloat.md)
- [`FromHex`](operations.Class.FromHex.md)
- [`FromHexContent`](operations.Class.FromHexContent.md)
- [`FromHexdump`](operations.Class.FromHexdump.md)
- [`FromHTMLEntity`](operations.Class.FromHTMLEntity.md)
- [`FromMorseCode`](operations.Class.FromMorseCode.md)
- [`FromOctal`](operations.Class.FromOctal.md)
- [`FromQuotedPrintable`](operations.Class.FromQuotedPrintable.md)
- [`FromUNIXTimestamp`](operations.Class.FromUNIXTimestamp.md)
- [`GenerateUUID`](operations.Class.GenerateUUID.md)
- [`GenericCodeBeautify`](operations.Class.GenericCodeBeautify.md)
- [`GetAllCasings`](operations.Class.GetAllCasings.md)
- [`GetTime`](operations.Class.GetTime.md)
- [`HammingDistance`](operations.Class.HammingDistance.md)
- [`Head`](operations.Class.Head.md)
- [`HTMLToText`](operations.Class.HTMLToText.md)
- [`IndexOfCoincidence`](operations.Class.IndexOfCoincidence.md)
- [`JSONBeautify`](operations.Class.JSONBeautify.md)
- [`JSONMinify`](operations.Class.JSONMinify.md)
- [`JSONToCSV`](operations.Class.JSONToCSV.md)
- [`JWTDecode`](operations.Class.JWTDecode.md)
- [`Label`](operations.Class.Label.md)
- [`LevenshteinDistance`](operations.Class.LevenshteinDistance.md)
- [`LuhnChecksum`](operations.Class.LuhnChecksum.md)
- [`LZStringCompress`](operations.Class.LZStringCompress.md)
- [`LZStringDecompress`](operations.Class.LZStringDecompress.md)
- [`Mean`](operations.Class.Mean.md)
- [`Median`](operations.Class.Median.md)
- [`Merge`](operations.Class.Merge.md)
- [`MicrosoftScriptDecoder`](operations.Class.MicrosoftScriptDecoder.md)
- [`MurmurHash3`](operations.Class.MurmurHash3.md)
- [`Multiply`](operations.Class.Multiply.md)
- [`NormaliseUnicode`](operations.Class.NormaliseUnicode.md)
- [`NOT`](operations.Class.NOT.md)
- [`Numberwang`](operations.Class.Numberwang.md)
- [`OR`](operations.Class.OR.md)
- [`PadLines`](operations.Class.PadLines.md)
- [`ParseURI`](operations.Class.ParseURI.md)
- [`PowerSet`](operations.Class.PowerSet.md)
- [`PseudoRandomIntegerGenerator`](operations.Class.PseudoRandomIntegerGenerator.md)
- [`RegularExpression`](operations.Class.RegularExpression.md)
- [`RemoveLineNumbers`](operations.Class.RemoveLineNumbers.md)
- [`RemoveNullBytes`](operations.Class.RemoveNullBytes.md)
- [`RemoveWhitespace`](operations.Class.RemoveWhitespace.md)
- [`Reverse`](operations.Class.Reverse.md)
- [`ROT13`](operations.Class.ROT13.md)
- [`ROT47`](operations.Class.ROT47.md)
- [`Salsa20`](operations.Class.Salsa20.md)
- [`Scrypt`](operations.Class.Scrypt.md)
- [`SetDifference`](operations.Class.SetDifference.md)
- [`SetIntersection`](operations.Class.SetIntersection.md)
- [`SetUnion`](operations.Class.SetUnion.md)
- [`SHA0`](operations.Class.SHA0.md)
- [`SHA1`](operations.Class.SHA1.md)
- [`SHA2`](operations.Class.SHA2.md)
- [`SHA3`](operations.Class.SHA3.md)
- [`Shake`](operations.Class.Shake.md)
- [`ShowBase64Offsets`](operations.Class.ShowBase64Offsets.md)
- [`Shuffle`](operations.Class.Shuffle.md)
- [`Sleep`](operations.Class.Sleep.md)
- [`SM2Decrypt`](operations.Class.SM2Decrypt.md)
- [`SM2Encrypt`](operations.Class.SM2Encrypt.md)
- [`SM3`](operations.Class.SM3.md)
- [`SM4Decrypt`](operations.Class.SM4Decrypt.md)
- [`SM4Encrypt`](operations.Class.SM4Encrypt.md)
- [`Snefru`](operations.Class.Snefru.md)
- [`Sort`](operations.Class.Sort.md)
- [`Split`](operations.Class.Split.md)
- [`SQLBeautify`](operations.Class.SQLBeautify.md)
- [`SQLMinify`](operations.Class.SQLMinify.md)
- [`SSDEEP`](operations.Class.SSDEEP.md)
- [`StandardDeviation`](operations.Class.StandardDeviation.md)
- [`Streebog`](operations.Class.Streebog.md)
- [`Strings`](operations.Class.Strings.md)
- [`StripHTMLTags`](operations.Class.StripHTMLTags.md)
- [`StripHTTPHeaders`](operations.Class.StripHTTPHeaders.md)
- [`StripIPv4Header`](operations.Class.StripIPv4Header.md)
- [`StripTCPHeader`](operations.Class.StripTCPHeader.md)
- [`StripUDPHeader`](operations.Class.StripUDPHeader.md)
- [`SUB`](operations.Class.SUB.md)
- [`Subsection`](operations.Class.Subsection.md)
- [`Substitute`](operations.Class.Substitute.md)
- [`Subtract`](operations.Class.Subtract.md)
- [`Sum`](operations.Class.Sum.md)
- [`SwapCase`](operations.Class.SwapCase.md)
- [`SwapEndianness`](operations.Class.SwapEndianness.md)
- [`SymmetricDifference`](operations.Class.SymmetricDifference.md)
- [`SyntaxHighlighter`](operations.Class.SyntaxHighlighter.md)
- [`Tail`](operations.Class.Tail.md)
- [`TakeBytes`](operations.Class.TakeBytes.md)
- [`TakeNthBytes`](operations.Class.TakeNthBytes.md)
- [`ToBase32`](operations.Class.ToBase32.md)
- [`ToBase45`](operations.Class.ToBase45.md)
- [`ToBase58`](operations.Class.ToBase58.md)
- [`ToBase62`](operations.Class.ToBase62.md)
- [`ToBase85`](operations.Class.ToBase85.md)
- [`ToBase92`](operations.Class.ToBase92.md)
- [`ToBCD`](operations.Class.ToBCD.md)
- [`ToBech32`](operations.Class.ToBech32.md)
- [`ToBinary`](operations.Class.ToBinary.md)
- [`ToBraille`](operations.Class.ToBraille.md)
- [`ToCamelCase`](operations.Class.ToCamelCase.md)
- [`ToCaseInsensitiveRegex`](operations.Class.ToCaseInsensitiveRegex.md)
- [`ToCharcode`](operations.Class.ToCharcode.md)
- [`ToDecimal`](operations.Class.ToDecimal.md)
- [`ToFloat`](operations.Class.ToFloat.md)
- [`ToHex`](operations.Class.ToHex.md)
- [`ToHexContent`](operations.Class.ToHexContent.md)
- [`ToHexdump`](operations.Class.ToHexdump.md)
- [`ToHTMLEntity`](operations.Class.ToHTMLEntity.md)
- [`ToKebabCase`](operations.Class.ToKebabCase.md)
- [`ToLowerCase`](operations.Class.ToLowerCase.md)
- [`ToMorseCode`](operations.Class.ToMorseCode.md)
- [`ToOctal`](operations.Class.ToOctal.md)
- [`ToPunycode`](operations.Class.ToPunycode.md)
- [`ToQuotedPrintable`](operations.Class.ToQuotedPrintable.md)
- [`ToSnakeCase`](operations.Class.ToSnakeCase.md)
- [`ToTable`](operations.Class.ToTable.md)
- [`ToUNIXTimestamp`](operations.Class.ToUNIXTimestamp.md)
- [`ToUpperCase`](operations.Class.ToUpperCase.md)
- [`TranslateDateTimeFormat`](operations.Class.TranslateDateTimeFormat.md)
- [`TripleDESDecrypt`](operations.Class.TripleDESDecrypt.md)
- [`TripleDESEncrypt`](operations.Class.TripleDESEncrypt.md)
- [`UnescapeString`](operations.Class.UnescapeString.md)
- [`UnescapeUnicodeCharacters`](operations.Class.UnescapeUnicodeCharacters.md)
- [`UnicodeTextFormat`](operations.Class.UnicodeTextFormat.md)
- [`Unique`](operations.Class.Unique.md)
- [`UNIXTimestampToWindowsFiletime`](operations.Class.UNIXTimestampToWindowsFiletime.md)
- [`Untar`](operations.Class.Untar.md)
- [`Unzip`](operations.Class.Unzip.md)
- [`URLDecode`](operations.Class.URLDecode.md)
- [`URLEncode`](operations.Class.URLEncode.md)
- [`VarIntDecode`](operations.Class.VarIntDecode.md)
- [`VarIntEncode`](operations.Class.VarIntEncode.md)
- [`Whirlpool`](operations.Class.Whirlpool.md)
- [`WindowsFiletimeToUNIXTimestamp`](operations.Class.WindowsFiletimeToUNIXTimestamp.md)
- [`Wrap`](operations.Class.Wrap.md)
- [`XKCDRandomNumber`](operations.Class.XKCDRandomNumber.md)
- [`XMLBeautify`](operations.Class.XMLBeautify.md)
- [`XMLMinify`](operations.Class.XMLMinify.md)
- [`XOR`](operations.Class.XOR.md)
- [`XORBruteForce`](operations.Class.XORBruteForce.md)
- [`XORChecksum`](operations.Class.XORChecksum.md)
- [`XPathExpression`](operations.Class.XPathExpression.md)
- [`XSalsa20`](operations.Class.XSalsa20.md)
- [`Zip`](operations.Class.Zip.md)
- [`ZlibDeflate`](operations.Class.ZlibDeflate.md)
- [`ZlibInflate`](operations.Class.ZlibInflate.md)

## Constructors

### Constructor

> **new Operation**(): `Operation`

#### Returns

`Operation`

## Properties

### args

> **args**: [`ArgConfig`](Operation.Interface.ArgConfig.md)[] = `[]`

Defined in: [Operation.ts:121](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L121)

List of arguments the operation accepts, defined via [[ArgConfig]].

***

### checks?

> `optional` **checks?**: `object`[]

Defined in: [Operation.ts:126](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L126)

Patterns and flags for automatic detection of when this operation might be applicable.

#### args

> **args**: `unknown`[]

#### flags

> **flags**: `string`

#### pattern

> **pattern**: `string`

***

### description

> **description**: `string` = `""`

Defined in: [Operation.ts:86](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L86)

Human-readable description of what the operation does.

***

### flowControl

> **flowControl**: `boolean` = `false`

Defined in: [Operation.ts:111](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L111)

Whether the operation supports flow control (e.g., 'Fork', 'Jump').

***

### infoURL

> **infoURL**: `string` = `null`

Defined in: [Operation.ts:91](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L91)

Optional URL for more information about the operation or algorithm (e.g., Wikipedia).

***

### inputType

> **inputType**: `string` = `"string"`

Defined in: [Operation.ts:96](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L96)

Expected input data type (e.g., 'string', 'byteArray', 'ArrayBuffer').

***

### manualBake

> **manualBake**: `boolean` = `false`

Defined in: [Operation.ts:116](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L116)

Whether the operation requires manual triggering rather than automatic baking.

***

### module

> **module**: `string` = `""`

Defined in: [Operation.ts:81](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L81)

Category or module the operation belongs to (e.g., 'Encryption', 'Hashing').

***

### name

> **name**: `string` = `""`

Defined in: [Operation.ts:76](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L76)

Internal name of the operation. 
Used for identification and display.

***

### outputType

> **outputType**: `string` = `"string"`

Defined in: [Operation.ts:101](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L101)

Expected output data type (e.g., 'string', 'byteArray', 'ArrayBuffer').

***

### presentType

> **presentType**: `string` = `"string"`

Defined in: [Operation.ts:106](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L106)

Type for presentation purposes. Defaults to `outputType`.

## Methods

### highlight()

> **highlight**(`_pos`, `_args`): [`HighlightResult`](Operation.TypeAlias.HighlightResult.md)

Defined in: [Operation.ts:164](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L164)

Calculates how selection in the input translates to selection in the output.

Used for synchronized highlighting between input and output panes.

#### Parameters

##### \_pos

[`HighlightPos`](Operation.TypeAlias.HighlightPos.md)

The current highlight positions in the input.

##### \_args

`any`[]

The arguments used.

#### Returns

[`HighlightResult`](Operation.TypeAlias.HighlightResult.md)

The corresponding highlight positions in the output, or `false`.

***

### highlightReverse()

> **highlightReverse**(`_pos`, `_args`): [`HighlightResult`](Operation.TypeAlias.HighlightResult.md)

Defined in: [Operation.ts:176](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L176)

Calculates how selection in the output translates back to selection in the input.

#### Parameters

##### \_pos

[`HighlightPos`](Operation.TypeAlias.HighlightPos.md)

The current highlight positions in the output.

##### \_args

`any`[]

The arguments used.

#### Returns

[`HighlightResult`](Operation.TypeAlias.HighlightResult.md)

The corresponding highlight positions in the input, or `false`.

***

### present()

> **present**(`data`, `_args`): `any`

Defined in: [Operation.ts:150](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L150)

Formats the output data for presentation in the UI.

By default, it returns the data as-is. Override this to provide
custom formatting (e.g., HTML rendering, image display).

#### Parameters

##### data

`any`

The output data from the [[run]] method.

##### \_args

`any`[]

The arguments used during execution.

#### Returns

`any`

The formatted presentation data.

***

### run()

> `abstract` **run**(`input`, `args`): `any`

Defined in: [Operation.ts:137](https://github.com/MichaelWeissDEV/ts-chef/blob/bdbca45ef0e6eb64c409f2b4715425aa432739b3/src/chef/Operation.ts#L137)

Executes the operation logic.

#### Parameters

##### input

`any`

The data to process. Can be string, byteArray, etc.

##### args

`any`[]

The arguments configured for this instance of the operation.

#### Returns

`any`

The processed data.

#### Throws

If processing fails.
