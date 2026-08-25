import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "./ui/button";
import { IconBubble, IconHeart } from "@tabler/icons-react";
import Link from "next/link";

interface Post {
  title: string;
  description: string;
  date: string;
  authors: string[];
  categories: string[];
  mainCategory: string;
  likes: number;
  comments: number;
  image: string;
  id: string;
}

function PostCard({ post, className }: { post: Post; className?: string }) {
  return (
    <div
      className={cn(
        "bg-card rounded-lg shadow-md relative h-100 overflow-hidden flex flex-col justify-end",
        className,
      )}
    >
      <Image
        src={post.image}
        alt={post.title}
        width={400}
        height={200}
        className="w-full h-full object-cover absolute opacity-20 hover:opacity-30 duration-300 hover:transform hover:scale-105 transition-all"
      />
      <div className="relative z-10 p-6">
        <p className="tracking-[0.3em]! uppercase font-semibold text-md text-primary">
          {post.mainCategory}
        </p>
        <Link href={`/posts/${post.id}`}>
          <h3 className="text-2xl font-bold mb-2 hover:underline">
            {post.title}
          </h3>
        </Link>

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div>
            {post.authors.map((author, index) => (
              <Image
                key={index}
                // src={`/images/authors/${author.toLowerCase().replace(" ", "_")}.jpg`}
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=random&size=40`}
                alt={author}
                width={40}
                height={40}
                className="inline-block rounded-full not-first:ml-[-20%] hover:not-first:ml-0 transition-all duration-300"
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 rounded-lg bg-background"
            >
              <IconHeart className="w-4 h-4" />
              <span>{post.likes}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 rounded-lg bg-background"
            >
              <IconBubble className="w-4 h-4" />
              <span>{post.comments}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostCard;
