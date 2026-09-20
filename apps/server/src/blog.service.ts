import { Injectable } from "@nestjs/common";
import prisma from "@defied/db";

export const postOrderBy = {
  publishedAt: "desc" as const,
  createdAt: "desc" as const,
};

export interface PostInput {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  published: boolean;
  authorId?: string | null;
}

type PostWithAuthor = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  published: boolean;
  authorId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string | null; email: string | null } | null;
};

@Injectable()
export class BlogService {
  private readonly author = {
    select: { id: true, name: true, email: true },
  } as const;

  listPosts(): Promise<PostWithAuthor[]> {
    return prisma.post.findMany({
      orderBy: [postOrderBy],
      include: { author: this.author },
    });
  }

  listPublishedPosts(): Promise<PostWithAuthor[]> {
    return prisma.post.findMany({
      where: { published: true },
      orderBy: [postOrderBy],
      include: { author: this.author },
    });
  }

  getPostBySlug(slug: string): Promise<PostWithAuthor | null> {
    return prisma.post.findUnique({
      where: { slug },
      include: { author: this.author },
    });
  }

  getPostById(id: string): Promise<PostWithAuthor | null> {
    return prisma.post.findUnique({
      where: { id },
      include: { author: this.author },
    });
  }

  getPublishedPostBySlug(slug: string): Promise<PostWithAuthor | null> {
    return prisma.post.findFirst({
      where: { slug, published: true },
      include: { author: this.author },
    });
  }

  createPost(input: PostInput): Promise<PostWithAuthor> {
    return prisma.post.create({
      data: {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt ?? null,
        content: input.content,
        coverImage: input.coverImage ?? null,
        published: input.published,
        authorId: input.authorId ?? null,
        publishedAt: input.published ? new Date() : null,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async updatePost(id: string, input: PostInput): Promise<PostWithAuthor> {
    const existing = await this.getPostById(id);
    const now = new Date();
    const publishedAt = input.published ? (existing?.publishedAt ?? now) : null;

    return prisma.post.update({
      where: { id },
      data: {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt ?? null,
        content: input.content,
        coverImage: input.coverImage ?? null,
        published: input.published,
        authorId: input.authorId ?? null,
        publishedAt,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
  }

  deletePost(id: string): Promise<PostWithAuthor> {
    return prisma.post.delete({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async stats(): Promise<{
    total: number;
    published: number;
    drafts: number;
  }> {
    const [total, published, drafts] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.post.count({ where: { published: false } }),
    ]);
    return { total, published, drafts };
  }
}
