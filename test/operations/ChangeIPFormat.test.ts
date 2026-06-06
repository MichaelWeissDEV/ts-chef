import { ChangeIPFormat } from "../../src/chef/operations/ChangeIPFormat";

describe("ChangeIPFormat", () => {
    const op = new ChangeIPFormat();

    test("Dotted Decimal to Decimal", () => {
        expect(op.run("127.0.0.1", ["Dotted Decimal", "Decimal"])).toBe("2130706433");
    });

    test("Decimal to Hex", () => {
        expect(op.run("2130706433", ["Decimal", "Hex"])).toBe("7f000001");
    });

    test("Hex to Dotted Decimal", () => {
        expect(op.run("7f000001", ["Hex", "Dotted Decimal"])).toBe("127.0.0.1");
    });

    test("Dotted Decimal to Octal", () => {
        expect(op.run("127.0.0.1", ["Dotted Decimal", "Octal"])).toBe("017700000001");
    });

    test("Multiple lines", () => {
        const input = "127.0.0.1\n192.168.0.1";
        const output = op.run(input, ["Dotted Decimal", "Decimal"]);
        expect(output).toBe("2130706433\n3232235521");
    });
});
