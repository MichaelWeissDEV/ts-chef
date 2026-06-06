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
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

/**
 * Render Markdown operation
 */
export class RenderMarkdown extends Operation {
  /**
   * RenderMarkdown constructor
   */
  constructor() {
    super();

    this.name = "Render Markdown";
    this.module = "Code";
    this.description =
      "Renders input Markdown as HTML. HTML rendering is disabled to avoid XSS.";
    this.infoURL = "https://wikipedia.org/wiki/Markdown";
    this.inputType = "string";
    this.outputType = "html";
    this.args = [
      {
        name: "Autoconvert URLs to links",
        type: "boolean",
        value: false,
      },
      {
        name: "Enable syntax highlighting",
        type: "boolean",
        value: true,
      },
      {
        name: "Open links in new tab.",
        type: "boolean",
        value: false,
      },
    ];
  }

  /**
   * @param {string} input
   * @param {Object[]} args
   * @returns {string}
   */
  run(input: string, args: any[]): string {
    const [convertLinks, enableHighlighting, openLinksBlank] = args,
      md = new MarkdownIt({
        linkify: convertLinks,
        html: false, // Explicitly disable HTML rendering
        highlight: function (str: string, lang: string): string {
          if (lang && hljs.getLanguage(lang) && enableHighlighting) {
            try {
              return hljs.highlight(str, { language: lang }).value;
            } catch (__) {}
          }

          return "";
        },
      });
    if (openLinksBlank) {
      this.makeLinksOpenInNewTab(md);
    }
    const rendered = md.render(input);
    return `<div style="font-family: var(--primary-font-family)">${rendered}</div>`;
  }

  /**
   * Adds target="_blank" to links.
   * @param {MarkdownIt} md
   */
  makeLinksOpenInNewTab(md: MarkdownIt) {
    // Adapted from: https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer
    // Remember old renderer, if overridden, or proxy to default renderer
    const defaultRender =
      md.renderer.rules.link_open ||
      function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

    // eslint-disable-next-line camelcase
    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      const token = tokens[idx];
      const aIndex = token.attrIndex("target");

      if (aIndex < 0) {
        token.attrPush(["target", "_blank"]); // add new attribute
      } else {
        const attrs = token.attrs;
        if (attrs) {
          attrs[aIndex][1] = "_blank";
        }
      }

      // pass token to default renderer.
      return defaultRender(tokens, idx, options, env, self);
    };
  }
}

export default RenderMarkdown;
