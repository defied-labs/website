import {
  BlockNoteEditor as BNE,
  BlockNoteSchema as BNS,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
  createCodeBlockSpec,
  SyntaxHighlightingExtension,
} from "@blocknote/core";
import { createReactMathBlockSpec, createReactInlineMathSpec } from "@blocknote/math-block";
import { codeBlockOptions } from "@blocknote/code-block";
import { createHighlighterWrapper } from "@/lib/shiki.bundle";
import { highlightExportedCode } from "./prism-setup";
import { renderMathInHtml, sanitizeBlogHtml } from "./blog-content";
import katex from "katex";

// Create custom code block spec with our custom highlighter (which supports Objective-C)
const customCodeBlockSpec = createCodeBlockSpec({
  ...codeBlockOptions,
  supportedLanguages: Object.fromEntries(
    Object.entries(codeBlockOptions.supportedLanguages).filter(
      ([key]) => key !== "objective-c",
    ),
  ),
});

// Server-side only modules
let parseHTML: typeof import("linkedom").parseHTML;
if (typeof window === "undefined") {
  parseHTML = (await import("linkedom")).parseHTML;
}

// Create syntax highlighter with our custom wrapper
const syntaxHighlighter = SyntaxHighlightingExtension({
  createHighlighter: async () => {
    const highlighter = await createHighlighterWrapper();
    return highlighter;
  },
});

// Create schema with math blocks, code blocks, and inline math
const schema = BNS.create({
  blockSpecs: {
    ...(await import("@blocknote/core")).defaultBlockSpecs,
    mathBlock: (await import("@blocknote/math-block")).createReactMathBlockSpec(),
    codeBlock: (await import("@blocknote/core")).createCodeBlockSpec({
      ...codeBlockOptions,
      supportedLanguages: Object.fromEntries(
        Object.entries(codeBlockOptions.supportedLanguages).filter(
          ([key]) => key !== "objective-c",
        ),
      ),
    }),
  },
  inlineContentSpecs: {
    ...(await import("@blocknote/core")).defaultInlineContentSpecs,
    math: (await import("@blocknote/math-block")).createReactInlineMathSpec(),
  },
  styleSpecs: (await import("@blocknote/core")).defaultStyleSpecs,
});

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

function withHeadlessDom<T>(run: () => T): T {
  // In browser, just run directly - we already have a real DOM
  if (isBrowser) {
    return run();
  }
  
  // Server-side: mock the DOM using linkedom
  const globalScope = globalThis as unknown as {
    document?: unknown;
    window?: unknown;
    HTMLElement?: unknown;
    Element?: unknown;
    Node?: unknown;
    Document?: unknown;
    DocumentFragment?: unknown;
  };
  const previousDocument = globalScope.document;
  const previousWindow = globalScope.window;
  const previousHTMLElement = globalScope.HTMLElement;
  const previousElement = globalScope.Element;
  const previousNode = globalScope.Node;
  const previousDocumentFragment = globalScope.DocumentFragment;

  const dom = parseHTML!("<!doctype html><html><head></head><body></body></html>", {
    includeNodeLocations: false,
  });
  
  globalScope.document = dom.document;
  globalScope.window = dom.window;
  globalScope.HTMLElement = dom.window.HTMLElement;
  globalScope.Element = dom.window.Element;
  globalScope.Node = dom.window.Node;
  globalScope.Document = dom.window.Document;
  globalScope.DocumentFragment = dom.window.DocumentFragment;

  try {
    return run();
  } finally {
    if (previousDocument === undefined) delete globalScope.document;
    else globalScope.document = previousDocument;
    if (previousWindow === undefined) delete globalScope.window;
    else globalScope.window = previousWindow;
    if (previousHTMLElement === undefined) delete globalScope.HTMLElement;
    else globalScope.HTMLElement = previousHTMLElement;
    if (previousElement === undefined) delete globalScope.Element;
    else globalScope.Element = previousElement;
    if (previousNode === undefined) delete globalScope.Node;
    else globalScope.Node = previousNode;
    if (previousDocumentFragment === undefined)
      delete globalScope.DocumentFragment;
    else globalScope.DocumentFragment = previousDocumentFragment;
  }
}

