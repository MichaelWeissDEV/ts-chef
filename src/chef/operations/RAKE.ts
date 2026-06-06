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
import { Utils } from "../Utils";

/**
 * RAKE operation
 */
export class RAKE extends Operation {
  /**
   * RAKE constructor
   */
  constructor() {
    super();

    this.name = "RAKE";
    this.module = "Default";
    this.description = [
      "Rapid Keyword Extraction (RAKE)",
      "<br><br>",
      "RAKE is a domain-independent keyword extraction algorithm in Natural Language Processing.",
      "<br><br>",
      "The list of stop words are from the NLTK python package",
    ].join("\n");
    this.inputType = "string";
    this.outputType = "string";
    this.args = [
      {
        name: "Word Delimiter (Regex)",
        type: "text",
        value: "\\s",
      },
      {
        name: "Sentence Delimiter (Regex)",
        type: "text",
        value: "\\.\\s|\\n",
      },
      {
        name: "Stop Words",
        type: "text",
        value:
          "i,me,my,myself,we,our,ours,ourselves,you,you're,you've,you'll,you'd,your,yours,yourself,yourselves,he,him,his,himself,she,she's,her,hers,herself,it,it's,its,itsef,they,them,their,theirs,themselves,what,which,who,whom,this,that,that'll,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does',did,doing,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,s,t,can,will,just,don,don't,should,should've,now,d,ll,m,o,re,ve,y,ain,aren,aren't,couldn,couldn't,didn,didn't,doesn,doesn't,hadn,hadn't,hasn,hasn't,haven,haven't,isn,isn't,ma,mightn,mightn't,mustn,mustn't,needn,needn't,shan,shan't,shouldn,shouldn't,wasn,wasn't,weren,weren't,won,won't,wouldn,wouldn't",
      },
    ];
  }

  /**
   * @param {string} input
   * @param {any[]} args
   * @returns {string}
   */
  run(input: string, args: any[]): string {
    // Get delimiter regexs
    const wordDelim = new RegExp(args[0], "g");
    const sentDelim = new RegExp(args[1], "g");

    // Deduplicate the stop words and add the empty string
    const stopWords = Utils.unique(
      args[2].toLowerCase().replace(/ /g, "").split(","),
    );
    stopWords.push("");

    // Lower case input and remove start and ending whitespace
    input = input.toLowerCase().trim();

    // Get tokens, token count, and phrases
    const tokens: string[] = [];
    const wordFrequencies: number[] = [];
    let phrases: string[][] = [];

    // Build up list of phrases and token counts
    const sentences = input.split(sentDelim);
    for (const sent of sentences) {
      // Split sentence into words
      const splitSent = sent.split(wordDelim);
      let startIndex = 0;

      for (let i = 0; i < splitSent.length; i++) {
        const token = splitSent[i];
        if (stopWords.includes(token)) {
          // If token is stop word then split to create phrase
          phrases.push(splitSent.slice(startIndex, i));
          startIndex = i + 1;
        } else {
          // If token is not a stop word add to the count of the list of words
          if (tokens.includes(token)) {
            wordFrequencies[tokens.indexOf(token)] += 1;
          } else {
            tokens.push(token);
            wordFrequencies.push(1);
          }
        }
      }
      phrases.push(splitSent.slice(startIndex));
    }

    // remove empty phrases
    phrases = phrases.filter((subArray) => subArray.length > 0);

    // Remove duplicate phrases
    phrases = Utils.unique(phrases);

    // Generate word_degree_matrix and populate
    const wordDegreeMatrix: number[][] = Array(tokens.length)
      .fill(0)
      .map(() => Array(tokens.length).fill(0));
    for (const phrase of phrases) {
      for (const word1 of phrase) {
        for (const word2 of phrase) {
          wordDegreeMatrix[tokens.indexOf(word1)][tokens.indexOf(word2)]++;
        }
      }
    }

    // Calculate degree score for each token
    const degreeScores: number[] = Array(tokens.length).fill(0);
    for (let i = 0; i < tokens.length; i++) {
      let wordDegree = 0;
      for (let j = 0; j < wordDegreeMatrix.length; j++) {
        wordDegree += wordDegreeMatrix[j][i];
      }
      degreeScores[i] = wordDegree / wordFrequencies[i];
    }

    // Calculate score for each phrase
    const scores: [number | string, string][] = phrases.map(function (phrase) {
      let score = 0;
      phrase.forEach(function (token) {
        score += degreeScores[tokens.indexOf(token)];
      });
      return [score, phrase.join(" ")];
    });
    scores.sort((a, b) => (b[0] as number) - (a[0] as number));
    scores.unshift(["Scores: ", "Keywords: "]);

    // Output works with the 'To Table' functionality already built into CC
    return scores
      .map(function (score) {
        return score.join(", ");
      })
      .join("\n");
  }
}

export default RAKE;
