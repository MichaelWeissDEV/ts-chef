import { gzipSync, deflateSync } from "zlib";
import { gunzipWithLimit } from "../../src/chef/operations/Gunzip";
import { zlibInflateWithLimit } from "../../src/chef/operations/ZlibInflate";

function arrayBuffer(value: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(value.byteLength);
  copy.set(value);
  return copy.buffer;
}

describe("bounded zlib decompression", () => {
  test("decompresses normal gzip and zlib payloads", () => {
    const plain = Buffer.from("safe payload");
    expect(
      Buffer.from(gunzipWithLimit(arrayBuffer(gzipSync(plain)))).toString(),
    ).toBe("safe payload");
    expect(
      Buffer.from(
        zlibInflateWithLimit(arrayBuffer(deflateSync(plain))),
      ).toString(),
    ).toBe("safe payload");
  });

  test("aborts gzip expansion before exceeding the output budget", () => {
    const compressed = gzipSync(Buffer.alloc(256 * 1024, 0x41));
    expect(() =>
      gunzipWithLimit(arrayBuffer(compressed), 64 * 1024),
    ).toThrow(/limit|large/i);
  });

  test("aborts zlib expansion before exceeding the output budget", () => {
    const compressed = deflateSync(Buffer.alloc(256 * 1024, 0x41));
    expect(() =>
      zlibInflateWithLimit(arrayBuffer(compressed), 64 * 1024),
    ).toThrow(/limit|large/i);
  });
});
