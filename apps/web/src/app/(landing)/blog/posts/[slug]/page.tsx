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

  return (
    <BlogPostArticle
      title={blogPost.title}
      excerpt={blogPost.excerpt}
      content={blogPost.content}
      publishedAt={blogPost.publishedAt}
    />
  );
}
