export interface MagicResult {
  recipe: Array<{ op: string; args: unknown[] }>;
  data: string;
  type: string;
  valid: boolean;
  score: number;
  isUTF8: boolean;
  languageScores: Array<{ lang: string; score: number }>;
  fileType?: { name: string; mime: string; extension: string } | null;
}

class Magic {
  constructor(
    private data: string | Uint8Array,
    private chiIds: string[] = [],
  ) {}

  async detectLanguage(
    optionArray: boolean[],
  ): Promise<Array<{ lang: string; score: number }>> {
    void optionArray;
    return [];
  }

  async detectFileType(): Promise<{
    name: string;
    mime: string;
    extension: string;
  } | null> {
    return null;
  }

  isUTF8(): boolean {
    try {
      const buf =
        typeof this.data === "string"
          ? new TextEncoder().encode(this.data)
          : this.data;
      new TextDecoder("utf-8", { fatal: true }).decode(buf);
      return true;
    } catch {
      return false;
    }
  }

  static codeToLanguage(code: string): string {
    const languages: Record<string, string> = {
      en: "English",
      de: "German",
      fr: "French",
      es: "Spanish",
      it: "Italian",
      pt: "Portuguese",
      nl: "Dutch",
      ru: "Russian",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
      ar: "Arabic",
    };
    return languages[code] ?? code;
  }

  async speculativeExecution(
    depth: number,
    extLang: boolean,
    crib: string,
    p0: never[],
    p1: boolean,
    cribRegex: RegExp | null,
  ): Promise<MagicResult[]> {
    void depth;
    void extLang;
    void crib;
    return [];
  }
}

export default Magic;
