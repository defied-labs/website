import {
  BlockNoteEditor as BNE,
  BlockNoteSchema as BNS,
  createCodeBlockSpec,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from "@blocknote/core";
import {
  createReactInlineMathSpec,
  createReactMathBlockSpec,
} from "@blocknote/math-block";
import { codeBlockOptions } from "@blocknote/code-block";
import { highlightExportedCode } from "./prism-setup";
import {
  renderBlogContent,
  renderMathInHtml,
  sanitizeBlogHtml,
} from "./blog-content";

// Server-side only modules
let parseHTML: typeof import("linkedom").parseHTML;
if (typeof window === "undefined") {
  parseHTML = (await import("linkedom")).parseHTML;
}

// Create schema with math blocks, code blocks, and inline math
const schema = BNS.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    mathBlock: createReactMathBlockSpec(),
    codeBlock: createCodeBlockSpec({
      ...codeBlockOptions,
      supportedLanguages: Object.fromEntries(
        Object.entries(codeBlockOptions.supportedLanguages).filter(
          ([key]) => key !== "objective-c",
        ),
      ),
    }),
  },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    math: createReactInlineMathSpec(),
  },
  styleSpecs: defaultStyleSpecs,
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

  const dom = parseHTML!(
    "<!doctype html><html><head></head><body></body></html>",
    {
      includeNodeLocations: false,
    },
  );
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

  let blocks: unknown;
  try {
    blocks = JSON.parse(content);
  } catch {
    // Not JSON: a legacy markdown post
    try {
      return renderBlogContent(content);
    } catch {
      return null;
    }
  }

  if (!Array.isArray(blocks)) return null;
  return blocksToHtml(blocks.map(mathToDelimitedText));
}

// biome-ignore lint/suspicious/noExplicitAny: blocks come from stored editor JSON
type StoredNode = any;

const plainText = (node: StoredNode): string =>
  Array.isArray(node.content)
    ? node.content.map((c: StoredNode) => c.text ?? "").join("")
    : "";

/**
 * The math specs render through React and flushSync, which is a no-op when
 * this runs inside a React effect, so their exported HTML comes out empty.
 * Rewrite math to $-delimited text instead; renderMathInHtml turns it into
 * KaTeX without React.
 */
function mathToDelimitedText(block: StoredNode): StoredNode {
  const children = Array.isArray(block.children)
    ? block.children.map(mathToDelimitedText)
    : [];

  if (block.type === "mathBlock") {
    const latex = plainText(block).trim();
    return {
      type: "paragraph",
      props: {},
      content: latex ? [{ type: "text", text: `$$${latex}$$`, styles: {} }] : [],
      children,
    };
  }

  const content = Array.isArray(block.content)
    ? block.content.map((c: StoredNode) =>
        c.type === "math"
          ? { type: "text", text: `$${plainText(c)}$`, styles: {} }
          : c,
      )
    : block.content;

  return { ...block, content, children };
}

// biome-ignore lint/suspicious/noExplicitAny: blocks come from stored editor JSON
function blocksToHtml(blocks: any[]): string {
  return withHeadlessDom(() => {
    try {
      const editor = BNE.create({ schema });
      let html: string = editor.blocksToFullHTML(blocks);
      html = highlightExportedCode(html);
      html = renderMathInHtml(html);
      return sanitizeBlogHtml(html);
    } catch (e) {
      console.error("[blocknote-render] failed to render post:", e);
      return "";
    }
  });
}
