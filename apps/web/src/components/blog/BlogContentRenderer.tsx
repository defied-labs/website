"use client";

import React from "react";
import { renderBlockNoteContent } from "@/lib/blocknote-render";

export function BlogContentRenderer({ content }: { content: string }) {
  const [html, setHtml] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!content.trim()) {
      setHtml(null);
      return;
    }

    const html = renderBlockNoteContent(content);
    setHtml(html);
  }, [content]);

  if (!content.trim()) return null;
  if (html === null) return <div>Loading content...</div>;
  if (!html) return <div>This post could not be displayed.</div>;

  // biome-ignore lint/security/noDangerouslySetInnerHtml: output passes through sanitizeBlogHtml
  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}
