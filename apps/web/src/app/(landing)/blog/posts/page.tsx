import { DatabasePostCard } from "@/components/blog/DatabasePostCard";
import { listPublishedPosts } from "@/lib/blog-server";

export const metadata = { title: "Posts" };
export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const posts = await listPublishedPosts();
  return (
    <main className="min-h-screen" data-pagefind-ignore="all">
      <h1 className="text-3xl font-bold">Posts</h1>
      <p className="text-muted-foreground">
        Here are all the posts on the blog.
      </p>
      {posts.length ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <DatabasePostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-muted-foreground">
          No posts have been published yet.
        </p>
      )}
    </main>
  );
}
