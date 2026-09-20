"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IconTrash } from "@tabler/icons-react";

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setPending(true);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to delete post");
      }
      toast.success("Post deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive transition-colors disabled:opacity-50"
      aria-label="Delete post"
    >
      <IconTrash className="size-4" />
    </button>
  );
}
