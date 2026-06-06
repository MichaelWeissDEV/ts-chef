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

import { Operation } from "../Operation";
import { Utils } from "../Utils";

/**
 * Tar operation
 */
export class Tar extends Operation {
  /**
   * Tar constructor
   */
  constructor() {
    super();

    this.name = "Tar";
    this.module = "Compression";
    this.description =
      "Packs the input into a tarball.<br><br>No support for multiple files at this time.";
    this.infoURL = "https://wikipedia.org/wiki/Tar_(computing)";
    this.inputType = "ArrayBuffer";
    this.outputType = "File";
    this.args = [
      {
        name: "Filename",
        type: "string",
        value: "file.txt",
      },
    ];
  }

  /**
   * @param {ArrayBuffer} input
   * @param {any[]} args
   * @returns {File}
   */
  run(input: ArrayBuffer, args: any[]): File {
    const inputBytes = new Uint8Array(input);

    class Tarball {
      bytes: number[] = new Array(512).fill(0);
      position: number = 0;

      addEmptyBlock() {
        const filler = new Array(512).fill(0);
        this.bytes = this.bytes.concat(filler);
      }

      writeBytes(bytes: string | number[] | Uint8Array) {
        if (this.position + bytes.length > this.bytes.length) {
          this.addEmptyBlock();
        }

        for (let i = 0; i < bytes.length; i++) {
          let b: any = (bytes as any)[i];
          if (typeof b === "string") {
            b = b.charCodeAt(0);
          }

          this.bytes[this.position] = b;
          this.position += 1;
        }
      }

      writeEndBlocks() {
        const numEmptyBlocks = 2;
        for (let i = 0; i < numEmptyBlocks; i++) {
          this.addEmptyBlock();
        }
      }
    }

    const fileSize = inputBytes.length.toString(8).padStart(11, "0");
    const currentUnixTimestamp = Math.floor(Date.now() / 1000);
    const lastModTime = currentUnixTimestamp.toString(8).padStart(11, "0");

    const file: Record<string, number[] | string> = {
      fileName: Utils.padBytesRight(Utils.strToByteArray(args[0]), 100),
      fileMode: Utils.padBytesRight(Utils.strToByteArray("0000664"), 8),
      ownerUID: Utils.padBytesRight(Utils.strToByteArray("0"), 8),
      ownerGID: Utils.padBytesRight(Utils.strToByteArray("0"), 8),
      size: Utils.padBytesRight(Utils.strToByteArray(fileSize), 12),
      lastModTime: Utils.padBytesRight(Utils.strToByteArray(lastModTime), 12),
      checksum: "        ",
      type: "0",
      linkedFileName: Utils.padBytesRight(Utils.strToByteArray(""), 100),
      USTARFormat: Utils.padBytesRight(Utils.strToByteArray("ustar"), 6),
      version: "00",
      ownerUserName: Utils.padBytesRight(Utils.strToByteArray(""), 32),
      ownerGroupName: Utils.padBytesRight(Utils.strToByteArray(""), 32),
      deviceMajor: Utils.padBytesRight(Utils.strToByteArray(""), 8),
      deviceMinor: Utils.padBytesRight(Utils.strToByteArray(""), 8),
      fileNamePrefix: Utils.padBytesRight(Utils.strToByteArray(""), 155),
    };

    let checksum = 0;
    for (const key in file) {
      const val = file[key];
      if (Array.isArray(val)) {
        for (let i = 0; i < val.length; i++) {
          checksum += val[i];
        }
      } else if (typeof val === "string") {
        for (let i = 0; i < val.length; i++) {
          checksum += val.charCodeAt(i);
        }
      }
    }
    const checksumStr = Utils.padBytesRight(
      Utils.strToByteArray(checksum.toString(8).padStart(7, "0")),
      8,
    );
    file.checksum = Utils.byteArrayToChars(checksumStr);

    const tarball = new Tarball();
    tarball.writeBytes(file.fileName as number[]);
    tarball.writeBytes(file.fileMode as number[]);
    tarball.writeBytes(file.ownerUID as number[]);
    tarball.writeBytes(file.ownerGID as number[]);
    tarball.writeBytes(file.size as number[]);
    tarball.writeBytes(file.lastModTime as number[]);
    tarball.writeBytes(file.checksum as string);
    tarball.writeBytes(file.type as string);
    tarball.writeBytes(file.linkedFileName as number[]);
    tarball.writeBytes(file.USTARFormat as number[]);
    tarball.writeBytes(file.version as string);
    tarball.writeBytes(file.ownerUserName as number[]);
    tarball.writeBytes(file.ownerGroupName as number[]);
    tarball.writeBytes(file.deviceMajor as number[]);
    tarball.writeBytes(file.deviceMinor as number[]);
    tarball.writeBytes(file.fileNamePrefix as number[]);
    tarball.writeBytes(Utils.padBytesRight(Utils.strToByteArray(""), 12));
    tarball.writeBytes(inputBytes);
    tarball.writeEndBlocks();

    return new File([new Uint8Array(tarball.bytes)], args[0]);
  }
}

export default Tar;
