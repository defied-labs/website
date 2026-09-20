import Image from "next/image";
import Link from "next/link";

import type { BlogPost } from "@/lib/blog-server";

export function DatabasePostCard({ post }: { post: BlogPost }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      {post.coverImage ? (
        <Image
          src={post.coverImage}
          alt=""
          width={800}
          height={450}
          className="h-48 w-full object-cover"
        />
      ) : null}
      <div className="space-y-3 p-5">
        <p className="text-xs text-muted-foreground">
          {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
            new Date(post.publishedAt ?? post.createdAt),
          )}
        </p>
        <Link href={`/blog/posts/${post.slug}`} className="block">
          <h2 className="text-xl font-semibold hover:underline">
            {post.title}
          </h2>
        </Link>
        {post.excerpt ? (
          <p className="text-sm text-muted-foreground">{post.excerpt}</p>
        ) : null}
        {post.author?.name ? (
          <p className="text-xs text-muted-foreground">By {post.author.name}</p>
        ) : null}
      </div>
    </article>
  );
}
