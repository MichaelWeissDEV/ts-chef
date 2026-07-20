/**
 * @fileoverview PHPSerialize operation - Ported from GCHQ's CyberChef
 * @package chef/operations
 * @license Apache-2.0
 * @author Michael Weiss
 * @copyright 2024-2026 Michael Weiss
 * @see {@link https://github.com/gchq/CyberChef|GCHQ CyberChef} - Original source for ported operations
 */

import { TypedOperation, AnyInput } from "../Operation";
import OperationError from "../errors/OperationError";

/**
 * PHP Serialize operation
 */
export class PHPSerialize extends TypedOperation<
  AnyInput,
  AnyInput,
  unknown[]
> {
  /**
   * PHPSerialize constructor
   */
  constructor() {
    super();

    this.name = "PHP Serialize";
    this.module = "Default";
    this.description =
      "Performs PHP serialization on JSON data.<br><br>This function does not support <code>object</code> tags.<br><br>Since PHP doesn't distinguish dicts and arrays, this operation is not always symmetric to <code>PHP Deserialize</code>.<br><br>Example:<br><code>[5,&quot;abc&quot;,true]</code><br>becomes<br><code>a:3:{i:0;i:5;i:1;s:3:&quot;abc&quot;;i:2;b:1;}<code>";
    this.infoURL =
      "https://www.phpinternalsbook.com/php5/classes_objects/serialization.html";
    this.inputType = "JSON";
    this.outputType = "string";
    this.args = [];
  }

  /**
   * @param {JSON} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: AnyInput, _args: unknown[]): AnyInput {
    /**
     * Determines if a number is an integer
     * @param {number} value
     * @returns {boolean}
     */
    function isInteger(value: unknown): boolean {
      return (
        typeof value === "number" && parseInt(value.toString(), 10) === value
      );
    }

    /**
     * Serialize basic types
     * @param {string | number | boolean} content
     * @returns {string}
     */
    function serializeBasicTypes(content: string | number | boolean) {
      const basicTypes = {
        string: "s",
        integer: "i",
        float: "d",
        boolean: "b",
      };
      /**
       * Booleans
       * cast to 0 or 1
       */
      if (typeof content === "boolean") {
        return `${basicTypes.boolean}:${content ? 1 : 0}`;
      }
      /* Numbers */
      if (typeof content === "number") {
        if (isInteger(content)) {
          return `${basicTypes.integer}:${content.toString()}`;
        } else {
          return `${basicTypes.float}:${content.toString()}`;
        }
      }
      /* Strings */
      if (typeof content === "string")
        return `${basicTypes.string}:${content.length}:"${content}"`;

      /** This should be unreachable */
      throw new OperationError(
        `Encountered a non-implemented type: ${typeof content}`,
      );
    }

    /**
     * Recursively serialize
     * @param {*} object
     * @returns {string}
     */
    function serialize(object: unknown): string {
      /* Null */
      if (object == null) {
        return `N;`;
      }

      if (
        typeof object === "string" ||
        typeof object === "number" ||
        typeof object === "boolean"
      ) {
        /* Basic types */
        return `${serializeBasicTypes(object)};`;
      } else if (object instanceof Array) {
        /* Arrays */
        const serializedElements = [];

        for (let i = 0; i < object.length; i++) {
          serializedElements.push(`${serialize(i)}${serialize(object[i])}`);
        }

        return `a:${object.length}:{${serializedElements.join("")}}`;
      } else if (object instanceof Object) {
        /**
         * Objects
         * Note: the output cannot be guaranteed to be in the same order as the input
         */
        const serializedElements = [];
        const record = object as Record<string, unknown>;
        const keys = Object.keys(record);

        for (const key of keys) {
          serializedElements.push(`${serialize(key)}${serialize(record[key])}`);
        }

        return `a:${keys.length}:{${serializedElements.join("")}}`;
      }

      /** This should be unreachable */
      throw new OperationError(
        `Encountered a non-implemented type: ${typeof object}`,
      );
    }

    return serialize(input);
  }
}

export default PHPSerialize;
