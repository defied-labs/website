"use client";

import { $createCodeNode } from "@lexical/code";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $getSelection, $isRangeSelection, type LexicalEditor } from "lexical";

// Keyboard shortcuts that vanilla Lexical plugins don't provide:
// - Cmd/Ctrl+Shift+C → wrap current selection in a code block
// - Cmd/Ctrl+K → prompt for a URL and link the current selection
export function registerBlogShortcuts(
  editor: LexicalEditor,
  onOpenCodeEditor?: () => void,
): () => void {
  function onKeyDown(event: KeyboardEvent) {
    const mod = event.metaKey || event.ctrlKey;
    if (!mod) return;

    if (event.shiftKey && (event.key === "C" || event.key === "c")) {
      event.preventDefault();
      if (onOpenCodeEditor) {
        onOpenCodeEditor();
        return;
      }
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        const text = selection.getTextContent();
        const codeNode = $createCodeNode(undefined, text);
        selection.insertNodes([codeNode]);
      });
      return;
    }

    if (event.key === "k" || event.key === "K") {
      event.preventDefault();
      const selection = editor.getEditorState().read(() => {
        const sel = $getSelection();
        return $isRangeSelection(sel) && !sel.isCollapsed()
          ? sel.getTextContent()
          : null;
      });
      if (!selection) return;
      const url = window.prompt("Link URL:", "https://");
      if (!url) return;
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    }
  }

  const rootElement = editor.getRootElement();
  rootElement?.addEventListener("keydown", onKeyDown);

  return () => {
    rootElement?.removeEventListener("keydown", onKeyDown);
  };
}
