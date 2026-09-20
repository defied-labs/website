import Link from "next/link";
import { PostForm } from "../post-form";
import { IconArrowLeft } from "@tabler/icons-react";

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <IconArrowLeft className="size-4" />
        Back to posts
      </Link>
      <div>
        <h1 className="text-2xl font-bold">New Post</h1>
        <p className="text-sm text-muted-foreground">Write a new blog post.</p>
      </div>
      <div className="rounded-lg border border-border p-6 bg-card">
        <PostForm mode="create" />
      </div>
    </div>
  );
}
