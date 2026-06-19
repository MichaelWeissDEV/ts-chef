/**
 * @fileoverview Operation registry managing all available ts-chef operations
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import type { Operation } from "./chef/Operation";

import { A1Z26CipherDecode } from "./chef/operations/A1Z26CipherDecode";
import { A1Z26CipherEncode } from "./chef/operations/A1Z26CipherEncode";
import { ADD } from "./chef/operations/ADD";
import { AddLineNumbers } from "./chef/operations/AddLineNumbers";
import { AddTextToImage } from "./chef/operations/AddTextToImage";
import { Adler32Checksum } from "./chef/operations/Adler32Checksum";
import { AESDecrypt } from "./chef/operations/AESDecrypt";
import { AESEncrypt } from "./chef/operations/AESEncrypt";
import { AESKeyUnwrap } from "./chef/operations/AESKeyUnwrap";
import { AESKeyWrap } from "./chef/operations/AESKeyWrap";
import { AffineCipherDecode } from "./chef/operations/AffineCipherDecode";
import { AffineCipherEncode } from "./chef/operations/AffineCipherEncode";
import { AlternatingCaps } from "./chef/operations/AlternatingCaps";
import { AMFDecode } from "./chef/operations/AMFDecode";
import { AMFEncode } from "./chef/operations/AMFEncode";
import { AnalyseHash } from "./chef/operations/AnalyseHash";
import { AnalyseUUID } from "./chef/operations/AnalyseUUID";
import { AND } from "./chef/operations/AND";
import { AtbashCipher } from "./chef/operations/AtbashCipher";
import { AvroToJSON } from "./chef/operations/AvroToJSON";
import { BaconCipherDecode } from "./chef/operations/BaconCipherDecode";
import { BaconCipherEncode } from "./chef/operations/BaconCipherEncode";
import { Bcrypt } from "./chef/operations/Bcrypt";
import { BcryptCompare } from "./chef/operations/BcryptCompare";
import { BcryptParse } from "./chef/operations/BcryptParse";
import { BifidCipherDecode } from "./chef/operations/BifidCipherDecode";
import { BifidCipherEncode } from "./chef/operations/BifidCipherEncode";
import { BitShiftLeft } from "./chef/operations/BitShiftLeft";
import { BitShiftRight } from "./chef/operations/BitShiftRight";
import { BLAKE2b } from "./chef/operations/BLAKE2b";
import { BLAKE2s } from "./chef/operations/BLAKE2s";
import { BLAKE3 } from "./chef/operations/BLAKE3";
import { BlowfishDecrypt } from "./chef/operations/BlowfishDecrypt";
import { BlowfishEncrypt } from "./chef/operations/BlowfishEncrypt";
import { BlurImage } from "./chef/operations/BlurImage";
import { Bombe } from "./chef/operations/Bombe";
import { BSONDeserialise } from "./chef/operations/BSONDeserialise";
import { BSONSerialise } from "./chef/operations/BSONSerialise";
import { CaesarBoxCipher } from "./chef/operations/CaesarBoxCipher";
import { CaretMdecode } from "./chef/operations/CaretMdecode";
import { CartesianProduct } from "./chef/operations/CartesianProduct";
import { CBORDecode } from "./chef/operations/CBORDecode";
import { CBOREncode } from "./chef/operations/CBOREncode";
import { CetaceanCipherDecode } from "./chef/operations/CetaceanCipherDecode";
import { CetaceanCipherEncode } from "./chef/operations/CetaceanCipherEncode";
import { ChaCha } from "./chef/operations/ChaCha";
import { ChangeIPFormat } from "./chef/operations/ChangeIPFormat";
import { ChiSquare } from "./chef/operations/ChiSquare";
import { CipherSaber2Decrypt } from "./chef/operations/CipherSaber2Decrypt";
import { CipherSaber2Encrypt } from "./chef/operations/CipherSaber2Encrypt";
import { CitrixCTX1Decode } from "./chef/operations/CitrixCTX1Decode";
import { CitrixCTX1Encode } from "./chef/operations/CitrixCTX1Encode";
import { CMAC } from "./chef/operations/CMAC";
import { Colossus } from "./chef/operations/Colossus";
import { Comment } from "./chef/operations/Comment";
import { CompareCTPHHashes } from "./chef/operations/CompareCTPHHashes";
import { CompareSSDEEPHashes } from "./chef/operations/CompareSSDEEPHashes";
import { ConditionalJump } from "./chef/operations/ConditionalJump";
import { ContainImage } from "./chef/operations/ContainImage";
import { ConvertArea } from "./chef/operations/ConvertArea";
import { ConvertCoordinateFormat } from "./chef/operations/ConvertCoordinateFormat";
import { ConvertDataUnits } from "./chef/operations/ConvertDataUnits";
import { ConvertDistance } from "./chef/operations/ConvertDistance";
import { ConvertImageFormat } from "./chef/operations/ConvertImageFormat";
import { ConvertLeetSpeak } from "./chef/operations/ConvertLeetSpeak";
import { ConvertMass } from "./chef/operations/ConvertMass";
import { ConvertSpeed } from "./chef/operations/ConvertSpeed";
import { ConvertToNATOAlphabet } from "./chef/operations/ConvertToNATOAlphabet";
import { CountOccurrences } from "./chef/operations/CountOccurrences";
import { CoverImage } from "./chef/operations/CoverImage";
import { CRCChecksum } from "./chef/operations/CRCChecksum";
import { CropImage } from "./chef/operations/CropImage";
import { CSSBeautify } from "./chef/operations/CSSBeautify";
import { CSSMinify } from "./chef/operations/CSSMinify";
import { CSVToJSON } from "./chef/operations/CSVToJSON";
import { CTPH } from "./chef/operations/CTPH";
import { DateTimeDelta } from "./chef/operations/DateTimeDelta";
import { DechunkHTTPResponse } from "./chef/operations/DechunkHTTPResponse";
import { DecodeNetBIOSName } from "./chef/operations/DecodeNetBIOSName";
import { DecodeText } from "./chef/operations/DecodeText";
import { DefangIPAddresses } from "./chef/operations/DefangIPAddresses";
import { DefangURL } from "./chef/operations/DefangURL";
import { DeriveEVPKey } from "./chef/operations/DeriveEVPKey";
import { DerivePBKDF2Key } from "./chef/operations/DerivePBKDF2Key";
import { DESDecrypt } from "./chef/operations/DESDecrypt";
import { DESEncrypt } from "./chef/operations/DESEncrypt";
import { DetectFileType } from "./chef/operations/DetectFileType";
import { Diff } from "./chef/operations/Diff";
import { DisassembleX86 } from "./chef/operations/DisassembleX86";
import { DitherImage } from "./chef/operations/DitherImage";
import { Divide } from "./chef/operations/Divide";
import { DNSOverHTTPS } from "./chef/operations/DNSOverHTTPS";
import { DropBytes } from "./chef/operations/DropBytes";
import { DropNthBytes } from "./chef/operations/DropNthBytes";
import { ECDSASign } from "./chef/operations/ECDSASign";
import { ECDSASignatureConversion } from "./chef/operations/ECDSASignatureConversion";
import { ECDSAVerify } from "./chef/operations/ECDSAVerify";
import { ELFInfo } from "./chef/operations/ELFInfo";
import { EncodeNetBIOSName } from "./chef/operations/EncodeNetBIOSName";
import { EncodeText } from "./chef/operations/EncodeText";
import { Enigma } from "./chef/operations/Enigma";
import { Entropy } from "./chef/operations/Entropy";
import { EscapeString } from "./chef/operations/EscapeString";
import { EscapeUnicodeCharacters } from "./chef/operations/EscapeUnicodeCharacters";
import { ExpandAlphabetRange } from "./chef/operations/ExpandAlphabetRange";
import { ExtractAudioMetadata } from "./chef/operations/ExtractAudioMetadata";
import { ExtractDates } from "./chef/operations/ExtractDates";
import { ExtractDomains } from "./chef/operations/ExtractDomains";
import { ExtractEmailAddresses } from "./chef/operations/ExtractEmailAddresses";
import { ExtractEXIF } from "./chef/operations/ExtractEXIF";
import { ExtractFilePaths } from "./chef/operations/ExtractFilePaths";
import { ExtractFiles } from "./chef/operations/ExtractFiles";
import { ExtractHashes } from "./chef/operations/ExtractHashes";
import { ExtractID3 } from "./chef/operations/ExtractID3";
import { ExtractIPAddresses } from "./chef/operations/ExtractIPAddresses";
import { ExtractLSB } from "./chef/operations/ExtractLSB";
import { ExtractMACAddresses } from "./chef/operations/ExtractMACAddresses";
import { ExtractRGBA } from "./chef/operations/ExtractRGBA";
import { ExtractURLs } from "./chef/operations/ExtractURLs";
import { FangURL } from "./chef/operations/FangURL";
import { FileTree } from "./chef/operations/FileTree";
import { Filter } from "./chef/operations/Filter";
import { FindReplace } from "./chef/operations/FindReplace";
import { FlaskSessionDecode } from "./chef/operations/FlaskSessionDecode";
import { Fletcher16Checksum } from "./chef/operations/Fletcher16Checksum";
import { Fletcher32Checksum } from "./chef/operations/Fletcher32Checksum";
import { Fletcher64Checksum } from "./chef/operations/Fletcher64Checksum";
import { Fletcher8Checksum } from "./chef/operations/Fletcher8Checksum";
import { FlipImage } from "./chef/operations/FlipImage";
import { Fork } from "./chef/operations/Fork";
import { FormatMACAddresses } from "./chef/operations/FormatMACAddresses";
import { FrequencyDistribution } from "./chef/operations/FrequencyDistribution";
import { FromBase } from "./chef/operations/FromBase";
import { FromBase32 } from "./chef/operations/FromBase32";
import { FromBase45 } from "./chef/operations/FromBase45";
import { FromBase58 } from "./chef/operations/FromBase58";
import { FromBase62 } from "./chef/operations/FromBase62";
import { FromBase64 } from "./chef/operations/FromBase64";
import { FromBase85 } from "./chef/operations/FromBase85";
import { FromBase92 } from "./chef/operations/FromBase92";
import { FromBCD } from "./chef/operations/FromBCD";
import { FromBech32 } from "./chef/operations/FromBech32";
import { FromBinary } from "./chef/operations/FromBinary";
import { FromBraille } from "./chef/operations/FromBraille";
import { FromCaseInsensitiveRegex } from "./chef/operations/FromCaseInsensitiveRegex";
import { FromCharcode } from "./chef/operations/FromCharcode";
import { FromDecimal } from "./chef/operations/FromDecimal";
import { FromFloat } from "./chef/operations/FromFloat";
import { FromHex } from "./chef/operations/FromHex";
import { FromHexContent } from "./chef/operations/FromHexContent";
import { FromHexdump } from "./chef/operations/FromHexdump";
import { FromHTMLEntity } from "./chef/operations/FromHTMLEntity";
import { FromMessagePack } from "./chef/operations/FromMessagePack";
import { FromModhex } from "./chef/operations/FromModhex";
import { FromMorseCode } from "./chef/operations/FromMorseCode";
import { FromOctal } from "./chef/operations/FromOctal";
import { FromPunycode } from "./chef/operations/FromPunycode";
import { FromQuotedPrintable } from "./chef/operations/FromQuotedPrintable";
import { FromRadix } from "./chef/operations/FromRadix";
import { FromUNIXTimestamp } from "./chef/operations/FromUNIXTimestamp";
import { FuzzyMatch } from "./chef/operations/FuzzyMatch";
import { GenerateAllChecksums } from "./chef/operations/GenerateAllChecksums";
import { GenerateDeBruijnSequence } from "./chef/operations/GenerateDeBruijnSequence";
import { GenerateECDSAKeyPair } from "./chef/operations/GenerateECDSAKeyPair";
import { GenerateImage } from "./chef/operations/GenerateImage";
import { GenerateLoremIpsum } from "./chef/operations/GenerateLoremIpsum";
import { GenerateRSAKeyPair } from "./chef/operations/GenerateRSAKeyPair";
import { GenerateUUID } from "./chef/operations/GenerateUUID";
import { GenericCodeBeautify } from "./chef/operations/GenericCodeBeautify";
import { GetAllCasings } from "./chef/operations/GetAllCasings";
import { GetTime } from "./chef/operations/GetTime";
import { GOSTHash } from "./chef/operations/GOSTHash";
import { GroupIPAddresses } from "./chef/operations/GroupIPAddresses";
import { Gunzip } from "./chef/operations/Gunzip";
import { Gzip } from "./chef/operations/Gzip";
import { HammingDistance } from "./chef/operations/HammingDistance";
import { HaversineDistance } from "./chef/operations/HaversineDistance";
import { Head } from "./chef/operations/Head";
import { HeatmapChart } from "./chef/operations/HeatmapChart";
import { HexDensityChart } from "./chef/operations/HexDensityChart";
import { HexToObjectIdentifier } from "./chef/operations/HexToObjectIdentifier";
import { HexToPEM } from "./chef/operations/HexToPEM";
import { HTMLToText } from "./chef/operations/HTMLToText";
import { HTTPRequest } from "./chef/operations/HTTPRequest";
import { ImageBrightnessContrast } from "./chef/operations/ImageBrightnessContrast";
import { ImageFilter } from "./chef/operations/ImageFilter";
import { ImageHueSaturationLightness } from "./chef/operations/ImageHueSaturationLightness";
import { ImageOpacity } from "./chef/operations/ImageOpacity";
import { IndexOfCoincidence } from "./chef/operations/IndexOfCoincidence";
import { InvertImage } from "./chef/operations/InvertImage";
import { IPv6TransitionAddresses } from "./chef/operations/IPv6TransitionAddresses";
import { JavaScriptParser } from "./chef/operations/JavaScriptParser";
import { JSONBeautify } from "./chef/operations/JSONBeautify";
import { JSONMinify } from "./chef/operations/JSONMinify";
import { JSONToCSV } from "./chef/operations/JSONToCSV";
import { JSONtoYAML } from "./chef/operations/JSONtoYAML";
import { Jump } from "./chef/operations/Jump";
import { JWKToPem } from "./chef/operations/JWKToPem";
import { JWTDecode } from "./chef/operations/JWTDecode";
import { JWTSign } from "./chef/operations/JWTSign";
import { JWTVerify } from "./chef/operations/JWTVerify";
import { Keccak } from "./chef/operations/Keccak";
import { Label } from "./chef/operations/Label";
import { LevenshteinDistance } from "./chef/operations/LevenshteinDistance";
import { LMHash } from "./chef/operations/LMHash";
import { Lorenz } from "./chef/operations/Lorenz";
import { LS47Decrypt } from "./chef/operations/LS47Decrypt";
import { LS47Encrypt } from "./chef/operations/LS47Encrypt";
import { LuhnChecksum } from "./chef/operations/LuhnChecksum";
import { LZ4Compress } from "./chef/operations/LZ4Compress";
import { LZ4Decompress } from "./chef/operations/LZ4Decompress";
import { LZNT1Decompress } from "./chef/operations/LZNT1Decompress";
import { LZStringCompress } from "./chef/operations/LZStringCompress";
import { LZStringDecompress } from "./chef/operations/LZStringDecompress";
import { Magic } from "./chef/operations/Magic";
import { Mean } from "./chef/operations/Mean";
import { Median } from "./chef/operations/Median";
import { Merge } from "./chef/operations/Merge";
import { MicrosoftScriptDecoder } from "./chef/operations/MicrosoftScriptDecoder";
import { MIMEDecoding } from "./chef/operations/MIMEDecoding";
import { MultipleBombe } from "./chef/operations/MultipleBombe";
import { Multiply } from "./chef/operations/Multiply";
import { MurmurHash3 } from "./chef/operations/MurmurHash3";
import { NormaliseImage } from "./chef/operations/NormaliseImage";
import { NormaliseUnicode } from "./chef/operations/NormaliseUnicode";
import { NOT } from "./chef/operations/NOT";
import { Numberwang } from "./chef/operations/Numberwang";
import { ObjectIdentifierToHex } from "./chef/operations/ObjectIdentifierToHex";
import { OffsetChecker } from "./chef/operations/OffsetChecker";
import { OR } from "./chef/operations/OR";
import { PlistViewer as PLISTViewer } from "./chef/operations/PLISTViewer";
import { PadLines } from "./chef/operations/PadLines";
import { ParityBit } from "./chef/operations/ParityBit";
import { ParseASN1HexString } from "./chef/operations/ParseASN1HexString";
import { ParseColourCode } from "./chef/operations/ParseColourCode";
import { ParseCSR } from "./chef/operations/ParseCSR";
import { ParseDateTime } from "./chef/operations/ParseDateTime";
import { ParseEthernetFrame } from "./chef/operations/ParseEthernetFrame";
import { ParseIPRange } from "./chef/operations/ParseIPRange";
import { ParseIPv4Header } from "./chef/operations/ParseIPv4Header";
import { ParseIPv6Address } from "./chef/operations/ParseIPv6Address";
import { ParseObjectIDTimestamp } from "./chef/operations/ParseObjectIDTimestamp";
import { ParseSSHHostKey } from "./chef/operations/ParseSSHHostKey";
import { ParseTCP } from "./chef/operations/ParseTCP";
import { ParseTLSRecord } from "./chef/operations/ParseTLSRecord";
import { ParseTLV } from "./chef/operations/ParseTLV";
import { ParseUDP } from "./chef/operations/ParseUDP";
import { ParseUNIXFilePermissions } from "./chef/operations/ParseUNIXFilePermissions";
import { ParseURI } from "./chef/operations/ParseURI";
import { ParseX509CRL } from "./chef/operations/ParseX509CRL";
import { PEMToHex } from "./chef/operations/PEMToHex";
import { PEMToJWK } from "./chef/operations/PEMToJWK";
import { PHPDeserialize } from "./chef/operations/PHPDeserialize";
import { PHPSerialize } from "./chef/operations/PHPSerialize";
import { PlayMedia } from "./chef/operations/PlayMedia";
import { PowerSet } from "./chef/operations/PowerSet";
import { PseudoRandomIntegerGenerator } from "./chef/operations/PseudoRandomIntegerGenerator";
import { PseudoRandomNumberGenerator } from "./chef/operations/PseudoRandomNumberGenerator";
import { PubKeyFromCert } from "./chef/operations/PubKeyFromCert";
import { PubKeyFromPrivKey } from "./chef/operations/PubKeyFromPrivKey";
import { Rabbit } from "./chef/operations/Rabbit";
import { RailFenceCipherDecode } from "./chef/operations/RailFenceCipherDecode";
import { RailFenceCipherEncode } from "./chef/operations/RailFenceCipherEncode";
import { RAKE } from "./chef/operations/RAKE";
import { RawDeflate } from "./chef/operations/RawDeflate";
import { RawInflate } from "./chef/operations/RawInflate";
import { RC2Decrypt } from "./chef/operations/RC2Decrypt";
import { RC2Encrypt } from "./chef/operations/RC2Encrypt";
import { RC4 } from "./chef/operations/RC4";
import { RC4Drop } from "./chef/operations/RC4Drop";
import { RC6Decrypt } from "./chef/operations/RC6Decrypt";
import { RC6Encrypt } from "./chef/operations/RC6Encrypt";
import { Register } from "./chef/operations/Register";
import { RegularExpression } from "./chef/operations/RegularExpression";
import { RemoveDiacritics } from "./chef/operations/RemoveDiacritics";
import { RemoveEXIF } from "./chef/operations/RemoveEXIF";
import { RemoveLineNumbers } from "./chef/operations/RemoveLineNumbers";
import { RemoveNullBytes } from "./chef/operations/RemoveNullBytes";
import { RemoveWhitespace } from "./chef/operations/RemoveWhitespace";
import { RenderImage } from "./chef/operations/RenderImage";
import { RenderMarkdown } from "./chef/operations/RenderMarkdown";
import { ResizeImage } from "./chef/operations/ResizeImage";
import { Return } from "./chef/operations/Return";
import { Reverse } from "./chef/operations/Reverse";
import { RisonDecode } from "./chef/operations/RisonDecode";
import { RisonEncode } from "./chef/operations/RisonEncode";
import { ROT13 } from "./chef/operations/ROT13";
import { ROT13BruteForce } from "./chef/operations/ROT13BruteForce";
import { ROT47 } from "./chef/operations/ROT47";
import { ROT47BruteForce } from "./chef/operations/ROT47BruteForce";
import { ROT8000 } from "./chef/operations/ROT8000";
import { RotateImage } from "./chef/operations/RotateImage";
import { RotateLeft } from "./chef/operations/RotateLeft";
import { RotateRight } from "./chef/operations/RotateRight";
import { RSADecrypt } from "./chef/operations/RSADecrypt";
import { RSAEncrypt } from "./chef/operations/RSAEncrypt";
import { RSASign } from "./chef/operations/RSASign";
import { RSAVerify } from "./chef/operations/RSAVerify";
import { Salsa20 } from "./chef/operations/Salsa20";
import { ScanForEmbeddedFiles } from "./chef/operations/ScanForEmbeddedFiles";
import { ScatterChart } from "./chef/operations/ScatterChart";
import { Scrypt } from "./chef/operations/Scrypt";
import { SeriesChart } from "./chef/operations/SeriesChart";
import { SetDifference } from "./chef/operations/SetDifference";
import { SetIntersection } from "./chef/operations/SetIntersection";
import { SetUnion } from "./chef/operations/SetUnion";
import { SHA0 } from "./chef/operations/SHA0";
import { SHA1 } from "./chef/operations/SHA1";
import { SHA2 } from "./chef/operations/SHA2";
import { SHA3 } from "./chef/operations/SHA3";
import { Shake } from "./chef/operations/Shake";
import { SharpenImage } from "./chef/operations/SharpenImage";
import { ShowBase64Offsets } from "./chef/operations/ShowBase64Offsets";
import { ShowOnMap } from "./chef/operations/ShowOnMap";
import { Shuffle } from "./chef/operations/Shuffle";
import { Sigaba as SIGABA } from "./chef/operations/SIGABA";
import { Sleep } from "./chef/operations/Sleep";
import { SM2Decrypt } from "./chef/operations/SM2Decrypt";
import { SM2Encrypt } from "./chef/operations/SM2Encrypt";
import { SM3 } from "./chef/operations/SM3";
import { SM4Decrypt } from "./chef/operations/SM4Decrypt";
import { SM4Encrypt } from "./chef/operations/SM4Encrypt";
import { Snefru } from "./chef/operations/Snefru";
import { Sort } from "./chef/operations/Sort";
import { Split } from "./chef/operations/Split";
import { SplitColourChannels } from "./chef/operations/SplitColourChannels";
import { SQLBeautify } from "./chef/operations/SQLBeautify";
import { SQLMinify } from "./chef/operations/SQLMinify";
import { SSDEEP } from "./chef/operations/SSDEEP";
import { StandardDeviation } from "./chef/operations/StandardDeviation";
import { Streebog } from "./chef/operations/Streebog";
import { Strings } from "./chef/operations/Strings";
import { StripHTMLTags } from "./chef/operations/StripHTMLTags";
import { StripHTTPHeaders } from "./chef/operations/StripHTTPHeaders";
import { StripIPv4Header } from "./chef/operations/StripIPv4Header";
import { StripTCPHeader } from "./chef/operations/StripTCPHeader";
import { StripUDPHeader } from "./chef/operations/StripUDPHeader";
import { SUB } from "./chef/operations/SUB";
import { Subsection } from "./chef/operations/Subsection";
import { Substitute } from "./chef/operations/Substitute";
import { Subtract } from "./chef/operations/Subtract";
import { Sum } from "./chef/operations/Sum";
import { SwapCase } from "./chef/operations/SwapCase";
import { SwapEndianness } from "./chef/operations/SwapEndianness";
import { SymmetricDifference } from "./chef/operations/SymmetricDifference";
import { SyntaxHighlighter } from "./chef/operations/SyntaxHighlighter";
import { Tail } from "./chef/operations/Tail";
import { TakeBytes } from "./chef/operations/TakeBytes";
import { TakeNthBytes } from "./chef/operations/TakeNthBytes";
import { Tar } from "./chef/operations/Tar";
import { TCPIPChecksum } from "./chef/operations/TCPIPChecksum";
import { Template } from "./chef/operations/Template";
import { TextEncodingBruteForce } from "./chef/operations/TextEncodingBruteForce";
import { TextIntegerConverter } from "./chef/operations/TextIntegerConverter";
import { ToBase } from "./chef/operations/ToBase";
import { ToBase32 } from "./chef/operations/ToBase32";
import { ToBase45 } from "./chef/operations/ToBase45";
import { ToBase58 } from "./chef/operations/ToBase58";
import { ToBase62 } from "./chef/operations/ToBase62";
import { ToBase64 } from "./chef/operations/ToBase64";
import { ToBase85 } from "./chef/operations/ToBase85";
import { ToBase92 } from "./chef/operations/ToBase92";
import { ToBCD } from "./chef/operations/ToBCD";
import { ToBech32 } from "./chef/operations/ToBech32";
import { ToBinary } from "./chef/operations/ToBinary";
import { ToBraille } from "./chef/operations/ToBraille";
import { ToCamelCase } from "./chef/operations/ToCamelCase";
import { ToCaseInsensitiveRegex } from "./chef/operations/ToCaseInsensitiveRegex";
import { ToCharcode } from "./chef/operations/ToCharcode";
import { ToDecimal } from "./chef/operations/ToDecimal";
import { ToFloat } from "./chef/operations/ToFloat";
import { ToHex } from "./chef/operations/ToHex";
import { ToHexContent } from "./chef/operations/ToHexContent";
import { ToHexdump } from "./chef/operations/ToHexdump";
import { ToHTMLEntity } from "./chef/operations/ToHTMLEntity";
import { ToKebabCase } from "./chef/operations/ToKebabCase";
import { ToLowerCase } from "./chef/operations/ToLowerCase";
import { ToMessagePack } from "./chef/operations/ToMessagePack";
import { ToModhex } from "./chef/operations/ToModhex";
import { ToMorseCode } from "./chef/operations/ToMorseCode";
import { ToOctal } from "./chef/operations/ToOctal";
import { ToPunycode } from "./chef/operations/ToPunycode";
import { ToQuotedPrintable } from "./chef/operations/ToQuotedPrintable";
import { ToRadix } from "./chef/operations/ToRadix";
import { ToSnakeCase } from "./chef/operations/ToSnakeCase";
import { ToTable } from "./chef/operations/ToTable";
import { ToUNIXTimestamp } from "./chef/operations/ToUNIXTimestamp";
import { ToUpperCase } from "./chef/operations/ToUpperCase";
import { TranslateDateTimeFormat } from "./chef/operations/TranslateDateTimeFormat";
import { TripleDESDecrypt } from "./chef/operations/TripleDESDecrypt";
import { TripleDESEncrypt } from "./chef/operations/TripleDESEncrypt";
import { Typex } from "./chef/operations/Typex";
import { UnescapeString } from "./chef/operations/UnescapeString";
import { UnescapeUnicodeCharacters } from "./chef/operations/UnescapeUnicodeCharacters";
import { UnicodeTextFormat } from "./chef/operations/UnicodeTextFormat";
import { Unique } from "./chef/operations/Unique";
import { UNIXTimestampToWindowsFiletime } from "./chef/operations/UNIXTimestampToWindowsFiletime";
import { Untar } from "./chef/operations/Untar";
import { Unzip } from "./chef/operations/Unzip";
import { URLDecode } from "./chef/operations/URLDecode";
import { URLEncode } from "./chef/operations/URLEncode";
import { VarIntDecode } from "./chef/operations/VarIntDecode";
import { VarIntEncode } from "./chef/operations/VarIntEncode";
import { ViewBitPlane } from "./chef/operations/ViewBitPlane";
import VigenèreDecode from "./chef/operations/VigenèreDecode";
import VigenèreEncode from "./chef/operations/VigenèreEncode";
import { Whirlpool } from "./chef/operations/Whirlpool";
import { WindowsFiletimeToUNIXTimestamp } from "./chef/operations/WindowsFiletimeToUNIXTimestamp";
import { Wrap } from "./chef/operations/Wrap";
import { XKCDRandomNumber } from "./chef/operations/XKCDRandomNumber";
import { XMLBeautify } from "./chef/operations/XMLBeautify";
import { XMLMinify } from "./chef/operations/XMLMinify";
import { XOR } from "./chef/operations/XOR";
import { XORBruteForce } from "./chef/operations/XORBruteForce";
import { XORChecksum } from "./chef/operations/XORChecksum";
import { XPathExpression } from "./chef/operations/XPathExpression";
import { XSalsa20 } from "./chef/operations/XSalsa20";
import { XXTEADecrypt } from "./chef/operations/XXTEADecrypt";
import { XXTEAEncrypt } from "./chef/operations/XXTEAEncrypt";
import { YAMLToJSON } from "./chef/operations/YAMLToJSON";
import { YARARules } from "./chef/operations/YARARules";
import { Zip } from "./chef/operations/Zip";
import { ZlibDeflate } from "./chef/operations/ZlibDeflate";
import { ZlibInflate } from "./chef/operations/ZlibInflate";

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
    factory: () => new A1Z26CipherDecode(),
  },
  {
    opName: "A1Z26CipherEncode",
    displayName: "A1Z26 Cipher Encode",
    module: "Ciphers",
    factory: () => new A1Z26CipherEncode(),
  },
  {
    opName: "ADD",
    displayName: "ADD",
    module: "Arithmetic",
    factory: () => new ADD(),
  },
  {
    opName: "AddLineNumbers",
    displayName: "Add line numbers",
    module: "Default",
    factory: () => new AddLineNumbers(),
  },
  {
    opName: "AddTextToImage",
    displayName: "Add Text To Image",
    module: "Image",
    factory: () => new AddTextToImage(),
  },
  {
    opName: "Adler32Checksum",
    displayName: "Adler-32 Checksum",
    module: "Crypto",
    factory: () => new Adler32Checksum(),
  },
  {
    opName: "AESDecrypt",
    displayName: "AES Decrypt",
    module: "Ciphers",
    factory: () => new AESDecrypt(),
  },
  {
    opName: "AESEncrypt",
    displayName: "AES Encrypt",
    module: "Ciphers",
    factory: () => new AESEncrypt(),
  },
  {
    opName: "AESKeyUnwrap",
    displayName: "AES Key Unwrap",
    module: "Ciphers",
    factory: () => new AESKeyUnwrap(),
  },
  {
    opName: "AESKeyWrap",
    displayName: "AES Key Wrap",
    module: "Ciphers",
    factory: () => new AESKeyWrap(),
  },
  {
    opName: "AffineCipherDecode",
    displayName: "Affine Cipher Decode",
    module: "Ciphers",
    factory: () => new AffineCipherDecode(),
  },
  {
    opName: "AffineCipherEncode",
    displayName: "Affine Cipher Encode",
    module: "Ciphers",
    factory: () => new AffineCipherEncode(),
  },
  {
    opName: "AlternatingCaps",
    displayName: "Alternating Caps",
    module: "Default",
    factory: () => new AlternatingCaps(),
  },
  {
    opName: "AMFDecode",
    displayName: "AMF Decode",
    module: "Encodings",
    factory: () => new AMFDecode(),
  },
  {
    opName: "AMFEncode",
    displayName: "AMF Encode",
    module: "Encodings",
    factory: () => new AMFEncode(),
  },
  {
    opName: "AnalyseHash",
    displayName: "Analyse hash",
    module: "Crypto",
    factory: () => new AnalyseHash(),
  },
  {
    opName: "AnalyseUUID",
    displayName: "Analyse UUID",
    module: "Crypto",
    factory: () => new AnalyseUUID(),
  },
  {
    opName: "AND",
    displayName: "AND",
    module: "Default",
    factory: () => new AND(),
  },
  {
    opName: "AtbashCipher",
    displayName: "Atbash Cipher",
    module: "Ciphers",
    factory: () => new AtbashCipher(),
  },
  {
    opName: "AvroToJSON",
    displayName: "Avro to JSON",
    module: "Serialise",
    factory: () => new AvroToJSON(),
  },
  {
    opName: "BaconCipherDecode",
    displayName: "Bacon Cipher Decode",
    module: "Default",
    factory: () => new BaconCipherDecode(),
  },
  {
    opName: "BaconCipherEncode",
    displayName: "Bacon Cipher Encode",
    module: "Default",
    factory: () => new BaconCipherEncode(),
  },
  {
    opName: "Bcrypt",
    displayName: "Bcrypt",
    module: "Crypto",
    factory: () => new Bcrypt(),
  },
  {
    opName: "BcryptCompare",
    displayName: "Bcrypt compare",
    module: "Crypto",
    factory: () => new BcryptCompare(),
  },
  {
    opName: "BcryptParse",
    displayName: "Bcrypt parse",
    module: "Crypto",
    factory: () => new BcryptParse(),
  },
  {
    opName: "BifidCipherDecode",
    displayName: "Bifid Cipher Decode",
    module: "Ciphers",
    factory: () => new BifidCipherDecode(),
  },
  {
    opName: "BifidCipherEncode",
    displayName: "Bifid Cipher Encode",
    module: "Ciphers",
    factory: () => new BifidCipherEncode(),
  },
  {
    opName: "BitShiftLeft",
    displayName: "Bit shift left",
    module: "Default",
    factory: () => new BitShiftLeft(),
  },
  {
    opName: "BitShiftRight",
    displayName: "Bit shift right",
    module: "Default",
    factory: () => new BitShiftRight(),
  },
  {
    opName: "BLAKE2b",
    displayName: "BLAKE2b",
    module: "Hashing",
    factory: () => new BLAKE2b(),
  },
  {
    opName: "BLAKE2s",
    displayName: "BLAKE2s",
    module: "Hashing",
    factory: () => new BLAKE2s(),
  },
  {
    opName: "BLAKE3",
    displayName: "BLAKE3",
    module: "Hashing",
    factory: () => new BLAKE3(),
  },
  {
    opName: "BlowfishDecrypt",
    displayName: "Blowfish Decrypt",
    module: "Ciphers",
    factory: () => new BlowfishDecrypt(),
  },
  {
    opName: "BlowfishEncrypt",
    displayName: "Blowfish Encrypt",
    module: "Ciphers",
    factory: () => new BlowfishEncrypt(),
  },
  {
    opName: "BlurImage",
    displayName: "Blur Image",
    module: "Image",
    factory: () => new BlurImage(),
  },
  {
    opName: "Bombe",
    displayName: "Bombe",
    module: "Bletchley",
    factory: () => new Bombe(),
  },
  {
    opName: "BSONDeserialise",
    displayName: "BSON deserialise",
    module: "Serialise",
    factory: () => new BSONDeserialise(),
  },
  {
    opName: "BSONSerialise",
    displayName: "BSON serialise",
    module: "Serialise",
    factory: () => new BSONSerialise(),
  },
  {
    opName: "CaesarBoxCipher",
    displayName: "Caesar Box Cipher",
    module: "Ciphers",
    factory: () => new CaesarBoxCipher(),
  },
  {
    opName: "CaretMdecode",
    displayName: "Caret/M-decode",
    module: "Default",
    factory: () => new CaretMdecode(),
  },
  {
    opName: "CartesianProduct",
    displayName: "Cartesian Product",
    module: "Default",
    factory: () => new CartesianProduct(),
  },
  {
    opName: "CBORDecode",
    displayName: "CBOR Decode",
    module: "Serialise",
    factory: () => new CBORDecode(),
  },
  {
    opName: "CBOREncode",
    displayName: "CBOR Encode",
    module: "Serialise",
    factory: () => new CBOREncode(),
  },
  {
    opName: "CetaceanCipherDecode",
    displayName: "Cetacean Cipher Decode",
    module: "Ciphers",
    factory: () => new CetaceanCipherDecode(),
  },
  {
    opName: "CetaceanCipherEncode",
    displayName: "Cetacean Cipher Encode",
    module: "Ciphers",
    factory: () => new CetaceanCipherEncode(),
  },
  {
    opName: "ChaCha",
    displayName: "ChaCha",
    module: "Ciphers",
    factory: () => new ChaCha(),
  },
  {
    opName: "ChangeIPFormat",
    displayName: "Change IP format",
    module: "Default",
    factory: () => new ChangeIPFormat(),
  },
  {
    opName: "ChiSquare",
    displayName: "Chi Square",
    module: "Default",
    factory: () => new ChiSquare(),
  },
  {
    opName: "CipherSaber2Decrypt",
    displayName: "CipherSaber2 Decrypt",
    module: "Crypto",
    factory: () => new CipherSaber2Decrypt(),
  },
  {
    opName: "CipherSaber2Encrypt",
    displayName: "CipherSaber2 Encrypt",
    module: "Crypto",
    factory: () => new CipherSaber2Encrypt(),
  },
  {
    opName: "CitrixCTX1Decode",
    displayName: "Citrix CTX1 Decode",
    module: "Encodings",
    factory: () => new CitrixCTX1Decode(),
  },
  {
    opName: "CitrixCTX1Encode",
    displayName: "Citrix CTX1 Encode",
    module: "Encodings",
    factory: () => new CitrixCTX1Encode(),
  },
  {
    opName: "CMAC",
    displayName: "CMAC",
    module: "Crypto",
    factory: () => new CMAC(),
  },
  {
    opName: "Colossus",
    displayName: "Colossus",
    module: "Bletchley",
    factory: () => new Colossus(),
  },
  {
    opName: "Comment",
    displayName: "Comment",
    module: "Default",
    factory: () => new Comment(),
  },
  {
    opName: "CompareCTPHHashes",
    displayName: "Compare CTPH hashes",
    module: "Crypto",
    factory: () => new CompareCTPHHashes(),
  },
  {
    opName: "CompareSSDEEPHashes",
    displayName: "Compare SSDEEP hashes",
    module: "Crypto",
    factory: () => new CompareSSDEEPHashes(),
  },
  {
    opName: "ConditionalJump",
    displayName: "Conditional Jump",
    module: "Default",
    factory: () => new ConditionalJump(),
  },
  {
    opName: "ContainImage",
    displayName: "Contain Image",
    module: "Image",
    factory: () => new ContainImage(),
  },
  {
    opName: "ConvertArea",
    displayName: "Convert area",
    module: "Default",
    factory: () => new ConvertArea(),
  },
  {
    opName: "ConvertCoordinateFormat",
    displayName: "Convert co-ordinate format",
    module: "Hashing",
    factory: () => new ConvertCoordinateFormat(),
  },
  {
    opName: "ConvertDataUnits",
    displayName: "Convert data units",
    module: "Default",
    factory: () => new ConvertDataUnits(),
  },
  {
    opName: "ConvertDistance",
    displayName: "Convert distance",
    module: "Default",
    factory: () => new ConvertDistance(),
  },
  {
    opName: "ConvertImageFormat",
    displayName: "Convert Image Format",
    module: "Image",
    factory: () => new ConvertImageFormat(),
  },
  {
    opName: "ConvertLeetSpeak",
    displayName: "Convert Leet Speak",
    module: "Default",
    factory: () => new ConvertLeetSpeak(),
  },
  {
    opName: "ConvertMass",
    displayName: "Convert mass",
    module: "Default",
    factory: () => new ConvertMass(),
  },
  {
    opName: "ConvertSpeed",
    displayName: "Convert speed",
    module: "Default",
    factory: () => new ConvertSpeed(),
  },
  {
    opName: "ConvertToNATOAlphabet",
    displayName: "Convert to NATO alphabet",
    module: "Default",
    factory: () => new ConvertToNATOAlphabet(),
  },
  {
    opName: "CountOccurrences",
    displayName: "Count occurrences",
    module: "Default",
    factory: () => new CountOccurrences(),
  },
  {
    opName: "CoverImage",
    displayName: "Cover Image",
    module: "Image",
    factory: () => new CoverImage(),
  },
  {
    opName: "CRCChecksum",
    displayName: "CRC Checksum",
    module: "Default",
    factory: () => new CRCChecksum(),
  },
  {
    opName: "CropImage",
    displayName: "Crop Image",
    module: "Image",
    factory: () => new CropImage(),
  },
  {
    opName: "CSSBeautify",
    displayName: "CSS Beautify",
    module: "Code",
    factory: () => new CSSBeautify(),
  },
  {
    opName: "CSSMinify",
    displayName: "CSS Minify",
    module: "Code",
    factory: () => new CSSMinify(),
  },
  {
    opName: "CSVToJSON",
    displayName: "CSV to JSON",
    module: "Default",
    factory: () => new CSVToJSON(),
  },
  {
    opName: "CTPH",
    displayName: "CTPH",
    module: "Crypto",
    factory: () => new CTPH(),
  },
  {
    opName: "DateTimeDelta",
    displayName: "DateTime Delta",
    module: "Default",
    factory: () => new DateTimeDelta(),
  },
  {
    opName: "DechunkHTTPResponse",
    displayName: "Dechunk HTTP response",
    module: "Default",
    factory: () => new DechunkHTTPResponse(),
  },
  {
    opName: "DecodeNetBIOSName",
    displayName: "Decode NetBIOS Name",
    module: "Default",
    factory: () => new DecodeNetBIOSName(),
  },
  {
    opName: "DecodeText",
    displayName: "Decode text",
    module: "Encodings",
    factory: () => new DecodeText(),
  },
  {
    opName: "DefangIPAddresses",
    displayName: "Defang IP Addresses",
    module: "Default",
    factory: () => new DefangIPAddresses(),
  },
  {
    opName: "DefangURL",
    displayName: "Defang URL",
    module: "Default",
    factory: () => new DefangURL(),
  },
  {
    opName: "DeriveEVPKey",
    displayName: "Derive EVP key",
    module: "Ciphers",
    factory: () => new DeriveEVPKey(),
  },
  {
    opName: "DerivePBKDF2Key",
    displayName: "Derive PBKDF2 key",
    module: "Ciphers",
    factory: () => new DerivePBKDF2Key(),
  },
  {
    opName: "DESDecrypt",
    displayName: "DES Decrypt",
    module: "Ciphers",
    factory: () => new DESDecrypt(),
  },
  {
    opName: "DESEncrypt",
    displayName: "DES Encrypt",
    module: "Ciphers",
    factory: () => new DESEncrypt(),
  },
  {
    opName: "DetectFileType",
    displayName: "Detect File Type",
    module: "Default",
    factory: () => new DetectFileType(),
  },
  {
    opName: "Diff",
    displayName: "Diff",
    module: "Diff",
    factory: () => new Diff(),
  },
  {
    opName: "DisassembleX86",
    displayName: "Disassemble x86",
    module: "Shellcode",
    factory: () => new DisassembleX86(),
  },
  {
    opName: "DitherImage",
    displayName: "Dither Image",
    module: "Image",
    factory: () => new DitherImage(),
  },
  {
    opName: "Divide",
    displayName: "Divide",
    module: "Default",
    factory: () => new Divide(),
  },
  {
    opName: "DNSOverHTTPS",
    displayName: "DNS over HTTPS",
    module: "Default",
    factory: () => new DNSOverHTTPS(),
  },
  {
    opName: "DropBytes",
    displayName: "Drop bytes",
    module: "Default",
    factory: () => new DropBytes(),
  },
  {
    opName: "DropNthBytes",
    displayName: "Drop nth bytes",
    module: "Default",
    factory: () => new DropNthBytes(),
  },
  {
    opName: "ECDSASign",
    displayName: "ECDSA Sign",
    module: "Ciphers",
    factory: () => new ECDSASign(),
  },
  {
    opName: "ECDSASignatureConversion",
    displayName: "ECDSA Signature Conversion",
    module: "Ciphers",
    factory: () => new ECDSASignatureConversion(),
  },
  {
    opName: "ECDSAVerify",
    displayName: "ECDSA Verify",
    module: "Ciphers",
    factory: () => new ECDSAVerify(),
  },
  {
    opName: "ELFInfo",
    displayName: "ELF Info",
    module: "Default",
    factory: () => new ELFInfo(),
  },
  {
    opName: "EncodeNetBIOSName",
    displayName: "Encode NetBIOS Name",
    module: "Default",
    factory: () => new EncodeNetBIOSName(),
  },
  {
    opName: "EncodeText",
    displayName: "Encode text",
    module: "Encodings",
    factory: () => new EncodeText(),
  },
  {
    opName: "Enigma",
    displayName: "Enigma",
    module: "Bletchley",
    factory: () => new Enigma(),
  },
  {
    opName: "Entropy",
    displayName: "Entropy",
    module: "Charts",
    factory: () => new Entropy(),
  },
  {
    opName: "EscapeString",
    displayName: "Escape string",
    module: "Default",
    factory: () => new EscapeString(),
  },
  {
    opName: "EscapeUnicodeCharacters",
    displayName: "Escape Unicode Characters",
    module: "Default",
    factory: () => new EscapeUnicodeCharacters(),
  },
  {
    opName: "ExpandAlphabetRange",
    displayName: "Expand alphabet range",
    module: "Default",
    factory: () => new ExpandAlphabetRange(),
  },
  {
    opName: "ExtractAudioMetadata",
    displayName: "Extract Audio Metadata",
    module: "Default",
    factory: () => new ExtractAudioMetadata(),
  },
  {
    opName: "ExtractDates",
    displayName: "Extract dates",
    module: "Regex",
    factory: () => new ExtractDates(),
  },
  {
    opName: "ExtractDomains",
    displayName: "Extract domains",
    module: "Regex",
    factory: () => new ExtractDomains(),
  },
  {
    opName: "ExtractEmailAddresses",
    displayName: "Extract email addresses",
    module: "Regex",
    factory: () => new ExtractEmailAddresses(),
  },
  {
    opName: "ExtractEXIF",
    displayName: "Extract EXIF",
    module: "Image",
    factory: () => new ExtractEXIF(),
  },
  {
    opName: "ExtractFilePaths",
    displayName: "Extract file paths",
    module: "Regex",
    factory: () => new ExtractFilePaths(),
  },
  {
    opName: "ExtractFiles",
    displayName: "Extract Files",
    module: "Default",
    factory: () => new ExtractFiles(),
  },
  {
    opName: "ExtractHashes",
    displayName: "Extract hashes",
    module: "Regex",
    factory: () => new ExtractHashes(),
  },
  {
    opName: "ExtractID3",
    displayName: "Extract ID3",
    module: "Default",
    factory: () => new ExtractID3(),
  },
  {
    opName: "ExtractIPAddresses",
    displayName: "Extract IP addresses",
    module: "Regex",
    factory: () => new ExtractIPAddresses(),
  },
  {
    opName: "ExtractLSB",
    displayName: "Extract LSB",
    module: "Image",
    factory: () => new ExtractLSB(),
  },
  {
    opName: "ExtractMACAddresses",
    displayName: "Extract MAC addresses",
    module: "Regex",
    factory: () => new ExtractMACAddresses(),
  },
  {
    opName: "ExtractRGBA",
    displayName: "Extract RGBA",
    module: "Image",
    factory: () => new ExtractRGBA(),
  },
  {
    opName: "ExtractURLs",
    displayName: "Extract URLs",
    module: "Regex",
    factory: () => new ExtractURLs(),
  },
  {
    opName: "FangURL",
    displayName: "Fang URL",
    module: "Default",
    factory: () => new FangURL(),
  },
  {
    opName: "FileTree",
    displayName: "File Tree",
    module: "Default",
    factory: () => new FileTree(),
  },
  {
    opName: "Filter",
    displayName: "Filter",
    module: "Regex",
    factory: () => new Filter(),
  },
  {
    opName: "FindReplace",
    displayName: "Find / Replace",
    module: "Regex",
    factory: () => new FindReplace(),
  },
  {
    opName: "FlaskSessionDecode",
    displayName: "Flask Session Decode",
    module: "Crypto",
    factory: () => new FlaskSessionDecode(),
  },
  {
    opName: "Fletcher16Checksum",
    displayName: "Fletcher-16 Checksum",
    module: "Crypto",
    factory: () => new Fletcher16Checksum(),
  },
  {
    opName: "Fletcher32Checksum",
    displayName: "Fletcher-32 Checksum",
    module: "Crypto",
    factory: () => new Fletcher32Checksum(),
  },
  {
    opName: "Fletcher64Checksum",
    displayName: "Fletcher-64 Checksum",
    module: "Crypto",
    factory: () => new Fletcher64Checksum(),
  },
  {
    opName: "Fletcher8Checksum",
    displayName: "Fletcher-8 Checksum",
    module: "Crypto",
    factory: () => new Fletcher8Checksum(),
  },
  {
    opName: "FlipImage",
    displayName: "Flip Image",
    module: "Image",
    factory: () => new FlipImage(),
  },
  {
    opName: "Fork",
    displayName: "Fork",
    module: "Default",
    factory: () => new Fork(),
  },
  {
    opName: "FormatMACAddresses",
    displayName: "Format MAC addresses",
    module: "Default",
    factory: () => new FormatMACAddresses(),
  },
  {
    opName: "FrequencyDistribution",
    displayName: "Frequency distribution",
    module: "Default",
    factory: () => new FrequencyDistribution(),
  },
  {
    opName: "FromBase",
    displayName: "From Base",
    module: "Default",
    factory: () => new FromBase(),
  },
  {
    opName: "FromBase32",
    displayName: "From Base32",
    module: "Default",
    factory: () => new FromBase32(),
  },
  {
    opName: "FromBase45",
    displayName: "From Base45",
    module: "Default",
    factory: () => new FromBase45(),
  },
  {
    opName: "FromBase58",
    displayName: "From Base58",
    module: "Default",
    factory: () => new FromBase58(),
  },
  {
    opName: "FromBase62",
    displayName: "From Base62",
    module: "Default",
    factory: () => new FromBase62(),
  },
  {
    opName: "FromBase64",
    displayName: "From Base64",
    module: "Default",
    factory: () => new FromBase64(),
  },
  {
    opName: "FromBase85",
    displayName: "From Base85",
    module: "Default",
    factory: () => new FromBase85(),
  },
  {
    opName: "FromBase92",
    displayName: "From Base92",
    module: "Default",
    factory: () => new FromBase92(),
  },
  {
    opName: "FromBCD",
    displayName: "From BCD",
    module: "Default",
    factory: () => new FromBCD(),
  },
  {
    opName: "FromBech32",
    displayName: "From Bech32",
    module: "Default",
    factory: () => new FromBech32(),
  },
  {
    opName: "FromBinary",
    displayName: "From Binary",
    module: "Default",
    factory: () => new FromBinary(),
  },
  {
    opName: "FromBraille",
    displayName: "From Braille",
    module: "Default",
    factory: () => new FromBraille(),
  },
  {
    opName: "FromCaseInsensitiveRegex",
    displayName: "From Case Insensitive Regex",
    module: "Default",
    factory: () => new FromCaseInsensitiveRegex(),
  },
  {
    opName: "FromCharcode",
    displayName: "From Charcode",
    module: "Default",
    factory: () => new FromCharcode(),
  },
  {
    opName: "FromDecimal",
    displayName: "From Decimal",
    module: "Default",
    factory: () => new FromDecimal(),
  },
  {
    opName: "FromFloat",
    displayName: "From Float",
    module: "Default",
    factory: () => new FromFloat(),
  },
  {
    opName: "FromHex",
    displayName: "From Hex",
    module: "Default",
    factory: () => new FromHex(),
  },
  {
    opName: "FromHexContent",
    displayName: "From Hex Content",
    module: "Default",
    factory: () => new FromHexContent(),
  },
  {
    opName: "FromHexdump",
    displayName: "From Hexdump",
    module: "Default",
    factory: () => new FromHexdump(),
  },
  {
    opName: "FromHTMLEntity",
    displayName: "From HTML Entity",
    module: "Encodings",
    factory: () => new FromHTMLEntity(),
  },
  {
    opName: "FromMessagePack",
    displayName: "From MessagePack",
    module: "Code",
    factory: () => new FromMessagePack(),
  },
  {
    opName: "FromModhex",
    displayName: "From Modhex",
    module: "Default",
    factory: () => new FromModhex(),
  },
  {
    opName: "FromMorseCode",
    displayName: "From Morse Code",
    module: "Default",
    factory: () => new FromMorseCode(),
  },
  {
    opName: "FromOctal",
    displayName: "From Octal",
    module: "Default",
    factory: () => new FromOctal(),
  },
  {
    opName: "FromPunycode",
    displayName: "From Punycode",
    module: "Encodings",
    factory: () => new FromPunycode(),
  },
  {
    opName: "FromQuotedPrintable",
    displayName: "From Quoted Printable",
    module: "Default",
    factory: () => new FromQuotedPrintable(),
  },
  {
    opName: "FromRadix",
    displayName: "From Radix",
    module: "Default",
    factory: () => new FromRadix(),
  },
  {
    opName: "FromUNIXTimestamp",
    displayName: "From UNIX Timestamp",
    module: "Default",
    factory: () => new FromUNIXTimestamp(),
  },
  {
    opName: "FuzzyMatch",
    displayName: "Fuzzy Match",
    module: "Default",
    factory: () => new FuzzyMatch(),
  },
  {
    opName: "GenerateAllChecksums",
    displayName: "Generate all checksums",
    module: "Crypto",
    factory: () => new GenerateAllChecksums(),
  },
  {
    opName: "GenerateDeBruijnSequence",
    displayName: "Generate De Bruijn Sequence",
    module: "Default",
    factory: () => new GenerateDeBruijnSequence(),
  },
  {
    opName: "GenerateECDSAKeyPair",
    displayName: "Generate ECDSA Key Pair",
    module: "Ciphers",
    factory: () => new GenerateECDSAKeyPair(),
  },
  {
    opName: "GenerateImage",
    displayName: "Generate Image",
    module: "Image",
    factory: () => new GenerateImage(),
  },
  {
    opName: "GenerateLoremIpsum",
    displayName: "Generate Lorem Ipsum",
    module: "Default",
    factory: () => new GenerateLoremIpsum(),
  },
  {
    opName: "GenerateRSAKeyPair",
    displayName: "Generate RSA Key Pair",
    module: "Ciphers",
    factory: () => new GenerateRSAKeyPair(),
  },
  {
    opName: "GenerateUUID",
    displayName: "Generate UUID",
    module: "Crypto",
    factory: () => new GenerateUUID(),
  },
  {
    opName: "GenericCodeBeautify",
    displayName: "Generic Code Beautify",
    module: "Code",
    factory: () => new GenericCodeBeautify(),
  },
  {
    opName: "GetAllCasings",
    displayName: "Get All Casings",
    module: "Default",
    factory: () => new GetAllCasings(),
  },
  {
    opName: "GetTime",
    displayName: "Get Time",
    module: "Default",
    factory: () => new GetTime(),
  },
  {
    opName: "GOSTHash",
    displayName: "GOST Hash",
    module: "Hashing",
    factory: () => new GOSTHash(),
  },
  {
    opName: "GroupIPAddresses",
    displayName: "Group IP addresses",
    module: "Default",
    factory: () => new GroupIPAddresses(),
  },
  {
    opName: "Gunzip",
    displayName: "Gunzip",
    module: "Compression",
    factory: () => new Gunzip(),
  },
  {
    opName: "Gzip",
    displayName: "Gzip",
    module: "Compression",
    factory: () => new Gzip(),
  },
  {
    opName: "HammingDistance",
    displayName: "Hamming Distance",
    module: "Default",
    factory: () => new HammingDistance(),
  },
  {
    opName: "HaversineDistance",
    displayName: "Haversine distance",
    module: "Default",
    factory: () => new HaversineDistance(),
  },
  {
    opName: "Head",
    displayName: "Head",
    module: "Default",
    factory: () => new Head(),
  },
  {
    opName: "HeatmapChart",
    displayName: "Heatmap chart",
    module: "Charts",
    factory: () => new HeatmapChart(),
  },
  {
    opName: "HexDensityChart",
    displayName: "Hex Density chart",
    module: "Charts",
    factory: () => new HexDensityChart(),
  },
  {
    opName: "HexToObjectIdentifier",
    displayName: "Hex to Object Identifier",
    module: "PublicKey",
    factory: () => new HexToObjectIdentifier(),
  },
  {
    opName: "HexToPEM",
    displayName: "Hex to PEM",
    module: "PublicKey",
    factory: () => new HexToPEM(),
  },
  {
    opName: "HTMLToText",
    displayName: "HTML To Text",
    module: "Default",
    factory: () => new HTMLToText(),
  },
  {
    opName: "HTTPRequest",
    displayName: "HTTP request",
    module: "Default",
    factory: () => new HTTPRequest(),
  },
  {
    opName: "ImageBrightnessContrast",
    displayName: "Image Brightness / Contrast",
    module: "Image",
    factory: () => new ImageBrightnessContrast(),
  },
  {
    opName: "ImageFilter",
    displayName: "Image Filter",
    module: "Image",
    factory: () => new ImageFilter(),
  },
  {
    opName: "ImageHueSaturationLightness",
    displayName: "Image Hue/Saturation/Lightness",
    module: "Image",
    factory: () => new ImageHueSaturationLightness(),
  },
  {
    opName: "ImageOpacity",
    displayName: "Image Opacity",
    module: "Image",
    factory: () => new ImageOpacity(),
  },
  {
    opName: "IndexOfCoincidence",
    displayName: "Index of Coincidence",
    module: "Default",
    factory: () => new IndexOfCoincidence(),
  },
  {
    opName: "InvertImage",
    displayName: "Invert Image",
    module: "Image",
    factory: () => new InvertImage(),
  },
  {
    opName: "IPv6TransitionAddresses",
    displayName: "IPv6 Transition Addresses",
    module: "Default",
    factory: () => new IPv6TransitionAddresses(),
  },
  {
    opName: "JavaScriptParser",
    displayName: "JavaScript Parser",
    module: "Code",
    factory: () => new JavaScriptParser(),
  },
  {
    opName: "JSONBeautify",
    displayName: "JSON Beautify",
    module: "Code",
    factory: () => new JSONBeautify(),
  },
  {
    opName: "JSONMinify",
    displayName: "JSON Minify",
    module: "Code",
    factory: () => new JSONMinify(),
  },
  {
    opName: "JSONToCSV",
    displayName: "JSON to CSV",
    module: "Default",
    factory: () => new JSONToCSV(),
  },
  {
    opName: "JSONtoYAML",
    displayName: "JSON to YAML",
    module: "Default",
    factory: () => new JSONtoYAML(),
  },
  {
    opName: "Jump",
    displayName: "Jump",
    module: "Default",
    factory: () => new Jump(),
  },
  {
    opName: "JWKToPem",
    displayName: "JWK to PEM",
    module: "PublicKey",
    factory: () => new JWKToPem(),
  },
  {
    opName: "JWTDecode",
    displayName: "JWT Decode",
    module: "Crypto",
    factory: () => new JWTDecode(),
  },
  {
    opName: "JWTSign",
    displayName: "JWT Sign",
    module: "Crypto",
    factory: () => new JWTSign(),
  },
  {
    opName: "JWTVerify",
    displayName: "JWT Verify",
    module: "Crypto",
    factory: () => new JWTVerify(),
  },
  {
    opName: "Keccak",
    displayName: "Keccak",
    module: "Crypto",
    factory: () => new Keccak(),
  },
  {
    opName: "Label",
    displayName: "Label",
    module: "Default",
    factory: () => new Label(),
  },
  {
    opName: "LevenshteinDistance",
    displayName: "Levenshtein Distance",
    module: "Default",
    factory: () => new LevenshteinDistance(),
  },
  {
    opName: "LMHash",
    displayName: "LM Hash",
    module: "Crypto",
    factory: () => new LMHash(),
  },
  {
    opName: "Lorenz",
    displayName: "Lorenz",
    module: "Bletchley",
    factory: () => new Lorenz(),
  },
  {
    opName: "LS47Decrypt",
    displayName: "LS47 Decrypt",
    module: "Crypto",
    factory: () => new LS47Decrypt(),
  },
  {
    opName: "LS47Encrypt",
    displayName: "LS47 Encrypt",
    module: "Crypto",
    factory: () => new LS47Encrypt(),
  },
  {
    opName: "LuhnChecksum",
    displayName: "Luhn Checksum",
    module: "Default",
    factory: () => new LuhnChecksum(),
  },
  {
    opName: "LZ4Compress",
    displayName: "LZ4 Compress",
    module: "Compression",
    factory: () => new LZ4Compress(),
  },
  {
    opName: "LZ4Decompress",
    displayName: "LZ4 Decompress",
    module: "Compression",
    factory: () => new LZ4Decompress(),
  },
  {
    opName: "LZNT1Decompress",
    displayName: "LZNT1 Decompress",
    module: "Compression",
    factory: () => new LZNT1Decompress(),
  },
  {
    opName: "LZStringCompress",
    displayName: "LZString Compress",
    module: "Compression",
    factory: () => new LZStringCompress(),
  },
  {
    opName: "LZStringDecompress",
    displayName: "LZString Decompress",
    module: "Compression",
    factory: () => new LZStringDecompress(),
  },
  {
    opName: "Magic",
    displayName: "Magic",
    module: "Default",
    factory: () => new Magic(),
  },
  {
    opName: "Mean",
    displayName: "Mean",
    module: "Default",
    factory: () => new Mean(),
  },
  {
    opName: "Median",
    displayName: "Median",
    module: "Default",
    factory: () => new Median(),
  },
  {
    opName: "Merge",
    displayName: "Merge",
    module: "Default",
    factory: () => new Merge(),
  },
  {
    opName: "MicrosoftScriptDecoder",
    displayName: "Microsoft Script Decoder",
    module: "Default",
    factory: () => new MicrosoftScriptDecoder(),
  },
  {
    opName: "MIMEDecoding",
    displayName: "MIME Decoding",
    module: "Default",
    factory: () => new MIMEDecoding(),
  },
  {
    opName: "MultipleBombe",
    displayName: "Multiple Bombe",
    module: "Bletchley",
    factory: () => new MultipleBombe(),
  },
  {
    opName: "Multiply",
    displayName: "Multiply",
    module: "Default",
    factory: () => new Multiply(),
  },
  {
    opName: "MurmurHash3",
    displayName: "MurmurHash3",
    module: "Hashing",
    factory: () => new MurmurHash3(),
  },
  {
    opName: "NormaliseImage",
    displayName: "Normalise Image",
    module: "Image",
    factory: () => new NormaliseImage(),
  },
  {
    opName: "NormaliseUnicode",
    displayName: "Normalise Unicode",
    module: "Encodings",
    factory: () => new NormaliseUnicode(),
  },
  {
    opName: "NOT",
    displayName: "NOT",
    module: "Default",
    factory: () => new NOT(),
  },
  {
    opName: "Numberwang",
    displayName: "Numberwang",
    module: "Default",
    factory: () => new Numberwang(),
  },
  {
    opName: "ObjectIdentifierToHex",
    displayName: "Object Identifier to Hex",
    module: "PublicKey",
    factory: () => new ObjectIdentifierToHex(),
  },
  {
    opName: "OffsetChecker",
    displayName: "Offset checker",
    module: "Default",
    factory: () => new OffsetChecker(),
  },
  {
    opName: "OR",
    displayName: "OR",
    module: "Default",
    factory: () => new OR(),
  },
  {
    opName: "PLISTViewer",
    displayName: "P-list Viewer",
    module: "Default",
    factory: () => new PLISTViewer(),
  },
  {
    opName: "PadLines",
    displayName: "Pad lines",
    module: "Default",
    factory: () => new PadLines(),
  },
  {
    opName: "ParityBit",
    displayName: "Parity Bit",
    module: "Default",
    factory: () => new ParityBit(),
  },
  {
    opName: "ParseASN1HexString",
    displayName: "Parse ASN.1 hex string",
    module: "PublicKey",
    factory: () => new ParseASN1HexString(),
  },
  {
    opName: "ParseColourCode",
    displayName: "Parse colour code",
    module: "Default",
    factory: () => new ParseColourCode(),
  },
  {
    opName: "ParseCSR",
    displayName: "Parse CSR",
    module: "PublicKey",
    factory: () => new ParseCSR(),
  },
  {
    opName: "ParseDateTime",
    displayName: "Parse DateTime",
    module: "Default",
    factory: () => new ParseDateTime(),
  },
  {
    opName: "ParseEthernetFrame",
    displayName: "Parse Ethernet frame",
    module: "Default",
    factory: () => new ParseEthernetFrame(),
  },
  {
    opName: "ParseIPRange",
    displayName: "Parse IP range",
    module: "Default",
    factory: () => new ParseIPRange(),
  },
  {
    opName: "ParseIPv4Header",
    displayName: "Parse IPv4 header",
    module: "Default",
    factory: () => new ParseIPv4Header(),
  },
  {
    opName: "ParseIPv6Address",
    displayName: "Parse IPv6 address",
    module: "Default",
    factory: () => new ParseIPv6Address(),
  },
  {
    opName: "ParseObjectIDTimestamp",
    displayName: "Parse ObjectID timestamp",
    module: "Serialise",
    factory: () => new ParseObjectIDTimestamp(),
  },
  {
    opName: "ParseSSHHostKey",
    displayName: "Parse SSH Host Key",
    module: "Default",
    factory: () => new ParseSSHHostKey(),
  },
  {
    opName: "ParseTCP",
    displayName: "Parse TCP",
    module: "Default",
    factory: () => new ParseTCP(),
  },
  {
    opName: "ParseTLSRecord",
    displayName: "Parse TLS record",
    module: "Default",
    factory: () => new ParseTLSRecord(),
  },
  {
    opName: "ParseTLV",
    displayName: "Parse TLV",
    module: "Default",
    factory: () => new ParseTLV(),
  },
  {
    opName: "ParseUDP",
    displayName: "Parse UDP",
    module: "Default",
    factory: () => new ParseUDP(),
  },
  {
    opName: "ParseUNIXFilePermissions",
    displayName: "Parse UNIX file permissions",
    module: "Default",
    factory: () => new ParseUNIXFilePermissions(),
  },
  {
    opName: "ParseURI",
    displayName: "Parse URI",
    module: "URL",
    factory: () => new ParseURI(),
  },
  {
    opName: "ParseX509CRL",
    displayName: "Parse X.509 CRL",
    module: "PublicKey",
    factory: () => new ParseX509CRL(),
  },
  {
    opName: "PEMToHex",
    displayName: "PEM to Hex",
    module: "Default",
    factory: () => new PEMToHex(),
  },
  {
    opName: "PEMToJWK",
    displayName: "PEM to JWK",
    module: "PublicKey",
    factory: () => new PEMToJWK(),
  },
  {
    opName: "PHPDeserialize",
    displayName: "PHP Deserialize",
    module: "Default",
    factory: () => new PHPDeserialize(),
  },
  {
    opName: "PHPSerialize",
    displayName: "PHP Serialize",
    module: "Default",
    factory: () => new PHPSerialize(),
  },
  {
    opName: "PlayMedia",
    displayName: "Play Media",
    module: "Default",
    factory: () => new PlayMedia(),
  },
  {
    opName: "PowerSet",
    displayName: "Power Set",
    module: "Default",
    factory: () => new PowerSet(),
  },
  {
    opName: "PseudoRandomIntegerGenerator",
    displayName: "Pseudo-Random Integer Generator",
    module: "Ciphers",
    factory: () => new PseudoRandomIntegerGenerator(),
  },
  {
    opName: "PseudoRandomNumberGenerator",
    displayName: "Pseudo-Random Number Generator",
    module: "Ciphers",
    factory: () => new PseudoRandomNumberGenerator(),
  },
  {
    opName: "PubKeyFromCert",
    displayName: "Public Key from Certificate",
    module: "PublicKey",
    factory: () => new PubKeyFromCert(),
  },
  {
    opName: "PubKeyFromPrivKey",
    displayName: "Public Key from Private Key",
    module: "PublicKey",
    factory: () => new PubKeyFromPrivKey(),
  },
  {
    opName: "Rabbit",
    displayName: "Rabbit",
    module: "Ciphers",
    factory: () => new Rabbit(),
  },
  {
    opName: "RailFenceCipherDecode",
    displayName: "Rail Fence Cipher Decode",
    module: "Ciphers",
    factory: () => new RailFenceCipherDecode(),
  },
  {
    opName: "RailFenceCipherEncode",
    displayName: "Rail Fence Cipher Encode",
    module: "Ciphers",
    factory: () => new RailFenceCipherEncode(),
  },
  {
    opName: "RAKE",
    displayName: "RAKE",
    module: "Default",
    factory: () => new RAKE(),
  },
  {
    opName: "RawDeflate",
    displayName: "Raw Deflate",
    module: "Compression",
    factory: () => new RawDeflate(),
  },
  {
    opName: "RawInflate",
    displayName: "Raw Inflate",
    module: "Compression",
    factory: () => new RawInflate(),
  },
  {
    opName: "RC2Decrypt",
    displayName: "RC2 Decrypt",
    module: "Ciphers",
    factory: () => new RC2Decrypt(),
  },
  {
    opName: "RC2Encrypt",
    displayName: "RC2 Encrypt",
    module: "Ciphers",
    factory: () => new RC2Encrypt(),
  },
  {
    opName: "RC4",
    displayName: "RC4",
    module: "Ciphers",
    factory: () => new RC4(),
  },
  {
    opName: "RC4Drop",
    displayName: "RC4 Drop",
    module: "Ciphers",
    factory: () => new RC4Drop(),
  },
  {
    opName: "RC6Decrypt",
    displayName: "RC6 Decrypt",
    module: "Ciphers",
    factory: () => new RC6Decrypt(),
  },
  {
    opName: "RC6Encrypt",
    displayName: "RC6 Encrypt",
    module: "Ciphers",
    factory: () => new RC6Encrypt(),
  },
  {
    opName: "Register",
    displayName: "Register",
    module: "Regex",
    factory: () => new Register(),
  },
  {
    opName: "RegularExpression",
    displayName: "Regular expression",
    module: "Regex",
    factory: () => new RegularExpression(),
  },
  {
    opName: "RemoveDiacritics",
    displayName: "Remove Diacritics",
    module: "Default",
    factory: () => new RemoveDiacritics(),
  },
  {
    opName: "RemoveEXIF",
    displayName: "Remove EXIF",
    module: "Image",
    factory: () => new RemoveEXIF(),
  },
  {
    opName: "RemoveLineNumbers",
    displayName: "Remove line numbers",
    module: "Default",
    factory: () => new RemoveLineNumbers(),
  },
  {
    opName: "RemoveNullBytes",
    displayName: "Remove null bytes",
    module: "Default",
    factory: () => new RemoveNullBytes(),
  },
  {
    opName: "RemoveWhitespace",
    displayName: "Remove whitespace",
    module: "Default",
    factory: () => new RemoveWhitespace(),
  },
  {
    opName: "RenderImage",
    displayName: "Render Image",
    module: "Image",
    factory: () => new RenderImage(),
  },
  {
    opName: "RenderMarkdown",
    displayName: "Render Markdown",
    module: "Code",
    factory: () => new RenderMarkdown(),
  },
  {
    opName: "ResizeImage",
    displayName: "Resize Image",
    module: "Image",
    factory: () => new ResizeImage(),
  },
  {
    opName: "Return",
    displayName: "Return",
    module: "Default",
    factory: () => new Return(),
  },
  {
    opName: "Reverse",
    displayName: "Reverse",
    module: "Default",
    factory: () => new Reverse(),
  },
  {
    opName: "RisonDecode",
    displayName: "Rison Decode",
    module: "Encodings",
    factory: () => new RisonDecode(),
  },
  {
    opName: "RisonEncode",
    displayName: "Rison Encode",
    module: "Encodings",
    factory: () => new RisonEncode(),
  },
  {
    opName: "ROT13",
    displayName: "ROT13",
    module: "Default",
    factory: () => new ROT13(),
  },
  {
    opName: "ROT13BruteForce",
    displayName: "ROT13 Brute Force",
    module: "Default",
    factory: () => new ROT13BruteForce(),
  },
  {
    opName: "ROT47",
    displayName: "ROT47",
    module: "Default",
    factory: () => new ROT47(),
  },
  {
    opName: "ROT47BruteForce",
    displayName: "ROT47 Brute Force",
    module: "Default",
    factory: () => new ROT47BruteForce(),
  },
  {
    opName: "ROT8000",
    displayName: "ROT8000",
    module: "Default",
    factory: () => new ROT8000(),
  },
  {
    opName: "RotateImage",
    displayName: "Rotate Image",
    module: "Image",
    factory: () => new RotateImage(),
  },
  {
    opName: "RotateLeft",
    displayName: "Rotate left",
    module: "Default",
    factory: () => new RotateLeft(),
  },
  {
    opName: "RotateRight",
    displayName: "Rotate right",
    module: "Default",
    factory: () => new RotateRight(),
  },
  {
    opName: "RSADecrypt",
    displayName: "RSA Decrypt",
    module: "Ciphers",
    factory: () => new RSADecrypt(),
  },
  {
    opName: "RSAEncrypt",
    displayName: "RSA Encrypt",
    module: "Ciphers",
    factory: () => new RSAEncrypt(),
  },
  {
    opName: "RSASign",
    displayName: "RSA Sign",
    module: "Ciphers",
    factory: () => new RSASign(),
  },
  {
    opName: "RSAVerify",
    displayName: "RSA Verify",
    module: "Ciphers",
    factory: () => new RSAVerify(),
  },
  {
    opName: "Salsa20",
    displayName: "Salsa20",
    module: "Ciphers",
    factory: () => new Salsa20(),
  },
  {
    opName: "ScanForEmbeddedFiles",
    displayName: "Scan for Embedded Files",
    module: "Default",
    factory: () => new ScanForEmbeddedFiles(),
  },
  {
    opName: "ScatterChart",
    displayName: "Scatter chart",
    module: "Charts",
    factory: () => new ScatterChart(),
  },
  {
    opName: "Scrypt",
    displayName: "Scrypt",
    module: "Crypto",
    factory: () => new Scrypt(),
  },
  {
    opName: "SeriesChart",
    displayName: "Series chart",
    module: "Charts",
    factory: () => new SeriesChart(),
  },
  {
    opName: "SetDifference",
    displayName: "Set Difference",
    module: "Default",
    factory: () => new SetDifference(),
  },
  {
    opName: "SetIntersection",
    displayName: "Set Intersection",
    module: "Default",
    factory: () => new SetIntersection(),
  },
  {
    opName: "SetUnion",
    displayName: "Set Union",
    module: "Default",
    factory: () => new SetUnion(),
  },
  {
    opName: "SHA0",
    displayName: "SHA0",
    module: "Crypto",
    factory: () => new SHA0(),
  },
  {
    opName: "SHA1",
    displayName: "SHA1",
    module: "Crypto",
    factory: () => new SHA1(),
  },
  {
    opName: "SHA2",
    displayName: "SHA2",
    module: "Crypto",
    factory: () => new SHA2(),
  },
  {
    opName: "SHA3",
    displayName: "SHA3",
    module: "Crypto",
    factory: () => new SHA3(),
  },
  {
    opName: "Shake",
    displayName: "Shake",
    module: "Crypto",
    factory: () => new Shake(),
  },
  {
    opName: "SharpenImage",
    displayName: "Sharpen Image",
    module: "Image",
    factory: () => new SharpenImage(),
  },
  {
    opName: "ShowBase64Offsets",
    displayName: "Show Base64 offsets",
    module: "Default",
    factory: () => new ShowBase64Offsets(),
  },
  {
    opName: "ShowOnMap",
    displayName: "Show on map",
    module: "Hashing",
    factory: () => new ShowOnMap(),
  },
  {
    opName: "Shuffle",
    displayName: "Shuffle",
    module: "Default",
    factory: () => new Shuffle(),
  },
  {
    opName: "SIGABA",
    displayName: "SIGABA",
    module: "Bletchley",
    factory: () => new SIGABA(),
  },
  {
    opName: "Sleep",
    displayName: "Sleep",
    module: "Default",
    factory: () => new Sleep(),
  },
  {
    opName: "SM2Decrypt",
    displayName: "SM2 Decrypt",
    module: "Crypto",
    factory: () => new SM2Decrypt(),
  },
  {
    opName: "SM2Encrypt",
    displayName: "SM2 Encrypt",
    module: "Crypto",
    factory: () => new SM2Encrypt(),
  },
  {
    opName: "SM3",
    displayName: "SM3",
    module: "Crypto",
    factory: () => new SM3(),
  },
  {
    opName: "SM4Decrypt",
    displayName: "SM4 Decrypt",
    module: "Ciphers",
    factory: () => new SM4Decrypt(),
  },
  {
    opName: "SM4Encrypt",
    displayName: "SM4 Encrypt",
    module: "Ciphers",
    factory: () => new SM4Encrypt(),
  },
  {
    opName: "Snefru",
    displayName: "Snefru",
    module: "Hashing",
    factory: () => new Snefru(),
  },
  {
    opName: "Sort",
    displayName: "Sort",
    module: "Default",
    factory: () => new Sort(),
  },
  {
    opName: "Split",
    displayName: "Split",
    module: "Default",
    factory: () => new Split(),
  },
  {
    opName: "SplitColourChannels",
    displayName: "Split Colour Channels",
    module: "Image",
    factory: () => new SplitColourChannels(),
  },
  {
    opName: "SQLBeautify",
    displayName: "SQL Beautify",
    module: "Code",
    factory: () => new SQLBeautify(),
  },
  {
    opName: "SQLMinify",
    displayName: "SQL Minify",
    module: "Code",
    factory: () => new SQLMinify(),
  },
  {
    opName: "SSDEEP",
    displayName: "SSDEEP",
    module: "Crypto",
    factory: () => new SSDEEP(),
  },
  {
    opName: "StandardDeviation",
    displayName: "Standard Deviation",
    module: "Default",
    factory: () => new StandardDeviation(),
  },
  {
    opName: "Streebog",
    displayName: "Streebog",
    module: "Hashing",
    factory: () => new Streebog(),
  },
  {
    opName: "Strings",
    displayName: "Strings",
    module: "Regex",
    factory: () => new Strings(),
  },
  {
    opName: "StripHTMLTags",
    displayName: "Strip HTML tags",
    module: "Default",
    factory: () => new StripHTMLTags(),
  },
  {
    opName: "StripHTTPHeaders",
    displayName: "Strip HTTP headers",
    module: "Default",
    factory: () => new StripHTTPHeaders(),
  },
  {
    opName: "StripIPv4Header",
    displayName: "Strip IPv4 header",
    module: "Default",
    factory: () => new StripIPv4Header(),
  },
  {
    opName: "StripTCPHeader",
    displayName: "Strip TCP header",
    module: "Default",
    factory: () => new StripTCPHeader(),
  },
  {
    opName: "StripUDPHeader",
    displayName: "Strip UDP header",
    module: "Default",
    factory: () => new StripUDPHeader(),
  },
  {
    opName: "SUB",
    displayName: "SUB",
    module: "Default",
    factory: () => new SUB(),
  },
  {
    opName: "Subsection",
    displayName: "Subsection",
    module: "Default",
    factory: () => new Subsection(),
  },
  {
    opName: "Substitute",
    displayName: "Substitute",
    module: "Default",
    factory: () => new Substitute(),
  },
  {
    opName: "Subtract",
    displayName: "Subtract",
    module: "Default",
    factory: () => new Subtract(),
  },
  {
    opName: "Sum",
    displayName: "Sum",
    module: "Default",
    factory: () => new Sum(),
  },
  {
    opName: "SwapCase",
    displayName: "Swap case",
    module: "Default",
    factory: () => new SwapCase(),
  },
  {
    opName: "SwapEndianness",
    displayName: "Swap endianness",
    module: "Default",
    factory: () => new SwapEndianness(),
  },
  {
    opName: "SymmetricDifference",
    displayName: "Symmetric Difference",
    module: "Default",
    factory: () => new SymmetricDifference(),
  },
  {
    opName: "SyntaxHighlighter",
    displayName: "Syntax highlighter",
    module: "Code",
    factory: () => new SyntaxHighlighter(),
  },
  {
    opName: "Tail",
    displayName: "Tail",
    module: "Default",
    factory: () => new Tail(),
  },
  {
    opName: "TakeBytes",
    displayName: "Take bytes",
    module: "Default",
    factory: () => new TakeBytes(),
  },
  {
    opName: "TakeNthBytes",
    displayName: "Take nth bytes",
    module: "Default",
    factory: () => new TakeNthBytes(),
  },
  {
    opName: "Tar",
    displayName: "Tar",
    module: "Compression",
    factory: () => new Tar(),
  },
  {
    opName: "TCPIPChecksum",
    displayName: "TCP/IP Checksum",
    module: "Crypto",
    factory: () => new TCPIPChecksum(),
  },
  {
    opName: "Template",
    displayName: "Template",
    module: "Handlebars",
    factory: () => new Template(),
  },
  {
    opName: "TextEncodingBruteForce",
    displayName: "Text Encoding Brute Force",
    module: "Encodings",
    factory: () => new TextEncodingBruteForce(),
  },
  {
    opName: "TextIntegerConverter",
    displayName: "Text-Integer Conversion",
    module: "Default",
    factory: () => new TextIntegerConverter(),
  },
  {
    opName: "ToBase",
    displayName: "To Base",
    module: "Default",
    factory: () => new ToBase(),
  },
  {
    opName: "ToBase32",
    displayName: "To Base32",
    module: "Default",
    factory: () => new ToBase32(),
  },
  {
    opName: "ToBase45",
    displayName: "To Base45",
    module: "Default",
    factory: () => new ToBase45(),
  },
  {
    opName: "ToBase58",
    displayName: "To Base58",
    module: "Default",
    factory: () => new ToBase58(),
  },
  {
    opName: "ToBase62",
    displayName: "To Base62",
    module: "Default",
    factory: () => new ToBase62(),
  },
  {
    opName: "ToBase64",
    displayName: "To Base64",
    module: "Default",
    factory: () => new ToBase64(),
  },
  {
    opName: "ToBase85",
    displayName: "To Base85",
    module: "Default",
    factory: () => new ToBase85(),
  },
  {
    opName: "ToBase92",
    displayName: "To Base92",
    module: "Default",
    factory: () => new ToBase92(),
  },
  {
    opName: "ToBCD",
    displayName: "To BCD",
    module: "Default",
    factory: () => new ToBCD(),
  },
  {
    opName: "ToBech32",
    displayName: "To Bech32",
    module: "Default",
    factory: () => new ToBech32(),
  },
  {
    opName: "ToBinary",
    displayName: "To binary",
    module: "Default",
    factory: () => new ToBinary(),
  },
  {
    opName: "ToBraille",
    displayName: "To Braille",
    module: "Default",
    factory: () => new ToBraille(),
  },
  {
    opName: "ToCamelCase",
    displayName: "To camel case",
    module: "Default",
    factory: () => new ToCamelCase(),
  },
  {
    opName: "ToCaseInsensitiveRegex",
    displayName: "To case insensitive regex",
    module: "Default",
    factory: () => new ToCaseInsensitiveRegex(),
  },
  {
    opName: "ToCharcode",
    displayName: "To charcode",
    module: "Default",
    factory: () => new ToCharcode(),
  },
  {
    opName: "ToDecimal",
    displayName: "To decimal",
    module: "Default",
    factory: () => new ToDecimal(),
  },
  {
    opName: "ToFloat",
    displayName: "To float",
    module: "Default",
    factory: () => new ToFloat(),
  },
  {
    opName: "ToHex",
    displayName: "To hex",
    module: "Default",
    factory: () => new ToHex(),
  },
  {
    opName: "ToHexContent",
    displayName: "To hex content",
    module: "Default",
    factory: () => new ToHexContent(),
  },
  {
    opName: "ToHexdump",
    displayName: "To hexdump",
    module: "Default",
    factory: () => new ToHexdump(),
  },
  {
    opName: "ToHTMLEntity",
    displayName: "To HTML entity",
    module: "Default",
    factory: () => new ToHTMLEntity(),
  },
  {
    opName: "ToKebabCase",
    displayName: "To kebab case",
    module: "Default",
    factory: () => new ToKebabCase(),
  },
  {
    opName: "ToLowerCase",
    displayName: "To lower case",
    module: "Default",
    factory: () => new ToLowerCase(),
  },
  {
    opName: "ToMessagePack",
    displayName: "To MessagePack",
    module: "Code",
    factory: () => new ToMessagePack(),
  },
  {
    opName: "ToModhex",
    displayName: "To Modhex",
    module: "Default",
    factory: () => new ToModhex(),
  },
  {
    opName: "ToMorseCode",
    displayName: "To Morse Code",
    module: "Default",
    factory: () => new ToMorseCode(),
  },
  {
    opName: "ToOctal",
    displayName: "To octal",
    module: "Default",
    factory: () => new ToOctal(),
  },
  {
    opName: "ToPunycode",
    displayName: "To Punycode",
    module: "Default",
    factory: () => new ToPunycode(),
  },
  {
    opName: "ToQuotedPrintable",
    displayName: "To quoted-printable",
    module: "Default",
    factory: () => new ToQuotedPrintable(),
  },
  {
    opName: "ToRadix",
    displayName: "To Radix",
    module: "Default",
    factory: () => new ToRadix(),
  },
  {
    opName: "ToSnakeCase",
    displayName: "To snake case",
    module: "Default",
    factory: () => new ToSnakeCase(),
  },
  {
    opName: "ToTable",
    displayName: "To table",
    module: "Default",
    factory: () => new ToTable(),
  },
  {
    opName: "ToUNIXTimestamp",
    displayName: "To UNIX Timestamp",
    module: "Default",
    factory: () => new ToUNIXTimestamp(),
  },
  {
    opName: "ToUpperCase",
    displayName: "To upper case",
    module: "Default",
    factory: () => new ToUpperCase(),
  },
  {
    opName: "TranslateDateTimeFormat",
    displayName: "Translate DateTime format",
    module: "Default",
    factory: () => new TranslateDateTimeFormat(),
  },
  {
    opName: "TripleDESDecrypt",
    displayName: "Triple DES Decrypt",
    module: "Ciphers",
    factory: () => new TripleDESDecrypt(),
  },
  {
    opName: "TripleDESEncrypt",
    displayName: "Triple DES Encrypt",
    module: "Ciphers",
    factory: () => new TripleDESEncrypt(),
  },
  {
    opName: "Typex",
    displayName: "Typex",
    module: "Bletchley",
    factory: () => new Typex(),
  },
  {
    opName: "UnescapeString",
    displayName: "Unescape string",
    module: "Default",
    factory: () => new UnescapeString(),
  },
  {
    opName: "UnescapeUnicodeCharacters",
    displayName: "Unescape Unicode Characters",
    module: "Default",
    factory: () => new UnescapeUnicodeCharacters(),
  },
  {
    opName: "UnicodeTextFormat",
    displayName: "Unicode Text Format",
    module: "Default",
    factory: () => new UnicodeTextFormat(),
  },
  {
    opName: "Unique",
    displayName: "Unique",
    module: "Default",
    factory: () => new Unique(),
  },
  {
    opName: "UNIXTimestampToWindowsFiletime",
    displayName: "UNIX Timestamp to Windows Filetime",
    module: "Default",
    factory: () => new UNIXTimestampToWindowsFiletime(),
  },
  {
    opName: "Untar",
    displayName: "Untar",
    module: "Compression",
    factory: () => new Untar(),
  },
  {
    opName: "Unzip",
    displayName: "Unzip",
    module: "Compression",
    factory: () => new Unzip(),
  },
  {
    opName: "URLDecode",
    displayName: "URL decode",
    module: "URL",
    factory: () => new URLDecode(),
  },
  {
    opName: "URLEncode",
    displayName: "URL encode",
    module: "URL",
    factory: () => new URLEncode(),
  },
  {
    opName: "VarIntDecode",
    displayName: "VarInt Decode",
    module: "Default",
    factory: () => new VarIntDecode(),
  },
  {
    opName: "VarIntEncode",
    displayName: "VarInt Encode",
    module: "Default",
    factory: () => new VarIntEncode(),
  },
  {
    opName: "ViewBitPlane",
    displayName: "View Bit Plane",
    module: "Image",
    factory: () => new ViewBitPlane(),
  },
  {
    opName: "VigenèreDecode",
    displayName: "Vigenère Decode",
    module: "Ciphers",
    factory: () => new VigenèreDecode(),
  },
  {
    opName: "VigenèreEncode",
    displayName: "Vigenère Encode",
    module: "Ciphers",
    factory: () => new VigenèreEncode(),
  },
  {
    opName: "Whirlpool",
    displayName: "Whirlpool",
    module: "Hashing",
    factory: () => new Whirlpool(),
  },
  {
    opName: "WindowsFiletimeToUNIXTimestamp",
    displayName: "Windows Filetime to UNIX Timestamp",
    module: "Default",
    factory: () => new WindowsFiletimeToUNIXTimestamp(),
  },
  {
    opName: "Wrap",
    displayName: "Wrap",
    module: "Default",
    factory: () => new Wrap(),
  },
  {
    opName: "XKCDRandomNumber",
    displayName: "XKCD Random Number",
    module: "Default",
    factory: () => new XKCDRandomNumber(),
  },
  {
    opName: "XMLBeautify",
    displayName: "XML Beautify",
    module: "Default",
    factory: () => new XMLBeautify(),
  },
  {
    opName: "XMLMinify",
    displayName: "XML Minify",
    module: "Default",
    factory: () => new XMLMinify(),
  },
  {
    opName: "XOR",
    displayName: "XOR",
    module: "Default",
    factory: () => new XOR(),
  },
  {
    opName: "XORBruteForce",
    displayName: "XOR brute force",
    module: "Default",
    factory: () => new XORBruteForce(),
  },
  {
    opName: "XORChecksum",
    displayName: "XOR checksum",
    module: "Default",
    factory: () => new XORChecksum(),
  },
  {
    opName: "XPathExpression",
    displayName: "XPath expression",
    module: "Code",
    factory: () => new XPathExpression(),
  },
  {
    opName: "XSalsa20",
    displayName: "XSalsa20",
    module: "Ciphers",
    factory: () => new XSalsa20(),
  },
  {
    opName: "XXTEADecrypt",
    displayName: "XXTEA Decrypt",
    module: "Ciphers",
    factory: () => new XXTEADecrypt(),
  },
  {
    opName: "XXTEAEncrypt",
    displayName: "XXTEA Encrypt",
    module: "Ciphers",
    factory: () => new XXTEAEncrypt(),
  },
  {
    opName: "YAMLToJSON",
    displayName: "YAML to JSON",
    module: "Default",
    factory: () => new YAMLToJSON(),
  },
  {
    opName: "YARARules",
    displayName: "YARA Rules",
    module: "Yara",
    factory: () => new YARARules(),
  },
  {
    opName: "Zip",
    displayName: "Zip",
    module: "Compression",
    factory: () => new Zip(),
  },
  {
    opName: "ZlibDeflate",
    displayName: "Zlib deflate",
    module: "Compression",
    factory: () => new ZlibDeflate(),
  },
  {
    opName: "ZlibInflate",
    displayName: "Zlib inflate",
    module: "Compression",
    factory: () => new ZlibInflate(),
  },
];

export default registry;

/**
 * Looks up an operation by its display name (case-insensitive).
 *
 * @param displayName - The human-readable operation name to search for.
 * @returns The matching {@link OpMeta} entry, or `undefined` if not found.
 */
export function findOp(displayName: string): OpMeta | undefined {
  return registry.find(
    (e) => e.displayName.toLowerCase() === displayName.toLowerCase(),
  );
}

/**
 * Returns the full flat list of all registered operations.
 *
 * @returns Every {@link OpMeta} entry in the registry.
 */
export function allOps(): OpMeta[] {
  return registry;
}
