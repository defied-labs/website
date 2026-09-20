import "server-only";

import { headers } from "next/headers";
import type { BlogPost } from "./blog-types";

export type { BlogPost } from "./blog-types";

const apiUrl = process.env.INTERNAL_SERVER_URL ?? "http://localhost:3005";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Blog API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function listPublishedPosts() {
  return request<BlogPost[]>("/api/blog");
}

export async function getPublishedPostBySlug(slug: string) {
  const response = await fetch(
    `${apiUrl}/api/blog/${encodeURIComponent(slug)}`,
    {
      cache: "no-store",
    },
  );
  return response.ok ? (response.json() as Promise<BlogPost>) : null;
}

async function adminRequest<T>(path: string): Promise<T> {
  const requestHeaders = await headers();
  return request<T>(path, {
    headers: { cookie: requestHeaders.get("cookie") ?? "" },
  });
}

export function listAdminPosts() {
  return adminRequest<BlogPost[]>("/api/admin/blog");
}

export function getAdminBlogStats() {
  return adminRequest<{ total: number; published: number; drafts: number }>(
    "/api/admin/blog/stats",
  );
}

export async function getAdminPostById(id: string) {
  try {
    return await adminRequest<BlogPost>(
      `/api/admin/blog/${encodeURIComponent(id)}`,
    );
  } catch {
    return null;
  }
}
