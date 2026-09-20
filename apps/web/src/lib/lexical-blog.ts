import { createHeadlessEditor } from "@lexical/headless";
import { $generateHtmlFromNodes } from "@lexical/html";
import { CodeNode } from "@lexical/code";
import {
  $applyNodeReplacement,
  $createLineBreakNode,
  $getRoot,
  DecoratorNode,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { parseHTML } from "linkedom";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import {
  $createCodeHighlightNode,
  CodeHighlightNode,
  $isCodeNode,
} from "@lexical/code";
import Prism, {
  detectCodeLanguage,
  highlightExportedCode,
} from "./prism-setup";
import {
  isLexicalBlogContent,
  renderMathInHtml,
  sanitizeBlogHtml,
} from "./blog-content";

export type SerializedHorizontalRuleNode = Spread<
  { type: "horizontalrule"; version: 1 },
  SerializedLexicalNode
>;

export class HorizontalRuleNode extends DecoratorNode<null> {
  static getType(): string {
    return "horizontalrule";
  }

  static clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode(node.__key);
  }

  static importJSON(): HorizontalRuleNode {
    return $createHorizontalRuleNode();
  }

  isInline(): false {
    return false;
  }

  exportJSON(): SerializedHorizontalRuleNode {
    return { type: "horizontalrule", version: 1 };
  }

  createDOM(): HTMLElement {
    return document.createElement("hr");
  }

  exportDOM(): { element: HTMLElement } {
    return { element: document.createElement("hr") };
  }

  decorate(): null {
    return null;
  }

  isIsolated(): false {
    return false;
  }
}

export function $createHorizontalRuleNode(): HorizontalRuleNode {
  return $applyNodeReplacement(new HorizontalRuleNode());
}

const theme = {
  heading: {
    h1: "text-2xl font-bold",
    h2: "text-xl font-semibold",
    h3: "text-lg font-semibold",
  },
  paragraph: "mb-2",
  quote: "border-l-4 border-primary/40 pl-4 italic text-muted-foreground",
  list: { ul: "list-disc ml-6", ol: "list-decimal ml-6" },
  code: "rounded bg-muted px-1 py-0.5 font-mono text-sm",
  link: "text-primary underline",
  codeHighlight: {
    atrule: "token atrule",
    attr: "token attr",
    boolean: "token boolean",
    builtin: "token builtin",
    cdata: "token cdata",
    char: "token char",
    class: "token class-name",
    comment: "token comment",
    constant: "token constant",
    deleted: "token deleted",
    doctype: "token doctype",
    entity: "token entity",
    function: "token function",
    important: "token important",
    inserted: "token inserted",
    keyword: "token keyword",
    namespace: "token namespace",
    number: "token number",
    operator: "token operator",
    property: "token property",
    punctuation: "token punctuation",
    regex: "token regex",
    selector: "token selector",
    string: "token string",
    symbol: "token symbol",
    tag: "token tag",
    url: "token url",
    variable: "token variable",
  },
};

function highlightCodeBlocks() {
  const codeNodes: CodeNode[] = [];
  const root = $getRoot();
  const stack: LexicalNode[] = [root];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if ($isCodeNode(node)) codeNodes.push(node);
    if ("getChildren" in node) {
      const children = (node as { getChildren(): LexicalNode[] }).getChildren();
      for (const child of children) stack.push(child);
    }
  }

  for (const codeNode of codeNodes) {
    const code = codeNode.getTextContent();
    const language = codeNode.getLanguage() ?? detectCodeLanguage(code) ?? "";
    const grammar =
      language && Prism.languages[language]
        ? Prism.languages[language]
        : undefined;

    if (!grammar) {
      codeNode.clear().append($createCodeHighlightNode(code));
      continue;
    }

    const lines = code.split("\n");
    const newChildren: LexicalNode[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) newChildren.push($createLineBreakNode());
      if (lines[i].length === 0) continue;
      const tokens = Prism.tokenize(lines[i], grammar);
      const highlights = tokensToHighlightNodes(tokens);
      newChildren.push(...highlights);
    }
    codeNode.clear();
    for (const child of newChildren) codeNode.append(child);
  }
}