export function renderBlockNoteContent(content: string): string | null {
  if (!content.trim()) return null;

  try {
    console.log("[blocknote-render] renderBlockNoteContent called with content length:", content.length);
    const blocks = JSON.parse(content);
    if (!Array.isArray(blocks)) {
      console.log("[blocknote-render] Parsed content is not an array");
      return null;
    }

    const html = blocksToHtml(blocks);
    console.log("[blocknote-render] Generated HTML length:", html?.length);
    return html;
  } catch (e) {
    console.error("[blocknote-render] Error:", e);
    try {
      return renderBlogContentLegacy(content);
    } catch {
      return null;  
    }
  }
}

function blocksToHtml(blocks: any[]): string {
  return withHeadlessDom(() => {
    try {
      console.log("[blocknote-render] blocksToHtml called with", blocks.length, "blocks");
      const editor = BNE.create({ schema });

      editor.transact((tr) => {
        const { doc } = tr;
        const blockToNode = (block: any, parentContent: any[] = []) => {
          const schema = editor._tiptapEditor?.schema;
          if (!schema) return null;

          // Handle math blocks specially - they store LaTeX in props
          if (block.type === "mathBlock") {
            const latex = block.props?.latex || block.props?.formula || "";
            if (latex) {
              // Return a placeholder that will be replaced with KaTeX-rendered HTML
              return {
                type: "mathBlock",
                latex: latex,
                isMathBlock: true
              };
            }
          }

          const nodeContent =
            block.content
              ?.map((c: any) => {
                if (c.type === "text") {
                  const marks: any[] = [];
                  if (c.styles) {
                    Object.entries(c.styles).forEach(([markType, value]) => {
                      if (
                        value === true ||
                        (typeof value === "string" && value !== "")
                      ) {
                        if (schema.marks[markType]) {
                          marks.push(schema.marks[markType].create());
                        }
                      }
                    });
                  }
                  return schema.text(c.text, marks);
                }
                return null;
              })
              .filter(Boolean) || [];

          const node = schema.nodes[block.type]?.create(
            block.props || {},
            nodeContent,
          );
          return node;
        };

        const docContent = (blocks as any[])
          .map((block) => blockToNode(block))
          .filter((n): n is any => n !== null);
        const newDoc = editor._tiptapEditor?.schema?.nodes.doc.create(
          null,
          docContent,
        );
        if (newDoc) {
          tr.replaceWith(1, doc.content.size - 1, newDoc.content);
        }
      });

      console.log("[blocknote-render] editor state:", editor.document.map(b => b.type));
      
      // Export to full HTML with proper semantics
      let html = editor.blocksToFullHTML(blocks);
      console.log("[blocknote-render] raw html length:", html?.length);

      // Apply syntax highlighting to code blocks
      html = highlightExportedCode(html);

      // Render math expressions
      html = renderMathInHtml(html);

      // Sanitize
      html = sanitizeBlogHtml(html);

      // Post-process: Replace math block placeholders with KaTeX-rendered HTML
      // Handle various possible math block HTML structures from BlockNote
      html = html.replace(/<div class="bn-math-block"[^>]*data-latex="([^"]*)"[^>]*><\/div>/g, (match, latex) => {
        try {
          return katex.renderToString(latex, { throwOnError: false, displayMode: true });
        } catch {
          return match;
        }
      });
      
      // Also handle math blocks that might have different structure
      html = html.replace(/<div class="bn-math-block"[^>]*>([\s\S]*?)<\/div>/g, (match, innerContent) => {
        // Try to extract latex from data-latex attribute or from inner content
        const latexMatch = match.match(/data-latex="([^"]*)"/);
        if (latexMatch) {
          try {
            return katex.renderToString(latexMatch[1], { throwOnError: false, displayMode: true });
          } catch {
            return match;
          }
        }
        // If the inner content looks like LaTeX, try to render it
        if (innerContent && /[\\^_{}$]/.test(innerContent)) {
          try {
            return katex.renderToString(innerContent, { throwOnError: false, displayMode: true });
          } catch {
            return match;
          }
        }
        return match;
      });
      
      // Also handle math blocks that might be rendered as <math> elements with data attributes
      html = html.replace(/<math[^>]*data-latex="([^"]*)"[^>]*>([\s\S]*?)<\/math>/g, (match, latex) => {
        try {
          return katex.renderToString(latex, { throwOnError: false, displayMode: true });
        } catch {
          return match;
        }
      });
      
      // Handle any remaining elements with data-latex attribute
      html = html.replace(/<[^>]*data-latex="([^"]*)"[^>]*>[\s\S]*?<\/[^>]*>/g, (match, latex) => {
        try {
          return katex.renderToString(latex, { throwOnError: false, displayMode: true });
        } catch {
          return match;
        }
      });
      
      // Handle math inline blocks
      html = html.replace(/<span class="bn-inline-math"[^>]*data-latex="([^"]*)"[^>]*><\/span>/g, (match, latex) => {
        try {
          return katex.renderToString(latex, { throwOnError: false, displayMode: false });
        } catch {
          return match;
        }
      });
      
      // Also handle math blocks with different class structures
      html = html.replace(/<div[^>]*class="[^"]*math-block[^"]*"[^>]*data-latex="([^"]*)"[^>]*>([\s\S]*?)<\/div>/g, (match, latex, inner) => {
        try {
          return katex.renderToString(latex, { throwOnError: false, displayMode: true });
        } catch {
          return match;
        }
      });
      
      // Handle math blocks with different class names
      html = html.replace(/<div[^>]*class="[^"]*math[^"]*"[^>]*data-latex="([^"]*)"[^>]*>([\s\S]*?)<\/div>/g, (match, latex, inner) => {
        try {
          return katex.renderToString(latex, { throwOnError: false, displayMode: true });
        } catch {
          return match;
        }
      });
      
      // Handle any element with data-latex attribute that might have nested content
      html = html.replace(/<([^>]+)data-latex="([^"]*)"[^>]*>([\s\S]*?)<\/\1>/g, (match, tag, latex, inner) => {
        const isInline = tag.includes('inline') || tag.includes('span') || tag.includes('bn-inline');
        try {
          return katex.renderToString(latex, { throwOnError: false, displayMode: !isInline });
        } catch {
          return match;
        }
      });
      
      // Debug: log what math elements we found
      console.log("[blocknote-render] Post-process HTML length:", html.length);
      console.log("[blocknote-render] Post-process contains katex:", /katex/.test(html));
      console.log("[blocknote-render] Post-process contains math:", /math-display|math-inline/.test(html));
      
      return html;
    } catch (e) {
      console.error("[renderBlockNoteContent] failed:", e);
      return "";
    }
  });
}

