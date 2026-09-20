import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { DatabasePostCard } from "@/components/blog/DatabasePostCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { listPublishedPosts } from "@/lib/blog-server";

export const dynamic = "force-dynamic";

export default async function BlogHome() {
  const posts = await listPublishedPosts();
  return (
    <main className="mb-40 flex-col items-center justify-evenly">
      <div className="flex h-[40vh] flex-col items-center justify-center gap-4">
        <h1 className="text-center font-lora text-5xl">
          Defied&apos;s <span className="text-primary">magic</span>
          <br />
          <span className="italic text-primary">Explained.</span>
        </h1>
      </div>
      <div className="mx-auto rounded-2xl bg-primary/20 p-12 lg:w-2/3">
        <SectionTitle>
          <span>// Research, development and knowledge share</span>
          <span>Blog</span>
        </SectionTitle>
        {posts.length ? (
          <div className="grid gap-8 py-12 lg:grid-cols-3">
            {posts.slice(0, 5).map((post) => (
              <DatabasePostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            No posts have been published yet.
          </p>
        )}
        <Link
          href="/blog/posts"
          className="mx-auto flex w-fit items-center gap-2 border-b border-b-transparent text-primary transition-all hover:border-primary"
        >
          <span className="flex items-center gap-2 text-lg font-semibold">
            View all posts <IconArrowRight />
          </span>
        </Link>
      </div>
    </main>
  );
}
