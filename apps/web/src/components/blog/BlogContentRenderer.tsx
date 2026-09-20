"use client";

import { useEffect, useState } from "react";
import { $generateHtmlFromNodes } from "@lexical/html";
import {
  CodeNode,
  CodeHighlightNode,
  registerCodeHighlighting,
} from "@lexical/code";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { LinkNode } from "@lexical/link";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ImageNode } from "./ImageNode";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { highlightExportedCode } from "@/lib/prism-setup";
import { sanitizeBlogHtml } from "@/lib/blog-content";

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
};

const initialConfig = {
  namespace: "DefiedBlogRenderer",
  theme,
  editable: false,
  onError(error: Error) {
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
    // Without ImageNode, parseEditorState throws "node not configured" on
    // content containing an image → catch swallows it → empty content.
    ImageNode,
    TableNode,
    TableRowNode,
    TableCellNode,
  ],
};

function RenderPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();
  const [html, setHtml] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Prism tokenizes code blocks into CodeHighlightNodes on read.
    return registerCodeHighlighting(editor);
  }, [editor]);

  useEffect(() => {
    if (!content.trimStart().startsWith("{")) return;
    try {
      editor.setEditorState(editor.parseEditorState(content));
      editor.getEditorState().read(() => {
        // Lexical's HTML export strips CodeHighlightNode theme classes, so
        // re-highlight <pre> blocks with Prism for proper token spans.
        setHtml(
          sanitizeBlogHtml(
            highlightExportedCode($generateHtmlFromNodes(editor, null)),
          ),
        );
        setFailed(false);
      });
    } catch (error) {
      // Surface parse failures instead of silently rendering nothing —
      // a bare empty area looks like "content disappeared".
      console.error("[BlogContentRenderer] failed to render content:", error);
      setFailed(true);
    }
  }, [content, editor]);

  if (failed) {
    return (
      <p className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
        Failed to render content — see the browser console for details.
      </p>
    );
  }

  return html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null;
}

export function BlogContentRenderer({ content }: { content: string }) {
  if (!content.trimStart().startsWith("{")) return null;

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RenderPlugin content={content} />
    </LexicalComposer>
  );
}
