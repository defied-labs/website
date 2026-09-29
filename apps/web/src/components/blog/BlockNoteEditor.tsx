"use client";

import {
  BlockNoteEditor as BNEditor,
  BlockNoteSchema,
  combineByGroup,
  createCodeBlockSpec,
  filterSuggestionItems,
  SyntaxHighlightingExtension,
} from "@blocknote/core";
import {
  createReactMathBlockSpec,
  createReactInlineMathSpec,
  getMathSlashMenuItems,
  getMathBlockTypeSelectItems,
} from "@blocknote/math-block";
import { codeBlockOptions } from "@blocknote/code-block";
import { createHighlighterWrapper } from "@/lib/shiki.bundle";
import {
  blockTypeSelectItems,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
  FormattingToolbar,
  FormattingToolbarController,
  SuggestionMenuController,
} from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";

const BlockNoteView = dynamic(
  () => import("@blocknote/mantine").then((mod) => mod.BlockNoteView),
  { ssr: false },
) as any;

interface BlockNoteEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const schema = BlockNoteSchema.create().extend({
  blockSpecs: {
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
    math: createReactInlineMathSpec(),
  },
});

const syntaxHighlighter = SyntaxHighlightingExtension({
  createHighlighter: async () => {
    const highlighter = await createHighlighterWrapper();
    return highlighter;
  },
});

export function BlockNoteEditor({ value, onChange }: BlockNoteEditorProps) {
  const editor = useCreateBlockNote({
    schema,
    extensions: [syntaxHighlighter],
    initialContent: value && value !== "[]" ? JSON.parse(value) : undefined,
  });

  const editorContainerRef = useRef<HTMLDivElement>(null);
  // Track if change originated from editor to prevent sync loop
  const isInternalChange = useRef(false);

  // Handle editor content changes
  useEffect(() => {
    if (!editor) return;

    const handleChange = () => {
      const blocks = editor.document;
      console.log('[BlockNoteEditor.onChange] Blocks:', blocks);
      isInternalChange.current = true;
      onChange(JSON.stringify(blocks));
      // Reset after a tick to allow the state update to propagate
      setTimeout(() => {
        isInternalChange.current = false;
      }, 0);
    };

    // Use the proper onChange API
    const unsubscribe = editor.onChange(handleChange);

    return () => {
      unsubscribe();
    };
  }, [editor, onChange]);

  // Sync editor content when value prop changes (e.g., when loading a post to edit)
  useEffect(() => {
    if (!editor || !value || value === "[]" || isInternalChange.current) return;

    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed) || parsed.length === 0) return;

    editor.transact((tr) => {
      const { doc } = tr;
      const schema = editor._tiptapEditor?.schema;
      if (!schema) return;

      const blockToNode = (block: any) => {
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

        return schema.nodes[block.type]?.create(block.props || {}, nodeContent);
      };

      const docContent = (parsed as any[])
        .map((block) => blockToNode(block))
        .filter(Boolean);
      const newDoc = schema.nodes.doc.create(null, docContent);
      if (newDoc) {
        tr.replaceWith(1, doc.content.size - 1, newDoc.content);
      }
    });
  }, [editor, value]);

  useEffect(() => {
    const fixButtonTypes = (root: Document | Element) => {
      const buttons = root.querySelectorAll<HTMLButtonElement>(
        "button:not([type]), button[type='submit']",
      );
      buttons.forEach((btn) => {
        if (btn.closest("form")?.querySelector("[type='submit']") === btn)
          return;
        btn.setAttribute("type", "button");
      });
    };

    const container = editorContainerRef.current;
    if (container) fixButtonTypes(container);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            if (el.tagName === "BUTTON") {
              if (el.closest("form")?.querySelector("[type='submit']") !== el) {
                el.setAttribute("type", "button");
              }
            }
            fixButtonTypes(el);
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={editorContainerRef}
      className="border rounded-md bg-background overflow-hidden"
    >
      <BlockNoteView
        editor={editor}
        className="min-h-100 resize-y overflow-y-auto"
      >
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar
              blockTypeSelectItems={[
                ...blockTypeSelectItems(editor.dictionary),
                ...getMathBlockTypeSelectItems(editor),
              ]}
            />
          )}
        />
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) => {
            const items = combineByGroup(
              getDefaultReactSlashMenuItems(editor),
              getMathSlashMenuItems(editor),
            );
            return filterSuggestionItems(items, query);
          }}
        />
      </BlockNoteView>
    </div>
  );
}