function tokensToHighlightNodes(
  tokens: (string | Prism.Token)[],
): LexicalNode[] {
  const nodes: LexicalNode[] = [];
  for (const token of tokens) {
    if (typeof token === "string") {
      if (token.length > 0) nodes.push($createCodeHighlightNode(token));
      continue;
    }
    const text = tokenContent(token);
    if (text.length === 0) continue;
    nodes.push($createCodeHighlightNode(text, token.type));
  }
  return nodes;
}

function tokenContent(token: Prism.Token): string {
  if (typeof token.content === "string") return token.content;
  if (Array.isArray(token.content))
    return token.content
      .map((part) => (typeof part === "string" ? part : tokenContent(part)))
      .join("");
  return tokenContent(token.content as Prism.Token);
}

function withHeadlessDom<T>(run: () => T): T {
  const globalScope = globalThis as unknown as {
    document?: unknown;
    window?: unknown;
  };
  const previousDocument = globalScope.document;
  const previousWindow = globalScope.window;

  const dom = parseHTML(
    "<!doctype html><html><head></head><body></body></html>",
  );
  globalScope.document = dom.document;
  globalScope.window = dom.window;

  try {
    return run();
  } finally {
    if (previousDocument === undefined) delete globalScope.document;
    else globalScope.document = previousDocument;
    if (previousWindow === undefined) delete globalScope.window;
    else globalScope.window = previousWindow;
  }
}

export function renderLexicalBlogContent(content: string) {
  if (!isLexicalBlogContent(content)) return null;

  return withHeadlessDom(() => {
    const editor = createHeadlessEditor({
      namespace: "DefiedBlogServer",
      theme,
      onError(error) {
        throw error;
      },
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        LinkNode,
        CodeNode,
        CodeHighlightNode,
        HorizontalRuleNode,
        ServerImageNode,
        TableNode,
        TableRowNode,
        TableCellNode,
      ],
    });

    try {
      editor.setEditorState(editor.parseEditorState(content));
      editor.update(() => {
        highlightCodeBlocks();
      });
      let html = "";
      editor.getEditorState().read(() => {
        html = $generateHtmlFromNodes(editor, null);
      });
      return sanitizeBlogHtml(renderMathInHtml(highlightExportedCode(html)));
    } catch (error) {
      console.error("[renderLexicalBlogContent] failed:", error);
      return null;
    }
  });
}

export type SerializedServerImageNode = Spread<
  {
    altText: string;
    src: string;
    type: "blog-image";
    version: 1;
  },
  SerializedLexicalNode
>;

// Server counterpart of the client ImageNode (type "blog-image"): the client
// class is "use client" + JSX decorate, which cannot be imported in RSC.
// Only needs importJSON/exportDOM so the headless editor can parse and
// re-serialize image nodes as plain <img> HTML.
export class ServerImageNode extends DecoratorNode<null> {
  __src: string;
  __altText: string;

  constructor(src = "", altText = "", key?: import("lexical").NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
  }

  static getType(): string {
    return "blog-image";
  }

  static clone(node: ServerImageNode): ServerImageNode {
    return new ServerImageNode(node.__src, node.__altText, node.__key);
  }

  static importJSON(serialized: SerializedServerImageNode): ServerImageNode {
    return $applyNodeReplacement(
      new ServerImageNode(serialized.src, serialized.altText),
    );
  }

  exportJSON(): SerializedServerImageNode {
    return {
      altText: this.__altText,
      src: this.__src,
      type: "blog-image",
      version: 1,
    };
  }

  isInline(): false {
    return false;
  }

  createDOM(): HTMLElement {
    return document.createElement("span");
  }

  exportDOM(): { element: HTMLElement } {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__altText);
    return { element };
  }

  decorate(): null {
    return null;
  }
}
