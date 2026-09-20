export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  published: boolean;
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
  published: boolean;
}
