import { normalizePages } from "nextra/normalize-pages";
import { getPageMap } from "nextra/page-map";

export type NextraPost = Awaited<ReturnType<typeof getPosts>>[number];

export interface CardPost {
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

export function toCardPost(post: NextraPost): CardPost {
  const frontMatter = post.frontMatter;

  return {
    title: frontMatter.title,
    description: frontMatter.description ?? "",
    date: frontMatter.date,
    authors: frontMatter.authors ?? [],
    categories: frontMatter.categories ?? [],
    mainCategory: frontMatter.mainCategory ?? "",
    likes: frontMatter.likes ?? 0,
    comments: frontMatter.comments ?? 0,
    image: frontMatter.image ?? "/og-image.png",
    id: post.route.split("/").at(-1)!,
  };
}

export async function getPosts() {
  const { directories } = normalizePages({
    list: await getPageMap("/blog/posts"),
    route: "/blog/posts",
  });
  return directories
    .filter((post) => post.name !== "index")
    .sort(
      (a, b) => +new Date(b.frontMatter.date) - +new Date(a.frontMatter.date),
    );
}

export async function getTags() {
  const posts = await getPosts();
  return posts.flatMap((post) =>
    (post.frontMatter.tags ?? []).map((tag: unknown) => String(tag)),
  );
}
