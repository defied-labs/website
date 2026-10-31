import { describe, it, expect } from "vitest";
import { renderBlockNoteContent } from "@/lib/blocknote-render";

const paragraph = (text: string, styles: Record<string, unknown> = {}) => ({
  type: "paragraph",
  props: {},
  content: [{ type: "text", text, styles }],
  children: [],
});

const render = (blocks: unknown[]) =>
  renderBlockNoteContent(JSON.stringify(blocks)) ?? "";

describe("renderBlockNoteContent", () => {
  it("returns null for empty content", () => {
    expect(renderBlockNoteContent("   ")).toBeNull();
  });

  it("returns null for JSON that is not a block array", () => {
    expect(renderBlockNoteContent('"just a string"')).toBeNull();
  });

  it("renders paragraphs and headings", () => {
    const html = render([
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Title", styles: {} }],
        children: [],
      },
      paragraph("Hello world"),
    ]);

    expect(html).toMatch(/<h2[^>]*>[\s\S]*Title[\s\S]*<\/h2>/);
    expect(html).toContain("Hello world");
  });

  it("keeps bold and italic styles", () => {
    const html = render([paragraph("strong", { bold: true, italic: true })]);
    expect(html).toContain("<strong>");
    expect(html).toContain("<em>");
  });

  it("escapes HTML typed into text content", () => {
    const html = render([paragraph('<img src=x onerror="alert(1)">')]);
    expect(html).not.toMatch(/<img[^>]*onerror/i);
    expect(html).toContain("&lt;img");
  });

  it("strips javascript: links", () => {
    const html = render([
      {
        type: "paragraph",
        props: {},
        content: [
          {
            type: "link",
            href: "javascript:alert(1)",
            content: [{ type: "text", text: "click", styles: {} }],
          },
        ],
        children: [],
      },
    ]);
    expect(html).not.toContain("javascript:");
  });

  it("highlights code blocks", () => {
    const html = render([
      {
        type: "codeBlock",
        props: { language: "typescript" },
        content: [{ type: "text", text: "const x = 1;", styles: {} }],
        children: [],
      },
    ]);
    expect(html).toContain("<pre");
    expect(html).toContain("const");
  });

  it("renders math blocks with KaTeX", () => {
    const html = render([
      {
        type: "mathBlock",
        props: {},
        content: [{ type: "text", text: "x^2", styles: {} }],
        children: [],
      },
    ]);
    expect(html).toContain('class="katex-display"');
    expect(html).toContain('<annotation encoding="application/x-tex">x^2');
  });

  it("renders posts containing empty math blocks and empty text runs", () => {
    const html = render([
      paragraph("before"),
      {
        type: "mathBlock",
        props: {},
        content: [],
        children: [],
      },
      paragraph("", { bold: true }),
      paragraph("after"),
    ]);
    expect(html).toContain("before");
    expect(html).toContain("after");
  });

  it("falls back to markdown for non-JSON legacy posts", () => {
    const html = renderBlockNoteContent("# Legacy\n\nSome **bold** text");
    expect(html).toContain("<h1>Legacy</h1>");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("sanitizes legacy markdown posts", () => {
    const html =
      renderBlockNoteContent("hello <script>alert(1)</script> world") ?? "";
    expect(html).not.toContain("<script");
  });
});
