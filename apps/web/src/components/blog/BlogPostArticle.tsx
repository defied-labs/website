"use client";
import { BlogContentRenderer } from "./BlogContentRenderer";
import BorderGlow from "@/components/BorderGlow";
import { IconSparkles2Filled } from "@tabler/icons-react";

type BlogPostArticleProps = {
  title: string;
  excerpt: string | null;
  content: string;
  publishedAt?: string | null;
};

export function BlogPostArticle({
  title,
  excerpt,
  content,
  publishedAt,
}: BlogPostArticleProps) {
  

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <div>
        <h1 className="mb-0">{title}</h1>
        {publishedAt ? (
          <p className="text-sm text-muted-foreground mt-0">
            {new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
              new Date(publishedAt),
            )}
          </p>
        ) : null}
      </div>
      {excerpt ? (
        <BorderGlow
          edgeSensitivity={10}
          glowColor="40 80 80"
          backgroundColor="#120F17"
          borderRadius={28}
          glowRadius={60}
          glowIntensity={0.5}
          coneSpread={15}
          animated
          colors={["#1db6a5", "#1db6a5", "#06B6D4"]}
          className="my-10"
        >
          <div className="p-10 flex gap-2">
            <IconSparkles2Filled className="text-primary" />
            <div>
              <h2 className="p-0 m-0! text-white">AI Summary</h2>
              <p className="p-0 m-0! text-muted-foreground">{excerpt}</p>
            </div>
          </div>
        </BorderGlow>
      ) : null}
      <BlogContentRenderer content={content} />
    </article>
  );
}