/**
 * Legacy content handler - for old Lexical JSON or markdown posts
 */
function renderBlogContentLegacy(content: string): string {
  // If it's Lexical JSON (starts with {), convert via markdown
  if (content.trimStart().startsWith("{")) {
    return convertLexicalToHtml(content);
  }
  // Otherwise treat as markdown
  return renderBlogContentMarkdown(content);
}

function convertLexicalToHtml(lexicalJson: string): string {
  // For Lexical JSON, we'd ideally use the old pipeline
  // But since we're removing it, just return empty for now
  // The editor will re-save as BlockNote blocks on next edit
  return "";
}

function renderBlogContentMarkdown(content: string): string {
  // Use existing markdown renderer
  const { marked } = require("marked");
  const katex = require("katex");
  const sanitizeHtml = require("sanitize-html");

  const markdown = String(content ?? "");
  const renderedMath = markdown
    .replace(
      /\$\$([\s\S]+?)\$\$/g,
      (_, expr) =>
        `<div class="math-display">${katex.renderToString(expr.trim(), { throwOnError: false, displayMode: true })}</div>`,
    )
    .replace(/\$([^$\n]+)\$/g, (_, expr) =>
      katex.renderToString(expr, { throwOnError: false, displayMode: false }),
    );

  const html = marked.parse(renderedMath) as string;
  return sanitizeBlogHtml(renderMathInHtml(html));
}
