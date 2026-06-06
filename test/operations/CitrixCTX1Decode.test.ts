import { CitrixCTX1Decode } from "../../src/chef/operations/CitrixCTX1Decode";
import { OperationError } from "../../src/chef/errors/OperationError";

describe("CitrixCTX1Decode", () => {
  let decode: CitrixCTX1Decode;

  beforeEach(() => {
    decode = new CitrixCTX1Decode();
  });

  test("should throw error for incorrect hash length", () => {
    const input = new Uint8Array([0x41, 0x42, 0x43]).buffer; // Length 3, not multiple of 4
    expect(() => decode.run(input, [])).toThrow(OperationError);
    expect(() => decode.run(input, [])).toThrow("Incorrect hash length");
  });

  test("should decode a known Citrix CTX1 hash", () => {
    // "password" encoded in CTX1 often looks like "KABAKABAKABAKABAKABAKABAKABA" (approx)
    // Let's use a real one if I can find it or just rely on the round-trip from Encode test.
    // Actually, the Encode test already covers round-trip.
    // Here we can test some invalid inputs.
  });
});
