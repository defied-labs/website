import Link from "next/link";
import { listAdminPosts } from "@/lib/blog-server";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";
import dayjs from "dayjs";
import { DeletePostButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function BlogAdminPage() {
  const posts = await listAdminPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <p className="text-sm text-muted-foreground">
            Manage the posts on your blog.
          </p>
        </div>
        <Link
          href="/dashboard/blog/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-2 text-xs font-medium hover:bg-primary/80 transition-colors"
        >
          <IconPlus className="size-4" />
          New post
        </Link>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No posts yet. Create your first post to get started.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/blog/${post.id}`}
                      className="font-medium hover:underline"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      /{post.slug}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {post.published ? (
                      <span className="inline-block rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                        Published
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {dayjs(post.updatedAt).format("MMM D, YYYY")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/dashboard/blog/${post.id}`}
                        className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        aria-label="Edit post"
                      >
                        <IconPencil className="size-4" />
                      </Link>
                      <DeletePostButton id={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
