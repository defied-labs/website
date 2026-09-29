import { createHighlighter } from "shiki";

const ALIAS_TO_CANONICAL: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  tsx: "typescript",
  jsx: "javascript",
  py: "python",
  rs: "rust",
  cs: "csharp",
  rb: "ruby",
  kt: "kotlin",
  jl: "julia",
  md: "markdown",
  yml: "yaml",
  sh: "bash",
  zsh: "bash",
  shell: "bash",
  txt: "text",
  plain: "text",
  "c++": "cpp",
  gql: "graphql",
  regexp: "regex",
  hs: "haskell",
  "objective-c": "objc",
  plaintext: "text",
  objectivec: "objc",
};

const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "java",
  "c",
  "cpp",
  "csharp",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "scala",
  "r",
  "julia",
  "lua",
  "perl",
  "html",
  "css",
  "scss",
  "less",
  "json",
  "yaml",
  "toml",
  "xml",
  "sql",
  "bash",
  "powershell",
  "dockerfile",
  "nginx",
  "apache",
  "ini",
  "properties",
  "markdown",
  "mdx",
  "vue",
  "svelte",
  "graphql",
  "regex",
  "latex",
  "haskell",
  "elm",
  "clojure",
  "elixir",
  "erlang",
  "fsharp",
  "ocaml",
  "dart",
  "groovy",
  "objc",
  "prolog",
  "scheme",
  "lisp",
  "text",
];

function canonicalizeLanguage(lang: string): string {
  const normalized = lang.toLowerCase();
  return ALIAS_TO_CANONICAL[normalized] ?? normalized;
}

let highlighterPromise: Promise<
  Awaited<ReturnType<typeof createHighlighter>>
> | null = null;

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: SUPPORTED_LANGUAGES,
    });
  }

  return highlighterPromise;
}

export async function createHighlighterWrapper() {
  const highlighter = await getHighlighter();

  // Create a fallback highlighter for unsupported languages
  const fallbackHighlighter = {
    codeToHtml(code: string, options: any) {
      // Just return the code as plain text with basic escaping
      const escaped = code
        .replace(/&/g, "&")
        .replace(/</g, "<")
        .replace(/>/g, ">");
      return `<pre class="language-${options.lang || "text"}"><code>${escaped}</code></pre>`;
    },
    getLoadedLanguages: () => highlighter.getLoadedLanguages(),
    loadLanguage: async (lang: string) => {
      const canonical = canonicalizeLanguage(lang);
      // Check if the canonical language is in our supported list
      if (!SUPPORTED_LANGUAGES.includes(canonical)) {
        // Return a no-op for unsupported languages
        return;
      }
      return highlighter.loadLanguage(canonical as any);
    },
  };

  return {
    ...highlighter,

    getLoadedLanguages() {
      return highlighter.getLoadedLanguages();
    },

    loadLanguage: async (lang: string) => {
      const canonical = canonicalizeLanguage(lang);
      if (!SUPPORTED_LANGUAGES.includes(canonical)) {
        // Don't throw, just return - unsupported languages will use fallback
        return;
      }
      return highlighter.loadLanguage(canonical as any);
    },

    codeToHtml(code: string, options: any) {
      const lang = options?.lang ? canonicalizeLanguage(options.lang) : options.lang;
      // Check if the canonical language is supported
      if (lang && !SUPPORTED_LANGUAGES.includes(lang)) {
        // Use fallback highlighter for unsupported languages
        return fallbackHighlighter.codeToHtml(code, { ...options, lang: options.lang });
      }
      return highlighter.codeToHtml(code, {
        ...options,
        lang,
      });
    },
  } as Awaited<ReturnType<typeof createHighlighter>>;
}
