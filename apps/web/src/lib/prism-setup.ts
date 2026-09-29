import Prism from "prismjs";
// Prism's default bundle only ships markup/css/clike/javascript grammars.
// Load the full language set used by the blog editor so server-side and
// post-export highlighting matches the live editor.
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-python";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-css";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";

Prism;

// Language detection fallback for legacy code blocks saved without a
// `language` field (e.g. imported via markdown where fence info was dropped).
const LANGUAGE_PATTERNS: Array<[string, RegExp]> = [
  ["json", /^\s*[[{][\s\S]*[\]}]\s*$/],
  ["bash", /^\s*(\$|npm |pnpm |yarn |git |cd |mkdir |curl |sudo |#!\/)/m],
  ["python", /^\s*(def |import |from |class |print\(|if __name__)/m],
  [
    "typescript",
    /(:\s*(string|number|boolean)\b|interface\s+\w+|<\w+>\(|:\s*\w+\s*=)/,
  ],
  [
    "javascript",
    /(\bconst\b|\blet\b|\bfunction\b|=>|console\.log|require\(|module\.exports)/,
  ],
  ["sql", /\b(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|ALTER)\b/i],
  ["css", /([.#@][\w-]+\s*\{|[\w-]+:\s*[^;]+;\s*\})/],
  ["html", /<\/?(html|body|div|span|p|head|!doctype)\b/i],
  ["yaml", /^\s*[\w-]+:\s*(\S|$)/m],
  ["rust", /\b(fn\s+\w+|let\s+mut\b|impl\s+\w+|::<>|println!)/],
  ["java", /\b(public\s+(class|static|void)|System\.out\.println)/],
  ["c", /\b(#include\s*<|int\s+main\s*\(|printf\s*\()/],
  ["cpp", /\b(std::|#include\s*<\w+>|cout\s*<<)/],
];

function detectCodeLanguage(code: string): string | undefined {
  const sample = code.slice(0, 2000);
  for (const [language, pattern] of LANGUAGE_PATTERNS) {
    if (pattern.test(sample)) return language;
  }
  return undefined;
}

/**
 * Lexical's $generateHtmlFromNodes emits CodeHighlightNode tokens as bare
 * <span>s (the theme class is only applied by createDOM, not exportDOM),
 * so server-rendered/preview HTML loses all syntax highlighting.
 *
 * Fix: re-highlight every <pre> block in the exported HTML with Prism.
 * Produces <pre class="language-x"><code class="language-x">…</code></pre>
 * with proper token spans — the standard Prism markup.
 */
export function highlightExportedCode(html: string): string {
  return html.replace(
    /<pre([^>]*)>([\s\S]*?)<\/pre>/g,
    (match, preAttrs: string, inner: string) => {
      // Extract the plain text of the block (strip tags, decode entities).
      const text = decodeEntities(
        inner.replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, ""),
      );
      if (!text.trim()) return match;

      const language = detectCodeLanguage(text);
      const grammar = language ? Prism.languages[language] : undefined;
      if (!language || !grammar) return match;

      const highlighted = Prism.highlight(text, grammar, language);
      return `<pre${preAttrs}><code class="language-${language}">${highlighted}</code></pre>`;
    },
  );
}

// HTML entities built via concatenation so they are never mis-encoded.
const AMP = "&" + "amp;";
const LT = "&" + "lt;";
const GT = "&" + "gt;";
const QUOT = "&" + "quot;";
const SQUOT = "&" + "#" + "39;";

function decodeEntities(text: string): string {
  return text
    .replace(new RegExp(AMP, "g"), "&")
    .replace(new RegExp(LT, "g"), "<")
    .replace(new RegExp(GT, "g"), ">")
    .replace(new RegExp(QUOT, "g"), '"')
    .replace(new RegExp(SQUOT, "g"), "'");
}
