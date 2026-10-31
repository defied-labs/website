import "reflect-metadata";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { BlogController, PublicBlogController } from "../src/blog.controller";
import type { BlogService, PostInput } from "../src/blog.service";
import { NotFoundException } from "@nestjs/common";

describe("Blog API Endpoints (Controller Integration)", () => {
  let blogService: BlogService;
  let blogController: BlogController;
  let publicBlogController: PublicBlogController;

  const mockPost = {
    id: "post_1",
    title: "Understanding Antigravity",
    slug: "understanding-antigravity",
    excerpt: "Intro to antigravity",
    content: "# Antigravity is amazing",
    coverImage: "https://example.com/cover.png",
    status: "published" as const,
    published: true,
    seo: { noIndex: false },
    taxonomy: { categories: [], tags: [] },
    authorId: "user_1",
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    author: { id: "user_1", name: "Test Author", email: "author@defied.dev" },
  };

  beforeEach(() => {
    blogService = {
      listPosts: vi.fn(),
      listPublishedPosts: vi.fn(),
      getPostBySlug: vi.fn(),
      getPostById: vi.fn(),
      getPublishedPostBySlug: vi.fn(),
      createPost: vi.fn(),
      updatePost: vi.fn(),
      deletePost: vi.fn(),
      stats: vi.fn(),
    } as unknown as BlogService;

    blogController = new BlogController(blogService);
    publicBlogController = new PublicBlogController(blogService);
  });

  describe("PublicBlogController", () => {
    it("GET /api/blog - should return only published posts", async () => {
      vi.mocked(blogService.listPublishedPosts).mockResolvedValueOnce([
        mockPost,
      ]);

      const result = await publicBlogController.listPosts();

      expect(blogService.listPublishedPosts).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockPost]);
      expect(result[0]?.published).toBe(true);
    });

    it("GET /api/blog/:slug - should return published post if found", async () => {
      vi.mocked(blogService.getPublishedPostBySlug).mockResolvedValueOnce(
        mockPost,
      );

      const result = await publicBlogController.getBySlug(
        "understanding-antigravity",
      );

      expect(blogService.getPublishedPostBySlug).toHaveBeenCalledWith(
        "understanding-antigravity",
      );
      expect(result).toEqual(mockPost);
    });

    it("GET /api/blog/:slug - should throw NotFoundException when post not found", async () => {
      vi.mocked(blogService.getPublishedPostBySlug).mockResolvedValueOnce(null);

      await expect(
        publicBlogController.getBySlug("non-existent-slug"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("Admin BlogController", () => {
    it("GET /api/admin/blog - should list all posts including drafts", async () => {
      const draftPost = {
        ...mockPost,
        id: "post_2",
        status: "draft" as const,
        published: false,
        publishedAt: null,
      };
      vi.mocked(blogService.listPosts).mockResolvedValueOnce([
        mockPost,
        draftPost,
      ]);

      const result = await blogController.listPosts();

      expect(blogService.listPosts).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
    });

    it("GET /api/admin/blog/stats - should return blog statistics", async () => {
      const statsData = { total: 10, published: 7, drafts: 3 };
      vi.mocked(blogService.stats).mockResolvedValueOnce(statsData);

      const result = await blogController.stats();

      expect(blogService.stats).toHaveBeenCalledTimes(1);
      expect(result).toEqual(statsData);
    });

    it("POST /api/admin/blog - should create a new blog post", async () => {
      const input: PostInput = {
        title: "New Post",
        slug: "new-post",
        content: "Content",
        published: true,
      };
      vi.mocked(blogService.createPost).mockResolvedValueOnce({
        ...mockPost,
        ...input,
        id: "post_new",
      });

      const result = await blogController.create(input);

      expect(blogService.createPost).toHaveBeenCalledWith(input);
      expect(result.id).toBe("post_new");
      expect(result.title).toBe("New Post");
    });

    it("PATCH /api/admin/blog/:id - should update existing post", async () => {
      const updateInput: PostInput = {
        title: "Updated Title",
        slug: "updated-title",
        content: "New content",
        published: true,
      };

      vi.mocked(blogService.getPostById).mockResolvedValueOnce(mockPost);
      vi.mocked(blogService.updatePost).mockResolvedValueOnce({
        ...mockPost,
        ...updateInput,
      });

      const result = await blogController.update("post_1", updateInput);

      expect(blogService.getPostById).toHaveBeenCalledWith("post_1");
      expect(blogService.updatePost).toHaveBeenCalledWith(
        "post_1",
        updateInput,
      );
      expect(result.title).toBe("Updated Title");
    });

    it("PATCH /api/admin/blog/:id - should throw NotFoundException if post doesn't exist", async () => {
      vi.mocked(blogService.getPostById).mockResolvedValueOnce(null);

      await expect(
        blogController.update("unknown_id", {
          title: "X",
          slug: "x",
          content: "Y",
          published: false,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("DELETE /api/admin/blog/:id - should delete existing post", async () => {
      vi.mocked(blogService.getPostById).mockResolvedValueOnce(mockPost);
      vi.mocked(blogService.deletePost).mockResolvedValueOnce(mockPost);

      const result = await blogController.remove("post_1");

      expect(blogService.deletePost).toHaveBeenCalledWith("post_1");
      expect(result).toEqual(mockPost);
    });

    it("DELETE /api/admin/blog/:id - should throw NotFoundException if post doesn't exist", async () => {
      vi.mocked(blogService.getPostById).mockResolvedValueOnce(null);

      await expect(blogController.remove("unknown_id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
