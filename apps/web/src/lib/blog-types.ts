import type { ContentStatus, SeoMetadata, Taxonomy } from "@defied/content";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: ContentStatus;
  seo: SeoMetadata;
  taxonomy: Taxonomy;
  authorId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string | null; email: string | null } | null;
}

export interface PostFormValues {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: ContentStatus;
  seo: SeoMetadata;
  taxonomy: Taxonomy;
}

export function getInitialPostFormValues(initial?: Partial<PostFormValues> & { id: string }): PostFormValues {
  return {
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "[]",
    coverImage: initial?.coverImage ?? "",
    status: initial?.status ?? "draft",
    seo: initial?.seo ?? { noIndex: false },
    taxonomy: initial?.taxonomy ?? { categories: [], tags: [] },
  };
}
