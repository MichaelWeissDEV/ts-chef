import { Colossus } from "../../src/chef/operations/Colossus";
import { OperationError } from "../../src/chef/errors/OperationError";

describe("Colossus", () => {
  let colossus: Colossus;

  beforeEach(() => {
    colossus = new Colossus();
  });

  const defaultArgs = [
    "", // Input label
    "KH Pattern", // Pattern
    "", // QBusZ
    "", // QBusΧ
    "", // QBusΨ
    "None", // Limitation
    "Select Program", // K Rack Option
    "Letter Count", // Program to run
    "", // K Rack: Conditional label
    "",
    "",
    "",
    "",
    "", // R1-Q1..Q5
    false, // R1-Negate
    "1", // R1-Counter
    "",
    "",
    "",
    "",
    "", // R2-Q1..Q5
    false, // R2-Negate
    "", // R2-Counter
    "",
    "",
    "",
    "",
    "", // R3-Q1..Q5
    false, // R3-Negate
    "", // R3-Counter
    false, // Negate All
    "", // K Rack: Addition label
    false,
    false,
    false,
    false,
    false, // Add-Q1..Q5
    "", // Add-Equals
    false, // Add-Counter1
    false, // Add Negate All
    "", // Total Motor
    "", // Master Control Panel label
    0, // Set Total
    "", // Fast Step
    "", // Slow Step
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1, // Starts X1..S5
  ];

  test("should run 'Letter Count' program correctly", () => {
    const input = "HELLO";
    const result = colossus.run(input, defaultArgs);

    expect(result).toBeDefined();
    expect(result.counters).toBeDefined();
    expect(result.printout).toBeDefined();
    // HELLO in ITA2 is 5 characters
    expect(result.counters[0]).toBe(5);
  });

  test("should throw error for invalid ITA2 characters", () => {
    const input = "lower!"; // '!' is not in ITA2, and 'lower' will be uppercased but '!' remains
    expect(() => colossus.run(input, defaultArgs)).toThrow(OperationError);
  });

  test("should throw error for invalid rotor start position", () => {
    const args = [...defaultArgs];
    args[45] = 100; // X1 max size is 41
    expect(() => colossus.run("HELLO", args)).toThrow(OperationError);
    expect(() => colossus.run("HELLO", args)).toThrow(
      /X1 start must be between 1 and 41/,
    );
  });

  test("should throw error for invalid switch value", () => {
    const args = [...defaultArgs];
    args[7] = ""; // Don't select a program, so it doesn't overwrite our switch
    args[9] = "a"; // Must be blank, . or x
    expect(() => colossus.run("HELLO", args)).toThrow(OperationError);
    expect(() => colossus.run("HELLO", args)).toThrow(
      /Switch R1-Q1 can only be set to blank, . or x/,
    );
  });
});
