import { describe, it, expect, beforeEach, vi } from "vitest";
import { BlogService, type PostInput } from "../src/blog.service";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    post: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("@defied/db", () => ({
  default: mockPrisma,
}));

describe("BlogService Unit Tests", () => {
  let service: BlogService;

  const mockPost = {
    id: "post_1",
    title: "Understanding Antigravity",
    slug: "understanding-antigravity",
    excerpt: "Intro",
    content: "Content",
    coverImage: null,
    published: true,
    authorId: "user_1",
    publishedAt: new Date("2026-01-01"),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    author: { id: "user_1", name: "Author", email: "author@defied.dev" },
  };

  beforeEach(() => {
    service = new BlogService();
    vi.clearAllMocks();
  });

  it("listPosts should query prisma with order and author select", async () => {
    mockPrisma.post.findMany.mockResolvedValueOnce([mockPost]);

    const result = await service.listPosts();

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith({
      orderBy: [{ publishedAt: "desc", createdAt: "desc" }],
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    expect(result).toEqual([mockPost]);
  });

  it("listPublishedPosts should query posts where published is true", async () => {
    mockPrisma.post.findMany.mockResolvedValueOnce([mockPost]);

    const result = await service.listPublishedPosts();

    expect(mockPrisma.post.findMany).toHaveBeenCalledWith({
      where: { published: true },
      orderBy: [{ publishedAt: "desc", createdAt: "desc" }],
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    expect(result).toEqual([mockPost]);
  });

  it("getPostBySlug should find unique post by slug", async () => {
    mockPrisma.post.findUnique.mockResolvedValueOnce(mockPost);

    const result = await service.getPostBySlug("understanding-antigravity");

    expect(mockPrisma.post.findUnique).toHaveBeenCalledWith({
      where: { slug: "understanding-antigravity" },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    expect(result).toEqual(mockPost);
  });

  it("getPostById should find unique post by id", async () => {
    mockPrisma.post.findUnique.mockResolvedValueOnce(mockPost);

    const result = await service.getPostById("post_1");

    expect(mockPrisma.post.findUnique).toHaveBeenCalledWith({
      where: { id: "post_1" },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    expect(result).toEqual(mockPost);
  });

  it("getPublishedPostBySlug should find first published post by slug", async () => {
    mockPrisma.post.findFirst.mockResolvedValueOnce(mockPost);

    const result = await service.getPublishedPostBySlug(
      "understanding-antigravity",
    );

    expect(mockPrisma.post.findFirst).toHaveBeenCalledWith({
      where: { slug: "understanding-antigravity", published: true },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    expect(result).toEqual(mockPost);
  });

  it("createPost should set publishedAt if published=true", async () => {
    const input: PostInput = {
      title: "New Post",
      slug: "new-post",
      content: "Body",
      published: true,
      authorId: "user_1",
    };

    mockPrisma.post.create.mockResolvedValueOnce({
      ...mockPost,
      ...input,
      publishedAt: new Date(),
    });

    const result = await service.createPost(input);

    expect(mockPrisma.post.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: "New Post",
        slug: "new-post",
        published: true,
        publishedAt: expect.any(Date),
      }),
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    expect(result.title).toBe("New Post");
  });

  it("createPost should set publishedAt null if published=false", async () => {
    const input: PostInput = {
      title: "Draft Post",
      slug: "draft-post",
      content: "Body",
      published: false,
    };

    mockPrisma.post.create.mockResolvedValueOnce({
      ...mockPost,
      ...input,
      publishedAt: null,
    });

    await service.createPost(input);

    expect(mockPrisma.post.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        published: false,
        publishedAt: null,
      }),
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  });

  it("updatePost should update existing post", async () => {
    mockPrisma.post.findUnique.mockResolvedValueOnce(mockPost);
    mockPrisma.post.update.mockResolvedValueOnce({
      ...mockPost,
      title: "Updated Title",
    });

    const result = await service.updatePost("post_1", {
      title: "Updated Title",
      slug: "understanding-antigravity",
      content: "Content",
      published: true,
    });

    expect(mockPrisma.post.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "post_1" },
      }),
    );
    expect(result.title).toBe("Updated Title");
  });

  it("deletePost should call prisma.post.delete", async () => {
    mockPrisma.post.delete.mockResolvedValueOnce(mockPost);

    const result = await service.deletePost("post_1");

    expect(mockPrisma.post.delete).toHaveBeenCalledWith({
      where: { id: "post_1" },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    expect(result).toEqual(mockPost);
  });

  it("stats should return counts of total, published, and drafts", async () => {
    mockPrisma.post.count
      .mockResolvedValueOnce(15) // total
      .mockResolvedValueOnce(10) // published
      .mockResolvedValueOnce(5); // drafts

    const result = await service.stats();

    expect(result).toEqual({
      total: 15,
      published: 10,
      drafts: 5,
    });
  });
});
