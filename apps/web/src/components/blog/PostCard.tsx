import { cn } from "@/lib/utils";
import type { Post } from "@/types";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

function PostCard({ post, className }: { post: Post; className?: string }) {
  return (
    <article
      className={cn(
        "bg-card rounded-lg shadow-md relative h-100 overflow-hidden flex flex-col justify-end p-6 box-border",
        className,
      )}
    >
      <Image
        src={post.image}
        alt={post.title}
        width={400}
        height={200}
        loading="eager"
        className="w-full h-auto rounded-lg object-fill"
      />
      <div className="flex flex-col gap-2 my-4">
        <p className="tracking-[0.3em]! uppercase font-semibold text-md text-primary">
          {post.mainCategory}
        </p>
        <Link href={`/blog/posts/${post.id}` as any}>
          <h3 className="text-2xl font-bold mb-2 hover:underline">
            {post.title}
          </h3>
          <p className="text-muted-foreground">{post.description}</p>
        </Link>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <div className="flex gap-2">
          {post.authors.map((author) => (
            <Image
              key={author.name}
              src={author.avatar}
              alt={author.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {dayjs(post.date).fromNow()}
        </p>
      </div>
    </article>
  );
}

export default PostCard;
