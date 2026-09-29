import { Injectable } from "@nestjs/common";
import {
  blogPostSchema,
  type ContentStatus,
  type SeoMetadata,
  type Taxonomy,
} from "@defied/content";
import prisma from "@defied/db";

export interface PostInput {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  status?: ContentStatus;
  published?: boolean;
  seo?: SeoMetadata;
  taxonomy?: Taxonomy;
  authorId?: string | null;
}

type PostWithAuthor = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: ContentStatus;
  published: boolean;
  seo: SeoMetadata;
  taxonomy: Taxonomy;
  authorId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string | null; email: string | null } | null;
};

type PersistedPost = Omit<PostWithAuthor, "seo" | "taxonomy"> & {
  seoTitle: string | null;
  seoDescription: string | null;
  seoImage: string | null;
  canonicalUrl: string | null;
  seoNoIndex: boolean;
  categories: string | null;
  tags: string | null;
};

@Injectable()
export class BlogService {
  private readonly author = {
    select: { id: true, name: true, email: true },
  } as const;

  private toContentPost(post: PersistedPost): PostWithAuthor {
    const parseList = (value: string | null) => {
      try {
        const parsed = JSON.parse(value ?? "[]");
        return Array.isArray(parsed)
          ? parsed.filter((item): item is string => typeof item === "string")
          : [];
      } catch {
        return [];
      }
    };

    return {
      ...post,
      seo: {
        title: post.seoTitle,
        description: post.seoDescription,
        canonicalUrl: post.canonicalUrl,
        image: post.seoImage ?? post.coverImage,
        noIndex: post.seoNoIndex,
      },
      published: post.status === "published",
      taxonomy: {
        categories: parseList(post.categories),
        tags: parseList(post.tags),
      },
    };
  }

  async listPosts(): Promise<PostWithAuthor[]> {
    const posts = await prisma.post.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: { author: this.author },
    });
    return posts.map((post) => this.toContentPost(post as PersistedPost));
  }

  async listPublishedPosts(): Promise<PostWithAuthor[]> {
    const posts = await prisma.post.findMany({
      where: { status: "published" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: { author: this.author },
    });
    return posts.map((post) => this.toContentPost(post as PersistedPost));
  }

  async getPostBySlug(slug: string): Promise<PostWithAuthor | null> {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: { author: this.author },
    });
    return post ? this.toContentPost(post as PersistedPost) : null;
  }

  async getPostById(id: string): Promise<PostWithAuthor | null> {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: this.author },
    });
    return post ? this.toContentPost(post as PersistedPost) : null;
  }

  async getPublishedPostBySlug(slug: string): Promise<PostWithAuthor | null> {
    const post = await prisma.post.findFirst({
      where: { slug, status: "published" },
      include: { author: this.author },
    });
    return post ? this.toContentPost(post as PersistedPost) : null;
  }

  async createPost(input: PostInput): Promise<PostWithAuthor> {
    console.log("[BlogService.createPost] Input:", JSON.stringify(input, null, 2));
    const content = blogPostSchema.parse({
      kind: "blog-post",
      ...input,
      status: input.status ?? (input.published ? "published" : "draft"),
    });
    console.log("[BlogService.createPost] Parsed content:", JSON.stringify(content, null, 2));
    const post = await prisma.post.create({
      data: {
        title: content.title,
        slug: content.slug,
        excerpt: content.excerpt ?? null,
        content: content.content,
        coverImage: content.coverImage ?? null,
        status: content.status,
        seoTitle: content.seo.title ?? null,
        seoDescription: content.seo.description ?? null,
        seoImage: content.seo.image ?? content.coverImage ?? null,
        canonicalUrl: content.seo.canonicalUrl ?? null,
        seoNoIndex: content.seo.noIndex,
        categories: JSON.stringify(content.taxonomy.categories),
        tags: JSON.stringify(content.taxonomy.tags),
        authorId: content.authorId ?? null,
        publishedAt: content.status === "published" ? new Date() : null,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
    return this.toContentPost(post as PersistedPost);
  }

  async updatePost(id: string, input: PostInput): Promise<PostWithAuthor> {
    console.log("[BlogService.updatePost] Input:", JSON.stringify(input, null, 2));
    const existing = await this.getPostById(id);
    const content = blogPostSchema.parse({
      kind: "blog-post",
      ...input,
      status: input.status ?? (input.published ? "published" : "draft"),
    });
    console.log("[BlogService.updatePost] Parsed content:", JSON.stringify(content, null, 2));
    const now = new Date();
    const publishedAt =
      content.status === "published" ? (existing?.publishedAt ?? now) : null;

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: content.title,
        slug: content.slug,
        excerpt: content.excerpt ?? null,
        content: content.content,
        coverImage: content.coverImage ?? null,
        status: content.status,
        seoTitle: content.seo.title ?? null,
        seoDescription: content.seo.description ?? null,
        seoImage: content.seo.image ?? content.coverImage ?? null,
        canonicalUrl: content.seo.canonicalUrl ?? null,
        seoNoIndex: content.seo.noIndex,
        categories: JSON.stringify(content.taxonomy.categories),
        tags: JSON.stringify(content.taxonomy.tags),
        authorId: content.authorId ?? null,
        publishedAt,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
    return this.toContentPost(post as PersistedPost);
  }

  async deletePost(id: string): Promise<PostWithAuthor> {
    const post = await prisma.post.delete({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
    return this.toContentPost(post as PersistedPost);
  }

  async stats(): Promise<{
    total: number;
    published: number;
    drafts: number;
  }> {
    const [total, published, drafts] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: "published" } }),
      prisma.post.count({ where: { status: { in: ["draft", "review"] } } }),
    ]);
    return { total, published, drafts };
  }
}
