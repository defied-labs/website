import { notFound } from "next/navigation";
import { getPublishedPostBySlug, type BlogPost } from "@/lib/blog-server";
import { BlogPostArticle } from "@/components/blog/BlogPostArticle";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
  post,
}: {
  params: Promise<{ slug: string }> | null;
  post?: BlogPost;
}) {
  let blogPost = post || null;
  if (!blogPost && params) {
    const { slug } = await params;
    blogPost = await getPublishedPostBySlug(slug);
    if (!slug) notFound();
  }
  if (!blogPost) notFound();

  // Test content with actual LaTeX math
  const testContent = `[
    {"id":"1","type":"heading","props":{"level":1},"content":[{"type":"text","text":"LaTeX Math Test"}]},
    {"id":"2","type":"mathBlock","props":{"latex":"E = mc^2"},"content":[]},
    {"id":"3","type":"paragraph","props":{},"content":[{"type":"text","text":"Einstein's famous equation: "},{"type":"math","props":{"latex":"E = mc^2"},"styles":{}}]},
    {"id":"4","type":"mathBlock","props":{"latex":"x = \\\\frac{-b \\\\pm \\\\sqrt{b^2-4ac}}{2a}"},"content":[]},
    {"id":"5","type":"paragraph","props":{},"content":[{"type":"text","text":"Quadratic formula: "},{"type":"math","props":{"latex":"x = \\\\frac{-b \\\\pm \\\\sqrt{b^2-4ac}}{2a}"},"styles":{}}]}
  ]`;

  return (
    <>
      <BlogPostArticle
        title={blogPost.title}
        excerpt={blogPost.excerpt}
        content={testContent}
        publishedAt={blogPost.publishedAt}
      />
    </>
  );
}
