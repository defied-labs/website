import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminPostById } from "@/lib/blog-server";
import { IconArrowLeft } from "@tabler/icons-react";
import { EditPostClient } from "./edit-post-client";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getAdminPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6 col-span-2">
      <Link
        href="/dashboard/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <IconArrowLeft className="size-4" />
        Back to posts
      </Link>
      <EditPostClient post={post} />
    </div>
  );
}
