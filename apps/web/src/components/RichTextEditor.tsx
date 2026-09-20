"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { CodeNode } from "@lexical/code";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { $generateNodesFromDOM } from "@lexical/html";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  type LexicalNode,
} from "lexical";
import { Button } from "@/components/ui/button";
import {
  INSERT_TABLE_COMMAND,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "@lexical/table";
import { registerBlogShortcuts } from "@/lib/editor-shortcuts";
import {
  $createCodeNode,
  $isCodeNode,
  CodeHighlightNode,
  PrismTokenizer,
  registerCodeHighlighting,
} from "@lexical/code";
import { $createImageNode, ImageNode } from "@/components/blog/ImageNode";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

type CodeDraft = {
  nodeKey: string | null;
  code: string;
  language: string;
};

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
  namespace: "DefiedBlog",
  theme,
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
    TableNode,
    TableRowNode,
    TableCellNode,
    ImageNode,
  ],
};

function InitialStatePlugin({
  value,
  onInitialized,
}: {
  value: string;
  onInitialized: () => void;
}) {
  const [editor] = useLexicalComposerContext();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    if (!value) {
      onInitialized();
      return;
    }
    try {
      if (value.trimStart().startsWith("{")) {
        editor.setEditorState(editor.parseEditorState(value));
        onInitialized();
        return;
      }
    } catch {
      // Existing posts may contain legacy Markdown or HTML.
    }

    editor.update(() => {
      if (typeof document !== "undefined" && /<\/?[a-z][\s\S]*>/i.test(value)) {
        const container = document.createElement("div");
        container.innerHTML = value;
        const nodes = $generateNodesFromDOM(editor, container);
        $getRoot().clear();
        $getRoot().select();
        const selection = $getSelection();
        if ($isRangeSelection(selection)) selection.insertNodes(nodes);
      } else {
        $getRoot().clear();
        $getRoot().select();
        $convertFromMarkdownString(value, TRANSFORMERS);
      }
      onInitialized();
    });
  }, [editor, initialized, onInitialized, value]);

  return null;
}

