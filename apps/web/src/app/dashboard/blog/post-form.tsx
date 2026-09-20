"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { PostFormValues } from "@/lib/blog-types";
import { RichTextEditor } from "@/components/RichTextEditor";

export function PostForm({
  mode,
  initial,
  setPreview,
}: {
  mode: "create" | "edit";
  initial?: Partial<PostFormValues> & { id: string };
  setPreview?: React.Dispatch<React.SetStateAction<PostFormValues>>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<PostFormValues>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    coverImage: initial?.coverImage ?? "",
    published: initial?.published ?? false,
  });
  const [pending, setPending] = useState(false);

  function set<K extends keyof PostFormValues>(
    key: K,
    value: PostFormValues[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    setPreview?.(
      (prevState) => ({ ...prevState, [key]: value }) as PostFormValues,
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const url =
        mode === "create"
          ? "/api/admin/blog"
          : `/api/admin/blog/${initial?.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to save post");
      }
      toast.success(mode === "create" ? "Post created" : "Post saved");
      router.push("/dashboard/blog");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Post title"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={form.slug}
          onChange={(e) => set("slug", e.target.value)}
          placeholder="my-post-slug"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Input
          id="excerpt"
          value={form.excerpt as string}
          onChange={(e) => set("excerpt", e.target.value)}
          placeholder="Short summary"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="coverImage">Cover image URL</Label>
        <Input
          id="coverImage"
          value={form.coverImage as string}
          onChange={(e) => set("coverImage", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content">Content</Label>
        <RichTextEditor
          value={form.content}
          onChange={(content) => set("content", content)}
        />
      </div>

      <label className="flex items-center gap-2 text-xs">
        <Checkbox
          checked={form.published}
          onCheckedChange={(checked) => set("published", checked === true)}
        />
        Published
      </label>

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create post"
              : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/blog")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
