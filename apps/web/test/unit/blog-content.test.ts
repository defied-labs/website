import { describe, it, expect } from "vitest";
import {
  isLexicalBlogContent,
  renderBlogContent,
  sanitizeBlogHtml,
  renderMathInHtml,
} from "../../src/lib/blog-content";

describe("Blog Content Processing & Rendering", () => {
  describe("isLexicalBlogContent", () => {
    it("returns true for valid Lexical serialized json", () => {
      const lexicalJson = JSON.stringify({
        root: {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [{ text: "Hello World", type: "text" }],
            },
          ],
        },
      });

      expect(isLexicalBlogContent(lexicalJson)).toBe(true);
    });

    it("returns false for non-lexical json or plain markdown", () => {
      expect(isLexicalBlogContent("# Just markdown")).toBe(false);
      expect(isLexicalBlogContent(JSON.stringify({ notRoot: true }))).toBe(
        false,
      );
      expect(isLexicalBlogContent("")).toBe(false);
    });
  });

  describe("sanitizeBlogHtml", () => {
    it("removes script tags and disallowed dangerous attributes", () => {
      const dirtyHtml = `<p>Safe text</p><script>alert('pwned')</script><img src="x" onerror="stealCookies()"/>`;
      const clean = sanitizeBlogHtml(dirtyHtml);

      expect(clean).toContain("<p>Safe text</p>");
      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("onerror");
    });

    it("adds rel='noopener noreferrer nofollow' to anchor tags", () => {
      const linkHtml = `<a href="https://example.com">Visit site</a>`;
      const sanitized = sanitizeBlogHtml(linkHtml);

      expect(sanitized).toContain('rel="noopener noreferrer nofollow"');
    });

    it("allows standard formatting tags and math elements", () => {
      const richHtml = `<h1>Title</h1><p><strong>Bold</strong> and <em>italic</em></p><math><mrow><mi>x</mi></mrow></math>`;
      const sanitized = sanitizeBlogHtml(richHtml);

      expect(sanitized).toContain("<h1>Title</h1>");
      expect(sanitized).toContain("<strong>Bold</strong>");
      expect(sanitized).toContain("<math>");
    });
  });

  describe("renderBlogContent", () => {
    it("converts markdown to sanitized HTML", () => {
      const markdown = `## Heading 2\n\nThis is a [link](https://defied.dev).`;
      const html = renderBlogContent(markdown);

      expect(html).toContain("<h2>Heading 2</h2>");
      expect(html).toContain('<a href="https://defied.dev"');
      expect(html).toContain('rel="noopener noreferrer nofollow"');
    });

    it("parses math blocks $$ ... $$ using KaTeX", () => {
      const markdownWithMath = `The formula is: \n\n$$ E = mc^2 $$`;
      const html = renderBlogContent(markdownWithMath);

      expect(html).toContain('class="math-display"');
      expect(html).toContain("katex");
    });
  });

  describe("renderMathInHtml (DOM environment)", () => {
    it("renders inline and display math expressions inside HTML DOM", () => {
      const inputHtml = `<p>Euler's identity: $e^{i\\pi} + 1 = 0$ is elegant.</p>`;
      const outputHtml = renderMathInHtml(inputHtml);

      expect(outputHtml).toContain('class="math-inline"');
      expect(outputHtml).toContain("katex");
    });
  });
});
