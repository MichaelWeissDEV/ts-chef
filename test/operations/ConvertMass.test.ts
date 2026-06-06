import { ConvertMass } from "../../src/chef/operations/ConvertMass";

describe("ConvertMass", () => {
    const op = new ConvertMass();

    test("Gram to Kilogram", () => {
        expect(op.run("1500", ["Gram (g)", "Kilogram (kg)"])).toBe("1.5");
    });

    test("Pound to Ounce", () => {
        expect(op.run("1", ["Pound (lb)", "Ounce (oz)"])).toBe("16");
    });
});
