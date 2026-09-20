import { describe, it, expect, beforeEach } from "vitest";

// Content flows & Prisma schema simulation tests
interface PostModel {
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
}

interface UserModel {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface LicenseModel {
  id: string;
  licenseKey: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  active: boolean;
  lastUsedAt: Date | null;
}

class MockPrismaDatabase {
  users: Map<string, UserModel> = new Map();
  posts: Map<string, PostModel> = new Map();
  licenses: Map<string, LicenseModel> = new Map();

  reset() {
    this.users.clear();
    this.posts.clear();
    this.licenses.clear();
  }

  // User
  createUser(data: { id?: string; email: string; name?: string }): UserModel {
    if ([...this.users.values()].some((u) => u.email === data.email)) {
      throw new Error(`Unique constraint failed on the fields: (\`email\`)`);
    }
    const id =
      data.id || `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const user: UserModel = {
      id,
      email: data.email,
      name: data.name ?? null,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Post & Content Flows
  createPost(data: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    coverImage?: string | null;
    published?: boolean;
    authorId?: string | null;
  }): PostModel {
    if ([...this.posts.values()].some((p) => p.slug === data.slug)) {
      throw new Error(`Unique constraint failed on the fields: (\`slug\`)`);
    }
    if (data.authorId && !this.users.has(data.authorId)) {
      throw new Error(`Foreign key constraint failed on authorId`);
    }
    const id = `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const published = data.published ?? false;
    const post: PostModel = {
      id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt ?? null,
      coverImage: data.coverImage ?? null,
      published,
      authorId: data.authorId ?? null,
      publishedAt: published ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  updatePost(id: string, data: Partial<PostModel>): PostModel {
    const post = this.posts.get(id);
    if (!post) throw new Error(`Record not found`);

    if (data.slug && data.slug !== post.slug) {
      if (
        [...this.posts.values()].some(
          (p) => p.slug === data.slug && p.id !== id,
        )
      ) {
        throw new Error(`Unique constraint failed on the fields: (\`slug\`)`);
      }
    }

    const wasPublished = post.published;
    const willBePublished = data.published ?? wasPublished;
    let publishedAt = post.publishedAt;

    if (!wasPublished && willBePublished) {
      publishedAt = new Date();
    } else if (data.published === false) {
      publishedAt = null;
    }

    const updated: PostModel = {
      ...post,
      ...data,
      published: willBePublished,
      publishedAt,
      updatedAt: new Date(),
    };
    this.posts.set(id, updated);
    return updated;
  }

  // License
  createLicense(
    userId: string,
    licenseKey: string,
    expiresAt: Date,
  ): LicenseModel {
    if (!this.users.has(userId)) {
      throw new Error(`User not found for license`);
    }
    if ([...this.licenses.values()].some((l) => l.licenseKey === licenseKey)) {
      throw new Error(
        `Unique constraint failed on the fields: (\`licenseKey\`)`,
      );
    }
    const license: LicenseModel = {
      id: `lic_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      licenseKey,
      userId,
      createdAt: new Date(),
      expiresAt,
      active: true,
      lastUsedAt: null,
    };
    this.licenses.set(license.id, license);
    return license;
  }
}

describe("Prisma Schema & Content Flow Tests", () => {
  const db = new MockPrismaDatabase();

  beforeEach(() => {
    db.reset();
  });

  describe("User & Auth Schema Rules", () => {
    it("creates a user successfully", () => {
      const user = db.createUser({
        email: "founder@defied.dev",
        name: "Founder",
      });
      expect(user.id).toBeDefined();
      expect(user.email).toBe("founder@defied.dev");
      expect(user.name).toBe("Founder");
    });

    it("enforces unique constraint on email", () => {
      db.createUser({ email: "founder@defied.dev" });
      expect(() => db.createUser({ email: "founder@defied.dev" })).toThrow(
        "Unique constraint failed on the fields: (`email`)",
      );
    });
  });

  describe("Blog Post Lifecycle & Publishing Flow", () => {
    it("creates a draft post by default with published=false and null publishedAt", () => {
      const user = db.createUser({ email: "writer@defied.dev" });
      const post = db.createPost({
        title: "Hello Defied",
        slug: "hello-defied",
        content: "Draft content...",
        authorId: user.id,
      });

      expect(post.published).toBe(false);
      expect(post.publishedAt).toBeNull();
      expect(post.slug).toBe("hello-defied");
    });

    it("enforces unique slug constraint across posts", () => {
      db.createPost({
        title: "First",
        slug: "awesome-post",
        content: "Content 1",
      });

      expect(() =>
        db.createPost({
          title: "Second",
          slug: "awesome-post",
          content: "Content 2",
        }),
      ).toThrow("Unique constraint failed on the fields: (`slug`)");
    });

    it("sets publishedAt date when transitioning draft to published", () => {
      const post = db.createPost({
        title: "Draft Post",
        slug: "draft-post",
        content: "Content",
        published: false,
      });

      expect(post.publishedAt).toBeNull();

      const publishedPost = db.updatePost(post.id, { published: true });
      expect(publishedPost.published).toBe(true);
      expect(publishedPost.publishedAt).toBeInstanceOf(Date);
    });

    it("clears publishedAt date when unpublishing a post", () => {
      const post = db.createPost({
        title: "Live Post",
        slug: "live-post",
        content: "Live content",
        published: true,
      });

      expect(post.publishedAt).toBeInstanceOf(Date);

      const draftPost = db.updatePost(post.id, { published: false });
      expect(draftPost.published).toBe(false);
      expect(draftPost.publishedAt).toBeNull();
    });

    it("prevents assigning a post to a non-existent author", () => {
      expect(() =>
        db.createPost({
          title: "Orphan Post",
          slug: "orphan-post",
          content: "Content",
          authorId: "non-existent-user",
        }),
      ).toThrow("Foreign key constraint failed on authorId");
    });
  });

  describe("License Schema Rules", () => {
    it("creates an active license linked to a user", () => {
      const user = db.createUser({ email: "buyer@defied.dev" });
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);
      const license = db.createLicense(user.id, "DEF-KEY-12345", expiresAt);

      expect(license.licenseKey).toBe("DEF-KEY-12345");
      expect(license.userId).toBe(user.id);
      expect(license.active).toBe(true);
    });

    it("enforces uniqueness of licenseKey", () => {
      const user = db.createUser({ email: "buyer2@defied.dev" });
      const expiresAt = new Date();
      db.createLicense(user.id, "DEF-KEY-DUPLICATE", expiresAt);

      expect(() =>
        db.createLicense(user.id, "DEF-KEY-DUPLICATE", expiresAt),
      ).toThrow("Unique constraint failed on the fields: (`licenseKey`)");
    });
  });
});
