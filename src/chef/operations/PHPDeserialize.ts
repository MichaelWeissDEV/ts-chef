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
import OperationError from "../errors/OperationError";

/**
 * PHP Deserialize operation
 */
export class PHPDeserialize extends Operation {
  /**
   * PHPDeserialize constructor
   */
  constructor() {
    super();

    this.name = "PHP Deserialize";
    this.module = "Default";
    this.description =
      "Deserializes PHP serialized data, outputting keyed arrays as JSON.<br><br>This function does not support <code>object</code> tags.<br><br>Example:<br><code>a:2:{s:1:&quot;a&quot;;i:10;i:0;a:1:{s:2:&quot;ab&quot;;b:1;}}</code><br>becomes<br><code>{&quot;a&quot;: 10,0: {&quot;ab&quot;: true}}</code><br><br><u>Output valid JSON:</u> JSON doesn't support integers as keys, whereas PHP serialization does. Enabling this will cast these integers to strings. This will also escape backslashes.";
    this.infoURL =
      "http://www.phpinternalsbook.com/classes_objects/serialization.html";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Output valid JSON",
        type: "boolean",
        value: true,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: any, args: any[]): any {
    /**
     * Recursive method for deserializing.
     * @returns {*}
     */
    function handleInput(): any {
      /**
       * Read `length` characters from the input, shifting them out the input.
       * @param length
       * @returns {string}
       */
      function read(length: number) {
        let result = "";
        for (let idx = 0; idx < length; idx++) {
          const char = inputPart.shift();
          if (char === undefined) {
            throw new OperationError(
              "End of input reached before end of script",
            );
          }
          result += char;
        }
        return result;
      }

      /**
       * Read characters from the input until `until` is found.
       * @param until
       * @returns {string}
       */
      function readUntil(until: string) {
        let result = "";
        for (;;) {
          const char = read(1);
          if (char === until) {
            break;
          } else {
            result += char;
          }
        }
        return result;
      }

      /**
       * Read characters from the input that must be equal to `expect`
       * @param expect
       * @returns {string}
       */
      function expect(expectStr: string) {
        const result = read(expectStr.length);
        if (result !== expectStr) {
          throw new OperationError("Unexpected input found");
        }
        return result;
      }

      /**
       * Helper function to handle deserialized arrays.
       * @returns {Array}
       */
      function handleArray(): any[] {
        const items = parseInt(readUntil(":"), 10) * 2;
        expect("{");
        const result = [];
        let isKey = true;
        let lastItem = null;
        for (let idx = 0; idx < items; idx++) {
          const item = handleInput();
          if (isKey) {
            lastItem = item;
            isKey = false;
          } else {
            const numberCheck = lastItem.match(/[0-9]+/);
            if (
              args[0] &&
              numberCheck &&
              numberCheck[0].length === lastItem.length
            ) {
              result.push('"' + lastItem + '": ' + item);
            } else {
              result.push(lastItem + ": " + item);
            }
            isKey = true;
          }
        }
        expect("}");
        return result;
      }

      const kind = read(1).toLowerCase();

      switch (kind) {
        case "n":
          expect(";");
          return "null";
        case "i":
        case "d":
        case "b": {
          expect(":");
          const data = readUntil(";");
          if (kind === "b") {
            return parseInt(data, 10) !== 0;
          }
          return data;
        }

        case "a":
          expect(":");
          return "{" + handleArray() + "}";

        case "s": {
          expect(":");
          const length = readUntil(":");
          expect('"');
          const value = read(parseInt(length, 10));
          expect('";');
          if (args[0]) {
            return '"' + value.replace(/"/g, '\\"') + '"'; // lgtm [js/incomplete-sanitization]
          } else {
            return '"' + value + '"';
          }
        }

        default:
          throw new OperationError("Unknown type: " + kind);
      }
    }

    const inputPart = input.split("");
    return handleInput();
  }
}

export default PHPDeserialize;
