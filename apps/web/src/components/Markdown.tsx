import { MarkdownAsync } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import "katex/dist/katex.min.css";

export async function Markdown({ children }: { children: string }) {
  return (
    <MarkdownAsync
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        rehypeKatex,
        [
          rehypePrettyCode,
          {
            theme: "github-dark",
            keepBackground: false,
          },
        ],
      ]}
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {children}
    </MarkdownAsync>
  );
}