function ToolbarPlugin({ onOpenCodeEditor }: { onOpenCodeEditor: () => void }) {
  const [editor] = useLexicalComposerContext();
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("");

  function format(command: "bold" | "italic" | "underline" | "code") {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, command);
  }

  function block(type: "h1" | "h2" | "h3" | "quote") {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () =>
        type === "quote" ? $createQuoteNode() : $createHeadingNode(type),
      );
    });
  }

  return (
    <div className="sticky top-0 z-20 flex flex-wrap gap-1 border-b border-input bg-muted/95 p-1 backdrop-blur">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        Undo
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        Redo
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => format("bold")}
      >
        Bold
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => format("italic")}
      >
        Italic
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => format("underline")}
      >
        Underline
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => format("code")}
      >
        Code
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => block("h1")}
      >
        H1
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => block("h2")}
      >
        H2
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => block("h3")}
      >
        H3
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => block("quote")}
      >
        Quote
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
      >
        Bullets
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
      >
        Numbered
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
        }
      >
        Checklist
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)
        }
      >
        Rule
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          editor.dispatchCommand(INSERT_TABLE_COMMAND, {
            columns: "3",
            rows: "2",
            includeHeaders: true,
          })
        }
      >
        Table
      </Button>
      <input
        value={imageUrl}
        onChange={(event) => setImageUrl(event.target.value)}
        placeholder="https://.../image.png"
        className="h-8 min-w-32 rounded border bg-background px-2 text-xs"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;
            const src = imageUrl.trim();
            if (!src) return;
            // $createImageNode takes an options object, not a string.
            selection.insertNodes([
              $createImageNode({ src, altText: "Blog image" }),
            ]);
          })
        }
      >
        Image
      </Button>
      <select
        value={codeLanguage}
        onChange={(event) => {
          const language = event.target.value;
          setCodeLanguage(language);
          // Apply the language to the code block containing the caret (if
          // any), so existing blocks get highlighted without recreating them.
          editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;
            const codeNode = $isCodeNode(selection.anchor.getNode())
              ? selection.anchor.getNode()
              : selection.anchor.getNode().getParent();
            if ($isCodeNode(codeNode))
              codeNode.setLanguage(language || undefined);
          });
        }}
        className="h-8 rounded border bg-background px-2 text-xs"
        aria-label="Code language"
      >
        <option value="">Code lang…</option>
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="python">Python</option>
        <option value="json">JSON</option>
        <option value="css">CSS</option>
        <option value="markup">HTML</option>
        <option value="sql">SQL</option>
        <option value="bash">Bash</option>
        <option value="yaml">YAML</option>
        <option value="rust">Rust</option>
      </select>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onOpenCodeEditor}
      >
        Code editor
      </Button>
      <input
        value={linkUrl}
        onChange={(event) => setLinkUrl(event.target.value)}
        placeholder="https://..."
        className="h-8 min-w-32 rounded border bg-background px-2 text-xs"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl || null)
        }
      >
        Link
      </Button>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const initializedRef = useRef(false);
  const [codeDraft, setCodeDraft] = useState<CodeDraft | null>(null);

  function ShortcutPlugin() {
    const [editor] = useLexicalComposerContext();
    useEffect(
      () => registerBlogShortcuts(editor, openCodeEditor),
      [editor, openCodeEditor],
    );
    return null;
  }

  function EditorReferencePlugin() {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
      editorRef.current = editor;
      return () => {
        editorRef.current = null;
      };
    }, [editor]);
    return null;
  }

  function openCodeEditor() {
    const editor = editorRef.current;
    if (!editor) return;

    const draft = editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return { nodeKey: null, code: "", language: "javascript" };
      }

      let node: LexicalNode | null = selection.anchor.getNode();
      while (node && !$isCodeNode(node)) {
        node = node.getParent();
      }
      const codeNode = $isCodeNode(node) ? node : null;

      return {
        nodeKey: codeNode?.getKey() ?? null,
        code: codeNode?.getTextContent() ?? selection.getTextContent(),
        language: codeNode?.getLanguage() ?? "javascript",
      };
    });

    setCodeDraft(draft);
  }

  const editorRef = useRef<import("lexical").LexicalEditor | null>(null);

  function CodeHighlightPlugin() {
    const [editor] = useLexicalComposerContext();
    useEffect(() => registerCodeHighlighting(editor, PrismTokenizer), [editor]);
    return null;
  }

  return (
    <div className="relative max-h-[70vh] overflow-y-auto rounded-md border border-input bg-transparent focus-within:ring-1 focus-within:ring-ring/50">
      <LexicalComposer initialConfig={initialConfig}>
        <EditorReferencePlugin />
        <ToolbarPlugin onOpenCodeEditor={openCodeEditor} />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              aria-label="Post content"
              className="prose prose-sm dark:prose-invert min-h-64 max-w-none p-3 outline-none"
            />
          }
          placeholder={
            <div className="pointer-events-none p-3 text-sm text-muted-foreground">
              Write your post...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <TablePlugin hasHorizontalScroll />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <AutoFocusPlugin />
        <CodeHighlightPlugin />
        <ShortcutPlugin />
        <InitialStatePlugin
          value={value}
          onInitialized={() => {
            initializedRef.current = true;
          }}
        />
        <OnChangePlugin
          onChange={(state) => {
            if (initializedRef.current)
              onChange(JSON.stringify(state.toJSON()));
          }}
        />
      </LexicalComposer>
      {codeDraft ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="code-editor-title"
        >
          <div className="flex h-[min(720px,90vh)] w-full max-w-5xl flex-col overflow-hidden rounded-lg border bg-background shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
              <h2 id="code-editor-title" className="text-sm font-semibold">
                Edit code block
              </h2>
              <select
                value={codeDraft.language}
                onChange={(event) =>
                  setCodeDraft((draft) =>
                    draft ? { ...draft, language: event.target.value } : draft,
                  )
                }
                className="h-8 rounded border bg-background px-2 text-xs"
                aria-label="Code language"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="json">JSON</option>
                <option value="css">CSS</option>
                <option value="html">HTML</option>
                <option value="sql">SQL</option>
                <option value="shell">Shell</option>
                <option value="yaml">YAML</option>
                <option value="rust">Rust</option>
              </select>
            </div>
            <div className="min-h-0 flex-1">
              <MonacoEditor
                height="100%"
                language={codeDraft.language}
                theme="vs-dark"
                value={codeDraft.code}
                onChange={(code) =>
                  setCodeDraft((draft) =>
                    draft ? { ...draft, code: code ?? "" } : draft,
                  )
                }
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  automaticLayout: true,
                  tabSize: 2,
                  padding: { top: 16, bottom: 16 },
                }}
              />
            </div>
            <div className="flex justify-end gap-2 border-t px-4 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCodeDraft(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const draft = codeDraft;
                  const editor = editorRef.current;
                  if (!editor) return;
                  editor.update(() => {
                    const existing = draft.nodeKey
                      ? $getNodeByKey(draft.nodeKey)
                      : null;
                    if ($isCodeNode(existing)) {
                      existing.clear().append($createTextNode(draft.code));
                      existing.setLanguage(draft.language || undefined);
                      return;
                    }

                    let selection = $getSelection();
                    if (!$isRangeSelection(selection)) {
                      $getRoot().selectEnd();
                      selection = $getSelection();
                    }
                    if (!$isRangeSelection(selection)) return;
                    selection.insertNodes([
                      $createCodeNode(draft.language || undefined, draft.code),
                    ]);
                  });
                  setCodeDraft(null);
                }}
              >
                Save code
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
