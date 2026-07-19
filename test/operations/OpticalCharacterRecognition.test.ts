/**
 * @fileoverview Resource-lifecycle tests for OpticalCharacterRecognition.
 * @package test/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 */

const mockRecognize = jest.fn();
const mockTerminate = jest.fn();
const mockCreateWorker = jest.fn();

jest.mock("tesseract.js", () => ({
  createWorker: mockCreateWorker,
}));

import { OpticalCharacterRecognition } from "../../src/chef/operations/OpticalCharacterRecognition";

const pngHeader = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]).buffer;

describe("OpticalCharacterRecognition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRecognize.mockResolvedValue({
      data: { confidence: 98.5, text: "malware report" },
    });
    mockTerminate.mockResolvedValue(undefined);
    mockCreateWorker.mockResolvedValue({
      recognize: mockRecognize,
      terminate: mockTerminate,
    });
  });

  test("recognises image data and always terminates its worker", async () => {
    await expect(
      new OpticalCharacterRecognition().run(pngHeader, [true, "LSTM only"]),
    ).resolves.toBe("Confidence: 98.5%\n\nmalware report");

    expect(mockCreateWorker).toHaveBeenCalledWith(
      "eng",
      1,
      expect.objectContaining({ logger: expect.any(Function) }),
    );
    expect(mockRecognize).toHaveBeenCalledWith(
      expect.stringMatching(/^data:image\/png;base64,/),
    );
    expect(mockTerminate).toHaveBeenCalledTimes(1);
  });

  test("terminates the worker when recognition fails", async () => {
    mockRecognize.mockRejectedValueOnce(new Error("recognition failed"));

    await expect(
      new OpticalCharacterRecognition().run(pngHeader, [false, "LSTM only"]),
    ).rejects.toThrow("Error performing OCR on image");
    expect(mockTerminate).toHaveBeenCalledTimes(1);
  });

  test("rejects unknown engine modes before creating a worker", async () => {
    await expect(
      new OpticalCharacterRecognition().run(pngHeader, [false, "unknown"]),
    ).rejects.toThrow("Unsupported OCR engine mode");
    expect(mockCreateWorker).not.toHaveBeenCalled();
  });
});
