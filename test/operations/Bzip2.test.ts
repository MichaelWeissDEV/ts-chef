import { Bzip2Compress } from "../../src/chef/operations/Bzip2Compress";
import { Bzip2Decompress } from "../../src/chef/operations/Bzip2Decompress";

describe("Bzip2 Compress/Decompress", () => {
    const compressOp = new Bzip2Compress();
    const decompressOp = new Bzip2Decompress();

    test("Compress and Decompress a string", async () => {
        const inputString = "The quick brown fox jumps over the lazy dog";
        const inputBuffer = Buffer.from(inputString);
        
        const compressed = await compressOp.run(inputBuffer.buffer.slice(inputBuffer.byteOffset, inputBuffer.byteOffset + inputBuffer.byteLength), [9, 30]);
        expect(compressed.byteLength).toBeGreaterThan(0);

        const decompressed = await decompressOp.run(compressed, [false]);
        const resultString = Buffer.from(decompressed).toString();
        
        expect(resultString).toBe(inputString);
    });

    test("Compress and Decompress empty input should throw", async () => {
        const inputBuffer = new ArrayBuffer(0);
        await expect(compressOp.run(inputBuffer, [9, 30])).rejects.toThrow("Please provide an input.");
        await expect(decompressOp.run(inputBuffer, [false])).rejects.toThrow("Please provide an input.");
    });
});
