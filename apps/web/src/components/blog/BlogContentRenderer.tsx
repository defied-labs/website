"use client";

import React from "react";
import { renderBlockNoteContent } from "@/lib/blocknote-render";

export function BlogContentRenderer({ content }: { content: string }) {
  if (!content.trim()) return null;

  const [html, setHtml] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!content.trim()) {
      setHtml(null);
      return;
    }

    const html = renderBlockNoteContent(content);
    setHtml(html);
  }, [content]);

  if (!html) return <div>Loading content...</div>;

  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}
