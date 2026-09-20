"use client";

import { useState } from "react";
import type { BlogPost, PostFormValues } from "@/lib/blog-types";
import BlogPostPreviewModal from "@/components/blog/BlogPostPreviewModal";
import { PostForm } from "../post-form";

export function EditPostClient({ post }: { post: BlogPost }) {
  const [preview, setPreview] = useState<PostFormValues>({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    published: post.published,
  });

  return (
    <>
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <p className="text-sm text-muted-foreground">
            Update your blog post.
          </p>
        </div>
        <BlogPostPreviewModal post={post} preview={preview} />
      </div>
      <div className="rounded-lg border border-border p-6 bg-card">
        <PostForm
          mode="edit"
          initial={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt ?? "",
            content: post.content,
            coverImage: post.coverImage ?? "",
            published: post.published,
          }}
          setPreview={setPreview}
        />
      </div>
    </>
  );
}
