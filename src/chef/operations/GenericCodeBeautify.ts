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

export class GenericCodeBeautify extends Operation {
  constructor() {
    super();
    this.name = "Generic Code Beautify";
    this.module = "Code";
    this.description =
      "Attempts to pretty print C-style languages such as C, C++, C#, Java, PHP, JavaScript etc. This will not do a perfect job, and the resulting code may not work any more.";
    this.inputType = "string";
    this.outputType = "string";
    this.args = [];
  }

  run(input: string, _args: unknown[]): string {
    const preservedTokens: string[] = [];
    let code = input;
    let t = 0;
    let m: RegExpExecArray | null;

    function preserveToken(
      str: string,
      match: RegExpExecArray,
      idx: number,
    ): string {
      preservedTokens[idx] = match[0];
      return (
        str.substring(0, match.index) +
        `###preservedToken${idx}###` +
        str.substring(match.index + match[0].length)
      );
    }

    const sstrings = /'([^'\\]|\\.)*'/g;
    while ((m = sstrings.exec(code))) {
      code = preserveToken(code, m, t++);
      sstrings.lastIndex = m.index;
    }

    const dstrings = /"([^"\\]|\\.)*"/g;
    while ((m = dstrings.exec(code))) {
      code = preserveToken(code, m, t++);
      dstrings.lastIndex = m.index;
    }

    const scomments = /\/\/[^\n\r]*/g;
    while ((m = scomments.exec(code))) {
      code = preserveToken(code, m, t++);
      scomments.lastIndex = m.index;
    }

    const mcomments = /\/\*[\s\S]*?\*\//gm;
    while ((m = mcomments.exec(code))) {
      code = preserveToken(code, m, t++);
      mcomments.lastIndex = m.index;
    }

    const hcomments = /(^|\n)#[^\n\r#]+/g;
    while ((m = hcomments.exec(code))) {
      code = preserveToken(code, m, t++);
      hcomments.lastIndex = m.index;
    }

    const regexes = /\/.*?[^\\]\/[gim]{0,3}/gi;
    while ((m = regexes.exec(code))) {
      code = preserveToken(code, m, t++);
      regexes.lastIndex = m.index;
    }

    code = code
      .replace(/;/g, ";\n")
      .replace(/{/g, "{\n")
      .replace(/}/g, "\n}\n")
      .replace(/\r/g, "")
      .replace(/^\s+/g, "")
      .replace(/\n\s+/g, "\n")
      .replace(/\s*$/g, "")
      .replace(/\n{/g, "{");

    let i = 0;
    let level = 0;
    while (i < code.length) {
      switch (code[i]) {
        case "{":
          level++;
          break;
        case "\n":
          if (i + 1 >= code.length) break;
          if (code[i + 1] === "}") level--;
          {
            const indent = level >= 0 ? " ".repeat(level * 4) : "";
            code = code.substring(0, i + 1) + indent + code.substring(i + 1);
            if (level > 0) i += level * 4;
          }
          break;
      }
      i++;
    }

    code = code
      .replace(/\s*([!<>=+-/*]?)=\s*/g, " $1= ")
      .replace(/\s*<([=]?)\s*/g, " <$1 ")
      .replace(/\s*>([=]?)\s*/g, " >$1 ")
      .replace(/([^+])\+([^+=])/g, "$1 + $2")
      .replace(/([^-])-([^-=])/g, "$1 - $2")
      .replace(/([^*])\*([^*=])/g, "$1 * $2")
      .replace(/([^/])\/([^/=])/g, "$1 / $2")
      .replace(/\s*,\s*/g, ", ")
      .replace(/\s*{/g, " {")
      .replace(/}\n/g, "}\n\n")
      .replace(
        /(if|for|while|with|elif|elseif)\s*\(([^\n]*)\)\s*\n([^{])/gim,
        "$1 ($2)\n    $3",
      )
      .replace(
        /(if|for|while|with|elif|elseif)\s*\(([^\n]*)\)([^{])/gim,
        "$1 ($2) $3",
      )
      .replace(/else\s*\n([^{])/gim, "else\n    $1")
      .replace(/else\s+([^{])/gim, "else $1")
      .replace(/\s+;/g, ";")
      .replace(/\{\s+\}/g, "{}")
      .replace(/\[\s+\]/g, "[]")
      .replace(/}\s*(else|catch|except|finally|elif|elseif|else if)/gi, "} $1");

    const ptokens = /###preservedToken(\d+)###/g;
    while ((m = ptokens.exec(code))) {
      const ti = parseInt(m[1], 10);
      code =
        code.substring(0, m.index) +
        preservedTokens[ti] +
        code.substring(m.index + m[0].length);
      ptokens.lastIndex = m.index;
    }

    return code;
  }
}

export default GenericCodeBeautify;
