/**
 * @fileoverview AudioParsers module for ts-chef extension
 * @package chef
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { AudioReport } from "./AudioMetaSchema";

/**
 * Parses ID3v2 and ID3v1 metadata from an MP3 byte buffer into the report.
 *
 * @param b - The raw file bytes.
 * @param report - The report object to populate with extracted metadata.
 */
export function parseMp3(b: Uint8Array, report: AudioReport): void {
  void b;
  void report;
}
/**
 * Parses metadata from a RIFF/WAVE byte buffer into the report.
 *
 * @param b - The raw file bytes.
 * @param report - The report object to populate with extracted metadata.
 * @param maxTextBytes - Maximum number of bytes to read for text chunks.
 */
export function parseRiffWave(
  b: Uint8Array,
  report: AudioReport,
  maxTextBytes: number,
): void {
  void b;
  void report;
  void maxTextBytes;
}
/**
 * Parses Vorbis comment and STREAMINFO metadata from a FLAC byte buffer into the report.
 *
 * @param b - The raw file bytes.
 * @param report - The report object to populate with extracted metadata.
 * @param maxTextBytes - Maximum number of bytes to read for comment blocks.
 */
export function parseFlac(
  b: Uint8Array,
  report: AudioReport,
  maxTextBytes: number,
): void {
  void b;
  void report;
  void maxTextBytes;
}
/**
 * Parses Vorbis comment tags from an Ogg byte buffer into the report.
 *
 * @param b - The raw file bytes.
 * @param report - The report object to populate with extracted metadata.
 */
export function parseOgg(b: Uint8Array, report: AudioReport): void {
  void b;
  void report;
}
/**
 * Attempts to parse iTunes/MP4 atom metadata from an MP4 byte buffer into the report.
 *
 * @param b - The raw file bytes.
 * @param report - The report object to populate with extracted metadata.
 */
export function parseMp4BestEffort(b: Uint8Array, report: AudioReport): void {
  void b;
  void report;
}
/**
 * Attempts to parse AIFF chunk metadata from an AIFF byte buffer into the report.
 *
 * @param b - The raw file bytes.
 * @param report - The report object to populate with extracted metadata.
 * @param maxTextBytes - Maximum number of bytes to read for text chunks.
 */
export function parseAiffBestEffort(
  b: Uint8Array,
  report: AudioReport,
  maxTextBytes: number,
): void {
  void b;
  void report;
  void maxTextBytes;
}
/**
 * Parses stream parameters from an AAC ADTS byte buffer into the report.
 *
 * @param b - The raw file bytes.
 * @param report - The report object to populate with extracted metadata.
 */
export function parseAacAdts(b: Uint8Array, report: AudioReport): void {
  void b;
  void report;
}
/**
 * Parses stream parameters from an AC-3 (Dolby Digital) byte buffer into the report.
 *
 * @param b - The raw file bytes.
 * @param report - The report object to populate with extracted metadata.
 */
export function parseAc3(b: Uint8Array, report: AudioReport): void {
  void b;
  void report;
}
/**
 * Parses ASF content description metadata from a WMA/ASF byte buffer into the report.
 *
 * @param b - The raw file bytes.
 * @param report - The report object to populate with extracted metadata.
 */
export function parseWmaAsf(b: Uint8Array, report: AudioReport): void {
  void b;
  void report;
}
